# Real-Time Systems, Latency & Throughput Fundamentals

## Definition [FACT]
Real-Time Processing in facial motion capture is the execution constraint where the total end-to-end delay from light hitting the smartphone camera sensor to 3D avatar vertex deformation on the laptop screen is minimal and suitable for real-time interaction.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
In live VTuber streaming, interactive gaming, and stage pitch demonstrations, any visual delay between human facial movement and avatar animation breaks immersion. MocapLens AI aims to evaluate every millisecond in the capture-to-render pipeline.

## Core Concepts [FACT]
1. **FPS vs. Latency vs. Throughput**:
   - **FPS (Frames Per Second)**: Frequency of completed frames rendered per second ($60\text{ FPS} \implies 16.67\text{ ms}$ inter-frame period `[TARGET]`).
   - **Latency (End-to-End Delay)**: Total elapsed time from physical event capture to visual output ($T_{end-to-end} = t_{render} - t_{light\_capture}$).
   - **Throughput**: Data payload rate moving across network transport channel.
2. **Theoretical End-to-End Pipeline Latency Model [THEORETICAL MODEL]**:
   - $T_{capture}$: Sensor exposure and frame transfer to memory ($\sim 4.0\text{ ms}$).
   - $T_{inference}$: NPU/GPU model execution ($\sim 6.0\text{ ms}$).
   - $T_{bridge}$: Socket packet serialization & transport ($\sim 1.5\text{ ms}$).
   - $T_{render}$: Viewport frame swap and display sync ($\sim 3.5\text{ ms}$).
   - **Hypothesized Total $T_{end-to-end} \approx 15.0\text{ ms}$ `[TARGET - TO BE MEASURED EXPERIMENTALLY]`**.
3. **Pipeline Parallelism & Async Buffering [DESIGN PROPOSAL]**:
   - Decouple camera capture thread, model inference thread, and network socket thread using double/triple buffering to prevent queue blocking.

## Important Equations & Technical Details [FACT]
- **Little's Law for Pipeline Queues**:
  $$L = \lambda \cdot W$$
  where $L$ is average items in pipeline queue, $\lambda$ is frame arrival rate (e.g. 60 Hz), and $W$ is processing latency ($15\text{ ms}$). $L = 60 \times 0.015 = 0.9 \implies$ queue length stays $< 1$.
- **Jitter Metric (Inter-Frame Arrival Variation)**:
  $$J = \frac{1}{N}\sum_{i=1}^N | \Delta t_{i} - \overline{\Delta t} |$$

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Buttazzo, G. C. (2011). *Hard Real-Time Computing Systems*. Springer.
- Wessels, A., et al. (2021). "Latency Quantification in Optical Motion Capture Pipelines." *ACM SIGGRAPH Talks*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Evaluate non-blocking asynchronous socket writes (`TCP_NODELAY` or UDP socket packets) to avoid network buffer aggregation delays.
- Drop stale frames on mobile capture queue if inference duration exceeds frame period to prevent queue lag accumulation.

## Known Limitations [FACT]
- Display synchronization (V-Sync) on laptop monitors introduces a buffer delay tied to refresh rate ($16.6\text{ ms}$ at 60 Hz display, $7.0\text{ ms}$ at 144 Hz display).
