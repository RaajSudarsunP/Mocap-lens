# iQOO Office Kit & Multi-Device Bridge Architecture

## Definition [FACT]
iQOO Office Kit is Vivo/iQOO's cross-device interconnectivity framework enabling file sharing, screen mirroring, input sharing, and device-to-device connectivity between smartphones and personal computers.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
In MocapLens AI, the Office Kit framework or underlying local transport interfaces represent the physical and logical communication pipeline between the mobile edge and the laptop host.

## Audit Classification of Office Kit Capabilities [AUDIT CLASSIFICATION]

| Capability | Current Status | Audit Classification | Engineering Notes |
|---|---|---|---|
| Screen Mirroring / File Sharing | Supported by Vendor | `[OFFICIAL DOCUMENTATION]` | Standard consumer feature exposed by iQOO Office Kit software suite. |
| Custom High-Frequency Telemetry SDK API | Not Confirmed | `[UNVERIFIED]` | Whether Office Kit provides a public developer SDK for raw high-frequency telemetry streaming is unverified. |
| Direct Local Wi-Fi P2P Socket Access | Hypothesized | `[UNVERIFIED / ASSUMPTION]` | Relies on OS local socket policies and network adapter isolation. |
| USB Cable Socket Bridge | Hypothesized | `[UNVERIFIED]` | USB/local transport may be evaluated as a fallback, but its availability, configuration and actual jitter must be experimentally verified. |
| ADB Reverse Port Tethering (`adb reverse`) | Hypothesized | `[UNVERIFIED]` | Works on standard Android developer builds; availability under Office Kit daemon mode requires testing. |
| 100% Offline / Airplane Mode Local Streaming | Target | `[TARGET / UNVERIFIED]` | Target execution model to ensure venue resilience; requires hardware testing without internet. |
| Localhost / Port Accessibility | Hypothesized | `[UNVERIFIED]` | OS desktop firewall rules and Android loopback permissions must be verified. |
| Transport Latency & Continuous Throughput | Unmeasured | `[UNVERIFIED]` | Continuous 60 Hz socket telemetry latency must be measured experimentally. |

## Detailed Engineering Position on USB / Local Transport [AUDIT CORRECTION]
- USB and local socket transport are candidate fallback options for venue environments.
- **Corrected Engineering Position**: USB/local transport may be evaluated as a fallback, but its availability, configuration, security restrictions, firewall behavior, and actual jitter must be experimentally verified on target hardware. It must NOT be described as guaranteed or zero-jitter prior to empirical testing.

## Relevant Papers & Documentation [OFFICIAL DOCUMENTATION]
- Vivo / iQOO Developer Documentation. (2024). "iQOO Office Kit Suite Guide." `[OFFICIAL DOCUMENTATION]`.
- Android Open Source Project. (2023). "Android ADB & Local Socket Communication." `[OFFICIAL DOCUMENTATION]`.

## Engineering Recommendations [DESIGN PROPOSAL]
- Architecture should feature an automated connection fallback strategy:
  1. Attempt direct WebSocket connection over local Office Kit network.
  2. Attempt local USB reverse port socket (`localhost:8080`).
  3. Provide local loopback / simulator mode for offline UI testing.

## Known Risks & Verification Matrix [UNVERIFIED]
- OS-level desktop firewall prompts on Windows/macOS may block incoming local socket connections until user grants permission.
- Android background socket service restrictions may suspend socket transmission if app loses foreground focus.
