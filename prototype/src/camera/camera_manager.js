/**
 * Camera Manager Module — Physical Hardware Webcam Only Mode
 * Strictly requires HTML5 MediaDevices physical webcam capture.
 * Synthetic fallback disabled per Supervisor Real-Hardware Verification Gate.
 */

export class CameraManager {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.stream = null;
    this.isStreaming = false;
    this.isSyntheticFallback = false;
  }

  async initializeCamera(desiredWidth = 1280, desiredHeight = 720) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("MocapLens: navigator.mediaDevices.getUserMedia is unavailable. Secure HTTP context (http://localhost:8000) is required.");
      return false;
    }

    try {
      const constraints = {
        video: {
          width: { ideal: desiredWidth },
          height: { ideal: desiredHeight },
          facingMode: "user"
        },
        audio: false
      };

      console.log("MocapLens: Requesting physical hardware webcam stream via getUserMedia()...");
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play().catch(e => console.warn("Video play warning:", e));
          this.canvas.width = this.video.videoWidth || desiredWidth;
          this.canvas.height = this.video.videoHeight || desiredHeight;
          this.isStreaming = true;
          this.isSyntheticFallback = false;
          console.log(`MocapLens: Physical Hardware Camera Active (${this.canvas.width}x${this.canvas.height}) ✅`);
          resolve(true);
        };
      });

    } catch (hwError) {
      console.error("MocapLens: Physical Hardware Camera Access Failed:", hwError.name, hwError.message);
      this.isStreaming = false;
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
