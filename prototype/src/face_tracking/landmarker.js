/**
 * MediaPipe FaceLandmarker Tasks Vision Module
 * Loads MediaPipe vision tasks, detects 468 3D face landmarks, extracts blendshape scores,
 * and tracks real user facial expressions synchronously.
 */

import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";

export class FaceLandmarkerManager {
  constructor() {
    this.landmarker = null;
    this.isReady = false;
    this.lastTimestamp = -1;
    this.syntheticPhase = 0;
    this.initError = null;
  }

  async initialize() {
    try {
      console.log("MocapLens: Loading MediaPipe Vision Wasm files from CDN...");
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
      });

      this.isReady = true;
      console.log("MocapLens: MediaPipe FaceLandmarker Task Initialized Successfully (GPU Delegate) ✅");
      return true;
    } catch (error) {
      console.warn("MocapLens GPU Delegate fallback to CPU:", error);
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true
        });
        this.isReady = true;
        console.log("MocapLens: MediaPipe FaceLandmarker Task Initialized (CPU Fallback) ✅");
        return true;
      } catch (cpuErr) {
        this.initError = cpuErr.message;
        console.error("MocapLens FaceLandmarker Initialization Failed:", cpuErr);
        this.isReady = false;
        return false;
      }
    }
  }

  /**
   * Performs face landmark detection on the current video frame synchronously.
   * @param {HTMLVideoElement} videoElement 
   * @param {HTMLCanvasElement} canvasElement 
   * @param {boolean} isSynthetic 
   */
  detectVideoFrame(videoElement, canvasElement = null, isSynthetic = false) {
    let now = Math.round(performance.now());
    if (now <= this.lastTimestamp) {
      now = this.lastTimestamp + 1;
    }
    this.lastTimestamp = now;

    // Synthetic feed explicitly requested
    if (isSynthetic) {
      return this.generateSyntheticLandmarkResults(now);
    }

    // Real hardware camera tracking
    if (this.isReady && this.landmarker) {
      // Determine the best frame source (video element or painted canvas)
      let frameSource = null;
      if (videoElement && videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
        frameSource = videoElement;
      } else if (canvasElement && canvasElement.width > 0) {
        frameSource = canvasElement;
      }

      if (frameSource) {
        try {
          const res = this.landmarker.detectForVideo(frameSource, now);
          if (res && res.faceLandmarks && res.faceLandmarks.length > 0) {
            return {
              ...res,
              isFaceDetected: true
            };
          }
        } catch (err) {
          // Frame skipped or transient WebGL context issue
        }
      }
    }

    // Return empty results when on hardware camera but no face is in view
    return {
      faceLandmarks: [],
      faceBlendshapes: [],
      facialTransformationMatrixes: [],
      isFaceDetected: false
    };
  }

  /**
   * Generates continuous 478-point 3D face landmark mesh & blendshape categories
   * ONLY used when the user explicitly chooses the Synthetic Demo Feed.
   */
  generateSyntheticLandmarkResults(timestampMs) {
    this.syntheticPhase += 0.05;
    const p = this.syntheticPhase;

    // 478 3D Landmark array
    const faceLandmarks = [new Array(478)];
    const cx = 0.5 + Math.sin(p * 0.4) * 0.04;
    const cy = 0.5 + Math.cos(p * 0.3) * 0.03;

    for (let i = 0; i < 478; i++) {
      const angle = (i / 478) * Math.PI * 2;
      const radius = (i < 468) ? 0.18 : 0.03;
      faceLandmarks[0][i] = {
        x: cx + Math.cos(angle) * radius * 0.7,
        y: cy + Math.sin(angle) * radius,
        z: Math.sin(angle * 2) * 0.02
      };
    }

    const blinkL = Math.sin(p * 1.5) > 0.85 ? 0.9 : 0.05;
    const blinkR = Math.sin(p * 1.5) > 0.85 ? 0.9 : 0.05;
    const jawOpen = 0.15 + Math.abs(Math.sin(p * 0.8)) * 0.65;
    const smile = 0.2 + Math.abs(Math.cos(p * 0.6)) * 0.5;
    const brow = 0.1 + Math.abs(Math.sin(p * 0.5)) * 0.4;

    faceLandmarks[0][1] = { x: cx, y: cy, z: -0.05 }; // Nose tip
    faceLandmarks[0][152] = { x: cx, y: cy + 0.22 + jawOpen * 0.04, z: 0.01 }; // Chin
    faceLandmarks[0][33] = { x: cx - 0.08, y: cy - 0.05, z: -0.01 }; // Left Eye Outer
    faceLandmarks[0][263] = { x: cx + 0.08, y: cy - 0.05, z: -0.01 }; // Right Eye Outer
    faceLandmarks[0][61] = { x: cx - 0.06 - smile * 0.02, y: cy + 0.10 - smile * 0.01, z: 0.0 }; // Left Mouth
    faceLandmarks[0][291] = { x: cx + 0.06 + smile * 0.02, y: cy + 0.10 - smile * 0.01, z: 0.0 }; // Right Mouth
    faceLandmarks[0][13] = { x: cx, y: cy + 0.08, z: 0.0 }; // Upper Lip
    faceLandmarks[0][14] = { x: cx, y: cy + 0.08 + jawOpen * 0.05, z: 0.0 }; // Lower Lip

    const faceBlendshapes = [{
      categories: [
        { categoryName: "jawOpen", score: jawOpen },
        { categoryName: "eyeBlinkLeft", score: blinkL },
        { categoryName: "eyeBlinkRight", score: blinkR },
        { categoryName: "mouthSmileLeft", score: smile },
        { categoryName: "mouthSmileRight", score: smile },
        { categoryName: "browInnerUp", score: brow }
      ]
    }];

    const pitch = Math.sin(p * 0.5) * 0.2;
    const yaw = Math.cos(p * 0.4) * 0.3;
    const roll = Math.sin(p * 0.3) * 0.1;

    const cY = Math.cos(yaw), sY = Math.sin(yaw);
    const cP = Math.cos(pitch), sP = Math.sin(pitch);
    const cR = Math.cos(roll), sR = Math.sin(roll);

    const m = [
      cY * cR, sP * sY * cR + cP * sR, -cP * sY * cR + sP * sR, 0,
      -cY * sR, -sP * sY * sR + cP * cR, cP * sY * sR + sP * cR, 0,
      sY, -sP * cY, cP * cY, 0,
      (cx - 0.5) * 0.3, -(cy - 0.5) * 0.3, 0, 1
    ];

    return {
      faceLandmarks,
      faceBlendshapes,
      facialTransformationMatrixes: [{ data: m }],
      isFaceDetected: true
    };
  }

  /**
   * Draws 468-point 3D facial landmark mesh wireframe on canvas
   */
  drawLandmarks(ctx, landmarks, canvasWidth, canvasHeight) {
    if (!landmarks || landmarks.length === 0) return;

    ctx.save();
    ctx.fillStyle = "rgba(0, 240, 255, 0.75)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
    ctx.lineWidth = 1;

    // Draw landmark point grid
    landmarks.forEach((pt, idx) => {
      const x = pt.x * canvasWidth;
      const y = pt.y * canvasHeight;

      if (idx % 4 === 0) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}
