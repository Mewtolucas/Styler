const HERITAGE_GROUPS = [
  "east_asian",
  "south_asian",
  "southeast_asian",
  "african",
  "european",
  "latino",
  "middle_eastern",
];

const HERITAGE_LABELS = {
  east_asian: "East Asian",
  south_asian: "South Asian",
  southeast_asian: "Southeast Asian",
  african: "African / Black",
  european: "European / White",
  latino: "Latino / Hispanic",
  middle_eastern: "Middle Eastern",
};

export function estimateHeritage(landmarks68, imageElement, skinAnalysis) {
  const positions = landmarks68.positions || landmarks68._positions;
  if (!positions || positions.length < 68) return null;

  const geo = extractGeometry(positions);
  const skin = skinAnalysis || {};

  const scores = {};
  for (const group of HERITAGE_GROUPS) {
    scores[group] = computeGroupScore(group, geo, skin);
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const probabilities = {};
  for (const group of HERITAGE_GROUPS) {
    probabilities[group] = scores[group] / total;
  }

  const sorted = HERITAGE_GROUPS.slice().sort(
    (a, b) => probabilities[b] - probabilities[a]
  );

  return {
    primary: sorted[0],
    primaryLabel: HERITAGE_LABELS[sorted[0]],
    confidence: probabilities[sorted[0]],
    probabilities,
    labels: HERITAGE_LABELS,
  };
}

function extractGeometry(pts) {
  const leftEyeInner = pts[39];
  const rightEyeInner = pts[42];
  const leftEyeOuter = pts[36];
  const rightEyeOuter = pts[45];
  const leftEyeTop = pts[37];
  const leftEyeBottom = pts[41];
  const rightEyeTop = pts[43];
  const rightEyeBottom = pts[47];

  const noseTop = pts[27];
  const noseTip = pts[30];
  const noseLeft = pts[31];
  const noseRight = pts[35];

  const mouthLeft = pts[48];
  const mouthRight = pts[54];
  const upperLipTop = pts[51];
  const lowerLipBottom = pts[57];

  const jawLeft = pts[0];
  const jawRight = pts[16];
  const chin = pts[8];
  const foreheadApprox = pts[27];

  const browLeft = pts[17];
  const browRight = pts[26];
  const cheekLeft = pts[1];
  const cheekRight = pts[15];

  const eyeWidth =
    (dist(leftEyeOuter, leftEyeInner) + dist(rightEyeInner, rightEyeOuter)) / 2;
  const eyeHeight =
    (dist(leftEyeTop, leftEyeBottom) + dist(rightEyeTop, rightEyeBottom)) / 2;
  const eyeAspect = eyeHeight / (eyeWidth || 1);

  const interEyeDist = dist(leftEyeInner, rightEyeInner);
  const biocularDist = dist(leftEyeOuter, rightEyeOuter);

  const noseWidth = dist(noseLeft, noseRight);
  const noseLength = dist(noseTop, noseTip);
  const noseWidthRatio = noseWidth / (biocularDist || 1);

  const mouthWidth = dist(mouthLeft, mouthRight);
  const lipHeight = dist(upperLipTop, lowerLipBottom);
  const lipFullness = lipHeight / (mouthWidth || 1);

  const jawWidth = dist(jawLeft, jawRight);
  const faceLength = dist(foreheadApprox, chin);
  const faceRatio = faceLength / (jawWidth || 1);

  const cheekWidth = dist(cheekLeft, cheekRight);
  const cheekToJaw = cheekWidth / (jawWidth || 1);

  const interEyeRatio = interEyeDist / (biocularDist || 1);

  return {
    eyeAspect,
    interEyeRatio,
    noseWidthRatio,
    noseLength: noseLength / (faceLength || 1),
    lipFullness,
    faceRatio,
    cheekToJaw,
    jawWidth: jawWidth / (biocularDist || 1),
  };
}

function computeGroupScore(group, geo, skin) {
  const mstDepth = skin.mstDepth || 5;
  const undertone = skin.undertone || "neutral";

  let score = 1;

  switch (group) {
    case "east_asian":
      score *= gaussian(geo.eyeAspect, 0.25, 0.08);
      score *= gaussian(geo.interEyeRatio, 0.38, 0.06);
      score *= gaussian(geo.noseWidthRatio, 0.28, 0.06);
      score *= gaussian(geo.lipFullness, 0.28, 0.06);
      score *= gaussian(geo.faceRatio, 1.35, 0.12);
      score *= mstDepth <= 5 ? 1.2 : 0.6;
      if (undertone === "warm" || undertone === "olive") score *= 1.1;
      break;

    case "south_asian":
      score *= gaussian(geo.eyeAspect, 0.30, 0.08);
      score *= gaussian(geo.noseWidthRatio, 0.32, 0.07);
      score *= gaussian(geo.lipFullness, 0.34, 0.07);
      score *= gaussian(geo.faceRatio, 1.40, 0.12);
      score *= mstDepth >= 4 && mstDepth <= 8 ? 1.2 : 0.5;
      if (undertone === "warm") score *= 1.2;
      break;

    case "southeast_asian":
      score *= gaussian(geo.eyeAspect, 0.27, 0.08);
      score *= gaussian(geo.noseWidthRatio, 0.33, 0.07);
      score *= gaussian(geo.lipFullness, 0.32, 0.07);
      score *= gaussian(geo.faceRatio, 1.30, 0.12);
      score *= mstDepth >= 3 && mstDepth <= 7 ? 1.2 : 0.5;
      if (undertone === "warm" || undertone === "olive") score *= 1.1;
      break;

    case "african":
      score *= gaussian(geo.eyeAspect, 0.33, 0.08);
      score *= gaussian(geo.noseWidthRatio, 0.38, 0.08);
      score *= gaussian(geo.lipFullness, 0.42, 0.08);
      score *= gaussian(geo.faceRatio, 1.30, 0.12);
      score *= mstDepth >= 6 ? 1.3 : 0.4;
      if (undertone === "warm" || undertone === "neutral") score *= 1.1;
      break;

    case "european":
      score *= gaussian(geo.eyeAspect, 0.32, 0.08);
      score *= gaussian(geo.noseWidthRatio, 0.26, 0.06);
      score *= gaussian(geo.lipFullness, 0.30, 0.07);
      score *= gaussian(geo.faceRatio, 1.45, 0.12);
      score *= mstDepth <= 4 ? 1.3 : 0.5;
      if (undertone === "cool" || undertone === "neutral") score *= 1.1;
      break;

    case "latino":
      score *= gaussian(geo.eyeAspect, 0.31, 0.08);
      score *= gaussian(geo.noseWidthRatio, 0.30, 0.07);
      score *= gaussian(geo.lipFullness, 0.34, 0.07);
      score *= gaussian(geo.faceRatio, 1.38, 0.12);
      score *= mstDepth >= 3 && mstDepth <= 7 ? 1.2 : 0.5;
      if (undertone === "warm" || undertone === "olive") score *= 1.2;
      break;

    case "middle_eastern":
      score *= gaussian(geo.eyeAspect, 0.32, 0.08);
      score *= gaussian(geo.noseWidthRatio, 0.29, 0.06);
      score *= gaussian(geo.lipFullness, 0.32, 0.07);
      score *= gaussian(geo.faceRatio, 1.42, 0.12);
      score *= mstDepth >= 3 && mstDepth <= 6 ? 1.2 : 0.5;
      if (undertone === "warm" || undertone === "olive") score *= 1.2;
      break;
  }

  return Math.max(score, 0.001);
}

function gaussian(value, mean, sigma) {
  const diff = value - mean;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export { HERITAGE_GROUPS, HERITAGE_LABELS };
