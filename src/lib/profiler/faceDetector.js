import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  const base = import.meta.env.BASE_URL || "/";
  const modelPath = base + "models";
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
    faceapi.nets.ageGenderNet.loadFromUri(modelPath),
  ]);
  modelsLoaded = true;
}

export async function detectFace(imageElement) {
  await loadModels();

  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.15,
    maxResults: 1,
  });

  const result = await faceapi
    .detectSingleFace(imageElement, options)
    .withFaceLandmarks()
    .withFaceDescriptor()
    .withAgeAndGender();

  if (!result) return null;

  return {
    detection: result.detection,
    landmarks: result.landmarks,
    descriptor: result.descriptor,
    age: result.age,
    gender: result.gender,
    genderProbability: result.genderProbability,
  };
}
