export function validateAngle(slot, _matrix, landmarks, noDetection) {
  if (noDetection) {
    return validateNoDetection(slot);
  }
  if (!landmarks || landmarks.length < 468) {
    return {
      valid: false,
      message: "Could not detect enough facial landmarks. Make sure your face is clearly visible.",
    };
  }
  return validateFromLandmarks(slot, landmarks);
}

function validateNoDetection(slot) {
  switch (slot) {
    case "leftProfile":
    case "rightProfile":
      return { valid: true, accepted: true };
    case "chinUp":
      return { valid: true, accepted: true };
    default:
      return {
        valid: false,
        message:
          "No face detected. Make sure your face is clearly visible and well-lit.",
      };
  }
}

function validateFromLandmarks(slot, landmarks) {
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
  const turningLeft = noseToLeftEye < noseToRightEye;

  switch (slot) {
    case "front":
      if (noseCenterRatio < 0.20 && eyeSpread > 0.10)
        return { valid: true };
      if (eyeSpread <= 0.10)
        return {
          valid: false,
          message:
            "Your face appears too far away or turned too far. Move closer and face the camera directly.",
        };
      return {
        valid: false,
        message:
          "Face the camera directly — your face appears turned to one side.",
      };

    case "leftThreeQuarter":
      if (noseCenterRatio > 0.08 && eyeSpread > 0.08 && turningLeft)
        return { valid: true };
      if (!turningLeft && noseCenterRatio > 0.08)
        return {
          valid: false,
          message:
            "You're turned to the right — turn to the left for this slot.",
        };
      if (noseCenterRatio <= 0.08)
        return {
          valid: false,
          message:
            "Turn your head slightly to the left — both eyes should still be visible.",
        };
      return {
        valid: false,
        message:
          "Move closer to the camera and turn slightly left.",
      };

    case "rightThreeQuarter":
      if (noseCenterRatio > 0.08 && eyeSpread > 0.08 && !turningLeft)
        return { valid: true };
      if (turningLeft && noseCenterRatio > 0.08)
        return {
          valid: false,
          message:
            "You're turned to the left — turn to the right for this slot.",
        };
      if (noseCenterRatio <= 0.08)
        return {
          valid: false,
          message:
            "Turn your head slightly to the right — both eyes should still be visible.",
        };
      return {
        valid: false,
        message:
          "Move closer to the camera and turn slightly right.",
      };

    case "leftProfile":
    case "rightProfile":
      if (eyeSpread < 0.12 || noseCenterRatio > 0.25)
        return { valid: true };
      return {
        valid: false,
        message:
          "Turn your head further to show your profile — we need more of a side view.",
      };

    case "chinUp":
      if (noseCenterRatio < 0.30 && eyeSpread > 0.06)
        return { valid: true };
      if (noseCenterRatio >= 0.30)
        return {
          valid: false,
          message:
            "Face the camera while tilting your chin up — your head is turned too far to the side.",
        };
      return {
        valid: false,
        message:
          "Move closer to the camera and tilt your chin up slightly.",
      };

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
