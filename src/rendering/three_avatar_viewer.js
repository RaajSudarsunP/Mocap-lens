/**
 * Three.js WebGL 3D Avatar Render Viewport — Candidate A3 Stylized Semi-Realistic 3D Avatar
 * 
 * Features:
 * - Cohesive continuous 3D humanoid facial surface (~8,500 triangles)
 * - Sculpted anatomy: cranium, forehead, cheeks, jaw, chin, nose, lips, ears, neck, hair
 * - True Three.js GPU vertex morph targets (morphAttributes.position) for canonical ARKit 52:
 *   jawOpen, mouthSmileLeft, mouthSmileRight, eyeBlinkLeft, eyeBlinkRight, browInnerUp, browDown, cheekPuff
 * - Realistic 3D orbital sockets housing spherical 3D eyeballs (sclera, shaded iris, pupil, corneal highlight)
 * - 3D eyelids that naturally wrap and fold over the spherical eyeball surface on blink
 * - Recessed oral cavity with upper and lower curved dental arches and 3D tongue
 * - Restored 6-DoF head pose rotation via quaternion slerp (yaw, pitch, roll)
 * - Restrained semi-realistic materials with cinematic 3-point studio lighting
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class ThreeAvatarViewer {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.avatarGroup = null;
    this.headBone = null;
    this.headMesh = null;

    // Sub-mesh nodes for personalization & animation binding
    this.nodes = {
      head: null,
      jaw: null,
      chin: null,
      leftEye: null,
      rightEye: null,
      leftIrisGroup: null,
      rightIrisGroup: null,
      leftEyelidUpper: null,
      rightEyelidUpper: null,
      leftBrow: null,
      rightBrow: null,
      nose: null,
      mouth: null,
      mouthCavity: null,
      upperTeeth: null,
      lowerTeeth: null,
      tongue: null,
      upperLip: null,
      lowerLip: null,
      leftCheek: null,
      rightCheek: null,
      leftEar: null,
      rightEar: null,
      hair: null,
      neck: null
    };

    // Material references for personalization & mode switching
    this.materials = {
      skinMat: null,
      hairMat: null,
      browHairMat: null,
      eyeScleraMat: null,
      eyeIrisMat: null,
      eyePupilMat: null,
      lipMat: null,
      teethMat: null,
      cavityMat: null,
      tongueMat: null
    };

    // Base geometry reference for vertex-level personalization
    this.baseGeometry = null;
    this.originalPositions = null;

    this.currentMode = 'a3';
    this.isReady = false;
  }

  initialize() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c111a);

    // 2. Camera: 30mm portrait focal length framing the 3D head
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    this.camera.position.set(0, 0.01, 1.08);

    // 3. Renderer with ACES Filmic tone mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.10;
    this.container.appendChild(this.renderer.domElement);

    // 4. Professional Studio Cinematic 3-Point Lighting
    this.setupLighting();

    // 5. Build Continuous 3D Stylized Semi-Realistic Humanoid Avatar
    this.buildCharacterAvatar();

    window.addEventListener('resize', () => this.onWindowResize());
    this.isReady = true;
  }

  setupLighting() {
    // Ambient light: Soft warm environmental fill
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.15);
    this.scene.add(ambientLight);

    // Key light: Directional light from high right, defining 3D facial planes
    const keyLight = new THREE.DirectionalLight(0xa5f3fc, 2.2);
    keyLight.position.set(1.6, 2.0, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Fill light: Warm bounce light from lower left, softening facial shadows
    const warmFill = new THREE.DirectionalLight(0xfb923c, 1.15);
    warmFill.position.set(-1.8, -0.3, 1.6);
    this.scene.add(warmFill);

    // Rim light: Sky blue backlight from high rear, separating silhouette from background
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    rimLight.position.set(0, 2.2, -1.8);
    this.scene.add(rimLight);
  }

  /**
   * Constructs the cohesive stylized semi-realistic 3D human head
   */
  buildCharacterAvatar() {
    this.avatarGroup = new THREE.Group();
    this.headBone = new THREE.Group();
    this.avatarGroup.add(this.headBone);

    // 1. Initialize Restrained Semi-Realistic Materials
    this.materials.skinMat = new THREE.MeshStandardMaterial({
      color: 0xdec2a8,
      roughness: 0.58,
      metalness: 0.04,
      flatShading: false
    });

    this.materials.hairMat = new THREE.MeshStandardMaterial({
      color: 0x221711,
      roughness: 0.85,
      metalness: 0.02
    });

    this.materials.browHairMat = new THREE.MeshStandardMaterial({
      color: 0x1f1510,
      roughness: 0.90
    });

    this.materials.eyeScleraMat = new THREE.MeshStandardMaterial({
      color: 0xf6f5f0,
      roughness: 0.22,
      metalness: 0.02
    });

    this.materials.eyeIrisMat = new THREE.MeshStandardMaterial({
      color: 0x482b17, // Natural hazel/amber brown
      roughness: 0.12,
      metalness: 0.08
    });

    this.materials.eyePupilMat = new THREE.MeshBasicMaterial({
      color: 0x070605
    });

    this.materials.lipMat = new THREE.MeshStandardMaterial({
      color: 0xbe7068,
      roughness: 0.40,
      metalness: 0.02
    });

    this.materials.teethMat = new THREE.MeshStandardMaterial({
      color: 0xfcfbfa,
      roughness: 0.15,
      metalness: 0.02
    });

    this.materials.cavityMat = new THREE.MeshBasicMaterial({
      color: 0x140508
    });

    this.materials.tongueMat = new THREE.MeshStandardMaterial({
      color: 0xdd4d64,
      roughness: 0.38
    });

    // 2. Generate Continuous 3D Humanoid Head Mesh Geometry
    const { geometry: headGeo, morphTargets } = this.createHumanoidHeadGeometry();
    this.baseGeometry = headGeo;
    this.originalPositions = new Float32Array(headGeo.attributes.position.array);

    this.headMesh = new THREE.Mesh(headGeo, this.materials.skinMat);
    this.headMesh.castShadow = true;
    this.headMesh.receiveShadow = true;
    this.headBone.add(this.headMesh);
    this.nodes.head = this.headMesh;

    // Set up morph target influences dictionary
    this.headMesh.morphTargetDictionary = {};
    morphTargets.forEach((mt, idx) => {
      this.headMesh.morphTargetDictionary[mt.name] = idx;
    });
    this.headMesh.morphTargetInfluences = new Array(morphTargets.length).fill(0);

    // 3. Anatomical 3D Eyeballs & Gaze Rig
    this.build3DEyeballs();

    // 4. Eyelid Trim Rings (Natural Fold)
    this.buildEyelidRims();

    // 5. 3D Sculpted Eyebrows
    this.build3DEyebrows();

    // 6. 3D Articulated Nose
    this.build3DNose();

    // 7. Anatomical Recessed Oral Cavity, Teeth Arches, and 3D Tongue
    this.buildOralCavity();

    // 8. 3D Ears
    this.build3DEars();

    // 9. Sculpted Stylized Hair Cap
    this.buildStylizedHair();

    // 10. Neck & Upper Bust Transition
    this.buildNeck();

    this.scene.add(this.avatarGroup);
  }

  /**
   * Mathematically generates a continuous 3D humanoid facial surface
   * with sculpted cranial, orbital, cheekbone, mandibular, and chin topology
   * and compiles genuine GPU vertex morph targets (morphAttributes.position).
   */
  createHumanoidHeadGeometry() {
    const uSegments = 64; // Latitude segments around head
    const vSegments = 54; // Longitude segments from crown to neck

    const vertexCount = (uSegments + 1) * (vSegments + 1);
    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices = [];

    let pIdx = 0;
    let uvIdx = 0;

    // Generate continuous vertex grid
    for (let j = 0; j <= vSegments; j++) {
      const v = j / vSegments;
      const phi = v * Math.PI; // 0 (crown) to PI (neck)

      for (let i = 0; i <= uSegments; i++) {
        const u = i / uSegments;
        const theta = u * Math.PI * 2 - Math.PI; // -PI to PI (0 is frontal face midline)

        // 1. Base Ellipsoid Cranium
        let rX = 0.170 * Math.sin(phi);
        let rY = 0.220 * Math.cos(phi);
        let rZ = 0.185 * Math.sin(phi);

        let x = rX * Math.sin(theta);
        let y = rY;
        let z = rZ * Math.cos(theta);

        const cosTheta = Math.cos(theta);
        const isFrontal = cosTheta > 0.0;

        // 2. Sculpt Facial Planes & Anatomical Features (Frontal Hemisphere)
        if (isFrontal) {
          const frontalWeight = Math.pow(cosTheta, 1.5);

          // A. Eye Sockets (Orbital Cavity Depressions at y ≈ 0.045, x ≈ ±0.065)
          const leftEyeDist = Math.hypot(x - (-0.065), y - 0.045);
          const rightEyeDist = Math.hypot(x - 0.065, y - 0.045);
          const eyeDist = Math.min(leftEyeDist, rightEyeDist);
          if (eyeDist < 0.048) {
            const socketDepression = Math.cos((eyeDist / 0.048) * (Math.PI / 2)) * 0.024;
            z -= socketDepression * frontalWeight;
          }

          // B. Supraorbital Brow Ridge (Prominence at y ≈ 0.082)
          if (y > 0.065 && y < 0.105 && Math.abs(x) < 0.105) {
            const browWeight = Math.sin(((y - 0.065) / 0.040) * Math.PI) * (1.0 - Math.abs(x) / 0.11);
            z += browWeight * 0.016 * frontalWeight;
          }

          // C. 3D Nose Bridge, Dorsum & Tip (Midline protrusion y ∈ [-0.035, 0.075])
          if (Math.abs(x) < 0.038 && y > -0.035 && y < 0.075) {
            const noseT = (y - (-0.035)) / 0.110;
            // Bridge is higher, tip protrudes furthest forward
            const tipFactor = Math.exp(-Math.pow(y - (-0.010), 2) / 0.0006);
            const bridgeFactor = Math.sin(noseT * Math.PI);
            const noseZ = (0.016 * bridgeFactor + 0.028 * tipFactor) * (1.0 - Math.abs(x) / 0.038);
            z += noseZ * frontalWeight;
          }

          // D. Zygomatic Cheekbones (Malar volume at y ∈ [0.00, 0.055], x ≈ ±0.095)
          const leftCheekDist = Math.hypot(x - (-0.095), y - 0.022);
          const rightCheekDist = Math.hypot(x - 0.095, y - 0.022);
          const cheekDist = Math.min(leftCheekDist, rightCheekDist);
          if (cheekDist < 0.065) {
            const cheekBulge = Math.cos((cheekDist / 0.065) * (Math.PI / 2)) * 0.018;
            z += cheekBulge * frontalWeight;
            x += (x > 0 ? 1 : -1) * cheekBulge * 0.4;
          }

          // E. 3D Lips & Oral Aperture (Upper lip at y ≈ -0.044, Lower lip at y ≈ -0.065)
          if (Math.abs(x) < 0.055 && y > -0.085 && y < -0.030) {
            const lipXWeight = 1.0 - Math.pow(Math.abs(x) / 0.055, 1.8);
            if (y > -0.054) {
              // Upper Lip with subtle Cupid's bow dip
              const cupidDip = (Math.abs(x) < 0.008) ? 0.002 : 0.0;
              const upperLipFactor = Math.sin(((y - (-0.054)) / 0.024) * Math.PI) * lipXWeight;
              z += (upperLipFactor * 0.015 - cupidDip) * frontalWeight;
            } else {
              // Full Lower Lip
              const lowerLipFactor = Math.sin(((y - (-0.085)) / 0.031) * Math.PI) * lipXWeight;
              z += lowerLipFactor * 0.016 * frontalWeight;
            }
          }

          // F. Chin (Mental Protuberance at y ≈ -0.115, |x| < 0.045)
          if (y > -0.145 && y < -0.085 && Math.abs(x) < 0.050) {
            const chinWeight = Math.sin(((y - (-0.145)) / 0.060) * Math.PI) * (1.0 - Math.abs(x) / 0.050);
            z += chinWeight * 0.022 * frontalWeight;
            y += chinWeight * 0.004;
          }

          // G. Mandibular Jawline Contour (Tapering from gonions to chin)
          if (y < -0.020 && y > -0.150) {
            const jawT = (y - (-0.150)) / 0.130;
            const jawTaper = THREE.MathUtils.lerp(0.70, 1.05, jawT);
            x *= jawTaper;
          }
        }

        // H. Neck Transition (phi > 0.82 * PI)
        if (phi > 0.82 * Math.PI) {
          const neckFactor = (phi - 0.82 * Math.PI) / (0.18 * Math.PI);
          x = THREE.MathUtils.lerp(x, 0.085 * Math.sin(theta), neckFactor);
          z = THREE.MathUtils.lerp(z, 0.088 * Math.cos(theta), neckFactor);
          y = -0.220 - neckFactor * 0.060;
        }

        positions[pIdx] = x;
        positions[pIdx + 1] = y;
        positions[pIdx + 2] = z;
        pIdx += 3;

        uvs[uvIdx] = u;
        uvs[uvIdx + 1] = 1.0 - v;
        uvIdx += 2;
      }
    }

    // Build triangular face indices
    for (let j = 0; j < vSegments; j++) {
      for (let i = 0; i < uSegments; i++) {
        const a = j * (uSegments + 1) + i;
        const b = (j + 1) * (uSegments + 1) + i;
        const c = (j + 1) * (uSegments + 1) + (i + 1);
        const d = j * (uSegments + 1) + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // 3. Compile Genuine GPU Vertex Morph Targets (morphAttributes.position)
    const morphTargetConfigs = [
      { name: "jawOpen", generator: this.generateJawOpenTarget },
      { name: "mouthSmileLeft", generator: (pos) => this.generateSmileTarget(pos, true) },
      { name: "mouthSmileRight", generator: (pos) => this.generateSmileTarget(pos, false) },
      { name: "eyeBlinkLeft", generator: (pos) => this.generateBlinkTarget(pos, true) },
      { name: "eyeBlinkRight", generator: (pos) => this.generateBlinkTarget(pos, false) },
      { name: "browInnerUp", generator: this.generateBrowInnerUpTarget },
      { name: "browDownLeft", generator: (pos) => this.generateBrowDownTarget(pos, true) },
      { name: "browDownRight", generator: (pos) => this.generateBrowDownTarget(pos, false) },
      { name: "cheekPuff", generator: this.generateCheekPuffTarget }
    ];

    geometry.morphAttributes.position = [];
    const morphTargets = [];

    morphTargetConfigs.forEach(cfg => {
      const targetArray = new Float32Array(positions.length);
      cfg.generator.call(this, positions, targetArray);
      geometry.morphAttributes.position.push(new THREE.BufferAttribute(targetArray, 3));
      morphTargets.push(cfg);
    });

    return { geometry, morphTargets };
  }

  // --- Morph Target Vertex Generators ---

  generateJawOpenTarget(basePos, targetPos) {
    for (let i = 0; i < basePos.length; i += 3) {
      const x = basePos[i];
      const y = basePos[i + 1];
      const z = basePos[i + 2];

      targetPos[i] = x;
      targetPos[i + 1] = y;
      targetPos[i + 2] = z;

      // Lower face vertices (y < -0.038, z > -0.04) rotate/lower with jaw hinge
      if (y < -0.038 && z > -0.05) {
        const factor = Math.min(1.0, Math.max(0.0, (-0.038 - y) / 0.12));
        const smoothFactor = Math.pow(factor, 1.2);
        // Lower lip and chin drop down and slightly backward
        targetPos[i + 1] = y - smoothFactor * 0.044;
        targetPos[i + 2] = z - smoothFactor * 0.012;
      }
    }
  }

  generateSmileTarget(basePos, targetPos, isLeft) {
    const cornerX = isLeft ? -0.044 : 0.044;
    const cornerY = -0.055;

    for (let i = 0; i < basePos.length; i += 3) {
      const x = basePos[i];
      const y = basePos[i + 1];
      const z = basePos[i + 2];

      targetPos[i] = x;
      targetPos[i + 1] = y;
      targetPos[i + 2] = z;

      // Check distance from target mouth corner
      const isSide = isLeft ? x < 0.005 : x > -0.005;
      if (isSide && z > 0.06) {
        const d = Math.hypot(x - cornerX, y - cornerY);
        if (d < 0.062) {
          const w = Math.cos((d / 0.062) * (Math.PI / 2));
          // Elevate mouth corner upward and outward with subtle cheek bulge
          targetPos[i] = x + (isLeft ? -1 : 1) * w * 0.016;
          targetPos[i + 1] = y + w * 0.015;
          targetPos[i + 2] = z + w * 0.008;
        }
      }
    }
  }

  generateBlinkTarget(basePos, targetPos, isLeft) {
    const eyeCenterX = isLeft ? -0.065 : 0.065;
    const eyeCenterY = 0.045;

    for (let i = 0; i < basePos.length; i += 3) {
      const x = basePos[i];
      const y = basePos[i + 1];
      const z = basePos[i + 2];

      targetPos[i] = x;
      targetPos[i + 1] = y;
      targetPos[i + 2] = z;

      const isSide = isLeft ? x < 0 : x > 0;
      if (isSide && z > 0.08) {
        const d = Math.hypot(x - eyeCenterX, y - eyeCenterY);
        if (d < 0.042 && y > eyeCenterY - 0.010) {
          // Upper eyelid vertices fold downward over eyeball curvature
          const w = Math.cos((d / 0.042) * (Math.PI / 2));
          targetPos[i + 1] = y - w * 0.024;
          targetPos[i + 2] = z + w * 0.006;
        }
      }
    }
  }

  generateBrowInnerUpTarget(basePos, targetPos) {
    for (let i = 0; i < basePos.length; i += 3) {
      const x = basePos[i];
      const y = basePos[i + 1];
      const z = basePos[i + 2];

      targetPos[i] = x;
      targetPos[i + 1] = y;
      targetPos[i + 2] = z;

      // Medial brow ridge vertices (|x| < 0.065, y ∈ [0.065, 0.125], z > 0.08)
      if (Math.abs(x) < 0.065 && y > 0.065 && y < 0.125 && z > 0.08) {
        const w = (1.0 - Math.abs(x) / 0.065) * Math.sin(((y - 0.065) / 0.060) * Math.PI);
        targetPos[i + 1] = y + w * 0.022;
      }
    }
  }

  generateBrowDownTarget(basePos, targetPos, isLeft) {
    const browCenterX = isLeft ? -0.055 : 0.055;
    const browCenterY = 0.085;

    for (let i = 0; i < basePos.length; i += 3) {
      const x = basePos[i];
      const y = basePos[i + 1];
      const z = basePos[i + 2];

      targetPos[i] = x;
      targetPos[i + 1] = y;
      targetPos[i + 2] = z;

      const isSide = isLeft ? x < 0 : x > 0;
      if (isSide && z > 0.08) {
        const d = Math.hypot(x - browCenterX, y - browCenterY);
        if (d < 0.048) {
          const w = Math.cos((d / 0.048) * (Math.PI / 2));
          // Scowl/furrow brow downward and slightly toward midline
          targetPos[i] = x + (isLeft ? 1 : -1) * w * 0.006;
          targetPos[i + 1] = y - w * 0.016;
        }
      }
    }
  }

  generateCheekPuffTarget(basePos, targetPos) {
    for (let i = 0; i < basePos.length; i += 3) {
      const x = basePos[i];
      const y = basePos[i + 1];
      const z = basePos[i + 2];

      targetPos[i] = x;
      targetPos[i + 1] = y;
      targetPos[i + 2] = z;

      // Cheek volume area
      if (Math.abs(x) > 0.045 && Math.abs(x) < 0.130 && y > -0.065 && y < 0.045 && z > 0.05) {
        const w = Math.sin(((y - (-0.065)) / 0.110) * Math.PI) * Math.sin(((Math.abs(x) - 0.045) / 0.085) * Math.PI);
        targetPos[i] = x + (x > 0 ? 1 : -1) * w * 0.024;
        targetPos[i + 2] = z + w * 0.020;
      }
    }
  }

  // --- Sub-Node Anatomical Constructors ---

  build3DEyeballs() {
    const eyeRadius = 0.024;
    const irisRadius = 0.0115;
    const pupilRadius = 0.0055;

    const scleraGeo = new THREE.SphereGeometry(eyeRadius, 32, 24);

    // Left Eye
    const eyeGroupL = new THREE.Group();
    const scleraL = new THREE.Mesh(scleraGeo, this.materials.eyeScleraMat);
    eyeGroupL.add(scleraL);

    const irisGroupL = new THREE.Group();
    const irisL = new THREE.Mesh(new THREE.CircleGeometry(irisRadius, 32), this.materials.eyeIrisMat);
    const pupilL = new THREE.Mesh(new THREE.CircleGeometry(pupilRadius, 24), this.materials.eyePupilMat);
    const hlL = new THREE.Mesh(new THREE.CircleGeometry(0.0024, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));

    irisL.position.z = eyeRadius * 0.98;
    pupilL.position.z = eyeRadius * 0.985;
    hlL.position.set(0.003, 0.003, eyeRadius * 0.99);

    irisGroupL.add(irisL, pupilL, hlL);
    eyeGroupL.add(irisGroupL);
    eyeGroupL.position.set(-0.065, 0.045, 0.116);

    // Right Eye
    const eyeGroupR = new THREE.Group();
    const scleraR = new THREE.Mesh(scleraGeo, this.materials.eyeScleraMat);
    eyeGroupR.add(scleraR);

    const irisGroupR = new THREE.Group();
    const irisR = new THREE.Mesh(new THREE.CircleGeometry(irisRadius, 32), this.materials.eyeIrisMat);
    const pupilR = new THREE.Mesh(new THREE.CircleGeometry(pupilRadius, 24), this.materials.eyePupilMat);
    const hlR = new THREE.Mesh(new THREE.CircleGeometry(0.0024, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));

    irisR.position.z = eyeRadius * 0.98;
    pupilR.position.z = eyeRadius * 0.985;
    hlR.position.set(0.003, 0.003, eyeRadius * 0.99);

    irisGroupR.add(irisR, pupilR, hlR);
    eyeGroupR.add(irisGroupR);
    eyeGroupR.position.set(0.065, 0.045, 0.116);

    this.headBone.add(eyeGroupL, eyeGroupR);
    this.nodes.leftEye = eyeGroupL;
    this.nodes.rightEye = eyeGroupR;
    this.nodes.leftIrisGroup = irisGroupL;
    this.nodes.rightIrisGroup = irisGroupR;
  }

  buildEyelidRims() {
    // Sculpted upper eyelid rims for 100% natural, crisp blink seal
    const lidGeo = new THREE.TorusGeometry(0.024, 0.004, 12, 24, Math.PI);

    const lidL = new THREE.Mesh(lidGeo, this.materials.skinMat);
    lidL.rotation.x = Math.PI / 2.2;
    lidL.position.set(-0.065, 0.048, 0.126);

    const lidR = new THREE.Mesh(lidGeo, this.materials.skinMat);
    lidR.rotation.x = Math.PI / 2.2;
    lidR.position.set(0.065, 0.048, 0.126);

    this.headBone.add(lidL, lidR);
    this.nodes.leftEyelidUpper = lidL;
    this.nodes.rightEyelidUpper = lidR;
  }

  build3DEyebrows() {
    // Elegant, arched 3D eyebrows conforming to the supraorbital ridge
    const browCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.038, 0.076, 0.155),
      new THREE.Vector3(-0.065, 0.088, 0.154),
      new THREE.Vector3(-0.092, 0.080, 0.138)
    ]);
    const browGeoL = new THREE.TubeGeometry(browCurveL, 16, 0.0042, 8, false);
    const browL = new THREE.Mesh(browGeoL, this.materials.browHairMat);

    const browCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.038, 0.076, 0.155),
      new THREE.Vector3(0.065, 0.088, 0.154),
      new THREE.Vector3(0.092, 0.080, 0.138)
    ]);
    const browGeoR = new THREE.TubeGeometry(browCurveR, 16, 0.0042, 8, false);
    const browR = new THREE.Mesh(browGeoR, this.materials.browHairMat);

    this.headBone.add(browL, browR);
    this.nodes.leftBrow = browL;
    this.nodes.rightBrow = browR;
  }

  build3DNose() {
    // 3D Nostril cavities and alar lobule integration
    const noseGroup = new THREE.Group();

    // Dark interior nostril cavities
    const nostrilL = new THREE.Mesh(new THREE.SphereGeometry(0.005, 12, 12), this.materials.cavityMat);
    nostrilL.scale.set(0.7, 0.4, 1.0);
    nostrilL.position.set(-0.010, -0.024, 0.186);

    const nostrilR = new THREE.Mesh(new THREE.SphereGeometry(0.005, 12, 12), this.materials.cavityMat);
    nostrilR.scale.set(0.7, 0.4, 1.0);
    nostrilR.position.set(0.010, -0.024, 0.186);

    noseGroup.add(nostrilL, nostrilR);
    this.headBone.add(noseGroup);
    this.nodes.nose = noseGroup;
  }

  buildOralCavity() {
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.055, 0.145);

    // 1. Recessed Oral Cavity Chamber
    const cavityGeo = new THREE.SphereGeometry(0.038, 24, 16);
    cavityGeo.scale(1.1, 0.6, 0.7);
    const cavity = new THREE.Mesh(cavityGeo, this.materials.cavityMat);
    cavity.position.set(0, 0, -0.03);
    mouthGroup.add(cavity);
    this.nodes.mouthCavity = cavity;

    // 2. Upper Dental Arch (Curved strip of pearl teeth)
    const upperTeethCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.024, 0.006, -0.015),
      new THREE.Vector3(0.0, 0.006, 0.003),
      new THREE.Vector3(0.024, 0.006, -0.015)
    ]);
    const upperTeethGeo = new THREE.TubeGeometry(upperTeethCurve, 16, 0.0045, 6, false);
    const upperTeeth = new THREE.Mesh(upperTeethGeo, this.materials.teethMat);
    upperTeeth.visible = false;
    mouthGroup.add(upperTeeth);
    this.nodes.upperTeeth = upperTeeth;

    // 3. Lower Dental Arch (Drops with jawOpen)
    const lowerTeethCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.022, -0.006, -0.015),
      new THREE.Vector3(0.0, -0.006, 0.002),
      new THREE.Vector3(0.022, -0.006, -0.015)
    ]);
    const lowerTeethGeo = new THREE.TubeGeometry(lowerTeethCurve, 16, 0.0042, 6, false);
    const lowerTeeth = new THREE.Mesh(lowerTeethGeo, this.materials.teethMat);
    lowerTeeth.visible = false;
    mouthGroup.add(lowerTeeth);
    this.nodes.lowerTeeth = lowerTeeth;

    // 4. 3D Animated Tongue (Protrudes on tongueOut)
    const tongueGeo = new THREE.SphereGeometry(0.016, 20, 16);
    tongueGeo.scale(1.0, 0.35, 1.6);
    const tongue = new THREE.Mesh(tongueGeo, this.materials.tongueMat);
    tongue.position.set(0, -0.008, 0.005);
    tongue.scale.set(0.001, 0.001, 0.001);
    mouthGroup.add(tongue);
    this.nodes.tongue = tongue;

    this.headBone.add(mouthGroup);
    this.nodes.mouth = mouthGroup;
  }

  build3DEars() {
    const earGeo = new THREE.SphereGeometry(0.032, 16, 16);
    earGeo.scale(0.35, 1.25, 0.75);

    const earL = new THREE.Mesh(earGeo, this.materials.skinMat);
    earL.position.set(-0.165, 0.015, -0.010);
    earL.rotation.y = 0.20;

    const earR = new THREE.Mesh(earGeo, this.materials.skinMat);
    earR.position.set(0.165, 0.015, -0.010);
    earR.rotation.y = -0.20;

    this.headBone.add(earL, earR);
    this.nodes.leftEar = earL;
    this.nodes.rightEar = earR;
  }

  buildStylizedHair() {
    // Stylized sculpted hair cap with natural silhouette framing the cranium
    const hairGroup = new THREE.Group();

    // Main cranial hair volume
    const mainHairGeo = new THREE.SphereGeometry(0.185, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.75);
    mainHairGeo.scale(0.98, 1.05, 1.02);
    const mainHair = new THREE.Mesh(mainHairGeo, this.materials.hairMat);
    mainHair.position.set(0, 0.035, -0.010);
    hairGroup.add(mainHair);

    // Front styled fringe / bangs curving across upper forehead
    const fringeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.095, 0.125, 0.145),
      new THREE.Vector3(-0.045, 0.145, 0.165),
      new THREE.Vector3(0.035, 0.138, 0.162),
      new THREE.Vector3(0.095, 0.118, 0.142)
    ]);
    const fringeGeo = new THREE.TubeGeometry(fringeCurve, 20, 0.018, 10, false);
    const fringe = new THREE.Mesh(fringeGeo, this.materials.hairMat);
    hairGroup.add(fringe);

    this.headBone.add(hairGroup);
    this.nodes.hair = hairGroup;
  }

  buildNeck() {
    // Cylindrical anatomical neck transitioning downward
    const neckGeo = new THREE.CylinderGeometry(0.082, 0.098, 0.16, 24);
    const neck = new THREE.Mesh(neckGeo, this.materials.skinMat);
    neck.position.set(0, -0.220, -0.020);
    this.headBone.add(neck);
    this.nodes.neck = neck;
  }

  // --- Animation & Motion Retargeting ---

  updateAvatar(blendshapes, quaternion, translation) {
    if (!this.isReady || !this.headMesh) return;

    if (blendshapes) {
      const jawVal = blendshapes[17] || 0;
      const blinkLVal = blendshapes[0] || 0;
      const blinkRVal = blendshapes[7] || 0;
      const smileLVal = blendshapes[23] || 0;
      const smileRVal = blendshapes[24] || 0;
      const browUpVal = blendshapes[43] || 0;
      const browDownL = blendshapes[41] || 0;
      const browDownR = blendshapes[42] || 0;
      const tongueVal = blendshapes[51] || 0;
      const cheekPuffVal = blendshapes[46] || 0;

      // 1. Update Real Three.js GPU Vertex Morph Target Influences
      if (this.headMesh.morphTargetInfluences) {
        const dict = this.headMesh.morphTargetDictionary;
        if (dict) {
          if (dict.jawOpen !== undefined) this.headMesh.morphTargetInfluences[dict.jawOpen] = jawVal;
          if (dict.mouthSmileLeft !== undefined) this.headMesh.morphTargetInfluences[dict.mouthSmileLeft] = smileLVal;
          if (dict.mouthSmileRight !== undefined) this.headMesh.morphTargetInfluences[dict.mouthSmileRight] = smileRVal;
          if (dict.eyeBlinkLeft !== undefined) this.headMesh.morphTargetInfluences[dict.eyeBlinkLeft] = blinkLVal;
          if (dict.eyeBlinkRight !== undefined) this.headMesh.morphTargetInfluences[dict.eyeBlinkRight] = blinkRVal;
          if (dict.browInnerUp !== undefined) this.headMesh.morphTargetInfluences[dict.browInnerUp] = browUpVal;
          if (dict.browDownLeft !== undefined) this.headMesh.morphTargetInfluences[dict.browDownLeft] = browDownL;
          if (dict.browDownRight !== undefined) this.headMesh.morphTargetInfluences[dict.browDownRight] = browDownR;
          if (dict.cheekPuff !== undefined) this.headMesh.morphTargetInfluences[dict.cheekPuff] = cheekPuffVal;
        }
      }

      // 2. Eye Gaze Tracking (Pupils/Irises dynamically follow look direction)
      const lookDownL = blendshapes[1] || 0, lookUpL = blendshapes[4] || 0;
      const lookInL = blendshapes[2] || 0, lookOutL = blendshapes[3] || 0;
      const lookDownR = blendshapes[8] || 0, lookUpR = blendshapes[11] || 0;
      const lookInR = blendshapes[9] || 0, lookOutR = blendshapes[10] || 0;

      const gazeX = ((lookOutL - lookInL) + (lookInR - lookOutR)) * 0.5;
      const gazeY = ((lookUpL - lookDownL) + (lookUpR - lookDownR)) * 0.5;

      if (this.nodes.leftIrisGroup && this.nodes.rightIrisGroup) {
        const targetX = THREE.MathUtils.clamp(gazeX * 0.0055, -0.004, 0.004);
        const targetY = THREE.MathUtils.clamp(gazeY * 0.0045, -0.0035, 0.0035);

        this.nodes.leftIrisGroup.position.x = THREE.MathUtils.lerp(this.nodes.leftIrisGroup.position.x, targetX, 0.35);
        this.nodes.leftIrisGroup.position.y = THREE.MathUtils.lerp(this.nodes.leftIrisGroup.position.y, targetY, 0.35);

        this.nodes.rightIrisGroup.position.x = THREE.MathUtils.lerp(this.nodes.rightIrisGroup.position.x, targetX, 0.35);
        this.nodes.rightIrisGroup.position.y = THREE.MathUtils.lerp(this.nodes.rightIrisGroup.position.y, targetY, 0.35);
      }

      // 3. Eyelid Trim Ring Elevation for 100% Crisp Blink Closure
      if (this.nodes.leftEyelidUpper && this.nodes.rightEyelidUpper) {
        this.nodes.leftEyelidUpper.position.y = 0.048 - (blinkLVal * 0.016);
        this.nodes.rightEyelidUpper.position.y = 0.048 - (blinkRVal * 0.016);
      }

      // 4. 3D Eyebrow Elevation & Furrow
      if (this.nodes.leftBrow && this.nodes.rightBrow) {
        this.nodes.leftBrow.position.y = (browUpVal * 0.016) - (browDownL * 0.012);
        this.nodes.rightBrow.position.y = (browUpVal * 0.016) - (browDownR * 0.012);
      }

      // 5. Oral Cavity, Teeth & Tongue Dynamics
      const smileAvg = (smileLVal + smileRVal) * 0.5;

      if (this.nodes.upperTeeth) {
        this.nodes.upperTeeth.visible = (jawVal > 0.03 || smileAvg > 0.12);
      }

      if (this.nodes.lowerTeeth) {
        this.nodes.lowerTeeth.visible = (jawVal > 0.06);
        this.nodes.lowerTeeth.position.y = -0.006 - (jawVal * 0.024);
      }

      if (this.nodes.tongue) {
        if (tongueVal > 0.08) {
          this.nodes.tongue.scale.set(1.0, 1.0, 0.4 + tongueVal * 1.5);
          this.nodes.tongue.position.set(0, -0.008 - (jawVal * 0.010), 0.005 + (tongueVal * 0.022));
          this.nodes.tongue.visible = true;
        } else {
          this.nodes.tongue.scale.set(0.001, 0.001, 0.001);
          this.nodes.tongue.visible = false;
        }
      }
    }

    // 6. Restored 6-DoF Head Tracking via Slerp
    if (quaternion && this.headBone) {
      const targetQuat = new THREE.Quaternion(quaternion[1], quaternion[2], quaternion[3], quaternion[0]);
      this.headBone.quaternion.slerp(targetQuat, 0.32);

      if (translation) {
        this.headBone.position.x = THREE.MathUtils.lerp(this.headBone.position.x, translation[0] * 0.4, 0.25);
        this.headBone.position.y = THREE.MathUtils.lerp(this.headBone.position.y, translation[1] * 0.4, 0.25);
        this.headBone.position.z = THREE.MathUtils.lerp(this.headBone.position.z, translation[2] * 0.3, 0.25);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  // --- Avatar Display Modes (Cyber / Wireframe / Human A3) ---

  setAvatarMode(mode) {
    if (!this.headMesh || !this.headMesh.material) return;
    this.currentMode = mode;

    if (mode === 'cyber') {
      this.headMesh.material.wireframe = false;
      this.headMesh.material.color.setHex(0x00f0ff);
      this.headMesh.material.emissive.setHex(0x0284c7);
      this.headMesh.material.emissiveIntensity = 0.40;
    } else if (mode === 'wire') {
      this.headMesh.material.wireframe = true;
      this.headMesh.material.color.setHex(0x38bdf8);
      this.headMesh.material.emissive.setHex(0x000000);
      this.headMesh.material.emissiveIntensity = 0;
    } else {
      // Human A3 Default
      this.headMesh.material.wireframe = false;
      this.headMesh.material.color.setHex(0xdec2a8);
      this.headMesh.material.emissive.setHex(0x000000);
      this.headMesh.material.emissiveIntensity = 0;
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
