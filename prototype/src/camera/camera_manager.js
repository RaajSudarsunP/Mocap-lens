/**
 * Camera Manager Module
 * Manages HTML5 MediaDevices webcam capture, video binding, and canvas rendering.
 */

export class CameraManager {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.stream = null;
    this.isStreaming = false;
    this.onFrameCallback = null;
  }

  async initializeCamera(desiredWidth = 1280, desiredHeight = 720) {
    try {
      const constraints = {
        video: {
          width: { ideal: desiredWidth },
          height: { ideal: desiredHeight },
          facingMode: "user",
          frameRate: { ideal: 60, min: 30 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          this.canvas.width = this.video.videoWidth;
          this.canvas.height = this.video.videoHeight;
          this.isStreaming = true;
          console.log(`MocapLens: Camera initialized ${this.video.videoWidth}x${this.video.videoHeight}`);
          resolve(true);
        };
      });
    } catch (error) {
      console.error("MocapLens Camera Initialization Failed:", error);
      alert("Unable to access computer webcam. Please grant camera permissions.");
      return false;
    }
  }

  drawFrame() {
    if (!this.isStreaming) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.isStreaming = false;
    }
  }
}
