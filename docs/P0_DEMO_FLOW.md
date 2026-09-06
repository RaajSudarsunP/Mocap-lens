# MocapLens AI — UI/UX & Demo Flow Architecture (Material 3 Expressive)

> [!NOTE]
> **DESIGN FOUNDATION**: MocapLens AI adopts Google's **Material 3 Expressive** design system ([m3.material.io](https://m3.material.io/)) combined with a professional facial motion capture studio visual identity. The 3D avatar is the central visual hero element of the product experience.

---

## 1. Design Direction & Visual Hierarchy

MocapLens AI uses Material 3 Expressive as its visual foundation while delivering a futuristic, high-performance facial motion capture experience.

### 1.1 Core Visual Hierarchy (Priority Order)
1. **USER'S FACE**: Live webcam preview card with 468-landmark wireframe overlay.
2. **3D AVATAR HERO VIEWPORT**: Dominates screen real estate (`1fr` hero card) with studio lighting, material shader color modes, and 52-blendshape morph targets.
3. **FACIAL MOTION**: Real-time 60 FPS expression tracking with One Euro Filter smoothing and adjustable Expression Gain (0.5x–2.5x).
4. **INTERACTION & CONTROLS**: Floating frosted action bar with shape-transforming buttons, neutral pose calibrator, Candidate A3 mesh deformer, take recorder, and avatar style selector.
5. **TECHNICAL DATA**: Clean overlay revealing engineering telemetry (468 landmarks, tracking confidence, 6-DoF pitch/yaw/roll, and live blendshape meters) without cluttering the main performance experience.

---

## 2. Material 3 Expressive Design System Tokens

### 2.1 Color System (Dynamic Studio Palette)
- **Background**: `var(--m3-sys-color-background)` (`#090d14`)
- **Surface & Cards**: `var(--m3-sys-color-surface)` (`#121824`)
- **Primary Accent (Live Tracking)**: `var(--m3-sys-color-primary)` (`#00f0ff` Cyan)
- **Secondary Accent (Personalized/Avatars)**: `var(--m3-sys-color-secondary)` (`#8b5cf6` Violet)
- **Tertiary Accent (Calibrated/Ready)**: `var(--m3-sys-color-tertiary)` (`#00ff66` Emerald Green)
- **Error / Recording Active**: `var(--m3-sys-color-error)` (`#ff0055` Crimson Red)
- **Warning State**: `var(--m3-sys-color-warning)` (`#ffb703` Amber)

### 2.2 Expressive Shapes & Typography
- **Corner Radii**: Small (`8px`), Medium (`16px`), Large (`28px`), Pill (`9999px`).
- **Typography Scale**: Google Sans Flex / Outfit font family. Strategic large type reserved for header branding, acquisition sequence indicators, and primary action controls.
- **Motion Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)` for fluid, spring-like container transforms, button scale-up, and overlay transitions.

---

## 3. Acquisition Sequence State Machine

The user journey follows a continuous state acquisition sequence:

```text
       ┌────────────────────────────────────────────────────────┐
       │                       1. IDLE                          │
       │ • "LOOK AT THE CAMERA TO START" banner                 │
       │ • Camera feed searching, avatar awaiting face          │
       └───────────────────────────┬────────────────────────────┘
                                   │ Face Detected (468 Points)
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                   2. FACE DETECTED                     │
       │ • Subtle container shape expansion & cyan glow         │
       │ • 468-Point mesh wireframe materializes on webcam      │
       └───────────────────────────┬────────────────────────────┘
                                   │ Click "Calibrate Neutral"
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                   3. CALIBRATING                       │
       │ • Baseline neutral expression offsets stored           │
       │ • Prevents resting mesh distortion / artifacts         │
       └───────────────────────────┬────────────────────────────┘
                                   │ Calibration Complete
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                   4. MOTION READY                      │
       │ • Status badge transitions to "READY FOR PERFORMANCE" │
       │ • User can click "Personalize Avatar (A3)"             │
       └───────────────────────────┬────────────────────────────┘
                                   │ Avatar Materializes
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │              5. LIVE AVATAR PERFORMANCE                │
       │ • Avatar responds live to blinks, smiles, jaw & pose   │
       │ • Floating controls: Record, Gain Slider, Tech View    │
       └────────────────────────────────────────────────────────┘
```

---

## 4. Component Implementation Guide

| Component | Design Pattern | Material 3 Expressive Feature |
| :--- | :--- | :--- |
| **Hero 3D Viewport** | Large Hero Card | Glow-bordered card with `28px` corner radius & inset lighting |
| **Capture Control** | Prominent Action Button | Shape-changing FAB button morphing to Crimson Red pulse during recording |
| **Avatar Mode Selector** | Visual Segmented Selector | Pill shape container switching between A3 Semi-Realistic, Cyber, and Wireframe |
| **Expression Gain** | Interactive Slider | Custom thumb slider adjusting blendshape sensitivity (0.5x–2.5x) |
| **Technical Mode** | Frosted Telemetry Overlay | Glassmorphic overlay displaying 6-DoF pose and 52 ARKit blendshape progress bars |

---

## 5. Dual-View Experience

### Normal Mode (Product Experience)
- High visual impact, cinematic split view.
- Camera feed with subtle landmark mesh overlay on left.
- Dominant 3D Avatar viewport with studio lighting on right.
- Clean floating action bar at bottom.

### Technical Mode (Engineering View)
- Toggled via `⚙️ Technical View` button.
- Displays live 6-DoF Pitch/Yaw/Roll angles, landmark tracking confidence, One Euro Filter parameters, FPS counter, and animated progress bars for key blendshapes (`jawOpen`, `eyeBlinkLeft`, `mouthSmileLeft`, `browInnerUp`).
