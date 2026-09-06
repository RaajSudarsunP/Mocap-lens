/**
 * Timeline Keyframe Recorder & Exporter Module
 * Captures live takes of facial motion parameters and exports formatted .JSON animation assets.
 */

export class TimelineRecorder {
  constructor() {
    this.isRecording = false;
    this.takeFrames = [];
    this.startTime = 0;
  }

  startRecording() {
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

  exportTakeAsJSON(filename = "mocaplens_take.json") {
    if (this.takeFrames.length === 0) {
      alert("No motion data recorded yet. Click 'Record Take' first.");
      return;
    }

    const payload = {
      project: "MocapLens AI",
      version: "1.0-P0",
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
