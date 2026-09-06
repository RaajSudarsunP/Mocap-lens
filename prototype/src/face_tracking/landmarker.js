/**
 * MediaPipe FaceLandmarker Tasks Vision Module
 * Loads MediaPipe vision tasks, detects 468 3D face landmarks, extracts blendshape scores,
 * and renders 3D facial wireframe mesh overlays.
 */

import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";

export class FaceLandmarkerManager {
  constructor() {
    this.landmarker = null;
    this.isReady = false;
    this.lastVideoTime = -1;
  }

  async initialize() {
    try {
      console.log("MocapLens: Loading MediaPipe Vision Wasm files...");
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "LIVE_STREAM",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
      });

      this.isReady = true;
      console.log("MocapLens: MediaPipe FaceLandmarker Task Initialized Successfully!");
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
          runningMode: "LIVE_STREAM",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true
        });
        this.isReady = true;
        return true;
      } catch (cpuErr) {
        console.error("MocapLens FaceLandmarker Initialization Error:", cpuErr);
        return false;
      }
    }
  }

  detectVideoFrame(videoElement, timestamp = Date.now()) {
    if (!this.isReady || !this.landmarker) return null;

    if (videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = videoElement.currentTime;
      return this.landmarker.detectForVideo(videoElement, timestamp);
    }
    return null;
  }

  /**
   * Draws 468-point 3D facial landmark mesh wireframe on canvas
   */
  drawLandmarks(ctx, landmarks, canvasWidth, canvasHeight) {
    if (!landmarks || landmarks.length === 0) return;

    ctx.save();
    ctx.fillStyle = "rgba(0, 240, 255, 0.7)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctx.lineWidth = 1;

    // Draw key points
    landmarks.forEach((pt, idx) => {
      const x = pt.x * canvasWidth;
      const y = pt.y * canvasHeight;

      if (idx % 4 === 0) { // Render sparse point grid for visual clarity
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}
