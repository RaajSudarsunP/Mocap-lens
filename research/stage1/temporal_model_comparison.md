# Track C — Temporal Processing & Signal Smoothing Comparison

## Overview
Track C evaluates time-series filtering and smoothing algorithms to attenuate high-frequency neural prediction jitter while preserving rapid facial dynamics (e.g. eye blinks, fast speech).

---

## 1. Candidate Temporal Filtering Matrix

| Filtering Method | Jitter Reduction | Phase Lag / Latency Penalty | Computational Cost | Memory Footprint | 30-Hour Hackathon Implementation Complexity |
|---|---|---|---|---|---|
| **Exponential Moving Average (EMA)** | Moderate | High during fast motion | Negligible ($<10$ FLOPs) | 236 Bytes | Extremely Simple ($<10$ lines code) |
| **One Euro Filter ($1\text{\euro Filter}$)** | High | Speed-Adaptive `[DESIGN PROPOSAL - E03 REQUIRED]` | Negligible ($<80$ FLOPs) | 520 Bytes | Simple ($<50$ lines code) |
| **Kalman Filter** | High | Low-Medium | Low ($\sim 2\text{K}$ FLOPs) | 2.5 KB | Moderate (Requires noise matrix tuning) |
| **Temporal CNN / Casual Conv1D** | High | High ($30 - 50\text{ ms}$ buffer lag) | Medium ($\sim 1\text{M}$ FLOPs) | 1.2 MB | High (Requires neural model training) |
| **GRU / LSTM Recurrent Layer** | High | High ($40 - 60\text{ ms}$ state lag) | Medium ($\sim 2\text{M}$ FLOPs) | 2.5 MB | High (Requires sequence pre-training) |

---

## 2. Tradeoff Analysis & Signal Behavior

### One Euro Filter vs. Static EMA
- Static EMA uses a fixed smoothing factor $\alpha$. Increasing $\alpha$ for stability during static resting pose introduces heavy phase lag during fast blinks. Decreasing $\alpha$ for responsiveness allows static jitter through.
- The One Euro Filter (Casiez et al. 2012) solves this via adaptive cutoff frequency $f_c$:
  $$f_c = f_{c,\min} + \beta |\dot{x}_t|$$
  When velocity $|\dot{x}_t|$ is near zero, $f_c \approx f_{c,\min} = 1.0\text{ Hz}$ (heavy noise suppression). When velocity is high (fast blink), $f_c$ scales up dynamically.
- **Corrected Engineering Position**: **Initial temporal-processing candidate; parameters and exact latency/jitter tradeoff require E03 validation.**

---

## 3. Initial Experimental Parameter Ranges [INITIAL EXPERIMENTAL PARAMETERS]
Parameters must be benchmarked on target hardware during Stage 2 (Experiment E03):
- **Eye Channels (`eyeBlinkLeft`, `eyeBlinkRight`)**: $f_{c,\min} \in [0.5, 2.0]\text{ Hz}, \beta \in [0.01, 0.1]$.
- **Mouth / Jaw Channels (`jawOpen`, `mouthSmile`)**: $f_{c,\min} \in [0.5, 1.5]\text{ Hz}, \beta \in [0.005, 0.05]$.
- **Head Rotation Quaternion Channels**: $f_{c,\min} \in [0.2, 1.0]\text{ Hz}, \beta \in [0.001, 0.01]$.

---

## 4. Track C Recommendation
**Recommended Method**: **One Euro Filter ($1\text{\euro Filter}$) with Channel Deadband** `[DESIGN PROPOSAL]`.
- Designated as initial temporal-processing candidate; parameters and latency/jitter tradeoff require E03 validation.
