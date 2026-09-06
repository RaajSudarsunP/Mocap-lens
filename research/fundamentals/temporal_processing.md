# Temporal Processing & Signal Smoothing Fundamentals

## Definition [FACT]
Temporal processing in motion capture is the application of mathematical time-series filtering algorithms to frame-by-frame raw predictions (landmarks, rotation angles, blendshapes) to suppress high-frequency noise and jitter while preserving rapid natural muscle movements (e.g. fast blinks).

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
Frame-independent neural network predictions exhibit small random variations (jitter) due to camera sensor noise and pixel quantization. Without temporal filtering, a 3D avatar's face will tremble or twitch. However, over-filtering introduces lag/latency. MocapLens AI must evaluate dynamic filtering to balance stability and responsiveness.

## Core Concepts [FACT]
1. **The Fundamental Jitter vs. Latency Tradeoff**:
   - High Smoothing $\rightarrow$ Stable avatar, but increased phase lag.
   - Low Smoothing $\rightarrow$ Low lag, but increased jitter in static expressions.
2. **Exponential Moving Average (EMA)**:
   - First-order IIR filter:
     $$\hat{x}_t = \alpha x_t + (1 - \alpha) \hat{x}_{t-1}$$
     where $\alpha \in (0, 1]$. Constant $\alpha$ causes lag during fast movements or jitter during static pose.
3. **One Euro Filter ($1\text{\euro Filter}$) [PAPER-REPORTED]**:
   - First-order low-pass filter with an adaptive cutoff frequency based on signal rate-of-change (derivative):
     $$f_c = f_{c,\min} + \beta |\dot{x}_t|$$
   - When signal speed $|\dot{x}_t|$ is low (user standing still), $f_c \approx f_{c,\min}$, heavily filtering high-frequency noise (suppresses jitter).
   - When signal speed $|\dot{x}_t|$ is high (fast smile or blink), $f_c$ increases dynamically, reducing lag.

## Important Equations & Technical Details [FACT]
- **One Euro Filter Derivative Formulation**:
  $$\dot{x}_t = \frac{x_t - \hat{x}_{t-1}}{T}$$
  $$\hat{\dot{x}}_t = \text{Filter}(\dot{x}_t, \alpha_d), \quad \alpha_d = \frac{1}{1 + \frac{\tau_d}{T}}, \quad \tau_d = \frac{1}{2\pi f_{c,d}}$$
  $$\alpha = \frac{1}{1 + \frac{\tau}{T}}, \quad \tau = \frac{1}{2\pi f_c}, \quad f_c = f_{c,\min} + \beta |\hat{\dot{x}}_t|$$
  $$\hat{x}_t = \alpha x_t + (1 - \alpha) \hat{x}_{t-1}$$

## Initial Experimental Parameters [INITIAL EXPERIMENTAL PARAMETERS]
- Proposed starting configuration for evaluation:
  - Eye blinks: $\beta_{blink} \approx 0.05, f_{c,\min} \approx 1.0\text{ Hz}$ `[INITIAL EXPERIMENTAL PARAMETERS - TO BE BENCHMARKED]`
  - Eyebrows & mouth: $\beta_{brow} \approx 0.005, f_{c,\min} \approx 0.7\text{ Hz}$ `[INITIAL EXPERIMENTAL PARAMETERS - TO BE BENCHMARKED]`

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Casiez, G., Roussel, N., & Vogel, D. (2012). "1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems." *ACM CHI*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Apply One Euro Filtering independently across each parameter channel (blendshape coefficients and quaternion components).
- Filter parameters must scale inversely with frame period $T$ to prevent overshoot during frame rate drops.

## Known Limitations [FACT]
- Heavy filtering cannot compensate for structural model mispredictions or severe occlusion; it only attenuates high-frequency zero-mean Gaussian noise.
