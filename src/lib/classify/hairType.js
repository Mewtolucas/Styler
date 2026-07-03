export function classifyHairType(imageData, landmarks, imgWidth, imgHeight) {
  const topOfHead = landmarks[10];
  const hairRegionY = Math.max(0, Math.floor(topOfHead.y * imgHeight - imgHeight * 0.08));
  const centerX = Math.floor(topOfHead.x * imgWidth);
  const regionSize = Math.floor(imgWidth * 0.1);

  if (hairRegionY < 5) return "unknown";

  const { data, width } = imageData;

  const xStart = Math.max(0, centerX - regionSize);
  const xEnd = Math.min(width - 1, centerX + regionSize);
  const yStart = Math.max(0, hairRegionY - regionSize);
  const yEnd = Math.max(0, hairRegionY);

  if (yEnd - yStart < 5 || xEnd - xStart < 5) return "unknown";

  let edgeSum = 0, count = 0;

  for (let y = yStart + 1; y < yEnd - 1; y++) {
    for (let x = xStart + 1; x < xEnd - 1; x++) {
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

      const idxUp = ((y - 1) * width + x) * 4;
      const idxDown = ((y + 1) * width + x) * 4;
      const idxLeft = (y * width + (x - 1)) * 4;
      const idxRight = (y * width + (x + 1)) * 4;

      const grayUp = 0.299 * data[idxUp] + 0.587 * data[idxUp + 1] + 0.114 * data[idxUp + 2];
      const grayDown = 0.299 * data[idxDown] + 0.587 * data[idxDown + 1] + 0.114 * data[idxDown + 2];
      const grayLeft = 0.299 * data[idxLeft] + 0.587 * data[idxLeft + 1] + 0.114 * data[idxLeft + 2];
      const grayRight = 0.299 * data[idxRight] + 0.587 * data[idxRight + 1] + 0.114 * data[idxRight + 2];

      const gx = grayRight - grayLeft;
      const gy = grayDown - grayUp;
      edgeSum += Math.sqrt(gx * gx + gy * gy);
      count++;
    }
  }

  if (count < 10) return "unknown";

  const avgEdge = edgeSum / count;

  if (avgEdge > 40) return "coily";
  if (avgEdge > 25) return "curly";
  if (avgEdge > 14) return "wavy";
  return "straight";
}
