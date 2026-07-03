import { initLandmarker } from "./landmarks.js";

export async function validatePhoto(imageElement, expectedSlot) {
  const result = {
    detected: false,
    landmarks: null,
    pose: null,
    slotClassification: null,
    slotValid: false,
    quality: null,
    message: null,
    needsConfirmation: false,
  };

  const quality = checkImageQuality(imageElement);
  result.quality = quality;
  if (!quality.valid) {
    result.message = quality.issues
      .filter((i) => i.severity === "error")
      .map((i) => i.message)
      .join(" ");
    return result;
  }

  const lm = await initLandmarker();
  const detection = lm.detect(imageElement);

  if (!detection.faceLandmarks || detection.faceLandmarks.length === 0) {
    result.needsConfirmation = true;
    result.message =
      "Could not auto-detect face. Please confirm this photo is usable.";
    return result;
  }

  result.detected = true;
  result.landmarks = detection.faceLandmarks[0];

  const matrix = detection.facialTransformationMatrixes?.[0] ?? null;
  result.pose = estimatePoseFromLandmarks(result.landmarks, matrix);

  if (result.pose) {
    result.slotClassification = classifySlotFromPose(result.pose);
    const match = checkSlotMatch(
      expectedSlot,
      result.slotClassification.slot,
      result.slotClassification.confidence
    );
    result.slotValid = match.valid;
    if (!match.valid) {
      result.message = match.message;
    }
  } else {
    result.slotValid = true;
  }

  const box = computeFaceBox(result.landmarks, imageElement);
  if (box) {
    const w = imageElement.naturalWidth || imageElement.width;
    const h = imageElement.naturalHeight || imageElement.height;
    const faceRatio = (box.width * box.height) / (w * h);
    if (faceRatio < 0.03) {
      result.quality.issues.push({
        type: "face_size",
        message: "Face is too small in frame. Move closer to the camera.",
        severity: "error",
      });
      result.quality.valid = false;
      result.slotValid = false;
      result.message = "Face is too small in frame. Move closer to the camera.";
    }
  }

  return result;
}

function estimatePoseFromLandmarks(landmarks, matrix) {
  if (!landmarks || landmarks.length < 300) return null;

  const noseTip = landmarks[1];
  const chin = landmarks[152];
  const leftEyeOuter = landmarks[33];
  const rightEyeOuter = landmarks[263];
  const leftMouth = landmarks[61];
  const rightMouth = landmarks[291];
  const forehead = landmarks[10];

  if (!noseTip || !chin || !leftEyeOuter || !rightEyeOuter) return null;

  const eyeMidX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const eyeMidY = (leftEyeOuter.y + rightEyeOuter.y) / 2;
  const eyeWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x);

  if (eyeWidth < 0.001) return null;

  const noseToLeftEye = Math.abs(noseTip.x - leftEyeOuter.x);
  const noseToRightEye = Math.abs(noseTip.x - rightEyeOuter.x);

  const asymmetry = (noseToRightEye - noseToLeftEye) / eyeWidth;
  let yaw = Math.asin(Math.max(-1, Math.min(1, asymmetry * 1.2))) * (180 / Math.PI);

  const faceHeight = Math.sqrt(
    (chin.x - eyeMidX) ** 2 + (chin.y - eyeMidY) ** 2
  );

  let pitch = 0;
  if (faceHeight > 0.001) {
    const noseRelY = (noseTip.y - eyeMidY) / faceHeight;
    const expectedNoseRel = 0.35;
    pitch = (noseRelY - expectedNoseRel) * 120;
  }

  const eyeDy = rightEyeOuter.y - leftEyeOuter.y;
  const roll = Math.atan2(eyeDy, eyeWidth) * (180 / Math.PI);

  if (matrix) {
    try {
      const m = matrix.data || matrix;
      if (m.length >= 12) {
        const matYaw = Math.atan2(m[8], m[0]) * (180 / Math.PI);
        const matPitch = Math.asin(-m[4]) * (180 / Math.PI);
        if (isFinite(matYaw) && isFinite(matPitch)) {
          yaw = yaw * 0.5 + matYaw * 0.5;
          pitch = pitch * 0.5 + matPitch * 0.5;
        }
      }
    } catch {}
  }

  return { yaw, pitch, roll };
}

function classifySlotFromPose(pose) {
  if (!pose) return { slot: "unknown", confidence: 0 };

  const { yaw, pitch } = pose;
  const absYaw = Math.abs(yaw);

  if (Math.abs(pitch) > 15 && absYaw < 25) {
    return { slot: "chinUp", confidence: clamp(Math.abs(pitch) / 30) };
  }
  if (absYaw < 12) {
    return { slot: "front", confidence: clamp(1 - absYaw / 12) };
  }
  if (absYaw >= 12 && absYaw < 40) {
    const slot = yaw > 0 ? "rightThreeQuarter" : "leftThreeQuarter";
    const center = 26;
    const dist = Math.abs(absYaw - center);
    return { slot, confidence: clamp(1 - dist / 14) };
  }
  if (absYaw >= 40) {
    const slot = yaw > 0 ? "rightProfile" : "leftProfile";
    return { slot, confidence: clamp(absYaw / 70) };
  }
  return { slot: "unknown", confidence: 0 };
}

function checkSlotMatch(expectedSlot, detectedSlot, confidence) {
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

  const labels = {
    front: "front-facing",
    leftThreeQuarter: "left 3/4 angle",
    rightThreeQuarter: "right 3/4 angle",
    leftProfile: "left profile",
    rightProfile: "right profile",
    chinUp: "chin-up",
  };

  return {
    valid: false,
    message: `This looks like a ${labels[detectedSlot] || detectedSlot} photo — we need a ${labels[expectedSlot]} photo here.`,
  };
}

function computeFaceBox(landmarks, imageElement) {
  if (!landmarks || landmarks.length === 0) return null;
  const w = imageElement.naturalWidth || imageElement.width;
  const h = imageElement.naturalHeight || imageElement.height;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pt of landmarks) {
    const px = pt.x * w;
    const py = pt.y * h;
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function checkImageQuality(imageElement) {
  const issues = [];
  const w = imageElement.naturalWidth || imageElement.width;
  const h = imageElement.naturalHeight || imageElement.height;
  const minSide = Math.min(w, h);

  if (minSide < 480) {
    issues.push({
      type: "resolution",
      message: `Photo resolution too low (${w}×${h}). Use at least 480px on shortest side.`,
      severity: "error",
    });
  }

  const canvas = document.createElement("canvas");
  const sampleSize = Math.min(256, w, h);
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement, 0, 0, sampleSize, sampleSize);
  const pixels = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

  const exposure = checkExposure(pixels, sampleSize);
  if (exposure) issues.push(exposure);

  const blur = checkBlur(pixels, sampleSize);
  if (blur) issues.push(blur);

  const hasError = issues.some((i) => i.severity === "error");
  return {
    valid: !hasError,
    issues,
    score: hasError ? 0 : Math.max(0, 1 - issues.length * 0.15),
  };
}

function checkExposure(pixels, size) {
  const histogram = new Array(256).fill(0);
  const total = size * size;
  for (let i = 0; i < pixels.length; i += 4) {
    const lum = Math.round(
      0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
    );
    histogram[lum]++;
  }
  const darkRatio = histogram.slice(0, 35).reduce((a, b) => a + b, 0) / total;
  const brightRatio = histogram.slice(220).reduce((a, b) => a + b, 0) / total;

  if (darkRatio > 0.55)
    return { type: "exposure", message: "Photo is too dark — use better lighting.", severity: "error" };
  if (brightRatio > 0.55)
    return { type: "exposure", message: "Photo is overexposed — reduce direct light.", severity: "error" };
  if (darkRatio > 0.35)
    return { type: "exposure", message: "Photo is a bit dark — better lighting would improve results.", severity: "warning" };
  return null;
}

function checkBlur(pixels, size) {
  const gray = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
  }
  let variance = 0;
  let count = 0;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const c = gray[y * size + x];
      const lap =
        gray[(y - 1) * size + x] + gray[(y + 1) * size + x] +
        gray[y * size + (x - 1)] + gray[y * size + (x + 1)] - 4 * c;
      variance += lap * lap;
      count++;
    }
  }
  variance /= count;

  if (variance < 50)
    return { type: "blur", message: "Photo appears blurry — use a sharper image.", severity: "error" };
  if (variance < 150)
    return { type: "blur", message: "Photo is slightly soft — a sharper image would improve results.", severity: "warning" };
  return null;
}

function clamp(v) {
  return Math.max(0, Math.min(1, v));
}
