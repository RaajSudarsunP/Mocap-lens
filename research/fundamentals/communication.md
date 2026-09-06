# Network Protocols & High-Frequency Streaming Fundamentals

## Definition [FACT]
Device Communication in MocapLens AI is the low-latency network telemetry architecture responsible for serializing telemetry parameter array packets (blendshape weights, head pose) on the smartphone and transmitting them to the laptop 3D engine over local transport channels.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
Transmitting full high-resolution video streams from phone to laptop requires significant bandwidth ($15-30\text{ Mbps}$) and incurs video encoding/decoding latency. By processing AI on device and transmitting raw parameter arrays, MocapLens AI aims to minimize network bandwidth and transport latency.

## Core Concepts & Payload Calculations [FACT & AUDIT CORRECTION]
1. **Parameter Transfer vs. Video Transfer**:
   - *Video Transfer*: $1920 \times 1080 \times 60 \text{ FPS} \implies$ Heavy video compression (H.264/H.265), higher encode/decode lag.
   - *Telemetry Transfer*: Transmits scalar parameter arrays representing face geometry and pose.
2. **Payload & Packet Size Audit Breakdown [FACT]**:
   - **Raw Data Components**:
     - 52 Blendshape Floats ($52 \times 4 \text{ bytes} = 208 \text{ bytes}$).
     - Head Rotation Quaternion ($4 \times 4 \text{ bytes} = 16 \text{ bytes}$).
     - Head Translation Vector ($3 \times 4 \text{ bytes} = 12 \text{ bytes}$).
     - Timestamp ($1 \times 8 \text{ bytes} = 8 \text{ bytes}$, Float64).
     - Frame Index / Sequence ID ($1 \times 4 \text{ bytes} = 4 \text{ bytes}$, UInt32).
     - **Total Application Layer Payload = 248 Bytes**.
   - **Protocol Overhead & Network Transport Size**:
     - **Binary over UDP**:
       - UDP Header: 8 bytes.
       - IPv4 Header: 20 bytes (or IPv6: 40 bytes).
       - **Total Transmitted UDP/IP Packet Size $\approx 276 \text{ bytes}$ per frame**.
       - Bandwidth at target 60 Hz: $276 \text{ bytes/frame} \times 60 \text{ Hz} = 16,560 \text{ bytes/sec} \approx 16.56 \text{ KB/s} \quad (0.132 \text{ Mbps})$.
     - **Binary over TCP / WebSocket**:
       - WebSocket Framing Header: 2–6 bytes.
       - TCP Header: 20–32 bytes.
       - IP Header: 20 bytes.
       - **Total Transmitted TCP/IP Packet Size $\approx 296 \text{ bytes}$ per frame**.
       - Bandwidth at target 60 Hz: $296 \times 60 = 17,760 \text{ bytes/sec} \approx 17.76 \text{ KB/s} \quad (0.142 \text{ Mbps})$.
     - **JSON Format over WebSocket (Debugging Mode)**:
       - JSON string with key-value pairs (`{"jawOpen":0.82,"headQuat":[1,0,0,0],...}`): $\sim 1,150 \text{ bytes}$.
       - Total Transmitted Size with TCP/IP overhead: $\sim 1,200 \text{ bytes}$ per frame.
       - Bandwidth at 60 Hz: $1,200 \times 60 \approx 72.0 \text{ KB/s} \quad (0.576 \text{ Mbps})$.
3. **Transport Protocol Characteristics**:
   - **UDP**: Unreliable datagrams; lowest transport latency; missing packets are acceptable in real-time telemetry (next frame supersedes stale data).
   - **TCP / WebSockets with `TCP_NODELAY`**: Reliable stream; setting `TCP_NODELAY` disables Nagle's packet aggregation algorithm to force immediate transmission.

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Postel, J. (1980). "User Datagram Protocol." *RFC 768*.
- Fette, I., & Melnikov, A. (2011). "The WebSocket Protocol." *RFC 6455*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Binary `ArrayBuffer` payload structure is recommended for production to minimize serialization CPU overhead.
- Set `socket.setTcpNoDelay(true)` in Android socket implementations if using TCP/WebSockets to force immediate packet flushing.

## Known Limitations & Transport Verification [UNVERIFIED]
- Wi-Fi network congestion in public venues can cause packet arrival jitter; transport layer performance and packet loss rate must be measured experimentally on target hardware.
