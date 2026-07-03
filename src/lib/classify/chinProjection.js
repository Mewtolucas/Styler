export function classifyChinProjection(
  frontLandmarks,
  leftProfileLandmarks,
  rightProfileLandmarks,
  chinUpLandmarks
) {
  const profileResults = [];

  for (const profileLandmarks of [leftProfileLandmarks, rightProfileLandmarks]) {
    if (!profileLandmarks) continue;

    const noseTip = profileLandmarks[1];
    const chin = profileLandmarks[152];
    const lipBottom = profileLandmarks[17];

    if (!noseTip || !chin || !lipBottom) continue;

    if (profileLandmarks.length >= 468 && noseTip.z !== undefined && noseTip.z !== 0) {
      const chinBeyondLips = chin.z - lipBottom.z;
      const noseToLip = Math.abs(noseTip.y - lipBottom.y);
      const ratio = noseToLip > 0.001 ? chinBeyondLips / noseToLip : 0;
      profileResults.push(ratio);
    } else {
      const lowerFace = Math.abs(noseTip.y - chin.y);
      const chinPortion = Math.abs(lipBottom.y - chin.y);
      const ratio = lowerFace > 0.001 ? chinPortion / lowerFace : 0.5;
      profileResults.push(ratio - 0.35);
    }
  }

  if (chinUpLandmarks) {
    const chin = chinUpLandmarks[152];
    const lowerLip = chinUpLandmarks[17];
    const noseTip = chinUpLandmarks[1];

    if (chin && lowerLip && noseTip) {
      const jawLeft = chinUpLandmarks[136];
      const jawRight = chinUpLandmarks[365];

      if (jawLeft && jawRight) {
        const jawWidth = Math.abs(jawLeft.x - jawRight.x);
        const chinToLip = Math.abs(chin.y - lowerLip.y);
        const chinRatio = jawWidth > 0.001 ? chinToLip / jawWidth : 0.5;

        if (profileResults.length > 0) {
          const avgProfileRatio =
            profileResults.reduce((a, b) => a + b, 0) / profileResults.length;
          const combined = avgProfileRatio * 0.6 + (chinRatio - 0.35) * 0.4;
          if (combined < -0.08) return "short";
          if (combined > 0.12) return "long";
          return "balanced";
        }

        if (chinRatio < 0.25) return "short";
        if (chinRatio > 0.45) return "long";
        return "balanced";
      }
    }
  }

  if (profileResults.length > 0) {
    const avgRatio =
      profileResults.reduce((a, b) => a + b, 0) / profileResults.length;
    if (avgRatio < -0.1) return "short";
    if (avgRatio > 0.15) return "long";
    return "balanced";
  }

  if (!frontLandmarks) return "balanced";

  const chin = frontLandmarks[152];
  const lowerLip = frontLandmarks[17];
  const noseTip = frontLandmarks[1];

  if (!chin || !lowerLip || !noseTip) return "balanced";

  const lowerFace = Math.abs(noseTip.y - chin.y);
  const chinPortion = Math.abs(lowerLip.y - chin.y);
  const ratio = lowerFace > 0.001 ? chinPortion / lowerFace : 0.5;

  if (ratio < 0.28) return "short";
  if (ratio > 0.42) return "long";
  return "balanced";
}
