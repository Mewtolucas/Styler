#!/bin/bash
set -e

echo "Setting up ML model files..."

# face-api.js models
mkdir -p public/models
cp node_modules/@vladmandic/face-api/model/ssd_mobilenetv1_model-weights_manifest.json public/models/
cp node_modules/@vladmandic/face-api/model/ssd_mobilenetv1_model.bin public/models/
cp node_modules/@vladmandic/face-api/model/face_landmark_68_model-weights_manifest.json public/models/
cp node_modules/@vladmandic/face-api/model/face_landmark_68_model.bin public/models/
cp node_modules/@vladmandic/face-api/model/face_recognition_model-weights_manifest.json public/models/
cp node_modules/@vladmandic/face-api/model/face_recognition_model.bin public/models/
cp node_modules/@vladmandic/face-api/model/age_gender_model-weights_manifest.json public/models/
cp node_modules/@vladmandic/face-api/model/age_gender_model.bin public/models/

# MediaPipe WASM files
mkdir -p public/wasm
cp node_modules/@mediapipe/tasks-vision/wasm/* public/wasm/

# MediaPipe face landmarker model
if [ ! -f public/face_landmarker.task ]; then
  echo "Downloading MediaPipe face landmarker model..."
  curl -sS -o public/face_landmarker.task \
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
fi

echo "Models ready."
