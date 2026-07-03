import { loadModels, detectFace } from "./faceDetector.js";
import { estimatePose, classifySlot, validateSlotMatch } from "./poseEstimator.js";
import { checkQuality } from "./qualityChecker.js";
import { verifySamePerson, euclideanDistance } from "./faceVerifier.js";
import { estimateHeritage } from "./heritageEstimator.js";

export async function initProfiler() {
  await loadModels();
}

export async function profilePhoto(imageElement, expectedSlot) {
  const result = {
    detected: false,
    quality: null,
    pose: null,
    slotClassification: null,
    slotValid: false,
    descriptor: null,
    heritage: null,
    message: null,
  };

  const detection = await detectFace(imageElement);

  if (!detection) {
    if (
      expectedSlot === "leftProfile" ||
      expectedSlot === "rightProfile"
    ) {
      result.detected = false;
      result.slotValid = true;
      result.quality = { valid: true, issues: [], score: 0.7 };
      result.message =
        "Face not fully detected at this extreme angle — accepted as profile.";
      return result;
    }

    result.message =
      "No face detected. Make sure your face is clearly visible and well-lit.";
    return result;
  }

  result.detected = true;
  result.descriptor = Array.from(detection.descriptor);

  result.quality = checkQuality(imageElement, detection.detection);
  if (!result.quality.valid) {
    result.message = result.quality.issues
      .filter((i) => i.severity === "error")
      .map((i) => i.message)
      .join(" ");
    return result;
  }

  result.pose = estimatePose(detection.landmarks);
  if (result.pose) {
    const classified = classifySlot(result.pose);
    result.slotClassification = classified;

    const match = validateSlotMatch(
      expectedSlot,
      classified.slot,
      classified.confidence
    );
    result.slotValid = match.valid;
    if (!match.valid) {
      result.message = match.message;
    }
  } else {
    result.slotValid = true;
  }

  const skinAnalysis = analyzeSkinFromImage(imageElement, detection);
  result.heritage = estimateHeritage(
    detection.landmarks,
    imageElement,
    skinAnalysis
  );

  return result;
}

export function verifyAllSamePerson(descriptorMap) {
  return verifySamePerson(descriptorMap);
}

function analyzeSkinFromImage(imageElement, detection) {
  const box = detection.detection.box || detection.detection._box;
  if (!box) return {};

  const canvas = document.createElement("canvas");
  const w = imageElement.naturalWidth || imageElement.width;
  const h = imageElement.naturalHeight || imageElement.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement, 0, 0);

  const cheekX = Math.round(box.x + box.width * 0.25);
  const cheekY = Math.round(box.y + box.height * 0.55);
  const sampleSize = Math.round(Math.min(box.width, box.height) * 0.1);

  const sx = Math.max(0, cheekX - sampleSize);
  const sy = Math.max(0, cheekY - sampleSize);
  const sw = Math.min(sampleSize * 2, w - sx);
  const sh = Math.min(sampleSize * 2, h - sy);

  if (sw < 2 || sh < 2) return {};

  const pixels = ctx.getImageData(sx, sy, sw, sh).data;
  let rSum = 0, gSum = 0, bSum = 0;
  const count = sw * sh;

  for (let i = 0; i < pixels.length; i += 4) {
    rSum += pixels[i];
    gSum += pixels[i + 1];
    bSum += pixels[i + 2];
  }

  const r = rSum / count;
  const g = gSum / count;
  const b = bSum / count;

  const lab = rgbToLab(r, g, b);

  let undertone = "neutral";
  if (lab.b > 12) undertone = "warm";
  else if (lab.b < -2) undertone = "cool";
  else if (lab.a < -3 && lab.b > 2) undertone = "olive";

  const mstShades = [
    { L: 93, a: 4, b: 16 },
    { L: 85, a: 7, b: 20 },
    { L: 76, a: 10, b: 22 },
    { L: 68, a: 13, b: 23 },
    { L: 60, a: 15, b: 22 },
    { L: 52, a: 16, b: 20 },
    { L: 44, a: 14, b: 17 },
    { L: 37, a: 12, b: 13 },
    { L: 30, a: 10, b: 9 },
    { L: 23, a: 7, b: 5 },
  ];

  let minDist = Infinity;
  let mstDepth = 5;
  for (let i = 0; i < mstShades.length; i++) {
    const d = Math.sqrt(
      (lab.L - mstShades[i].L) ** 2 +
      (lab.a - mstShades[i].a) ** 2 +
      (lab.b - mstShades[i].b) ** 2
    );
    if (d < minDist) {
      minDist = d;
      mstDepth = i + 1;
    }
  }

  return { undertone, mstDepth };
}

function rgbToLab(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
  g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
  b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;

  let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750);
  let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;

  x = x > 0.008856 ? x ** (1/3) : 7.787 * x + 16/116;
  y = y > 0.008856 ? y ** (1/3) : 7.787 * y + 16/116;
  z = z > 0.008856 ? z ** (1/3) : 7.787 * z + 16/116;

  return { L: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

export { estimateHeritage, HERITAGE_LABELS } from "./heritageEstimator.js";
export { SLOT_LABELS } from "./poseEstimator.js";
