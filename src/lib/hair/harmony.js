import { getStylesForGender } from "./database.js";

// Score how well a hairstyle harmonizes with the user's facial proportions.
// Higher score = better fit. Returns sorted array of { style, score, reasons }.
//
// Weights reflect visual impact (same research basis as hairstyle proportion notes):
//   face ratio, face length > facial thirds > jaw/forehead width > cheekbones > chin > eyes

const WEIGHTS = {
  faceShape: 1.0,
  faceRatio: 0.9,
  faceLength: 0.85,
  foreheadThird: 0.8,
  midfaceThird: 0.7,
  lowerFaceThird: 0.7,
  jawWidth: 0.65,
  foreheadWidth: 0.6,
  cheekbones: 0.5,
  chinProjection: 0.5,
  hairType: 0.4,
};

export function scoreHairstyle(style, classification) {
  const { faceShape, faceRatio, facialThirds, chinProjection, hairType, proportions } = classification;
  let score = 0;
  let maxScore = 0;
  const reasons = [];

  // Face shape affinity
  const shapeScore = style.faceShapeAffinity[faceShape] || 0.5;
  score += shapeScore * WEIGHTS.faceShape;
  maxScore += WEIGHTS.faceShape;
  if (shapeScore >= 0.8) reasons.push({ type: "positive", text: `Suits your ${faceShape} face shape` });
  else if (shapeScore <= 0.4) reasons.push({ type: "negative", text: `Not ideal for ${faceShape} face shapes` });

  // Face ratio
  if (faceRatio === "narrow") {
    const benefit = style.harmony.narrowFace || 0;
    score += (benefit + 1) / 2 * WEIGHTS.faceRatio;
    maxScore += WEIGHTS.faceRatio;
    if (benefit > 0.3) reasons.push({ type: "positive", text: "Adds width to balance your narrow face" });
    else if (benefit < -0.3) reasons.push({ type: "negative", text: "May make your face look even narrower" });
  } else if (faceRatio === "wide") {
    const benefit = style.harmony.wideFace || 0;
    score += (benefit + 1) / 2 * WEIGHTS.faceRatio;
    maxScore += WEIGHTS.faceRatio;
    if (benefit > 0.3) reasons.push({ type: "positive", text: "Elongates your wide face" });
    else if (benefit < -0.3) reasons.push({ type: "negative", text: "May make your face look wider" });
  } else {
    score += 0.5 * WEIGHTS.faceRatio;
    maxScore += WEIGHTS.faceRatio;
  }

  // Face length
  if (proportions?.faceShape) {
    const lr = proportions.faceShape.lengthCheekRatio;
    if (lr > 1.5) {
      const benefit = style.harmony.narrowFace || 0;
      score += (benefit + 1) / 2 * WEIGHTS.faceLength;
      maxScore += WEIGHTS.faceLength;
    } else if (lr < 1.2) {
      const benefit = style.harmony.wideFace || 0;
      score += (benefit + 1) / 2 * WEIGHTS.faceLength;
      maxScore += WEIGHTS.faceLength;
    } else {
      score += 0.5 * WEIGHTS.faceLength;
      maxScore += WEIGHTS.faceLength;
    }
  }

  // Facial thirds
  if (facialThirds && facialThirds !== "balanced") {
    if (facialThirds.includes("long forehead")) {
      const benefit = style.harmony.longForehead || 0;
      score += (benefit + 1) / 2 * WEIGHTS.foreheadThird;
      maxScore += WEIGHTS.foreheadThird;
      if (benefit > 0.3) reasons.push({ type: "positive", text: "Covers/shortens your longer forehead" });
      else if (benefit < -0.3) reasons.push({ type: "negative", text: "Exposes your forehead fully" });
    }
    if (facialThirds.includes("short forehead")) {
      const benefit = style.harmony.shortForehead || 0;
      score += (benefit + 1) / 2 * WEIGHTS.foreheadThird;
      maxScore += WEIGHTS.foreheadThird;
      if (benefit > 0.3) reasons.push({ type: "positive", text: "Opens up and extends your forehead" });
      else if (benefit < -0.3) reasons.push({ type: "negative", text: "Covers an already short forehead" });
    }
  } else {
    score += 0.5 * WEIGHTS.foreheadThird;
    maxScore += WEIGHTS.foreheadThird;
  }

  // Jaw width
  if (proportions?.faceShape) {
    const jcr = proportions.faceShape.jawCheekRatio;
    if (jcr > 0.88) {
      const benefit = style.harmony.strongJaw || 0;
      score += (benefit + 1) / 2 * WEIGHTS.jawWidth;
      maxScore += WEIGHTS.jawWidth;
      if (benefit > 0.2) reasons.push({ type: "positive", text: "Softens your strong jawline" });
    } else if (jcr < 0.72) {
      const benefit = style.harmony.weakChin || 0;
      score += (benefit + 1) / 2 * WEIGHTS.jawWidth;
      maxScore += WEIGHTS.jawWidth;
      if (benefit > 0.2) reasons.push({ type: "positive", text: "Adds volume around your jawline" });
    } else {
      score += 0.5 * WEIGHTS.jawWidth;
      maxScore += WEIGHTS.jawWidth;
    }
  }

  // Chin projection
  if (chinProjection === "short") {
    const benefit = style.harmony.weakChin || 0;
    score += (benefit + 1) / 2 * WEIGHTS.chinProjection;
    maxScore += WEIGHTS.chinProjection;
    if (benefit > 0.2) reasons.push({ type: "positive", text: "Adds fullness around the chin area" });
  } else if (chinProjection === "long") {
    const benefit = style.harmony.strongJaw || 0;
    score += (benefit + 1) / 2 * WEIGHTS.chinProjection;
    maxScore += WEIGHTS.chinProjection;
  } else {
    score += 0.5 * WEIGHTS.chinProjection;
    maxScore += WEIGHTS.chinProjection;
  }

  // Hair type compatibility
  const ht = hairType === "unknown" ? "straight" : hairType;
  const htMatch = style.hairTypes.includes(ht) ? 1.0 : 0.1;
  score += htMatch * WEIGHTS.hairType;
  maxScore += WEIGHTS.hairType;
  if (!style.hairTypes.includes(ht)) {
    reasons.push({ type: "negative", text: `Not designed for ${ht} hair` });
  }

  const normalizedScore = maxScore > 0 ? score / maxScore : 0.5;

  return { style, score: normalizedScore, reasons };
}

export function rankStyles(classification, gender) {
  const styles = getStylesForGender(gender === "men" ? "men" : "women");
  const scored = styles.map((s) => scoreHairstyle(s, classification));
  scored.sort((a, b) => b.score - a.score);
  return scored;
}


export function getTopRecommendations(classification, gender, count = 5) {
  const ranked = rankStyles(classification, gender);
  return ranked.slice(0, count);
}

export function getWorstStyles(classification, gender, count = 3) {
  const ranked = rankStyles(classification, gender);
  return ranked.slice(-count).reverse();
}
