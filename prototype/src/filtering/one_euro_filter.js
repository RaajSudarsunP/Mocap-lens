/**
 * One Euro Filter (1€ Filter) — Speed-Adaptive Signal Filter
 * Authoritative Citation: Casiez, Roussel, & Vogel (ACM CHI 2012)
 *
 * Dynamically scales cutoff frequency based on signal derivative:
 * fc = fc_min + beta * |dot_x|
 */

class LowPassFilter {
  constructor(alpha = 1.0) {
    this.alpha = alpha;
    this.y = null;
    this.s = null;
  }

  filter(value, alpha = this.alpha) {
    this.alpha = alpha;
    if (this.s === null) {
      this.s = value;
    } else {
      this.s = alpha * value + (1.0 - alpha) * this.s;
    }
    this.y = value;
    return this.s;
  }

  reset() {
    this.y = null;
    this.s = null;
  }
}

export class OneEuroFilter {
  constructor(freq = 60, minCutoff = 1.0, beta = 0.005, dCutoff = 1.0) {
    this.freq = freq;
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;

    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
    this.lastTime = null;
  }

  alpha(cutoff) {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    const te = 1.0 / this.freq;
    return 1.0 / (1.0 + tau / te);
  }

  filter(value, timestamp = Date.now()) {
    if (this.lastTime !== null && timestamp !== this.lastTime) {
      this.freq = 1000.0 / (timestamp - this.lastTime);
    }
    this.lastTime = timestamp;

    const prevX = this.xFilter.s;
    const dx = prevX === null ? 0 : (value - prevX) * this.freq;
    const edx = this.dxFilter.filter(dx, this.alpha(this.dCutoff));
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);

    return this.xFilter.filter(value, this.alpha(cutoff));
  }

  reset() {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }
}

/**
 * Array filter wrapper for 52 ARKit blendshapes
 */
export class OneEuroFilterArray {
  constructor(size = 52, freq = 60, minCutoff = 1.0, beta = 0.005) {
    this.filters = Array.from({ length: size }, () => new OneEuroFilter(freq, minCutoff, beta));
  }

  filter(values, timestamp = Date.now()) {
    return values.map((val, idx) => this.filters[idx].filter(val, timestamp));
  }
}
