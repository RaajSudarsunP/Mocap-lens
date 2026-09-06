/**
 * Camera Manager Module
 * Manages HTML5 MediaDevices webcam capture, video binding, canvas rendering,
 * and automatic synthetic stream fallback when webcam permissions or file:// origins restrict camera access.
 */

export class CameraManager {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.stream = null;
    this.isStreaming = false;
    this.isSyntheticFallback = false;
    this.fallbackCanvas = null;
    this.fallbackAnimFrame = null;
  }

  async initializeCamera(desiredWidth = 1280, desiredHeight = 720) {
    // 1. Try Hardware Webcam Access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const constraints = {
          video: {
            width: { ideal: desiredWidth },
            height: { ideal: desiredHeight },
            facingMode: "user"
          },
          audio: false
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.video.srcObject = this.stream;

        return new Promise((resolve) => {
          this.video.onloadedmetadata = () => {
            this.video.play().catch(e => console.warn("Video play error:", e));
            this.canvas.width = this.video.videoWidth || desiredWidth;
            this.canvas.height = this.video.videoHeight || desiredHeight;
            this.isStreaming = true;
            this.isSyntheticFallback = false;
            console.log(`MocapLens: Hardware Camera Initialized (${this.canvas.width}x${this.canvas.height}) ✅`);
            resolve(true);
          };
        });

      } catch (hwError) {
        console.warn("MocapLens: Hardware webcam unvailable or blocked (file:// or permission denied):", hwError.name, hwError.message);
      }
    } else {
      console.warn("MocapLens: navigator.mediaDevices.getUserMedia unavailable in current origin context.");
    }

    // 2. Synthetic Stream Fallback (Ensures 100% Guaranteed Rendering under any origin/browser restriction)
    console.log("MocapLens: Initializing Synthetic Camera Fallback Feed...");
    return this.initializeSyntheticFallback(desiredWidth, desiredHeight);
  }

  initializeSyntheticFallback(width = 640, height = 480) {
    this.fallbackCanvas = document.createElement('canvas');
    this.fallbackCanvas.width = width;
    this.fallbackCanvas.height = height;
    const fCtx = this.fallbackCanvas.getContext('2d');

    let phase = 0;
    const drawSyntheticFace = () => {
      phase += 0.03;
      fCtx.fillStyle = '#101726';
      fCtx.fillRect(0, 0, width, height);

      // Draw stylized head shape
      const centerX = width / 2 + Math.sin(phase * 0.5) * 20;
      const centerY = height / 2 + Math.cos(phase * 0.7) * 15;

      fCtx.fillStyle = '#e0d0c0';
      fCtx.beginPath();
      fCtx.ellipse(centerX, centerY, 90, 120, 0, 0, Math.PI * 2);
      fCtx.fill();

      // Eyes with blink animation
      const blink = Math.sin(phase * 2) > 0.85 ? 1 : 15;
      fCtx.fillStyle = '#1e293b';
      fCtx.beginPath();
      fCtx.ellipse(centerX - 35, centerY - 20, 10, blink, 0, 0, Math.PI * 2);
      fCtx.ellipse(centerX + 35, centerY - 20, 10, blink, 0, 0, Math.PI * 2);
      fCtx.fill();

      // Animated mouth (jaw open)
      const mouthOpen = 10 + Math.abs(Math.sin(phase)) * 25;
      fCtx.fillStyle = '#881337';
      fCtx.beginPath();
      fCtx.ellipse(centerX, centerY + 45, 25, mouthOpen, 0, 0, Math.PI * 2);
      fCtx.fill();

      this.fallbackAnimFrame = requestAnimationFrame(drawSyntheticFace);
    };

    drawSyntheticFace();

    if (this.fallbackCanvas.captureStream) {
      this.stream = this.fallbackCanvas.captureStream(30);
      this.video.srcObject = this.stream;
      this.video.play().catch(e => console.warn("Video play error:", e));
      this.canvas.width = width;
      this.canvas.height = height;
      this.isStreaming = true;
      this.isSyntheticFallback = true;
      console.log("MocapLens: Synthetic Camera Feed Active ✅");
      return Promise.resolve(true);
    } else {
      console.error("MocapLens: captureStream not supported in fallback.");
      return Promise.resolve(false);
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
    if (this.fallbackAnimFrame) {
      cancelAnimationFrame(this.fallbackAnimFrame);
    }
  }
}
