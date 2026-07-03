const SLOT_LABELS = [
  "front",
  "leftThreeQuarter",
  "rightThreeQuarter",
  "leftProfile",
  "rightProfile",
  "chinUp",
];

const CANONICAL_3D = [
  [0.0, 0.0, 0.0],         // nose tip (landmark 30)
  [0.0, -63.6, -12.5],     // chin (landmark 8)
  [-43.3, 32.7, -26.0],    // left eye outer (landmark 36)
  [43.3, 32.7, -26.0],     // right eye outer (landmark 45)
  [-28.9, -28.9, -24.1],   // left mouth corner (landmark 48)
  [28.9, -28.9, -24.1],    // right mouth corner (landmark 54)
];

const LANDMARK_INDICES = [30, 8, 36, 45, 48, 54];

export function estimatePose(landmarks68) {
  const points = landmarks68.positions || landmarks68._positions;
  if (!points || points.length < 68) return null;

  const pts2d = LANDMARK_INDICES.map((i) => [points[i].x, points[i].y]);
  const pts3d = CANONICAL_3D;

  const { yaw, pitch, roll } = solvePoseApprox(pts2d, pts3d);

  return { yaw, pitch, roll };
}

function solvePoseApprox(pts2d, pts3d) {
  const noseTip = pts2d[0];
  const chin = pts2d[1];
  const leftEyeOuter = pts2d[2];
  const rightEyeOuter = pts2d[3];
  const leftMouth = pts2d[4];
  const rightMouth = pts2d[5];

  const eyeMidX = (leftEyeOuter[0] + rightEyeOuter[0]) / 2;
  const eyeMidY = (leftEyeOuter[1] + rightEyeOuter[1]) / 2;
  const eyeWidth = Math.abs(rightEyeOuter[0] - leftEyeOuter[0]);
  const mouthWidth = Math.abs(rightMouth[0] - leftMouth[0]);

  const noseToLeftEye = Math.abs(noseTip[0] - leftEyeOuter[0]);
  const noseToRightEye = Math.abs(noseTip[0] - rightEyeOuter[0]);

  const faceHeight = Math.sqrt(
    (chin[0] - eyeMidX) ** 2 + (chin[1] - eyeMidY) ** 2
  );

  let yaw = 0;
  if (eyeWidth > 1) {
    const asymmetry = (noseToRightEye - noseToLeftEye) / eyeWidth;
    yaw = Math.asin(Math.max(-1, Math.min(1, asymmetry * 1.2))) * (180 / Math.PI);
  }

  let pitch = 0;
  if (faceHeight > 1) {
    const noseRelY = (noseTip[1] - eyeMidY) / faceHeight;
    const expectedNoseRel = 0.35;
    pitch = (noseRelY - expectedNoseRel) * 120;
  }

  const eyeDy = rightEyeOuter[1] - leftEyeOuter[1];
  const roll = Math.atan2(eyeDy, eyeWidth) * (180 / Math.PI);

  return { yaw, pitch, roll };
}

export function classifySlot(pose) {
  if (!pose) return { slot: "unknown", confidence: 0 };

  const { yaw, pitch } = pose;
  const absYaw = Math.abs(yaw);

  if (Math.abs(pitch) > 15 && absYaw < 25) {
    return { slot: "chinUp", confidence: clampConf(Math.abs(pitch) / 30) };
  }

  if (absYaw < 12) {
    return { slot: "front", confidence: clampConf(1 - absYaw / 12) };
  }

  if (absYaw >= 12 && absYaw < 40) {
    const slot = yaw > 0 ? "rightThreeQuarter" : "leftThreeQuarter";
    const center = 26;
    const dist = Math.abs(absYaw - center);
    return { slot, confidence: clampConf(1 - dist / 14) };
  }

  if (absYaw >= 40) {
    const slot = yaw > 0 ? "rightProfile" : "leftProfile";
    return { slot, confidence: clampConf(absYaw / 70) };
  }

  return { slot: "unknown", confidence: 0 };
}

function clampConf(v) {
  return Math.max(0, Math.min(1, v));
}

export function validateSlotMatch(expectedSlot, detectedSlot, confidence) {
  if (detectedSlot === expectedSlot) {
    return { valid: true, confidence };
  }

  const compatible = {
    front: ["front"],
    leftThreeQuarter: ["leftThreeQuarter"],
    rightThreeQuarter: ["rightThreeQuarter"],
    leftProfile: ["leftProfile", "leftThreeQuarter"],
    rightProfile: ["rightProfile", "rightThreeQuarter"],
    chinUp: ["chinUp", "front"],
  };

  const allowed = compatible[expectedSlot] || [];
  if (allowed.includes(detectedSlot)) {
    return { valid: true, confidence: confidence * 0.8 };
  }

  const slotLabels = {
    front: "front-facing",
    leftThreeQuarter: "left 3/4 angle",
    rightThreeQuarter: "right 3/4 angle",
    leftProfile: "left profile",
    rightProfile: "right profile",
    chinUp: "chin-up",
  };

  return {
    valid: false,
    message: `This looks like a ${slotLabels[detectedSlot] || detectedSlot} photo — we need a ${slotLabels[expectedSlot]} photo here.`,
  };
}

export { SLOT_LABELS };
