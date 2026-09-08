/**
 * Head Pose Solver — 6-DoF Rigid Head Rotation & Quaternion Calculator
 * Decouples rigid head orientation (Pitch, Yaw, Roll) from non-rigid face muscle movements.
 */

export class HeadPoseSolver {
  constructor() {
    // Rigid facial landmark indices (Nose tip: 1, Chin: 152, Left Eye Outer: 33, Right Eye Outer: 263, Left Mouth: 61, Right Mouth: 291)
    this.rigidIndices = [1, 152, 33, 263, 61, 291];
  }

  /**
   * Calculates Euler angles (Pitch, Yaw, Roll in radians) and Quaternion [qw, qx, qy, qz]
   */
  solvePose(landmarks, matrix = null) {
    if (matrix && matrix.length === 16) {
      return this.matrixToQuaternionAndEuler(matrix);
    }

    if (!landmarks || landmarks.length < 468) {
      return { euler: { pitch: 0, yaw: 0, roll: 0 }, quaternion: [1, 0, 0, 0], translation: [0, 0, 0] };
    }

    const nose = landmarks[1];
    const chin = landmarks[152];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    // Estimate Yaw (horizontal rotation)
    const eyeDx = rightEye.x - leftEye.x;
    const eyeDz = rightEye.z - leftEye.z;
    const yaw = Math.atan2(eyeDz, eyeDx);

    // Estimate Pitch (vertical tilt)
    const noseChinDy = chin.y - nose.y;
    const noseChinDz = chin.z - nose.z;
    const pitch = Math.atan2(noseChinDz, noseChinDy);

    // Estimate Roll (side tilt)
    const eyeDy = rightEye.y - leftEye.y;
    const roll = Math.atan2(eyeDy, eyeDx);

    const quaternion = this.eulerToQuaternion(pitch, yaw, roll);

    return {
      euler: { pitch, yaw, roll },
      quaternion,
      translation: [nose.x - 0.5, -(nose.y - 0.5), -nose.z]
    };
  }

  eulerToQuaternion(pitch, yaw, roll) {
    const c1 = Math.cos(yaw / 2);
    const s1 = Math.sin(yaw / 2);
    const c2 = Math.cos(pitch / 2);
    const s2 = Math.sin(pitch / 2);
    const c3 = Math.cos(roll / 2);
    const s3 = Math.sin(roll / 2);

    const w = c1 * c2 * c3 - s1 * s2 * s3;
    const x = s1 * s2 * c3 + c1 * c2 * s3;
    const y = s1 * c2 * c3 + c1 * s2 * s3;
    const z = c1 * s2 * c3 - s1 * c2 * s3;

    return [w, x, y, z];
  }

  matrixToQuaternionAndEuler(m) {
    // Extract rotation matrix elements from 4x4 column-major matrix
    const r11 = m[0], r12 = m[4], r13 = m[8];
    const r21 = m[1], r22 = m[5], r23 = m[9];
    const r31 = m[2], r32 = m[6], r33 = m[10];

    const tr = r11 + r22 + r33;
    let w, x, y, z;

    if (tr > 0) {
      const S = Math.sqrt(tr + 1.0) * 2;
      w = 0.25 * S;
      x = (r32 - r23) / S;
      y = (r13 - r31) / S;
      z = (r21 - r12) / S;
    } else if ((r11 > r22) && (r11 > r33)) {
      const S = Math.sqrt(1.0 + r11 - r22 - r33) * 2;
      w = (r32 - r23) / S;
      x = 0.25 * S;
      y = (r12 + r21) / S;
      z = (r13 + r31) / S;
    } else if (r22 > r33) {
      const S = Math.sqrt(1.0 + r22 - r11 - r33) * 2;
      w = (r13 - r31) / S;
      x = (r12 + r21) / S;
      y = 0.25 * S;
      z = (r23 + r32) / S;
    } else {
      const S = Math.sqrt(1.0 + r33 - r11 - r22) * 2;
      w = (r21 - r12) / S;
      x = (r13 + r31) / S;
      y = (r23 + r32) / S;
      z = 0.25 * S;
    }

    const pitch = Math.asin(-r23);
    const yaw = Math.atan2(r13, r33);
    const roll = Math.atan2(r21, r22);

    return {
      euler: { pitch, yaw, roll },
      quaternion: [w, x, y, z],
      translation: [m[12], m[13], m[14]]
    };
  }
}
