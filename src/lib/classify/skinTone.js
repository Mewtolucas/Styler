const MST_REFERENCE_LAB = [
  { shade: 1, L: 94, a: 3, b: 15 },
  { shade: 2, L: 85, a: 8, b: 20 },
  { shade: 3, L: 75, a: 12, b: 22 },
  { shade: 4, L: 67, a: 14, b: 25 },
  { shade: 5, L: 58, a: 16, b: 27 },
  { shade: 6, L: 50, a: 17, b: 28 },
  { shade: 7, L: 42, a: 16, b: 25 },
  { shade: 8, L: 35, a: 14, b: 20 },
  { shade: 9, L: 28, a: 12, b: 15 },
  { shade: 10, L: 20, a: 8, b: 10 },
];

function rgbToLab(r, g, b) {
  let rr = r / 255, gg = g / 255, bb = b / 255;
  rr = rr > 0.04045 ? ((rr + 0.055) / 1.055) ** 2.4 : rr / 12.92;
  gg = gg > 0.04045 ? ((gg + 0.055) / 1.055) ** 2.4 : gg / 12.92;
  bb = bb > 0.04045 ? ((bb + 0.055) / 1.055) ** 2.4 : bb / 12.92;

  let x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  let y = rr * 0.2126 + gg * 0.7152 + bb * 0.0722;
  let z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;

  const f = (t) => (t > 0.008856 ? t ** (1 / 3) : 7.787 * t + 16 / 116);
  x = f(x);
  y = f(y);
  z = f(z);

  return { L: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

function sampleRegion(imageData, cx, cy, radius) {
  const { data, width, height } = imageData;
  let rSum = 0, gSum = 0, bSum = 0, count = 0;

  const xStart = Math.max(0, Math.floor(cx - radius));
  const xEnd = Math.min(width - 1, Math.ceil(cx + radius));
  const yStart = Math.max(0, Math.floor(cy - radius));
  const yEnd = Math.min(height - 1, Math.ceil(cy + radius));

  for (let py = yStart; py <= yEnd; py++) {
    for (let px = xStart; px <= xEnd; px++) {
      const i = (py * width + px) * 4;
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      count++;
    }
  }

  if (count === 0) return { r: 128, g: 128, b: 128 };
  return { r: rSum / count, g: gSum / count, b: bSum / count };
}

export function classifyUndertone(imageData, landmarks, imgWidth, imgHeight) {
  const forehead = landmarks[9];
  const cheekL = landmarks[205];
  const cheekR = landmarks[425];

  const samples = [forehead, cheekL, cheekR].map((pt) => {
    const px = pt.x * imgWidth;
    const py = pt.y * imgHeight;
    const radius = Math.max(5, imgWidth * 0.02);
    return sampleRegion(imageData, px, py, radius);
  });

  const avg = {
    r: samples.reduce((s, c) => s + c.r, 0) / samples.length,
    g: samples.reduce((s, c) => s + c.g, 0) / samples.length,
    b: samples.reduce((s, c) => s + c.b, 0) / samples.length,
  };

  const lab = rgbToLab(avg.r, avg.g, avg.b);

  const greenDominance = avg.g - (avg.r + avg.b) / 2;

  let label = "neutral";
  if (greenDominance > 5 && Math.abs(lab.b) < 18) {
    label = "olive";
  } else if (lab.b > 14) {
    label = "warm";
  } else if (lab.b < 4) {
    label = "cool";
  }

  return {
    label,
    proportions: {
      avgRgb: avg,
      lab,
      greenDominance,
    },
  };
}

export function classifySkinDepth(imageData, landmarks, imgWidth, imgHeight) {
  const forehead = landmarks[9];
  const cheekL = landmarks[205];
  const cheekR = landmarks[425];

  const samples = [forehead, cheekL, cheekR].map((pt) => {
    const px = pt.x * imgWidth;
    const py = pt.y * imgHeight;
    const radius = Math.max(5, imgWidth * 0.02);
    return sampleRegion(imageData, px, py, radius);
  });

  const avg = {
    r: samples.reduce((s, c) => s + c.r, 0) / samples.length,
    g: samples.reduce((s, c) => s + c.g, 0) / samples.length,
    b: samples.reduce((s, c) => s + c.b, 0) / samples.length,
  };

  const lab = rgbToLab(avg.r, avg.g, avg.b);

  let closest = 1;
  let minDist = Infinity;
  for (const ref of MST_REFERENCE_LAB) {
    const d = Math.sqrt(
      (lab.L - ref.L) ** 2 + (lab.a - ref.a) ** 2 + (lab.b - ref.b) ** 2
    );
    if (d < minDist) {
      minDist = d;
      closest = ref.shade;
    }
  }

  return {
    shade: closest,
    proportions: {
      avgRgb: avg,
      lab,
      closestDistance: minDist,
    },
  };
}
