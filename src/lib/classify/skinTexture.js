export function classifySkinTexture(imageData, landmarks, imgWidth, imgHeight) {
  const cheek = landmarks[205];
  const forehead = landmarks[9];

  const textureScore = measureLocalVariance(
    imageData, cheek.x * imgWidth, cheek.y * imgHeight, imgWidth, imgHeight
  );

  const redness = measureRedness(
    imageData, landmarks, imgWidth, imgHeight
  );

  const dryOily = estimateDryOily(imageData, forehead, imgWidth, imgHeight);

  const signals = [];

  if (textureScore > 800) {
    signals.push("textured");
  } else if (textureScore < 200) {
    signals.push("balanced");
  }

  if (redness > 0.12) {
    signals.push("redness");
  }

  if (dryOily.label) signals.push(dryOily.label);

  if (signals.length === 0) signals.push("balanced");

  return {
    signals,
    proportions: {
      textureScore,
      redness,
      dryOilyBrightRatio: dryOily.brightRatio,
    },
  };
}

function measureLocalVariance(imageData, cx, cy, imgWidth, imgHeight) {
  const { data, width } = imageData;
  const radius = Math.max(10, Math.floor(imgWidth * 0.03));
  let sum = 0, sumSq = 0, count = 0;

  const xStart = Math.max(0, Math.floor(cx - radius));
  const xEnd = Math.min(width - 1, Math.ceil(cx + radius));
  const yStart = Math.max(0, Math.floor(cy - radius));
  const yEnd = Math.min(imgHeight - 1, Math.ceil(cy + radius));

  for (let py = yStart; py <= yEnd; py++) {
    for (let px = xStart; px <= xEnd; px++) {
      const i = (py * width + px) * 4;
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += gray;
      sumSq += gray * gray;
      count++;
    }
  }

  if (count < 2) return 0;
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

function measureRedness(imageData, landmarks, imgWidth, imgHeight) {
  const { data, width } = imageData;
  const cheeks = [landmarks[205], landmarks[425]];
  const forehead = landmarks[9];

  const sampleAt = (pt) => {
    const px = Math.floor(pt.x * imgWidth);
    const py = Math.floor(pt.y * imgHeight);
    const radius = Math.max(5, Math.floor(imgWidth * 0.015));
    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = px + dx, y = py + dy;
        if (x < 0 || x >= width || y < 0 || y >= imgHeight) continue;
        const i = (y * width + x) * 4;
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
        count++;
      }
    }
    if (count === 0) return { r: 0, g: 0, b: 0 };
    return { r: rSum / count, g: gSum / count, b: bSum / count };
  };

  const fhSample = sampleAt(forehead);
  const fhRatio = fhSample.r / ((fhSample.g + fhSample.b) / 2 || 1);

  const cheekRatios = cheeks.map((c) => {
    const s = sampleAt(c);
    return s.r / ((s.g + s.b) / 2 || 1);
  });

  const avgCheekRatio = cheekRatios.reduce((a, b) => a + b, 0) / cheekRatios.length;
  return avgCheekRatio - fhRatio;
}

function estimateDryOily(imageData, forehead, imgWidth, imgHeight) {
  const { data, width } = imageData;
  const px = Math.floor(forehead.x * imgWidth);
  const py = Math.floor(forehead.y * imgHeight);
  const radius = Math.max(8, Math.floor(imgWidth * 0.025));

  let brightCount = 0, totalCount = 0;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = px + dx, y = py + dy;
      if (x < 0 || x >= width || y < 0 || y >= imgHeight) continue;
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum > 200) brightCount++;
      totalCount++;
    }
  }

  const brightRatio = totalCount > 0 ? brightCount / totalCount : 0;
  let label = null;
  if (brightRatio > 0.35) label = "oiliness";
  else if (brightRatio < 0.05) label = "dryness";
  return { label, brightRatio };
}
