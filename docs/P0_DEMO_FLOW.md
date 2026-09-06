# MocapLens AI — Professional Motion Capture Workstation (Material 3)

> [!NOTE]
> **DESIGN RESET & FOUNDATION**: MocapLens AI adopts a restrained **Material 3 Professional Workstation** visual identity. The design communicates precision, confidence, and quiet simplicity, allowing the **3D Avatar** to remain the visually dominant hero element.

---

## 1. Visual Hierarchy & Design System

### 1.1 Visual Priority
1. **3D AVATAR (HERO)**: Dominates over 80% of the screen workspace inside a quiet dark studio environment (`#0c1017`).
2. **USER'S FACE / CAMERA**: Compact picture-in-picture box (`240x145px`) positioned unobtrusively in the top-left with crisp 1px neutral borders.
3. **FACIAL MOTION**: Real-time 60 Hz tracking signal smoothed by $1\text{\euro Filter}$.
4. **PRIMARY CAPTURE ACTION**: Prominent Material 3 filled action button (**Start Capture** / **Stop Capture**) in center of the bottom control bar.
5. **SECONDARY CONTROLS**: `Calibrate Neutral`, `Personalize (A3)`, `Gain Slider`, `Export JSON`.
6. **TECHNICAL INFORMATION**: Slide-over right drawer displaying clean numeric telemetry without bright neon noise.

---

## 2. Material 3 Color Tokens & Typography

### 2.1 Color Palette
- **Studio Background**: `--m3-bg` (`#0c1017`)
- **Surface**: `--m3-surface` (`#141a24`)
- **Surface Variant**: `--m3-surface-variant` (`#1e2634`)
- **Border**: `--m3-border` (`rgba(255, 255, 255, 0.1)`)
- **Primary Accent**: `--m3-primary` (`#0284c7` / Slate Sky Blue)
- **Live / Success**: `--m3-success` (`#16a34a` / Muted Green)
- **Capture Recording**: `--m3-danger` (`#dc2626` / Deep Red)

### 2.2 Typography Scale
- **Font Stack**: Google Sans Flex / Inter.
- **Header Title**: Bold title `MocapLens` with small muted tag `P0 PROTOTYPE`.
- **Telemetry Headings**: Small uppercase eyebrow text (`FACE TRACKING`, `6-DOF HEAD POSE`, `EXPRESSION CHANNELS`) with tabular monospace numeric values.

---

## 3. Subdued Acquisition State Machine

The interface communicates state quietly without loud neon banners:

$$\text{Looking for face...} \longrightarrow \text{Face tracking active} \longrightarrow \text{Neutral pose calibrated} \longrightarrow \text{Capturing motion take...}$$

---

## 4. Workstation Component Layout

- **Top Bar (`52px`)**: Brand header, status dot, discrete state indicator, and FPS gauge.
- **Main Stage**: Quiet studio background with 3D avatar viewport, compact camera PIP preview, and top-right segment mode selector (`[ Human A3 ] [ Cyber ] [ Wireframe ]`).
- **Control Bar (`64px`)**: Clean bottom toolbar with `Calibrate Neutral`, `Personalize (A3)`, `Start Capture` FAB, `Gain Slider`, `Export JSON`, and `Technical View` toggle.
- **Telemetry Drawer**: Slide-over drawer on the right side providing complete numeric telemetry on demand.
