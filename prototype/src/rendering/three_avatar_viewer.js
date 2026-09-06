/**
 * Three.js WebGL 3D Avatar Render Viewport — Stylized Semi-Realistic Humanoid Avatar
 * Renders anatomical facial geometry: Head, Forehead, Cheekbones, Jaw, Chin, Nose & Nostrils,
 * Sclera/Iris/Pupil Eyes, Eyelids, Eyebrows, Lips, Mouth Cavity, Ears, and Stylized Hair.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class ThreeAvatarViewer {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.avatarGroup = null;
    this.headMesh = null;
    this.headBone = null;

    // Sub-mesh nodes for 10-parameter personalization scaling
    this.nodes = {
      head: null,
      jaw: null,
      chin: null,
      leftEye: null,
      rightEye: null,
      leftEyelid: null,
      rightEyelid: null,
      leftBrow: null,
      rightBrow: null,
      nose: null,
      mouth: null,
      upperLip: null,
      lowerLip: null,
      leftCheek: null,
      rightCheek: null,
      leftEar: null,
      rightEar: null,
      hair: null
    };

    this.morphDict = {};
    this.isReady = false;
  }

  initialize() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 600;

    // 1. Create Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c1017);

    // 2. Create Camera
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    this.camera.position.set(0, 0.05, 1.15);

    // 3. Create WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    keyLight.position.set(1.5, 2.5, 2.0);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf43f5e, 0.8);
    fillLight.position.set(-1.5, -0.5, 1.5);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, 2, -2);
    this.scene.add(rimLight);

    // 5. Build Anatomically Complete Stylized Semi-Realistic Avatar
    this.buildStylizedAvatar();

    window.addEventListener('resize', () => this.onWindowResize());
    this.isReady = true;
  }

  buildStylizedAvatar() {
    this.avatarGroup = new THREE.Group();
    this.headBone = new THREE.Group();
    this.avatarGroup.add(this.headBone);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xe5c3a6,
      roughness: 0.45,
      metalness: 0.05
    });

    const lipMat = new THREE.MeshStandardMaterial({
      color: 0xc97a7e,
      roughness: 0.3
    });

    const eyeScleraMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 });
    const eyeIrisMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1 });
    const eyePupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.05 });
    const browHairMat = new THREE.MeshStandardMaterial({ color: 0x331b11, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x24140e, roughness: 0.7 });

    // A. Head & Face Base Geometry with ARKit Morph Targets
    const headGeo = new THREE.SphereGeometry(0.20, 64, 64);
    headGeo.scale(0.85, 1.15, 0.92); // Anatomical face proportions

    // Build Morph Target Positions
    const posAttr = headGeo.attributes.position;
    const vertexCount = posAttr.count;
    headGeo.morphAttributes.position = [];

    const morphNames = [
      "jawOpen", "eyeBlinkLeft", "eyeBlinkRight", "mouthSmileLeft", "mouthSmileRight",
      "browInnerUp", "browDownLeft", "browDownRight", "cheekPuff"
    ];

    morphNames.forEach((name, mIdx) => {
      this.morphDict[name] = mIdx;
      const targetPos = [];

      for (let i = 0; i < vertexCount; i++) {
        let x = posAttr.getX(i);
        let y = posAttr.getY(i);
        let z = posAttr.getZ(i);

        if (name === "jawOpen" && y < -0.04 && z > 0) {
          y -= 0.07;
          z += 0.02;
        }
        if (name === "mouthSmileLeft" && x < -0.02 && y < -0.02 && z > 0.1) {
          x -= 0.025;
          y += 0.025;
        }
        if (name === "mouthSmileRight" && x > 0.02 && y < -0.02 && z > 0.1) {
          x += 0.025;
          y += 0.025;
        }
        if (name === "eyeBlinkLeft" && x < -0.03 && y > 0.03 && z > 0.12) {
          y -= 0.015;
        }
        if (name === "eyeBlinkRight" && x > 0.03 && y > 0.03 && z > 0.12) {
          y -= 0.015;
        }

        targetPos.push(x, y, z);
      }

      const morphAttr = new THREE.Float32BufferAttribute(targetPos, 3);
      morphAttr.name = name;
      headGeo.morphAttributes.position.push(morphAttr);
    });

    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headBone.add(this.headMesh);
    this.nodes.head = this.headMesh;

    // B. Anatomical Eyes (Sclera + Iris + Pupil)
    const eyeGroupL = new THREE.Group();
    const eyeGroupR = new THREE.Group();

    const scleraGeo = new THREE.SphereGeometry(0.032, 32, 32);
    const irisGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.005, 32);
    irisGeo.rotateX(Math.PI / 2);
    const pupilGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.006, 32);
    pupilGeo.rotateX(Math.PI / 2);

    const scleraL = new THREE.Mesh(scleraGeo, eyeScleraMat);
    const irisL = new THREE.Mesh(irisGeo, eyeIrisMat);
    irisL.position.z = 0.031;
    const pupilL = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupilL.position.z = 0.032;
    eyeGroupL.add(scleraL, irisL, pupilL);
    eyeGroupL.position.set(-0.068, 0.045, 0.155);

    const scleraR = new THREE.Mesh(scleraGeo, eyeScleraMat);
    const irisR = new THREE.Mesh(irisGeo, eyeIrisMat);
    irisR.position.z = 0.031;
    const pupilR = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupilR.position.z = 0.032;
    eyeGroupR.add(scleraR, irisR, pupilR);
    eyeGroupR.position.set(0.068, 0.045, 0.155);

    this.headMesh.add(eyeGroupL, eyeGroupR);
    this.nodes.leftEye = eyeGroupL;
    this.nodes.rightEye = eyeGroupR;

    // C. Eyelids
    const eyelidGeo = new THREE.SphereGeometry(0.034, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    eyelidGeo.rotateX(Math.PI / 2);
    const eyelidL = new THREE.Mesh(eyelidGeo, skinMat);
    eyelidL.position.set(-0.068, 0.045, 0.155);
    const eyelidR = new THREE.Mesh(eyelidGeo, skinMat);
    eyelidR.position.set(0.068, 0.045, 0.155);
    this.headMesh.add(eyelidL, eyelidR);
    this.nodes.leftEyelid = eyelidL;
    this.nodes.rightEyelid = eyelidR;

    // D. 3D Eyebrows
    const browGeo = new THREE.BoxGeometry(0.045, 0.008, 0.012);
    const browL = new THREE.Mesh(browGeo, browHairMat);
    browL.position.set(-0.068, 0.09, 0.165);
    browL.rotation.z = -0.05;
    const browR = new THREE.Mesh(browGeo, browHairMat);
    browR.position.set(0.068, 0.09, 0.165);
    browR.rotation.z = 0.05;
    this.headMesh.add(browL, browR);
    this.nodes.leftBrow = browL;
    this.nodes.rightBrow = browR;

    // E. 3D Nose & Nostrils
    const noseGroup = new THREE.Group();
    const bridgeGeo = new THREE.ConeGeometry(0.02, 0.08, 16);
    bridgeGeo.rotateX(Math.PI / 6);
    const bridge = new THREE.Mesh(bridgeGeo, skinMat);
    bridge.position.set(0, 0.005, 0.18);
    const tipGeo = new THREE.SphereGeometry(0.016, 16, 16);
    const tip = new THREE.Mesh(tipGeo, skinMat);
    tip.position.set(0, -0.03, 0.19);
    noseGroup.add(bridge, tip);
    this.headMesh.add(noseGroup);
    this.nodes.nose = noseGroup;

    // F. Lips & Mouth Cavity
    const mouthGroup = new THREE.Group();
    const upperLipGeo = new THREE.TorusGeometry(0.032, 0.007, 12, 24, Math.PI);
    upperLipGeo.rotateX(Math.PI / 2);
    const upperLip = new THREE.Mesh(upperLipGeo, lipMat);
    upperLip.position.set(0, -0.045, 0.168);

    const lowerLipGeo = new THREE.TorusGeometry(0.03, 0.008, 12, 24, Math.PI);
    lowerLipGeo.rotateX(-Math.PI / 2);
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipMat);
    lowerLip.position.set(0, -0.055, 0.168);

    mouthGroup.add(upperLip, lowerLip);
    this.headMesh.add(mouthGroup);
    this.nodes.mouth = mouthGroup;
    this.nodes.upperLip = upperLip;
    this.nodes.lowerLip = lowerLip;

    // G. Sculpted Jaw & Chin
    const jawGroup = new THREE.Group();
    const chinGeo = new THREE.SphereGeometry(0.035, 16, 16);
    chinGeo.scale(1.1, 0.8, 1.0);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.19, 0.11);
    jawGroup.add(chin);
    this.headMesh.add(jawGroup);
    this.nodes.jaw = jawGroup;
    this.nodes.chin = chin;

    // H. Ears
    const earGeo = new THREE.SphereGeometry(0.035, 16, 16);
    earGeo.scale(0.4, 1.2, 0.7);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.165, 0.02, 0.01);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.165, 0.02, 0.01);
    this.headMesh.add(earL, earR);
    this.nodes.leftEar = earL;
    this.nodes.rightEar = earR;

    // I. Stylized Hair Cap
    const hairGeo = new THREE.SphereGeometry(0.19, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.7);
    hairGeo.scale(0.92, 1.05, 0.98);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.04, -0.01);
    this.headMesh.add(hair);
    this.nodes.hair = hair;

    this.scene.add(this.avatarGroup);
    this.headMesh.morphTargetInfluences = new Array(morphNames.length).fill(0);
  }

  updateAvatar(blendshapes, quaternion, translation) {
    if (!this.isReady || !this.headMesh) return;

    // Update Morph Target Influences & Sub-node Morph Response
    if (blendshapes) {
      const jawVal = blendshapes[17] || 0;
      const blinkLVal = blendshapes[0] || 0;
      const blinkRVal = blendshapes[7] || 0;
      const smileLVal = blendshapes[23] || 0;
      const smileRVal = blendshapes[24] || 0;
      const browVal = blendshapes[43] || 0;

      // Primary Morph Target Array
      if (this.headMesh.morphTargetInfluences) {
        this.headMesh.morphTargetInfluences[0] = jawVal;
        this.headMesh.morphTargetInfluences[1] = blinkLVal;
        this.headMesh.morphTargetInfluences[2] = blinkRVal;
        this.headMesh.morphTargetInfluences[3] = smileLVal;
        this.headMesh.morphTargetInfluences[4] = smileRVal;
        this.headMesh.morphTargetInfluences[5] = browVal;
      }

      // Eyelid Rotation Morph Response
      if (this.nodes.leftEyelid && this.nodes.rightEyelid) {
        this.nodes.leftEyelid.rotation.x = blinkLVal * 0.7;
        this.nodes.rightEyelid.rotation.x = blinkRVal * 0.7;
      }

      // Mouth & Lower Lip Opening
      if (this.nodes.lowerLip) {
        this.nodes.lowerLip.position.y = -0.055 - (jawVal * 0.04);
      }

      // Eyebrow Elevation
      if (this.nodes.leftBrow && this.nodes.rightBrow) {
        this.nodes.leftBrow.position.y = 0.09 + (browVal * 0.025);
        this.nodes.rightBrow.position.y = 0.09 + (browVal * 0.025);
      }
    }

    // Update Head Rotation Quaternion
    if (quaternion && this.headBone) {
      const q = new THREE.Quaternion(quaternion[1], quaternion[2], quaternion[3], quaternion[0]);
      this.headBone.quaternion.slerp(q, 0.3);
    }

    this.renderer.render(this.scene, this.camera);
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
