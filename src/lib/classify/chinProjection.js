export function classifyChinProjection(frontLandmarks, profileLandmarks) {
  if (profileLandmarks && profileLandmarks.length >= 468) {
    const noseTip = profileLandmarks[1];
    const chin = profileLandmarks[152];
    const lipBottom = profileLandmarks[17];

    const chinBeyondLips = chin.z - lipBottom.z;
    const noseToLip = Math.abs(noseTip.y - lipBottom.y);
    const ratio = noseToLip > 0.001 ? chinBeyondLips / noseToLip : 0;

    if (ratio < -0.1) return "short";
    if (ratio > 0.15) return "long";
    return "balanced";
  }

  const chin = frontLandmarks[152];
  const lowerLip = frontLandmarks[17];
  const noseTip = frontLandmarks[1];

  const lowerFace = Math.abs(noseTip.y - chin.y);
  const chinPortion = Math.abs(lowerLip.y - chin.y);
  const ratio = lowerFace > 0.001 ? chinPortion / lowerFace : 0.5;

  if (ratio < 0.28) return "short";
  if (ratio > 0.42) return "long";
  return "balanced";
}
