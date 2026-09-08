/**
 * Candidate A3 Avatar Personalization Engine (Anthropometric & Appearance Matching)
 * 
 * 1. Extracts 10 scale-invariant, distinct anthropometric facial proportions from 3D landmarks.
 * 2. Completely separates Parameter 1 (faceWidth) from Parameter 10 (cheekProminence).
 * 3. Samples live skin tone, hair color, and lip color from camera video canvas.
 * 4. Stably deforms the continuous 3D base mesh geometry and organ anchors during neutral calibration.
 * 5. Provides controlled Profile A (Wide) and Profile B (Narrow) presets for empirical A/B verification.
 */

export class AvatarPersonalizer {
  constructor() {
    this.userMetrics = null;
    this.appearance = null;
    this.isPersonalized = false;
    this.activeProfile = null;
  }

  /**
   * Extracts 10 distinct, non-overlapping anthropometric facial proportions from 3D landmarks
   * normalized against Inter-Pupillary Distance (IPD).
   */
  extractUserFacialProportions(landmarks, canvas = null) {
    if (!landmarks || landmarks.length < 468) return null;

    // --- Key Landmark Indices ---
    const leftPupil = landmarks[468] || landmarks[33];
    const rightPupil = landmarks[473] || landmarks[263];

    // 1. Face Width: Zygomatic arch breadth across lateral cheek arcs
    const leftZygoma = landmarks[234];
    const rightZygoma = landmarks[454];

    // 2. Face Height: Trichion/upper forehead to gnathion/chin tip
    const forehead = landmarks[10];
    const chinTip = landmarks[152];

    // 3. Jaw Width: Mandibular gonial angles
    const leftGonion = landmarks[172];
    const rightGonion = landmarks[397];

    // 4. Chin Projection: Subnasale / nose tip to chin tip & lateral Z depth
    const noseTip = landmarks[1];
    const noseBridge = landmarks[6];

    // 5. Eye Spacing: Inter-Pupillary Distance (IPD)
    // 6. Eye Aperture: Palpebral fissure vertical opening
    const leftEyeTop = landmarks[159], leftEyeBottom = landmarks[145];
    const rightEyeTop = landmarks[386], rightEyeBottom = landmarks[374];

    // 7. Nose Width: Alar base breadth
    const noseLeftAlar = landmarks[129];
    const noseRightAlar = landmarks[358];

    // 8. Nose Projection: Nasion to pronasale
    // (noseBridge #6 to noseTip #1)

    // 9. Mouth Width: Cheilions (corners of lips)
    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];

    // 10. Cheek Prominence: DISTINCT Malar Prominence Landmarks (#116 & #345)
    // Distinct from #234 and #454! Measures anterior malar volume projection.
    const leftMalar = landmarks[116];
    const rightMalar = landmarks[345];

    // --- 3D Euclidean Distances ---
    const ipd = this.distance3D(leftPupil, rightPupil) || 0.15;
    const faceWidthDist = this.distance3D(leftZygoma, rightZygoma);
    const faceHeightDist = this.distance3D(forehead, chinTip);
    const jawWidthDist = this.distance3D(leftGonion, rightGonion);
    const chinLengthDist = this.distance3D(noseTip, chinTip);
    const eyeApertureDist = (this.distance3D(leftEyeTop, leftEyeBottom) + this.distance3D(rightEyeTop, rightEyeBottom)) / 2;
    const noseWidthDist = this.distance3D(noseLeftAlar, noseRightAlar);
    const noseLengthDist = this.distance3D(noseBridge, noseTip);
    const mouthWidthDist = this.distance3D(mouthLeft, mouthRight);
    const malarWidthDist = this.distance3D(leftMalar, rightMalar);

    // Cheek anterior projection depth relative to eye plane
    const eyePlaneZ = (landmarks[33].z + landmarks[263].z) / 2;
    const malarPlaneZ = (leftMalar.z + rightMalar.z) / 2;
    const cheekDepthOffset = Math.max(0, malarPlaneZ - eyePlaneZ);

    // --- 10 Distinct Scale-Invariant Ratios Normalized by IPD ---
    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    // 1. Face Width Ratio (canonical Face Width / IPD: 2.30)
    const faceWidth = clamp((faceWidthDist / ipd) / 2.30, 0.82, 1.25);

    // 2. Face Height Ratio (canonical Face Height / IPD: 2.85)
    const faceHeight = clamp((faceHeightDist / ipd) / 2.85, 0.82, 1.22);

    // 3. Jaw Width Ratio (canonical Jaw Width / IPD: 1.85)
    const jawWidth = clamp((jawWidthDist / ipd) / 1.85, 0.75, 1.30);

    // 4. Chin Projection Ratio (incorporates vertical length + forward Z depth)
    const chinZOffset = Math.max(-0.04, Math.min(0.04, chinTip.z - noseTip.z));
    const chinProjection = clamp(((chinLengthDist / ipd) / 1.45) * (1.0 + chinZOffset * 2.5), 0.78, 1.25);

    // 5. Eye Spacing Ratio (normalized against face breadth)
    const eyeSpacing = clamp((ipd / (faceWidthDist / 2.30)) / 1.0, 0.85, 1.20);

    // 6. Eye Aperture Ratio (canonical eye opening / IPD: 0.12)
    const eyeAperture = clamp((eyeApertureDist / ipd) / 0.12, 0.80, 1.25);

    // 7. Nose Width Ratio (canonical alar width / IPD: 0.50)
    const noseWidth = clamp((noseWidthDist / ipd) / 0.50, 0.75, 1.35);

    // 8. Nose Projection Ratio (canonical nose length / IPD: 0.65)
    const noseProjection = clamp((noseLengthDist / ipd) / 0.65, 0.75, 1.30);

    // 9. Mouth Width Ratio (canonical mouth width / IPD: 0.85)
    const mouthWidth = clamp((mouthWidthDist / ipd) / 0.85, 0.75, 1.30);

    // 10. Cheek Prominence Ratio (DISTINCT from face width: malar breadth + anterior projection)
    const cheekProminence = clamp(((malarWidthDist / ipd) / 1.68) * (1.0 + cheekDepthOffset * 3.0), 0.80, 1.25);

    // Classify Face Shape for UI display
    let faceShape = "Oval";
    if (faceWidth > 1.08 && jawWidth > 1.08) {
      faceShape = "Square";
    } else if (faceWidth > 1.06 && faceHeight < 0.95) {
      faceShape = "Round";
    } else if (faceHeight > 1.08 && jawWidth < 0.95) {
      faceShape = "Oblong";
    } else if (faceWidth > 1.02 && jawWidth < 0.92) {
      faceShape = "Heart";
    }

    this.userMetrics = {
      faceShape,
      faceWidth,
      faceHeight,
      jawWidth,
      chinProjection,
      eyeSpacing,
      eyeAperture,
      noseWidth,
      noseProjection,
      mouthWidth,
      cheekProminence
    };

    if (canvas) {
      this.appearance = this.sampleAppearanceColors(canvas, landmarks);
    }

    this.isPersonalized = true;
    this.activeProfile = "User Neutral Live Profile";
    console.log("MocapLens: Candidate A3 10-Parameter Profile Derived:", this.userMetrics, this.appearance);

    return {
      metrics: this.userMetrics,
      appearance: this.appearance
    };
  }

  /**
   * Samples live skin tone, hair color, and lip color from canvas pixels
   */
  sampleAppearanceColors(canvas, landmarks) {
    try {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      const sampleRegion = (normX, normY, radius = 5) => {
        const px = Math.round(normX * w);
        const py = Math.round(normY * h);
        if (px < 0 || px >= w || py < 0 || py >= h) return null;

        const imgData = ctx.getImageData(Math.max(0, px - radius), Math.max(0, py - radius), radius * 2, radius * 2).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          r += imgData[i];
          g += imgData[i + 1];
          b += imgData[i + 2];
          count++;
        }
        return count > 0 ? { r: r / count / 255, g: g / count / 255, b: b / count / 255 } : null;
      };

      // 1. Forehead Skin Tone (between brows and hairline, Landmark #10)
      const foreheadPt = landmarks[10];
      const skinSample = sampleRegion(foreheadPt.x, foreheadPt.y - 0.02, 5) || { r: 0.88, g: 0.76, b: 0.65 };

      // 2. Hair Tone (above top of forehead, Landmark #10)
      const hairSample = sampleRegion(foreheadPt.x, Math.max(0.01, foreheadPt.y - 0.12), 6) || { r: 0.14, g: 0.09, b: 0.07 };

      // 3. Lip Tone (center of lower lip, Landmark #14)
      const lipPt = landmarks[14];
      const lipSample = sampleRegion(lipPt.x, lipPt.y, 4) || { r: 0.75, g: 0.44, b: 0.41 };

      const rgbToHex = (c) => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');

      return {
        skin: skinSample,
        hair: hairSample,
        lip: lipSample,
        skinHex: rgbToHex(skinSample),
        hairHex: rgbToHex(hairSample),
        lipHex: rgbToHex(lipSample)
      };
    } catch (e) {
      console.warn("Appearance color sampling warning:", e);
      return null;
    }
  }

  /**
   * Stably deforms the continuous 3D avatar base mesh geometry and organ anchors
   * to permanently match the 10 personalized facial proportions.
   */
  applyPersonalizationToAvatar(avatarViewer) {
    if (!this.userMetrics || !avatarViewer || !avatarViewer.headMesh) return false;

    const m = this.userMetrics;
    const n = avatarViewer.nodes;
    const mats = avatarViewer.materials;
    const geo = avatarViewer.baseGeometry;
    const orig = avatarViewer.originalPositions;

    // 1. Genuine Vertex-Level Base Geometry Deformation
    if (geo && orig) {
      const posAttr = geo.attributes.position;
      const arr = posAttr.array;

      for (let i = 0; i < orig.length; i += 3) {
        let x = orig[i];
        let y = orig[i + 1];
        let z = orig[i + 2];

        // A. Global Cranial & Facial Proportions
        x *= m.faceWidth;
        y *= m.faceHeight;

        // B. Lower-Face Jaw Width Deformation (y < -0.02)
        if (y < -0.02) {
          const jawFactor = Math.min(1.0, (-0.02 - y) / 0.12);
          const jawScale = THREE.MathUtils.lerp(1.0, m.jawWidth / m.faceWidth, jawFactor);
          x *= jawScale;
        }

        // C. Chin Prominence & Projection (y ∈ [-0.145, -0.080], |x| < 0.05)
        if (y < -0.080 && y > -0.145 && Math.abs(x) < 0.055) {
          const chinWeight = Math.sin(((y - (-0.145)) / 0.065) * Math.PI) * (1.0 - Math.abs(x) / 0.055);
          z += (m.chinProjection - 1.0) * 0.032 * chinWeight;
          y += (m.chinProjection - 1.0) * 0.008 * chinWeight;
        }

        // D. Zygomatic Cheek Prominence (y ∈ [-0.01, 0.06], |x| ∈ [0.055, 0.13])
        if (y > -0.01 && y < 0.06 && Math.abs(x) > 0.055 && Math.abs(x) < 0.135) {
          const cheekWeight = Math.sin(((y - (-0.01)) / 0.07) * Math.PI) * Math.sin(((Math.abs(x) - 0.055) / 0.080) * Math.PI);
          z += (m.cheekProminence - 1.0) * 0.028 * cheekWeight;
          x += (x > 0 ? 1 : -1) * (m.cheekProminence - 1.0) * 0.012 * cheekWeight;
        }

        // E. 3D Nose Width & Projection (|x| < 0.040, y ∈ [-0.035, 0.080])
        if (Math.abs(x) < 0.040 && y > -0.035 && y < 0.080) {
          const noseWeight = (1.0 - Math.abs(x) / 0.040) * Math.sin(((y - (-0.035)) / 0.115) * Math.PI);
          x *= THREE.MathUtils.lerp(1.0, m.noseWidth, noseWeight);
          z += (m.noseProjection - 1.0) * 0.024 * noseWeight;
        }

        // F. Mouth Width (|x| < 0.060, y ∈ [-0.085, -0.028])
        if (Math.abs(x) < 0.060 && y > -0.085 && y < -0.028) {
          const mouthWeight = (1.0 - Math.abs(x) / 0.060) * Math.sin(((y - (-0.085)) / 0.057) * Math.PI);
          x *= THREE.MathUtils.lerp(1.0, m.mouthWidth, mouthWeight);
        }

        arr[i] = x;
        arr[i + 1] = y;
        arr[i + 2] = z;
      }

      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
    }

    // 2. Organ Node Anchors & Sub-Mesh Scaling
    // Eye Spacing & Eye Aperture
    if (n.leftEye && n.rightEye) {
      const eyeX = 0.065 * m.eyeSpacing * m.faceWidth;
      n.leftEye.position.x = -eyeX;
      n.rightEye.position.x = eyeX;
      n.leftEye.scale.setScalar(m.eyeAperture);
      n.rightEye.scale.setScalar(m.eyeAperture);
    }

    if (n.leftEyelidUpper && n.rightEyelidUpper) {
      const eyeX = 0.065 * m.eyeSpacing * m.faceWidth;
      n.leftEyelidUpper.position.x = -eyeX;
      n.rightEyelidUpper.position.x = eyeX;
      n.leftEyelidUpper.scale.setScalar(m.eyeAperture);
      n.rightEyelidUpper.scale.setScalar(m.eyeAperture);
    }

    if (n.leftBrow && n.rightBrow) {
      const eyeX = 0.065 * m.eyeSpacing * m.faceWidth;
      n.leftBrow.position.x = (n.leftBrow.position.x < 0 ? -1 : 1) * (0.065 * m.eyeSpacing * m.faceWidth - 0.065);
      n.rightBrow.position.x = (n.rightBrow.position.x < 0 ? -1 : 1) * (0.065 * m.eyeSpacing * m.faceWidth - 0.065);
    }

    // Mouth Width Anchor
    if (n.mouth) {
      n.mouth.scale.x = m.mouthWidth;
    }

    // Ears Lateral Placement
    if (n.leftEar && n.rightEar) {
      n.leftEar.position.x = -0.165 * m.faceWidth;
      n.rightEar.position.x = 0.165 * m.faceWidth;
    }

    // Hair Mass Scaling
    if (n.hair) {
      n.hair.scale.set(m.faceWidth, m.faceHeight, (m.faceWidth + m.faceHeight) / 2);
    }

    // Neck Width
    if (n.neck) {
      const neckW = THREE.MathUtils.lerp(1.0, m.jawWidth, 0.7);
      n.neck.scale.set(neckW, 1.0, neckW);
    }

    // 3. Appearance Material Tone Personalization
    if (this.appearance && mats) {
      if (mats.skinMat && this.appearance.skin) {
        mats.skinMat.color.setRGB(
          Math.min(1.0, this.appearance.skin.r * 1.06),
          Math.min(1.0, this.appearance.skin.g * 1.06),
          Math.min(1.0, this.appearance.skin.b * 1.06)
        );
      }
      if (mats.hairMat && this.appearance.hair) {
        mats.hairMat.color.setRGB(this.appearance.hair.r, this.appearance.hair.g, this.appearance.hair.b);
      }
      if (mats.browHairMat && this.appearance.hair) {
        mats.browHairMat.color.setRGB(
          this.appearance.hair.r * 0.85,
          this.appearance.hair.g * 0.85,
          this.appearance.hair.b * 0.85
        );
      }
      if (mats.lipMat && this.appearance.lip) {
        mats.lipMat.color.setRGB(this.appearance.lip.r, this.appearance.lip.g, this.appearance.lip.b);
      }
    }

    console.log(`MocapLens: Stably Deformed 3D Avatar to Personalized Face Shape [${m.faceShape}] ✅`);
    return true;
  }

  // --- Controlled A/B Calibration Verification Profiles ---

  /**
   * Profile A: Wide, robust face shape with broad jaw, wide eye spacing, and strong cheekbones
   */
  applyProfileA(avatarViewer) {
    this.userMetrics = {
      faceShape: "Square / Broad",
      faceWidth: 1.18,
      faceHeight: 0.96,
      jawWidth: 1.22,
      chinProjection: 1.15,
      eyeSpacing: 1.16,
      eyeAperture: 1.10,
      noseWidth: 1.18,
      noseProjection: 1.08,
      mouthWidth: 1.14,
      cheekProminence: 1.20
    };
    this.appearance = {
      skin: { r: 0.86, g: 0.72, b: 0.60 },
      hair: { r: 0.18, g: 0.11, b: 0.08 },
      lip: { r: 0.72, g: 0.42, b: 0.40 }
    };
    this.isPersonalized = true;
    this.activeProfile = "Controlled Calibration Profile A (Broad)";
    this.applyPersonalizationToAvatar(avatarViewer);
    return this.userMetrics;
  }

  /**
   * Profile B: Narrow, elongated face shape with tapered jaw, closer eye spacing, and delicate chin
   */
  applyProfileB(avatarViewer) {
    this.userMetrics = {
      faceShape: "Oblong / Slender",
      faceWidth: 0.86,
      faceHeight: 1.09,
      jawWidth: 0.80,
      chinProjection: 0.88,
      eyeSpacing: 0.88,
      eyeAperture: 0.90,
      noseWidth: 0.86,
      noseProjection: 0.94,
      mouthWidth: 0.86,
      cheekProminence: 0.85
    };
    this.appearance = {
      skin: { r: 0.92, g: 0.80, b: 0.70 },
      hair: { r: 0.09, g: 0.07, b: 0.06 },
      lip: { r: 0.80, g: 0.46, b: 0.45 }
    };
    this.isPersonalized = true;
    this.activeProfile = "Controlled Calibration Profile B (Slender)";
    this.applyPersonalizationToAvatar(avatarViewer);
    return this.userMetrics;
  }

  distance3D(p1, p2) {
    if (!p1 || !p2) return 0.0;
    return Math.hypot(p2.x - p1.x, p2.y - p1.y, (p2.z || 0) - (p1.z || 0));
  }
}
