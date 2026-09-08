/**
 * Camera Manager Module
 * Manages HTML5 MediaDevices webcam capture, camera device selection & enumeration,
 * dynamic device switching, resolution binding, canvas rendering, and optional synthetic
 * stream fallback.
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

    this.activeDeviceId = null;
    this.activeDeviceLabel = 'Default Camera';
    this.availableDevices = [];
    this.errorMessage = null;
  }

  /**
   * Enumerates available video input devices (webcams, capture cards, virtual cameras)
   */
  async getAvailableDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(device => device.kind === 'videoinput');
      return this.availableDevices;
    } catch (err) {
      console.warn("MocapLens: Could not enumerate camera devices:", err);
      return [];
    }
  }

  /**
   * Initializes hardware webcam stream with optional explicit deviceId.
   */
  async initializeCamera(deviceId = null, desiredWidth = 1280, desiredHeight = 720) {
    this.stopCamera();
    this.errorMessage = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const videoConstraints = {
          width: { ideal: desiredWidth },
          height: { ideal: desiredHeight }
        };

        if (deviceId && deviceId !== 'default') {
          videoConstraints.deviceId = { exact: deviceId };
        } else {
          videoConstraints.facingMode = "user";
        }

        const constraints = {
          video: videoConstraints,
          audio: false
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.video.srcObject = this.stream;

        // Fetch label & track details
        const track = this.stream.getVideoTracks()[0];
        if (track) {
          const settings = track.getSettings();
          this.activeDeviceId = settings.deviceId || deviceId;
          this.activeDeviceLabel = track.label || `Webcam (${settings.width || desiredWidth}x${settings.height || desiredHeight})`;
        }

        return new Promise((resolve) => {
          this.video.onloadedmetadata = async () => {
            try {
              await this.video.play();
            } catch (playErr) {
              console.warn("Video play warning:", playErr);
            }

            this.canvas.width = this.video.videoWidth || desiredWidth;
            this.canvas.height = this.video.videoHeight || desiredHeight;
            this.isStreaming = true;
            this.isSyntheticFallback = false;
            console.log(`MocapLens: Real Hardware Camera Active [${this.activeDeviceLabel}] (${this.canvas.width}x${this.canvas.height}) ✅`);

            // Refresh available device list
            await this.getAvailableDevices();

            resolve({
              success: true,
              isSynthetic: false,
              label: this.activeDeviceLabel,
              width: this.canvas.width,
              height: this.canvas.height
            });
          };
        });

      } catch (hwError) {
        this.errorMessage = hwError.message || hwError.name;
        console.warn("MocapLens: Hardware camera access failed or permission denied:", hwError.name, hwError.message);
        
        return {
          success: false,
          isSynthetic: false,
          error: hwError.name || "CameraPermissionDenied",
          message: hwError.message || "Camera access was denied or device is busy."
        };
      }
    } else {
      this.errorMessage = "getUserMedia is unavailable in current origin context.";
      return {
        success: false,
        isSynthetic: false,
        error: "MediaDevicesUnavailable",
        message: this.errorMessage
      };
    }
  }

  /**
   * Switches to a specific camera device ID or synthetic feed
   */
  async switchCamera(deviceId) {
    if (deviceId === 'synthetic') {
      return this.initializeSyntheticFallback();
    }
    console.log(`MocapLens: Switching camera device to ID [${deviceId}]...`);
    return this.initializeCamera(deviceId);
  }

  initializeSyntheticFallback(width = 640, height = 480) {
    this.stopCamera();

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
      this.video.play().catch(e => console.warn("Video play warning:", e));
      this.canvas.width = width;
      this.canvas.height = height;
      this.isStreaming = true;
      this.isSyntheticFallback = true;
      this.activeDeviceLabel = 'Synthetic Demo Feed';
      console.log("MocapLens: Synthetic Camera Feed Active ✅");

      return Promise.resolve({
        success: true,
        isSynthetic: true,
        label: this.activeDeviceLabel,
        width: width,
        height: height
      });
    } else {
      console.error("MocapLens: captureStream not supported in fallback.");
      return Promise.resolve({
        success: false,
        isSynthetic: true,
        label: 'Error',
        width: width,
        height: height
      });
    }
  }

  drawFrame() {
    if (!this.isStreaming) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    try {
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    } catch (e) {
      // transient frame draw ignore
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.isStreaming = false;
    }
    if (this.fallbackAnimFrame) {
      cancelAnimationFrame(this.fallbackAnimFrame);
      this.fallbackAnimFrame = null;
    }
  }
}
