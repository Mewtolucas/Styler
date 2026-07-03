function extractYawPitch(matrix) {
  if (!matrix || !matrix.data) return { yaw: 0, pitch: 0 };

  const m = matrix.data;
  const yaw = Math.atan2(m[8], m[0]) * (180 / Math.PI);
  const pitch = Math.asin(-m[4]) * (180 / Math.PI);

  return { yaw, pitch };
}

export function validateAngle(slot, matrix, landmarks, noDetection) {
  if (noDetection) {
    return validateNoDetection(slot);
  }
  if (matrix) {
    const { yaw, pitch } = extractYawPitch(matrix);
    return validateFromPose(slot, yaw, pitch);
  }
  return validateFromLandmarks(slot, landmarks);
}

function validateNoDetection(slot) {
  switch (slot) {
    case "leftProfile":
    case "rightProfile":
      return {
        valid: true,
        message: "Face not fully detected at this angle — accepted as profile.",
        accepted: true,
      };
    case "chinUp":
      return {
        valid: true,
        message: "Face not fully detected at this angle — accepted as chin-up.",
        accepted: true,
      };
    default:
      return {
        valid: false,
        message:
          "No face detected. Make sure your face is clearly visible and well-lit.",
      };
  }
}

function validateFromPose(slot, yaw, pitch) {
  const absYaw = Math.abs(yaw);
  const absPitch = Math.abs(pitch);

  switch (slot) {
    case "front":
      if (absYaw < 12 && absPitch < 12) return { valid: true };
      if (absYaw >= 12)
        return {
          valid: false,
          message:
            "Face the camera directly — your head is turned too far to one side.",
        };
      return {
        valid: false,
        message:
          "Keep your chin level with the camera — your head is tilted up or down.",
      };

    case "leftThreeQuarter":
      if (absYaw > 20 && absYaw < 65 && absPitch < 20) return { valid: true };
      if (absYaw <= 20)
        return {
          valid: false,
          message:
            "Turn your head more to the left — aim for a 3/4 angle with both eyes still visible.",
        };
      if (absYaw >= 65)
        return {
          valid: false,
          message:
            "You've turned too far left — turn back slightly so both eyes are still visible.",
        };
      return {
        valid: false,
        message:
          "Keep your chin level while turning — your head is tilted up or down.",
      };

    case "rightThreeQuarter":
      if (absYaw > 20 && absYaw < 65 && absPitch < 20) return { valid: true };
      if (absYaw <= 20)
        return {
          valid: false,
          message:
            "Turn your head more to the right — aim for a 3/4 angle with both eyes still visible.",
        };
      if (absYaw >= 65)
        return {
          valid: false,
          message:
            "You've turned too far right — turn back slightly so both eyes are still visible.",
        };
      return {
        valid: false,
        message:
          "Keep your chin level while turning — your head is tilted up or down.",
      };

    case "leftProfile":
    case "rightProfile":
      if (absYaw > 45 && absPitch < 25) return { valid: true };
      if (absYaw <= 45)
        return {
          valid: false,
          message:
            "Turn your head further to show your profile — we need a side view of your face.",
        };
      return {
        valid: false,
        message:
          "Keep your chin level while showing your profile — your head is tilted.",
      };

    case "chinUp":
      if (absPitch > 8 && absYaw < 25) return { valid: true };
      if (absPitch <= 8)
        return {
          valid: false,
          message:
            "Tilt your chin up more — we need to see the underside of your jaw slightly.",
        };
      return {
        valid: false,
        message:
          "Face the camera while tilting your chin up — your head is turned to the side.",
      };

    default:
      return { valid: false, message: "Unknown photo slot." };
  }
}

function validateFromLandmarks(slot, landmarks) {
  if (!landmarks || landmarks.length < 468) {
    return { valid: false, message: "Could not detect enough facial landmarks. Make sure your face is clearly visible." };
  }

  const noseTip = landmarks[1];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];

  const eyeSpread = Math.abs(leftEye.x - rightEye.x);
  const noseToLeftEye = Math.abs(noseTip.x - leftEye.x);
  const noseToRightEye = Math.abs(noseTip.x - rightEye.x);
  const noseCenterRatio =
    eyeSpread > 0.01
      ? Math.abs(noseToLeftEye - noseToRightEye) / eyeSpread
      : 0;

  switch (slot) {
    case "front":
      if (noseCenterRatio < 0.25 && eyeSpread > 0.08)
        return { valid: true };
      return {
        valid: false,
        message:
          "Face the camera directly — your face appears turned to one side.",
      };

    case "leftThreeQuarter":
    case "rightThreeQuarter":
      if (noseCenterRatio > 0.12 && eyeSpread > 0.03)
        return { valid: true };
      if (noseCenterRatio <= 0.12)
        return {
          valid: false,
          message:
            "Turn your head more for a 3/4 angle — both eyes should still be visible.",
        };
      return {
        valid: false,
        message:
          "You've turned too far — turn back slightly so both eyes are visible.",
      };

    case "leftProfile":
    case "rightProfile":
      if (eyeSpread < 0.08 || noseCenterRatio > 0.4)
        return { valid: true };
      return {
        valid: false,
        message:
          "Turn your head further to show your full profile from the side.",
      };

    case "chinUp": {
      const chin = landmarks[152];
      const forehead = landmarks[10];
      const faceHeight = Math.abs(forehead.y - chin.y);
      if (faceHeight < 0.15)
        return { valid: true };
      if (noseCenterRatio < 0.35)
        return { valid: true };
      return {
        valid: false,
        message:
          "Face the camera while tilting your chin up — your head is turned to the side.",
      };
    }

    default:
      return { valid: false, message: "Unknown photo slot." };
  }
}

export function checkPhotoQuality(imageElement) {
  const { naturalWidth: w, naturalHeight: h } = imageElement;
  const minSide = Math.min(w, h);

  if (minSide < 640) {
    return {
      valid: false,
      message: `Photo resolution is too low (${w}×${h}). Use a photo at least 640px on the shortest side.`,
    };
  }

  const canvas = document.createElement("canvas");
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  let histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[lum]++;
  }

  const totalPixels = size * size;
  const darkPixels = histogram.slice(0, 30).reduce((a, b) => a + b, 0);
  const brightPixels = histogram.slice(225).reduce((a, b) => a + b, 0);

  if (darkPixels / totalPixels > 0.6) {
    return {
      valid: false,
      message: "Photo is too dark — use better lighting or a brighter environment.",
    };
  }
  if (brightPixels / totalPixels > 0.6) {
    return {
      valid: false,
      message: "Photo is overexposed — reduce direct light or flash.",
    };
  }

  return { valid: true };
}
