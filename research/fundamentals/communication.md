# Network Protocols & High-Frequency Streaming Fundamentals

## Definition [FACT]
Device Communication in MocapLens AI is the low-latency network telemetry architecture responsible for serializing telemetry parameter array packets (blendshape weights, head pose) on the smartphone and transmitting them to the laptop 3D engine over local transport channels.

## Authoritative Telemetry Binary Packet Specification [AUTHORITATIVE SPECIFICATION]

The binary telemetry packet structure is standardized as follows:

| Field Name | Datatype | Byte Offset | Size (Bytes) | Description |
|---|---|---|---|---|
| **Magic Header** | UInt16 | 0 | 2 | Protocol identifier (`0x4D43` = "MC") |
| **Protocol Version & Flags** | UInt16 | 2 | 2 | Version (`0x01`) and status flags |
| **Sequence Number** | UInt32 | 4 | 4 | Monotonic incrementing frame index |
| **Timestamp** | Float64 | 8 | 8 | Unix timestamp in milliseconds |
| **Tracking Confidence** | Float32 | 16 | 4 | Landmark tracking presence score $[0.0, 1.0]$ |
| **Head Rotation Quaternion** | $4 \times \text{Float32}$ | 20 | 16 | $[q_w, q_x, q_y, q_z]$ normalized rotation |
| **Head Translation Vector** | $3 \times \text{Float32}$ | 36 | 12 | $[T_x, T_y, T_z]$ translation in mm |
| **Motion Parameter Vector** | $52 \times \text{Float32}$ | 48 | 208 | $[w_1 \dots w_{52}]$ blendshape float weights |
| **Padding / Alignment** | Bytes | 256 | 4 | Zero-padded to 64-bit boundary |
| **TOTAL APPLICATION PAYLOAD** | — | — | **260 Bytes** | **Exact Binary Payload Size** |

---

## Authoritative Transport Layer Packet & Bandwidth Audit

1. **Binary over UDP Datagram Protocol**:
   - Application Payload: 260 bytes
   - UDP Header: 8 bytes
   - IPv4 Header: 20 bytes
   - **Total Transmitted UDP/IP Packet Size: 288 Bytes**.
   - Network Bandwidth at target 60 Hz: $288 \times 60 = 17,280 \text{ bytes/sec} \approx 17.28 \text{ KB/s} \quad (0.138 \text{ Mbps})$.

2. **Binary over TCP / WebSocket Protocol**:
   - Application Payload: 260 bytes
   - WebSocket Framing Header: 4 bytes
   - TCP Header: 24 bytes
   - IPv4 Header: 20 bytes
   - **Total Transmitted TCP/WebSocket Packet Size: 308 Bytes**.
   - Network Bandwidth at target 60 Hz: $308 \times 60 = 18,480 \text{ bytes/sec} \approx 18.48 \text{ KB/s} \quad (0.148 \text{ Mbps})$.

3. **JSON Format over WebSocket (Debugging Mode)**:
   - JSON String Payload: $\sim 1,150 \text{ bytes}$.
   - Total Transmitted Size with TCP/IP overhead: $\sim 1,198 \text{ bytes}$.
   - Network Bandwidth at target 60 Hz: $1,198 \times 60 \approx 71.88 \text{ KB/s} \quad (0.575 \text{ Mbps})$.

## Transport Layer Recommendations [DESIGN PROPOSAL]
- Binary `ArrayBuffer` UDP or WebSocket payload is recommended for production to minimize network overhead.
- Set `socket.setTcpNoDelay(true)` in Android socket implementations if using TCP/WebSockets to force immediate packet transmission.
