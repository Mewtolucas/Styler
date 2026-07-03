const dist = (a, b) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z || 0) - (b.z || 0)) ** 2);

export function classifyFacialProportions(landmarks) {
  const forehead = landmarks[10];
  const browCenter = landmarks[9];
  const noseBottom = landmarks[2];
  const chin = landmarks[152];
  const noseTip = landmarks[1];
  const leftTemple = landmarks[234];
  const rightTemple = landmarks[454];

  const faceHeight = dist(forehead, chin);
  const faceWidth = dist(leftTemple, rightTemple);

  // Face width-to-height ratio (golden ratio ~1.618)
  const widthHeightRatio = faceWidth > 0.001 ? faceHeight / faceWidth : 1.5;

  // Facial thirds
  const foreheadHeight = dist(forehead, browCenter);
  const midfaceHeight = dist(browCenter, noseBottom);
  const lowerFaceHeight = dist(noseBottom, chin);
  const thirdAvg = faceHeight / 3;
  const foreheadDeviation = thirdAvg > 0.001 ? (foreheadHeight - thirdAvg) / thirdAvg : 0;
  const midfaceDeviation = thirdAvg > 0.001 ? (midfaceHeight - thirdAvg) / thirdAvg : 0;
  const lowerFaceDeviation = thirdAvg > 0.001 ? (lowerFaceHeight - thirdAvg) / thirdAvg : 0;

  let thirdsLabel = "balanced";
  const deviationThreshold = 0.15;
  if (Math.abs(foreheadDeviation) > deviationThreshold ||
      Math.abs(midfaceDeviation) > deviationThreshold ||
      Math.abs(lowerFaceDeviation) > deviationThreshold) {
    const parts = [];
    if (foreheadDeviation > deviationThreshold) parts.push("long forehead");
    if (foreheadDeviation < -deviationThreshold) parts.push("short forehead");
    if (midfaceDeviation > deviationThreshold) parts.push("long midface");
    if (midfaceDeviation < -deviationThreshold) parts.push("short midface");
    if (lowerFaceDeviation > deviationThreshold) parts.push("long lower face");
    if (lowerFaceDeviation < -deviationThreshold) parts.push("short lower face");
    thirdsLabel = parts.join(", ") || "balanced";
  }

  // Facial fifths (face divided into 5 equal vertical strips)
  const leftEyeOuter = landmarks[33];
  const leftEyeInner = landmarks[133];
  const rightEyeInner = landmarks[362];
  const rightEyeOuter = landmarks[263];
  const leftFaceEdge = landmarks[234];
  const rightFaceEdge = landmarks[454];

  const fifth1 = Math.abs(leftFaceEdge.x - leftEyeOuter.x);
  const fifth2 = Math.abs(leftEyeOuter.x - leftEyeInner.x);
  const fifth3 = Math.abs(leftEyeInner.x - rightEyeInner.x);
  const fifth4 = Math.abs(rightEyeInner.x - rightEyeOuter.x);
  const fifth5 = Math.abs(rightEyeOuter.x - rightFaceEdge.x);
  const fifthTotal = fifth1 + fifth2 + fifth3 + fifth4 + fifth5;
  const fifthIdeal = fifthTotal / 5;

  const eyeSpacing = fifth3;
  const leftEyeWidth = fifth2;
  const rightEyeWidth = fifth4;
  const eyeSpacingRatio = leftEyeWidth > 0.001 ? eyeSpacing / leftEyeWidth : 1;

  let eyeSpacingLabel = "balanced";
  if (eyeSpacingRatio > 1.2) eyeSpacingLabel = "wide-set";
  else if (eyeSpacingRatio < 0.8) eyeSpacingLabel = "close-set";

  return {
    widthHeightRatio: {
      value: widthHeightRatio,
      label: widthHeightRatio > 1.7 ? "narrow" : widthHeightRatio < 1.45 ? "wide" : "balanced",
    },
    facialThirds: {
      foreheadHeight,
      midfaceHeight,
      lowerFaceHeight,
      foreheadDeviation,
      midfaceDeviation,
      lowerFaceDeviation,
      label: thirdsLabel,
    },
    eyeSpacing: {
      value: eyeSpacing,
      leftEyeWidth,
      rightEyeWidth,
      ratio: eyeSpacingRatio,
      label: eyeSpacingLabel,
    },
    facialFifths: {
      fifth1, fifth2, fifth3, fifth4, fifth5,
      fifthIdeal,
    },
  };
}

export function classifyNoseProportions(landmarks) {
  const bridgeTop = landmarks[6];
  const noseTip = landmarks[1];
  const noseBottom = landmarks[2];
  const leftNostril = landmarks[98];
  const rightNostril = landmarks[327];
  const leftBridge = landmarks[48];
  const rightBridge = landmarks[278];

  const noseLength = dist(bridgeTop, noseTip);
  const nostrilWidth = dist(leftNostril, rightNostril);
  const bridgeWidth = dist(leftBridge, rightBridge);

  const forehead = landmarks[10];
  const chin = landmarks[152];
  const faceHeight = dist(forehead, chin);

  const noseFaceRatio = faceHeight > 0.001 ? noseLength / faceHeight : 0.33;
  const nostrilBridgeRatio = bridgeWidth > 0.001 ? nostrilWidth / bridgeWidth : 1.2;

  let lengthLabel = "balanced";
  if (noseFaceRatio > 0.38) lengthLabel = "long";
  else if (noseFaceRatio < 0.27) lengthLabel = "short";

  let widthLabel = "balanced";
  if (nostrilBridgeRatio > 1.5) widthLabel = "wide";
  else if (nostrilBridgeRatio < 1.0) widthLabel = "narrow";

  return {
    length: { value: noseLength, faceRatio: noseFaceRatio, label: lengthLabel },
    width: { nostrilWidth, bridgeWidth, ratio: nostrilBridgeRatio, label: widthLabel },
  };
}

export function classifyLipProportions(landmarks) {
  const upperLipTop = landmarks[0];
  const upperLipBottom = landmarks[13];
  const lowerLipBottom = landmarks[17];
  const lowerLipTop = landmarks[14];
  const mouthLeft = landmarks[61];
  const mouthRight = landmarks[291];
  const cupidLeft = landmarks[37];
  const cupidRight = landmarks[267];

  const upperThickness = dist(upperLipTop, upperLipBottom);
  const lowerThickness = dist(lowerLipTop, lowerLipBottom);
  const mouthWidth = dist(mouthLeft, mouthRight);

  const lipRatio = upperThickness > 0.001 ? lowerThickness / upperThickness : 1.3;
  const cupidBowDip = (cupidLeft.y + cupidRight.y) / 2 - upperLipTop.y;

  const leftTemple = landmarks[234];
  const rightTemple = landmarks[454];
  const faceWidth = dist(leftTemple, rightTemple);
  const mouthFaceRatio = faceWidth > 0.001 ? mouthWidth / faceWidth : 0.4;

  let fullnessLabel = "balanced";
  if (upperThickness + lowerThickness > 0.06) fullnessLabel = "full";
  else if (upperThickness + lowerThickness < 0.03) fullnessLabel = "thin";

  let balanceLabel = "balanced";
  if (lipRatio > 1.6) balanceLabel = "bottom-heavy";
  else if (lipRatio < 1.0) balanceLabel = "top-heavy";

  let widthLabel = "balanced";
  if (mouthFaceRatio > 0.48) widthLabel = "wide";
  else if (mouthFaceRatio < 0.35) widthLabel = "narrow";

  // Lip posture — mouth corner tilt relative to center
  const mouthCenter = { y: (upperLipTop.y + lowerLipBottom.y) / 2 };
  const leftCornerDrop = mouthLeft.y - mouthCenter.y;
  const rightCornerDrop = mouthRight.y - mouthCenter.y;
  const avgCornerDrop = (leftCornerDrop + rightCornerDrop) / 2;
  const mouthHeight = Math.abs(upperLipTop.y - lowerLipBottom.y);
  const cornerTiltRatio = mouthHeight > 0.001 ? avgCornerDrop / mouthHeight : 0;

  let postureLabel = "neutral";
  if (cornerTiltRatio < -0.15) postureLabel = "upturned";
  else if (cornerTiltRatio > 0.2) postureLabel = "downturned";

  return {
    upperThickness,
    lowerThickness,
    lipRatio,
    mouthWidth,
    mouthFaceRatio,
    cupidBowDip,
    cornerTiltRatio,
    fullness: fullnessLabel,
    balance: balanceLabel,
    width: widthLabel,
    posture: postureLabel,
  };
}

export function classifyBrowProportions(landmarks) {
  const rightBrowInner = landmarks[107];
  const rightBrowArch = landmarks[105];
  const rightBrowOuter = landmarks[70];
  const leftBrowInner = landmarks[336];
  const leftBrowArch = landmarks[334];
  const leftBrowOuter = landmarks[300];

  // Additional brow contour points for shape/thickness
  const rightBrowUpper = landmarks[66];
  const rightBrowLower = landmarks[52];
  const leftBrowUpper = landmarks[296];
  const leftBrowLower = landmarks[282];

  const rightEyeUpper = landmarks[159];
  const leftEyeUpper = landmarks[386];

  const rightLength = dist(rightBrowInner, rightBrowOuter);
  const leftLength = dist(leftBrowInner, leftBrowOuter);

  const rightArchHeight = rightBrowInner.y - rightBrowArch.y;
  const rightArchPosition = rightLength > 0.001
    ? dist(rightBrowInner, rightBrowArch) / rightLength : 0.5;

  const leftArchHeight = leftBrowInner.y - leftBrowArch.y;
  const leftArchPosition = leftLength > 0.001
    ? dist(leftBrowInner, leftBrowArch) / leftLength : 0.5;

  const rightBrowEyeGap = dist(rightBrowArch, rightEyeUpper);
  const leftBrowEyeGap = dist(leftBrowArch, leftEyeUpper);
  const avgBrowEyeGap = (rightBrowEyeGap + leftBrowEyeGap) / 2;

  const avgArchHeight = (rightArchHeight + leftArchHeight) / 2;
  const avgLength = (rightLength + leftLength) / 2;
  const avgArchPosition = (rightArchPosition + leftArchPosition) / 2;

  // Brow thickness — distance between upper and lower brow edges
  const rightThickness = dist(rightBrowUpper, rightBrowLower);
  const leftThickness = dist(leftBrowUpper, leftBrowLower);
  const avgThickness = (rightThickness + leftThickness) / 2;
  const thicknessToLength = avgLength > 0.001 ? avgThickness / avgLength : 0.1;

  let thicknessLabel = "medium";
  if (thicknessToLength > 0.18) thicknessLabel = "thick";
  else if (thicknessToLength < 0.08) thicknessLabel = "thin";

  // Brow shape — classify based on arch height and tail drop
  const rightTailDrop = rightBrowOuter.y - rightBrowInner.y;
  const leftTailDrop = leftBrowOuter.y - leftBrowInner.y;
  const avgTailDrop = (rightTailDrop + leftTailDrop) / 2;
  const tailDropNorm = avgLength > 0.001 ? avgTailDrop / avgLength : 0;

  let shapeLabel = "soft-angled";
  if (avgArchHeight < 0.005) {
    shapeLabel = "straight";
  } else if (avgArchPosition > 0.65) {
    // Arch peak is far from inner edge — S-shape or rounded
    shapeLabel = tailDropNorm > 0.15 ? "S-shaped" : "rounded";
  } else if (avgArchHeight > 0.012 && tailDropNorm > 0.1) {
    shapeLabel = "angled";
  } else if (avgArchHeight > 0.008 && tailDropNorm < 0.08) {
    shapeLabel = "rounded";
  }

  let archLabel = "balanced";
  if (avgArchHeight > 0.015) archLabel = "high-arched";
  else if (avgArchHeight < 0.005) archLabel = "flat";

  let positionLabel = "balanced";
  if (avgBrowEyeGap > 0.035) positionLabel = "high-set";
  else if (avgBrowEyeGap < 0.02) positionLabel = "low-set";

  return {
    rightLength,
    leftLength,
    avgLength,
    rightArchHeight,
    leftArchHeight,
    avgArchHeight,
    rightArchPosition,
    leftArchPosition,
    avgArchPosition,
    avgBrowEyeGap,
    rightThickness,
    leftThickness,
    avgThickness,
    thicknessToLength,
    avgTailDrop,
    tailDropNorm,
    arch: archLabel,
    position: positionLabel,
    thickness: thicknessLabel,
    shape: shapeLabel,
  };
}
