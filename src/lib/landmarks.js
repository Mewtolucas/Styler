import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let landmarker = null;

export async function initLandmarker() {
  if (landmarker) return landmarker;

  const base = import.meta.env.BASE_URL || "/";

  const vision = await FilesetResolver.forVisionTasks(
    base + "wasm"
  );

  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: base + "face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    numFaces: 1,
    minFaceDetectionConfidence: 0.2,
    minFacePresenceConfidence: 0.2,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
  });

  return landmarker;
}

const EXTREME_ANGLE_SLOTS = new Set([
  "leftProfile",
  "rightProfile",
  "chinUp",
]);

export async function detectLandmarks(imageElement, slot) {
  const lm = await initLandmarker();
  const result = lm.detect(imageElement);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    if (EXTREME_ANGLE_SLOTS.has(slot)) {
      return { landmarks: null, matrix: null, noDetection: true };
    }
    return null;
  }

  return {
    landmarks: result.faceLandmarks[0],
    matrix: result.facialTransformationMatrixes?.[0] ?? null,
    noDetection: false,
  };
}

export function getImageDimensions(imageElement) {
  return {
    width: imageElement.naturalWidth || imageElement.width,
    height: imageElement.naturalHeight || imageElement.height,
  };
}
