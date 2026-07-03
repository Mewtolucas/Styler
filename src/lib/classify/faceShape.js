export function classifyFaceShape(landmarks) {
  const dist = (a, b) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z || 0) - (b.z || 0)) ** 2);

  const jawWidth = dist(landmarks[172], landmarks[397]);
  const cheekboneWidth = dist(landmarks[234], landmarks[454]);
  const foreheadWidth = dist(landmarks[21], landmarks[251]);
  const faceLength = dist(landmarks[10], landmarks[152]);

  const jawCheek = jawWidth / cheekboneWidth;
  const foreheadCheek = foreheadWidth / cheekboneWidth;
  const lengthCheek = faceLength / cheekboneWidth;

  if (lengthCheek > 1.55 && Math.abs(jawCheek - foreheadCheek) < 0.15) {
    return "oblong";
  }

  if (foreheadCheek > 1.05 && jawCheek < 0.88) {
    return "heart";
  }

  if (jawCheek > 1.05 && foreheadCheek < 0.92) {
    return "triangle";
  }

  if (
    jawCheek < 0.9 &&
    foreheadCheek < 0.9 &&
    cheekboneWidth > jawWidth &&
    cheekboneWidth > foreheadWidth
  ) {
    return "diamond";
  }

  if (
    Math.abs(jawCheek - 1) < 0.1 &&
    Math.abs(foreheadCheek - 1) < 0.1 &&
    lengthCheek < 1.35
  ) {
    return "square";
  }

  if (lengthCheek < 1.3 && jawCheek < 1.0 && foreheadCheek < 1.0) {
    return "round";
  }

  return "oval";
}
