function extractYawPitch(matrix) {
  if (!matrix || !matrix.data) return { yaw: 0, pitch: 0 };

  const m = matrix.data;
  const yaw = Math.atan2(m[8], m[0]) * (180 / Math.PI);
  const pitch = Math.asin(-m[4]) * (180 / Math.PI);

  return { yaw, pitch };
}

export function validateAngle(slot, matrix, landmarks) {
  if (matrix) {
    const { yaw, pitch } = extractYawPitch(matrix);
    return validateFromPose(slot, yaw, pitch);
  }
  return validateFromLandmarks(slot, landmarks);
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
      if (yaw > 25 && yaw < 65 && absPitch < 18) return { valid: true };
      if (yaw <= 25)
        return {
          valid: false,
          message:
            "Turn your head more to the left — aim for a 3/4 angle with both eyes still visible.",
        };
      if (yaw >= 65)
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
      if (yaw < -25 && yaw > -65 && absPitch < 18) return { valid: true };
      if (yaw >= -25)
        return {
          valid: false,
          message:
            "Turn your head more to the right — aim for a 3/4 angle with both eyes still visible.",
        };
      if (yaw <= -65)
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
      if (yaw > 65 && absPitch < 18) return { valid: true };
      if (yaw <= 65)
        return {
          valid: false,
          message:
            "Turn your head further left to show your full left profile.",
        };
      return {
        valid: false,
        message:
          "Keep your chin level while showing your profile — your head is tilted.",
      };

    case "rightProfile":
      if (yaw < -65 && absPitch < 18) return { valid: true };
      if (yaw >= -65)
        return {
          valid: false,
          message:
            "Turn your head further right to show your full right profile.",
        };
      return {
        valid: false,
        message:
          "Keep your chin level while showing your profile — your head is tilted.",
      };

    case "chinUp":
      if (pitch < -10 && pitch > -45 && absYaw < 18) return { valid: true };
      if (pitch >= -10)
        return {
          valid: false,
          message:
            "Tilt your chin up more — we need to see the underside of your jaw slightly.",
        };
      if (pitch <= -45)
        return {
          valid: false,
          message:
            "You've tilted too far back — just a slight chin-up angle is needed.",
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
      if (noseCenterRatio > 0.15 && noseCenterRatio < 0.7 && eyeSpread > 0.04 && noseToLeftEye < noseToRightEye)
        return { valid: true };
      if (noseCenterRatio <= 0.15)
        return {
          valid: false,
          message:
            "Turn your head more to the left for a 3/4 angle — both eyes should still be visible.",
        };
      if (noseToLeftEye >= noseToRightEye)
        return {
          valid: false,
          message:
            "This looks like a right turn — turn to the left instead for this slot.",
        };
      return {
        valid: false,
        message:
          "You've turned too far — turn back slightly so both eyes are visible.",
      };

    case "rightThreeQuarter":
      if (noseCenterRatio > 0.15 && noseCenterRatio < 0.7 && eyeSpread > 0.04 && noseToRightEye < noseToLeftEye)
        return { valid: true };
      if (noseCenterRatio <= 0.15)
        return {
          valid: false,
          message:
            "Turn your head more to the right for a 3/4 angle — both eyes should still be visible.",
        };
      if (noseToRightEye >= noseToLeftEye)
        return {
          valid: false,
          message:
            "This looks like a left turn — turn to the right instead for this slot.",
        };
      return {
        valid: false,
        message:
          "You've turned too far — turn back slightly so both eyes are visible.",
      };

    case "leftProfile":
      if ((eyeSpread < 0.06 || noseCenterRatio > 0.6) && noseToLeftEye < noseToRightEye)
        return { valid: true };
      if (noseToLeftEye >= noseToRightEye)
        return {
          valid: false,
          message:
            "This looks like a right profile — turn to show your left side.",
        };
      return {
        valid: false,
        message:
          "Turn your head further left to show your full left profile.",
      };

    case "rightProfile":
      if ((eyeSpread < 0.06 || noseCenterRatio > 0.6) && noseToRightEye < noseToLeftEye)
        return { valid: true };
      if (noseToRightEye >= noseToLeftEye)
        return {
          valid: false,
          message:
            "This looks like a left profile — turn to show your right side.",
        };
      return {
        valid: false,
        message:
          "Turn your head further right to show your full right profile.",
      };

    case "chinUp": {
      const chin = landmarks[152];
      const forehead = landmarks[10];
      const faceHeight = Math.abs(forehead.y - chin.y);
      const noseY = noseTip.y;
      const midY = (forehead.y + chin.y) / 2;
      const noseRelative = (noseY - midY) / (faceHeight || 0.01);
      if (noseRelative < -0.05 && noseCenterRatio < 0.35)
        return { valid: true };
      if (noseCenterRatio >= 0.35)
        return {
          valid: false,
          message:
            "Face the camera while tilting your chin up — your head is turned to the side.",
        };
      return {
        valid: false,
        message:
          "Tilt your chin up slightly more — we need to see the underside of your jaw.",
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
