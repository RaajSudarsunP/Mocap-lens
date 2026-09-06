/**
 * Candidate A3 Avatar Personalization Engine
 * Extracts normalized facial feature ratios from user's initial 3D landmark mesh
 * and deforms template avatar skeleton bone scales & proportion channels.
 */

export class AvatarPersonalizer {
  constructor() {
    this.baseMetrics = {
      ipd: 0.06,           // Canonical Inter-Pupillary Distance (meters)
      faceWidth: 0.14,      // Cheekbone width
      jawWidth: 0.12,       // Jaw contour width
      noseLength: 0.05,     // Nose bridge length
      eyeScale: 1.0,        // Eye socket scale factor
      lipThickness: 1.0     // Lip vertical ratio
    };

    this.userMetrics = null;
    this.isPersonalized = false;
  }

  /**
   * Extracts facial proportion ratios from 468 3D landmark mesh
   */
  extractUserFacialProportions(landmarks) {
    if (!landmarks || landmarks.length < 468) return null;

    // Landmark keypoint indices
    const leftPupil = landmarks[468] || landmarks[33];   // Left eye center
    const rightPupil = landmarks[473] || landmarks[263]; // Right eye center
    const leftCheek = landmarks[234];                     // Left cheekbone
    const rightCheek = landmarks[454];                    // Right cheekbone
    const leftJaw = landmarks[172];                       // Left jaw angle
    const rightJaw = landmarks[397];                      // Right jaw angle
    const noseTip = landmarks[1];                         // Nose tip
    const noseBridge = landmarks[6];                      // Upper nose bridge
    const topLip = landmarks[13];                         // Upper lip center
    const bottomLip = landmarks[14];                      // Lower lip center

    // Calculate Euclidean distances
    const ipd = this.distance3D(leftPupil, rightPupil);
    const faceWidth = this.distance3D(leftCheek, rightCheek);
    const jawWidth = this.distance3D(leftJaw, rightJaw);
    const noseLength = this.distance3D(noseBridge, noseTip);
    const lipThickness = this.distance3D(topLip, bottomLip);

    // Normalize proportions relative to IPD
    const scaleFactor = this.baseMetrics.ipd / (ipd || 0.06);

    this.userMetrics = {
      ipdRatio: (ipd * scaleFactor) / this.baseMetrics.ipd,
      faceWidthRatio: (faceWidth * scaleFactor) / this.baseMetrics.faceWidth,
      jawWidthRatio: (jawWidth * scaleFactor) / this.baseMetrics.jawWidth,
      noseLengthRatio: (noseLength * scaleFactor) / this.baseMetrics.noseLength,
      eyeScaleRatio: Math.min(1.3, Math.max(0.7, (ipd * scaleFactor) / 0.06)),
      lipThicknessRatio: Math.min(1.5, Math.max(0.7, (lipThickness * scaleFactor) / 0.02))
    };

    this.isPersonalized = true;
    console.log("Candidate A3 Personalization Proportions Derived:", this.userMetrics);
    return this.userMetrics;
  }

  /**
   * Applies personalized feature scaling to Three.js avatar skeleton & mesh nodes
   */
  applyPersonalizationToAvatar(avatarHeadMesh, skeletonBones = {}) {
    if (!this.userMetrics || !avatarHeadMesh) return false;

    const { faceWidthRatio, jawWidthRatio, noseLengthRatio, eyeScaleRatio } = this.userMetrics;

    // Deform main head mesh proportion scale
    avatarHeadMesh.scale.set(
      Math.min(1.25, Math.max(0.8, faceWidthRatio)),
      1.0,
      Math.min(1.2, Math.max(0.85, (faceWidthRatio + jawWidthRatio) / 2))
    );

    // Scale specific bone nodes if skeleton is bound
    if (skeletonBones.jawNode) {
      skeletonBones.jawNode.scale.x = Math.min(1.3, Math.max(0.7, jawWidthRatio));
    }
    if (skeletonBones.noseNode) {
      skeletonBones.noseNode.scale.y = Math.min(1.3, Math.max(0.7, noseLengthRatio));
    }
    if (skeletonBones.leftEyeNode && skeletonBones.rightEyeNode) {
      skeletonBones.leftEyeNode.scale.setScalar(eyeScaleRatio);
      skeletonBones.rightEyeNode.scale.setScalar(eyeScaleRatio);
    }

    return true;
  }

  distance3D(p1, p2) {
    if (!p1 || !p2) return 0.0;
    return Math.hypot(p2.x - p1.x, p2.y - p1.y, (p2.z || 0) - (p1.z || 0));
  }
}
