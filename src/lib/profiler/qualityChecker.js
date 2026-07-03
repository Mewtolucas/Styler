export function checkQuality(imageElement, detection) {
  const issues = [];
  const w = imageElement.naturalWidth || imageElement.width;
  const h = imageElement.naturalHeight || imageElement.height;
  const minSide = Math.min(w, h);

  if (minSide < 480) {
    issues.push({
      type: "resolution",
      message: `Photo resolution too low (${w}×${h}). Use at least 480px on shortest side.`,
      severity: "error",
    });
  }

  const canvas = document.createElement("canvas");
  const sampleSize = Math.min(256, w, h);
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement, 0, 0, sampleSize, sampleSize);
  const pixels = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

  const exposure = checkExposure(pixels, sampleSize);
  if (exposure) issues.push(exposure);

  const blur = checkBlur(pixels, sampleSize);
  if (blur) issues.push(blur);

  if (detection) {
    const box = detection.box || detection._box;
    if (box) {
      const faceArea = box.width * box.height;
      const imgArea = w * h;
      const faceRatio = faceArea / imgArea;

      if (faceRatio < 0.03) {
        issues.push({
          type: "face_size",
          message: "Face is too small in frame. Move closer to the camera.",
          severity: "error",
        });
      }
      if (faceRatio > 0.85) {
        issues.push({
          type: "face_size",
          message: "Face is too close. Move back slightly.",
          severity: "warning",
        });
      }
    }
  }

  const hasError = issues.some((i) => i.severity === "error");
  return {
    valid: !hasError,
    issues,
    score: hasError ? 0 : Math.max(0, 1 - issues.length * 0.15),
  };
}

function checkExposure(pixels, size) {
  const histogram = new Array(256).fill(0);
  const total = size * size;

  for (let i = 0; i < pixels.length; i += 4) {
    const lum = Math.round(
      0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
    );
    histogram[lum]++;
  }

  const darkRatio = histogram.slice(0, 35).reduce((a, b) => a + b, 0) / total;
  const brightRatio = histogram.slice(220).reduce((a, b) => a + b, 0) / total;

  if (darkRatio > 0.55) {
    return {
      type: "exposure",
      message: "Photo is too dark — use better lighting.",
      severity: "error",
    };
  }
  if (brightRatio > 0.55) {
    return {
      type: "exposure",
      message: "Photo is overexposed — reduce direct light.",
      severity: "error",
    };
  }
  if (darkRatio > 0.35) {
    return {
      type: "exposure",
      message: "Photo is a bit dark — better lighting would improve results.",
      severity: "warning",
    };
  }
  return null;
}

function checkBlur(pixels, size) {
  const gray = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
  }

  let laplacianVariance = 0;
  let count = 0;

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const center = gray[y * size + x];
      const lap =
        gray[(y - 1) * size + x] +
        gray[(y + 1) * size + x] +
        gray[y * size + (x - 1)] +
        gray[y * size + (x + 1)] -
        4 * center;
      laplacianVariance += lap * lap;
      count++;
    }
  }

  laplacianVariance /= count;

  if (laplacianVariance < 50) {
    return {
      type: "blur",
      message: "Photo appears blurry — use a sharper image.",
      severity: "error",
    };
  }
  if (laplacianVariance < 150) {
    return {
      type: "blur",
      message: "Photo is slightly soft — a sharper image would improve results.",
      severity: "warning",
    };
  }
  return null;
}
