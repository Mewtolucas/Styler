export function classifySymmetry(landmarks) {
  const midTop = landmarks[10];
  const midBottom = landmarks[152];
  const midX = (midTop.x + midBottom.x) / 2;

  const leftIndices = [234, 93, 132, 58, 172, 136, 150, 176];
  const rightIndices = [454, 323, 361, 288, 397, 365, 379, 400];

  let leftTotal = 0;
  let rightTotal = 0;

  for (let i = 0; i < leftIndices.length; i++) {
    const left = landmarks[leftIndices[i]];
    const right = landmarks[rightIndices[i]];
    leftTotal += Math.abs(left.x - midX);
    rightTotal += Math.abs(right.x - midX);
  }

  const diff = (leftTotal - rightTotal) / leftIndices.length;
  const faceWidth =
    Math.abs(landmarks[234].x - landmarks[454].x) || 0.01;
  const normalizedDiff = diff / faceWidth;

  if (Math.abs(normalizedDiff) < 0.02) return "balanced";
  return normalizedDiff > 0 ? "left-fuller" : "right-fuller";
}
