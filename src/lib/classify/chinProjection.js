export function classifyChinProjection(
  frontLandmarks,
  leftProfileLandmarks,
  rightProfileLandmarks,
  chinUpLandmarks
) {
  const proportions = { profileRatios: [], chinUpRatio: null, frontRatio: null, source: null };
  const profileResults = [];

  for (const [name, profileLandmarks] of [["left", leftProfileLandmarks], ["right", rightProfileLandmarks]]) {
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
      proportions.profileRatios.push({ side: name, ratio, method: "z-depth" });
    } else {
      const lowerFace = Math.abs(noseTip.y - chin.y);
      const chinPortion = Math.abs(lipBottom.y - chin.y);
      const ratio = lowerFace > 0.001 ? chinPortion / lowerFace : 0.5;
      profileResults.push(ratio - 0.35);
      proportions.profileRatios.push({ side: name, ratio: ratio - 0.35, rawRatio: ratio, method: "y-proportion" });
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
        proportions.chinUpRatio = chinRatio;

        if (profileResults.length > 0) {
          const avgProfileRatio =
            profileResults.reduce((a, b) => a + b, 0) / profileResults.length;
          const combined = avgProfileRatio * 0.6 + (chinRatio - 0.35) * 0.4;
          proportions.combinedRatio = combined;
          proportions.source = "profile+chinUp";
          let label = "balanced";
          if (combined < -0.08) label = "short";
          else if (combined > 0.12) label = "long";
          return { label, proportions };
        }

        proportions.source = "chinUp-only";
        let label = "balanced";
        if (chinRatio < 0.25) label = "short";
        else if (chinRatio > 0.45) label = "long";
        return { label, proportions };
      }
    }
  }

  if (profileResults.length > 0) {
    const avgRatio =
      profileResults.reduce((a, b) => a + b, 0) / profileResults.length;
    proportions.avgProfileRatio = avgRatio;
    proportions.source = "profile";
    let label = "balanced";
    if (avgRatio < -0.1) label = "short";
    else if (avgRatio > 0.15) label = "long";
    return { label, proportions };
  }

  if (!frontLandmarks) return { label: "balanced", proportions: { source: "default" } };

  const chin = frontLandmarks[152];
  const lowerLip = frontLandmarks[17];
  const noseTip = frontLandmarks[1];

  if (!chin || !lowerLip || !noseTip) return { label: "balanced", proportions: { source: "default" } };

  const lowerFace = Math.abs(noseTip.y - chin.y);
  const chinPortion = Math.abs(lowerLip.y - chin.y);
  const ratio = lowerFace > 0.001 ? chinPortion / lowerFace : 0.5;
  proportions.frontRatio = ratio;
  proportions.source = "front";

  let label = "balanced";
  if (ratio < 0.28) label = "short";
  else if (ratio > 0.42) label = "long";
  return { label, proportions };
}
