/**
 * Timeline Keyframe Recorder & Replay Engine Module
 * Captures live takes of facial motion parameters, replays motion tracks across avatars,
 * and exports formatted .JSON animation assets.
 */

export class TimelineRecorder {
  constructor() {
    this.isRecording = false;
    this.isPlaying = false;
    this.takeFrames = [];
    this.startTime = 0;
    this.playbackAnimFrame = null;
  }

  startRecording() {
    if (this.isPlaying) this.stopPlayback();
    this.takeFrames = [];
    this.startTime = Date.now();
    this.isRecording = true;
    console.log("MocapLens: Started recording animation take.");
  }

  recordFrame(blendshapes, quaternion, translation) {
    if (!this.isRecording) return;

    const timestamp = Date.now() - this.startTime;
    this.takeFrames.push({
      time: timestamp,
      blendshapes: [...blendshapes],
      quaternion: [...quaternion],
      translation: [...translation]
    });
  }

  stopRecording() {
    this.isRecording = false;
    console.log(`MocapLens: Take stopped. Captured ${this.takeFrames.length} frames.`);
    return this.takeFrames;
  }

  startPlayback(onFrameCallback, onCompleteCallback) {
    if (this.takeFrames.length === 0) {
      alert("No recorded motion take available to replay. Click 'Start Capture' first.");
      return false;
    }

    if (this.isRecording) this.stopRecording();
    this.isPlaying = true;
    const playbackStartTime = Date.now();
    const duration = this.takeFrames[this.takeFrames.length - 1].time;

    console.log(`MocapLens: Replaying motion take (${this.takeFrames.length} frames, ${duration}ms)...`);

    const step = () => {
      if (!this.isPlaying) return;

      const elapsed = Date.now() - playbackStartTime;
      // Find current frame matching elapsed time
      const frameIndex = this.takeFrames.findIndex(f => f.time >= elapsed);

      if (frameIndex !== -1) {
        const frame = this.takeFrames[frameIndex];
        if (onFrameCallback) {
          onFrameCallback(frame.blendshapes, frame.quaternion, frame.translation);
        }
        this.playbackAnimFrame = requestAnimationFrame(step);
      } else {
        // Replay completed
        this.isPlaying = false;
        console.log("MocapLens: Motion replay completed.");
        if (onCompleteCallback) onCompleteCallback();
      }
    };

    step();
    return true;
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.playbackAnimFrame) {
      cancelAnimationFrame(this.playbackAnimFrame);
      this.playbackAnimFrame = null;
    }
  }

  exportTakeAsJSON(filename = "mocaplens_take.json") {
    if (this.takeFrames.length === 0) {
      alert("No motion data recorded yet. Record a take first.");
      return;
    }

    const payload = {
      project: "MocapLens AI",
      version: "1.0-P1",
      fps: 60,
      totalFrames: this.takeFrames.length,
      durationMs: this.takeFrames[this.takeFrames.length - 1].time,
      keyframes: this.takeFrames
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
