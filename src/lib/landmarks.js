import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let landmarker = null;

export async function initLandmarker() {
  if (landmarker) return landmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
  });

  return landmarker;
}

export async function detectLandmarks(imageElement) {
  const lm = await initLandmarker();
  const result = lm.detect(imageElement);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    return null;
  }

  return {
    landmarks: result.faceLandmarks[0],
    matrix: result.facialTransformationMatrixes?.[0] ?? null,
  };
}

export function getImageDimensions(imageElement) {
  return {
    width: imageElement.naturalWidth || imageElement.width,
    height: imageElement.naturalHeight || imageElement.height,
  };
}
