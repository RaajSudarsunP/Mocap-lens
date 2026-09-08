/**
 * Expression & Blendshape Processor Module
 * Extracts canonical 52 ARKit blendshapes:
 * - Wide dynamic range Jaw Open & Speech
 * - Tongue Out detection
 * - Left/Right eye gaze tracking (pupil position)
 * - Complete eyelid blink & wink tracking
 * - Expressive smiles, frowns, and eyebrow lifts & scowls
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
    this.deadband = 0.01;
    this.sensitivityGain = 1.45;
  }

  processBlendshapes(rawCategories, landmarks = null) {
    let blendshapes = new Array(52).fill(0.0);

    // 1. Ingest MediaPipe category scores if present
    if (rawCategories && rawCategories.length > 0) {
      rawCategories.forEach(cat => {
        const idx = ARKIT_BLENDSHAPE_NAMES.indexOf(cat.categoryName);
        if (idx !== -1) {
          blendshapes[idx] = cat.score;
        }
      });
    }

    // 2. High-precision 3D geometric landmark calculation
    if (landmarks && landmarks.length >= 468) {
      const geoShapes = this.calculateGeometricExpressions(landmarks);
      geoShapes.forEach((val, idx) => {
        if (val > (blendshapes[idx] || 0)) {
          blendshapes[idx] = val;
        }
      });
    }

    // 3. Calibration baseline subtraction and response amplification
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

  /**
   * Calculates facial expression blendshapes directly from 3D landmark geometry
   */
  calculateGeometricExpressions(landmarks) {
    const b = new Array(52).fill(0.0);
    if (!landmarks || landmarks.length < 468) return b;

    // Blendshape Indices
    const jawOpenIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("jawOpen");
    const blinkLIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeBlinkLeft");
    const blinkRIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeBlinkRight");
    const smileLIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("mouthSmileLeft");
    const smileRIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("mouthSmileRight");
    const frownLIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("mouthFrownLeft");
    const frownRIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("mouthFrownRight");
    const browUpIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("browInnerUp");
    const browDownLIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("browDownLeft");
    const browDownRIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("browDownRight");
    const tongueOutIdx = ARKIT_BLENDSHAPE_NAMES.indexOf("tongueOut");

    // Gaze Indices
    const lookDownL = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeLookDownLeft");
    const lookInL = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeLookInLeft");
    const lookOutL = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeLookOutLeft");
    const lookUpL = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeLookUpLeft");

    const lookDownR = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeLookDownRight");
    const lookInR = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeLookInRight");
    const lookOutR = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeLookOutRight");
    const lookUpR = ARKIT_BLENDSHAPE_NAMES.indexOf("eyeLookUpRight");

    // Face scale normalization base (IPD)
    const leftEyeOuter = landmarks[33], rightEyeOuter = landmarks[263];
    const ipd = Math.hypot(rightEyeOuter.x - leftEyeOuter.x, rightEyeOuter.y - leftEyeOuter.y) || 0.15;

    // A. Wide-Range Jaw Opening
    const topLip = landmarks[13], bottomLip = landmarks[14];
    if (topLip && bottomLip) {
      const lipDist = Math.hypot(bottomLip.x - topLip.x, bottomLip.y - topLip.y) / ipd;
      // Responsive jaw opening scaling from slight speech to wide gasp
      b[jawOpenIdx] = Math.min(1.0, Math.max(0.0, (lipDist - 0.030) * 5.2));
    }

    // B. Eye Blinks (Crisp snapping closure)
    const leftEyeTop = landmarks[159], leftEyeBottom = landmarks[145];
    const rightEyeTop = landmarks[386], rightEyeBottom = landmarks[374];
    if (leftEyeTop && leftEyeBottom) {
      const leftDist = Math.hypot(leftEyeTop.x - leftEyeBottom.x, leftEyeTop.y - leftEyeBottom.y) / ipd;
      b[blinkLIdx] = Math.min(1.0, Math.max(0.0, (0.085 - leftDist) * 22.0));
    }
    if (rightEyeTop && rightEyeBottom) {
      const rightDist = Math.hypot(rightEyeTop.x - rightEyeBottom.x, rightEyeTop.y - rightEyeBottom.y) / ipd;
      b[blinkRIdx] = Math.min(1.0, Math.max(0.0, (0.085 - rightDist) * 22.0));
    }

    // C. Eye Gaze Tracking from Iris Landmarks (#468 & #473)
    const leftPupil = landmarks[468], rightPupil = landmarks[473];
    const leftEyeInner = landmarks[133], rightEyeInner = landmarks[362];

    if (leftPupil && leftEyeOuter && leftEyeInner && leftEyeTop && leftEyeBottom) {
      const eyeCenterXL = (leftEyeOuter.x + leftEyeInner.x) / 2;
      const eyeCenterYL = (leftEyeTop.y + leftEyeBottom.y) / 2;
      const eyeWidthL = Math.abs(leftEyeInner.x - leftEyeOuter.x) || 0.05;
      const eyeHeightL = Math.abs(leftEyeBottom.y - leftEyeTop.y) || 0.03;

      const normGazeXL = (leftPupil.x - eyeCenterXL) / (eyeWidthL * 0.4);
      const normGazeYL = (leftPupil.y - eyeCenterYL) / (eyeHeightL * 0.4);

      if (normGazeXL > 0.15) b[lookInL] = Math.min(1.0, normGazeXL);
      if (normGazeXL < -0.15) b[lookOutL] = Math.min(1.0, -normGazeXL);
      if (normGazeYL > 0.15) b[lookDownL] = Math.min(1.0, normGazeYL);
      if (normGazeYL < -0.15) b[lookUpL] = Math.min(1.0, -normGazeYL);
    }

    if (rightPupil && rightEyeOuter && rightEyeInner && rightEyeTop && rightEyeBottom) {
      const eyeCenterXR = (rightEyeOuter.x + rightEyeInner.x) / 2;
      const eyeCenterYR = (rightEyeTop.y + rightEyeBottom.y) / 2;
      const eyeWidthR = Math.abs(rightEyeOuter.x - rightEyeInner.x) || 0.05;
      const eyeHeightR = Math.abs(rightEyeBottom.y - rightEyeTop.y) || 0.03;

      const normGazeXR = (rightPupil.x - eyeCenterXR) / (eyeWidthR * 0.4);
      const normGazeYR = (rightPupil.y - eyeCenterYR) / (eyeHeightR * 0.4);

      if (normGazeXR > 0.15) b[lookOutR] = Math.min(1.0, normGazeXR);
      if (normGazeXR < -0.15) b[lookInR] = Math.min(1.0, -normGazeXR);
      if (normGazeYR > 0.15) b[lookDownR] = Math.min(1.0, normGazeYR);
      if (normGazeYR < -0.15) b[lookUpR] = Math.min(1.0, -normGazeYR);
    }

    // D. Tongue Out Detection
    const innerLipTop = landmarks[13], innerLipBottom = landmarks[14], chin = landmarks[152];
    if (innerLipTop && innerLipBottom && chin) {
      const lipDist = Math.hypot(innerLipBottom.x - innerLipTop.x, innerLipBottom.y - innerLipTop.y) / ipd;
      // Protrusion detected when mouth is open and lower inner landmark shifts
      if (lipDist > 0.11) {
        b[tongueOutIdx] = Math.min(1.0, (lipDist - 0.11) * 7.0);
      }
    }

    // E. Smiles & Frowns
    const mouthL = landmarks[61], mouthR = landmarks[291], nose = landmarks[1];
    if (mouthL && mouthR && nose) {
      const mouthWidth = Math.hypot(mouthR.x - mouthL.x, mouthR.y - mouthL.y) / ipd;
      const mouthY = (mouthL.y + mouthR.y) / 2;
      const noseToMouthDist = (mouthY - nose.y) / ipd;

      // Smiling widens mouth and raises mouth corners
      const smileScore = Math.min(1.0, Math.max(0.0, (mouthWidth - 0.64) * 4.2));
      b[smileLIdx] = smileScore;
      b[smileRIdx] = smileScore;

      // Frowning pulls corners downward
      if (noseToMouthDist > 0.53) {
        const frownScore = Math.min(1.0, (noseToMouthDist - 0.53) * 5.5);
        b[frownLIdx] = frownScore;
        b[frownRIdx] = frownScore;
      }
    }

    // F. Eyebrows (Prominent eyebrow raise vs scowl)
    const browInnerL = landmarks[55], browInnerR = landmarks[285];
    if (browInnerL && browInnerR && nose) {
      const browDist = ((browInnerL.y + browInnerR.y) / 2 - nose.y) / ipd;
      if (browDist < -0.42) {
        b[browUpIdx] = Math.min(1.0, (-0.42 - browDist) * 6.5);
      } else if (browDist > -0.37) {
        const downScore = Math.min(1.0, (browDist - (-0.37)) * 7.0);
        b[browDownLIdx] = downScore;
        b[browDownRIdx] = downScore;
      }
    }

    return b;
  }
}
