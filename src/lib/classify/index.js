import { classifyFaceShape } from "./faceShape.js";
import { classifySymmetry } from "./symmetry.js";
import { classifyChinProjection } from "./chinProjection.js";
import { classifyEyeShape } from "./eyeShape.js";
import { classifyUndertone, classifySkinDepth } from "./skinTone.js";
import { classifySkinTexture } from "./skinTexture.js";
import { classifyHairType } from "./hairType.js";

export function analyzeFace(
  frontLandmarks,
  frontImageData,
  frontWidth,
  frontHeight,
  leftProfileLandmarks,
  rightProfileLandmarks,
  leftThreeQuarterLandmarks,
  rightThreeQuarterLandmarks,
  chinUpLandmarks
) {
  const faceShape = classifyFaceShape(frontLandmarks);
  const symmetry = classifySymmetry(frontLandmarks);
  const chinProjection = classifyChinProjection(
    frontLandmarks,
    leftProfileLandmarks,
    rightProfileLandmarks,
    chinUpLandmarks
  );
  const undertone = classifyUndertone(frontImageData, frontLandmarks, frontWidth, frontHeight);
  const skinDepth = classifySkinDepth(frontImageData, frontLandmarks, frontWidth, frontHeight);
  const textureSignals = classifySkinTexture(frontImageData, frontLandmarks, frontWidth, frontHeight);
  const hairType = classifyHairType(frontImageData, frontLandmarks, frontWidth, frontHeight);

  const result = {
    faceShape,
    symmetry,
    chinProjection,
    undertone,
    skinDepth,
    textureSignals,
    hairType,
  };

  result.eyeShape = classifyEyeShape(frontLandmarks);

  return result;
}
