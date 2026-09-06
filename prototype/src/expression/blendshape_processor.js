/**
 * Expression & Blendshape Processor Module
 * Provides canonical 52 ARKit blendshape extraction, neutral pose calibration,
 * and the Option B 109.9K Res-MLP regressor placeholder pipeline interface.
 */

export const ARKIT_BLENDSHAPE_NAMES = [
  "eyeBlinkLeft", "eyeLookDownLeft", "eyeLookInLeft", "eyeLookOutLeft", "eyeLookUpLeft", "eyeSquintLeft", "eyeWideLeft",
  "eyeBlinkRight", "eyeLookDownRight", "eyeLookInRight", "eyeLookOutRight", "eyeLookUpRight", "eyeSquintRight", "eyeWideRight",
  "jawForward", "jawLeft", "jawRight", "jawOpen",
  "mouthClose", "mouthFunnel", "mouthPucker", "mouthLeft", "mouthRight",
  "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight",
  "mouthDimpleLeft", "mouthDimpleRight", "mouthStretchLeft", "mouthStretchRight",
  "mouthRollLower", "mouthRollUpper", "mouthShrugLower", "mouthShrugUpper",
  "mouthPressLeft", "mouthPressRight", "mouthLowerDownLeft", "mouthLowerDownRight",
  "mouthUpperUpLeft", "mouthUpperUpRight",
  "browDownLeft", "browDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight",
  "cheekPuff", "cheekSquintLeft", "cheekSquintRight",
  "noseSneerLeft", "noseSneerRight", "tongueOut"
];

export class BlendshapeProcessor {
  constructor() {
    this.neutralBaseline = new Array(52).fill(0.0);
    this.isCalibrated = false;
    this.deadband = 0.02;
    this.sensitivityGain = 1.25;
  }

  /**
   * Prototype Substitution Notice:
   * Uses MediaPipe Tasks Vision blendshapes for the functional prototype,
   * keeping Option B 109.9K Res-MLP as the planned MocapLens learned regressor module interface.
   */
  processBlendshapes(rawCategories, landmarks = null) {
    let blendshapes = new Array(52).fill(0.0);

    if (rawCategories && rawCategories.length > 0) {
      // Map MediaPipe category scores to 52 ARKit canonical array indices
      rawCategories.forEach(cat => {
        const idx = ARKIT_BLENDSHAPE_NAMES.indexOf(cat.categoryName);
        if (idx !== -1) {
          blendshapes[idx] = cat.score;
        }
      });
    } else if (landmarks && landmarks.length >= 468) {
      // Deterministic geometry fallback if category scores are missing
      blendshapes = this.calculateGeometricFallback(landmarks);
    }

    // Apply baseline subtraction and sensitivity gain if calibrated
    if (this.isCalibrated) {
      blendshapes = blendshapes.map((val, i) => {
        const baseline = this.neutralBaseline[i];
        let diff = val - baseline;
        if (Math.abs(diff) < this.deadband) diff = 0.0;
        return Math.min(1.0, Math.max(0.0, diff * this.sensitivityGain));
      });
    }

    return blendshapes;
  }

  calibrateNeutralPose(blendshapes) {
    if (blendshapes && blendshapes.length === 52) {
      this.neutralBaseline = [...blendshapes];
      this.isCalibrated = true;
      console.log("MocapLens: Neutral calibration baseline captured.", this.neutralBaseline);
      return true;
    }
    return false;
  }

  resetCalibration() {
    this.neutralBaseline.fill(0.0);
    this.isCalibrated = false;
  }

  calculateGeometricFallback(landmarks) {
    const blendshapes = new Array(52).fill(0.0);
    const topLip = landmarks[13];
    const bottomLip = landmarks[14];
    const jawOpenIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("jawOpen");

    if (topLip && bottomLip && jawOpenIdx !== -1) {
      const distance = Math.hypot(bottomLip.x - topLip.x, bottomLip.y - topLip.y, bottomLip.z - topLip.z);
      blendshapes[jawOpenIdx] = Math.min(1.0, distance * 10.0);
    }

    return blendshapes;
  }
}
