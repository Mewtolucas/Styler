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
  const faceShapeResult = classifyFaceShape(frontLandmarks);
  const symmetryResult = classifySymmetry(frontLandmarks);
  const chinResult = classifyChinProjection(
    frontLandmarks,
    leftProfileLandmarks,
    rightProfileLandmarks,
    chinUpLandmarks
  );
  const undertoneResult = classifyUndertone(frontImageData, frontLandmarks, frontWidth, frontHeight);
  const skinDepthResult = classifySkinDepth(frontImageData, frontLandmarks, frontWidth, frontHeight);
  const textureResult = classifySkinTexture(frontImageData, frontLandmarks, frontWidth, frontHeight);
  const hairResult = classifyHairType(frontImageData, frontLandmarks, frontWidth, frontHeight);
  const eyeResult = classifyEyeShape(frontLandmarks);

  return {
    faceShape: faceShapeResult.shape,
    symmetry: symmetryResult.label,
    chinProjection: chinResult.label,
    undertone: undertoneResult.label,
    skinDepth: skinDepthResult.shade,
    textureSignals: textureResult.signals,
    hairType: hairResult.label,
    eyeShape: eyeResult.label,
    proportions: {
      faceShape: faceShapeResult.proportions,
      symmetry: symmetryResult.proportions,
      chin: chinResult.proportions,
      undertone: undertoneResult.proportions,
      skinDepth: skinDepthResult.proportions,
      texture: textureResult.proportions,
      hair: hairResult.proportions,
      eyes: eyeResult.proportions,
    },
  };
}
