/**
 * Candidate A3 Avatar Personalization Engine (10 Measurable Parameters)
 * Extracts normalized facial feature ratios from user's 3D landmark mesh
 * and deforms template avatar head geometry sub-nodes.
 */

export class AvatarPersonalizer {
  constructor() {
    this.baseMetrics = {
      ipd: 0.063,            // Canonical Inter-Pupillary Distance (meters)
      faceWidth: 0.142,      // Cheekbone width
      faceHeight: 0.185,     // Forehead to chin distance
      jawWidth: 0.118,       // Jaw angle width
      chinPos: 0.095,        // Nose to chin vertical distance
      eyeSize: 0.032,        // Eye socket diameter
      noseWidth: 0.035,      // Nostril width
      noseLength: 0.052,     // Nose bridge length
      mouthWidth: 0.050,     // Lip corner distance
      cheekWidth: 0.138      // Zygomatic arch width
    };

    this.userMetrics = null;
    this.isPersonalized = false;
  }

  /**
   * Extracts 10 measurable facial proportion ratios from 468 3D landmark mesh
   */
  extractUserFacialProportions(landmarks) {
    if (!landmarks || landmarks.length < 468) return null;

    // Landmark keypoints
    const leftPupil = landmarks[468] || landmarks[33];   // Left pupil / eye
    const rightPupil = landmarks[473] || landmarks[263]; // Right pupil / eye
    const leftCheek = landmarks[234];                     // Left cheekbone
    const rightCheek = landmarks[454];                    // Right cheekbone
    const forehead = landmarks[10];                       // Upper forehead
    const chinTip = landmarks[152];                       // Chin bottom
    const leftJaw = landmarks[172];                       // Left jaw angle
    const rightJaw = landmarks[397];                      // Right jaw angle
    const noseTip = landmarks[1];                         // Nose tip
    const noseBridge = landmarks[6];                      // Upper nose bridge
    const noseLeft = landmarks[129];                      // Left nostril
    const noseRight = landmarks[358];                     // Right nostril
    const mouthLeft = landmarks[61];                      // Left mouth corner
    const mouthRight = landmarks[291];                    // Right mouth corner

    // Calculate Euclidean 3D distances
    const ipd = this.distance3D(leftPupil, rightPupil);
    const faceWidth = this.distance3D(leftCheek, rightCheek);
    const faceHeight = this.distance3D(forehead, chinTip);
    const jawWidth = this.distance3D(leftJaw, rightJaw);
    const chinPos = this.distance3D(noseTip, chinTip);
    const eyeSize = (this.distance3D(landmarks[33], landmarks[133]) + this.distance3D(landmarks[362], landmarks[263])) / 2;
    const noseWidth = this.distance3D(noseLeft, noseRight);
    const noseLength = this.distance3D(noseBridge, noseTip);
    const mouthWidth = this.distance3D(mouthLeft, mouthRight);
    const cheekWidth = faceWidth;

    // Normalize relative to IPD scale factor
    const scaleFactor = this.baseMetrics.ipd / (ipd || 0.063);

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    this.userMetrics = {
      // 10 Personalization Parameters (Ratios relative to canonical base)
      eyeSpacingRatio: clamp((ipd * scaleFactor) / this.baseMetrics.ipd, 0.85, 1.25),
      faceWidthRatio: clamp((faceWidth * scaleFactor) / this.baseMetrics.faceWidth, 0.80, 1.25),
      faceHeightRatio: clamp((faceHeight * scaleFactor) / this.baseMetrics.faceHeight, 0.85, 1.20),
      jawWidthRatio: clamp((jawWidth * scaleFactor) / this.baseMetrics.jawWidth, 0.75, 1.30),
      chinPosRatio: clamp((chinPos * scaleFactor) / this.baseMetrics.chinPos, 0.80, 1.25),
      eyeSizeRatio: clamp((eyeSize * scaleFactor) / this.baseMetrics.eyeSize, 0.75, 1.30),
      noseWidthRatio: clamp((noseWidth * scaleFactor) / this.baseMetrics.noseWidth, 0.75, 1.35),
      noseLengthRatio: clamp((noseLength * scaleFactor) / this.baseMetrics.noseLength, 0.75, 1.30),
      mouthWidthRatio: clamp((mouthWidth * scaleFactor) / this.baseMetrics.mouthWidth, 0.75, 1.30),
      cheekWidthRatio: clamp((cheekWidth * scaleFactor) / this.baseMetrics.cheekWidth, 0.80, 1.25),
      ipdRatio: (ipd * scaleFactor) / this.baseMetrics.ipd
    };

    this.isPersonalized = true;
    console.log("Candidate A3 10-Parameter Personalization Ratios Derived:", this.userMetrics);
    return this.userMetrics;
  }

  /**
   * Applies personalized feature scaling to Three.js avatar sub-node geometries
   */
  applyPersonalizationToAvatar(avatarViewer) {
    if (!this.userMetrics || !avatarViewer || !avatarViewer.nodes) return false;

    const m = this.userMetrics;
    const n = avatarViewer.nodes;

    // 1. Face Width & Height (Main Head Mesh)
    if (n.head) {
      n.head.scale.set(m.faceWidthRatio, m.faceHeightRatio, m.cheekWidthRatio);
    }

    // 2. Jaw Width
    if (n.jaw) {
      n.jaw.scale.x = m.jawWidthRatio;
    }

    // 3. Chin Position
    if (n.chin) {
      n.chin.position.y = -0.19 * m.chinPosRatio;
    }

    // 4. Eye Spacing & Eye Size
    if (n.leftEye && n.rightEye) {
      n.leftEye.position.x = -0.068 * m.eyeSpacingRatio;
      n.rightEye.position.x = 0.068 * m.eyeSpacingRatio;
      n.leftEye.scale.setScalar(m.eyeSizeRatio);
      n.rightEye.scale.setScalar(m.eyeSizeRatio);
    }

    // Eyelids match eye spacing
    if (n.leftEyelid && n.rightEyelid) {
      n.leftEyelid.position.x = -0.068 * m.eyeSpacingRatio;
      n.rightEyelid.position.x = 0.068 * m.eyeSpacingRatio;
      n.leftEyelid.scale.setScalar(m.eyeSizeRatio);
      n.rightEyelid.scale.setScalar(m.eyeSizeRatio);
    }

    // Eyebrows match eye spacing
    if (n.leftBrow && n.rightBrow) {
      n.leftBrow.position.x = -0.068 * m.eyeSpacingRatio;
      n.rightBrow.position.x = 0.068 * m.eyeSpacingRatio;
    }

    // 5. Nose Width & Length
    if (n.nose) {
      n.nose.scale.set(m.noseWidthRatio, m.noseLengthRatio, m.noseLengthRatio);
    }

    // 6. Mouth Width
    if (n.mouth) {
      n.mouth.scale.x = m.mouthWidthRatio;
    }

    // 7. Ears Width
    if (n.leftEar && n.rightEar) {
      n.leftEar.position.x = -0.165 * m.faceWidthRatio;
      n.rightEar.position.x = 0.165 * m.faceWidthRatio;
    }

    // 8. Hair Cap Scale
    if (n.hair) {
      n.hair.scale.set(m.faceWidthRatio, 1.05 * m.faceHeightRatio, m.faceWidthRatio);
    }

    console.log("MocapLens: Applied 10-Parameter A3 Personalization to Avatar Mesh Nodes ✅");
    return true;
  }

  distance3D(p1, p2) {
    if (!p1 || !p2) return 0.0;
    return Math.hypot(p2.x - p1.x, p2.y - p1.y, (p2.z || 0) - (p1.z || 0));
  }
}
