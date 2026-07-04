// Canvas-based hair silhouette renderer.
// Draws parametric hair shapes anchored to facial landmarks,
// adjustable in height and width, with dynamic coloring.

const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
  378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
  162, 21, 54, 103, 67, 109, 10,
];

function lm(landmarks, idx, w, h) {
  const p = landmarks[idx];
  return { x: p.x * w, y: p.y * h };
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function getAnchorPoints(landmarks, canvasWidth, canvasHeight) {
  const top = lm(landmarks, 10, canvasWidth, canvasHeight);
  const leftTemple = lm(landmarks, 234, canvasWidth, canvasHeight);
  const rightTemple = lm(landmarks, 454, canvasWidth, canvasHeight);
  const leftEar = lm(landmarks, 93, canvasWidth, canvasHeight);
  const rightEar = lm(landmarks, 323, canvasWidth, canvasHeight);
  const leftJaw = lm(landmarks, 172, canvasWidth, canvasHeight);
  const rightJaw = lm(landmarks, 397, canvasWidth, canvasHeight);
  const chin = lm(landmarks, 152, canvasWidth, canvasHeight);
  const leftHairline = lm(landmarks, 21, canvasWidth, canvasHeight);
  const rightHairline = lm(landmarks, 251, canvasWidth, canvasHeight);
  const browCenter = lm(landmarks, 9, canvasWidth, canvasHeight);
  const leftCheek = lm(landmarks, 127, canvasWidth, canvasHeight);
  const rightCheek = lm(landmarks, 356, canvasWidth, canvasHeight);
  const noseBottom = lm(landmarks, 2, canvasWidth, canvasHeight);

  const faceWidth = dist(leftTemple, rightTemple);
  const faceHeight = dist(top, chin);
  const center = midpoint(leftTemple, rightTemple);

  return {
    top, leftTemple, rightTemple, leftEar, rightEar,
    leftJaw, rightJaw, chin, leftHairline, rightHairline,
    browCenter, leftCheek, rightCheek, noseBottom,
    faceWidth, faceHeight, center,
  };
}

function buildHairPath(ctx, anchors, profile, heightMul, widthMul) {
  const { top, leftTemple, rightTemple, leftEar, rightEar,
    leftJaw, rightJaw, chin, faceWidth, faceHeight, center } = anchors;

  const crownH = faceHeight * profile.crownHeight * heightMul;
  const sideV = faceWidth * profile.sideVolume * widthMul;
  const backLen = faceHeight * profile.backLength * heightMul;

  const crownTop = { x: center.x, y: top.y - crownH };

  const leftCrown = { x: leftTemple.x - sideV, y: top.y - crownH * 0.6 };
  const rightCrown = { x: rightTemple.x + sideV, y: top.y - crownH * 0.6 };

  const leftSide = { x: leftEar.x - sideV, y: leftEar.y };
  const rightSide = { x: rightEar.x + sideV, y: rightEar.y };

  let leftBottom, rightBottom;
  const ll = profile.lengthLevel;

  if (ll === "above-ear") {
    leftBottom = { x: leftTemple.x - sideV * 0.5, y: leftEar.y - faceHeight * 0.05 };
    rightBottom = { x: rightTemple.x + sideV * 0.5, y: rightEar.y - faceHeight * 0.05 };
  } else if (ll === "ear") {
    leftBottom = { x: leftEar.x - sideV * 0.5, y: leftEar.y + faceHeight * 0.05 };
    rightBottom = { x: rightEar.x + sideV * 0.5, y: rightEar.y + faceHeight * 0.05 };
  } else if (ll === "below-ear") {
    leftBottom = { x: leftJaw.x - sideV * 0.3, y: leftJaw.y - faceHeight * 0.05 };
    rightBottom = { x: rightJaw.x + sideV * 0.3, y: rightJaw.y - faceHeight * 0.05 };
  } else if (ll === "chin") {
    leftBottom = { x: leftJaw.x - sideV * 0.2, y: chin.y };
    rightBottom = { x: rightJaw.x + sideV * 0.2, y: chin.y };
  } else if (ll === "shoulder") {
    leftBottom = { x: leftJaw.x - sideV * 0.1, y: chin.y + faceHeight * 0.25 };
    rightBottom = { x: rightJaw.x + sideV * 0.1, y: chin.y + faceHeight * 0.25 };
  } else if (ll === "chest") {
    leftBottom = { x: leftJaw.x, y: chin.y + faceHeight * 0.5 };
    rightBottom = { x: rightJaw.x, y: chin.y + faceHeight * 0.5 };
  } else if (ll === "pulled-up" || ll === "shaved-sides") {
    leftBottom = { x: leftTemple.x, y: leftEar.y };
    rightBottom = { x: rightTemple.x, y: rightEar.y };
  } else {
    leftBottom = { x: leftEar.x - sideV * 0.5, y: leftEar.y };
    rightBottom = { x: rightEar.x + sideV * 0.5, y: rightEar.y };
  }

  // Back of head extension
  const backBottom = { x: center.x, y: Math.max(leftBottom.y, rightBottom.y) + backLen };

  ctx.beginPath();

  // Start from left bottom, go up left side
  ctx.moveTo(leftBottom.x, leftBottom.y);

  // Left side up to left crown
  ctx.bezierCurveTo(
    leftSide.x - sideV * 0.3, leftSide.y,
    leftCrown.x - sideV * 0.2, leftCrown.y + crownH * 0.3,
    leftCrown.x, leftCrown.y
  );

  // Crown arc
  ctx.bezierCurveTo(
    leftCrown.x + (crownTop.x - leftCrown.x) * 0.4, crownTop.y - crownH * 0.1,
    crownTop.x - (crownTop.x - leftCrown.x) * 0.1, crownTop.y,
    crownTop.x, crownTop.y
  );

  ctx.bezierCurveTo(
    crownTop.x + (rightCrown.x - crownTop.x) * 0.1, crownTop.y,
    rightCrown.x - (rightCrown.x - crownTop.x) * 0.4, crownTop.y - crownH * 0.1,
    rightCrown.x, rightCrown.y
  );

  // Right side down
  ctx.bezierCurveTo(
    rightCrown.x + sideV * 0.2, rightCrown.y + crownH * 0.3,
    rightSide.x + sideV * 0.3, rightSide.y,
    rightBottom.x, rightBottom.y
  );

  // Bottom — connect through back
  if (ll === "shoulder" || ll === "chest") {
    ctx.bezierCurveTo(
      rightBottom.x, rightBottom.y + backLen * 0.3,
      backBottom.x + faceWidth * 0.2, backBottom.y,
      backBottom.x, backBottom.y
    );
    ctx.bezierCurveTo(
      backBottom.x - faceWidth * 0.2, backBottom.y,
      leftBottom.x, leftBottom.y + backLen * 0.3,
      leftBottom.x, leftBottom.y
    );
  } else {
    ctx.lineTo(rightBottom.x, rightBottom.y);
    // Close via back
    ctx.bezierCurveTo(
      rightBottom.x + sideV * 0.1, rightBottom.y + backLen * 0.5,
      leftBottom.x - sideV * 0.1, leftBottom.y + backLen * 0.5,
      leftBottom.x, leftBottom.y
    );
  }

  ctx.closePath();
}

function buildBangsPath(ctx, anchors, profile, heightMul, widthMul) {
  const { top, leftTemple, rightTemple, leftHairline, rightHairline,
    browCenter, faceWidth, faceHeight, center } = anchors;

  const bangDrop = faceHeight * profile.bangDrop * heightMul;
  if (bangDrop < 2) return;

  const bt = profile.bangType;
  const sideV = faceWidth * profile.sideVolume * widthMul;

  if (bt === "blunt-fringe" || bt === "short-fringe") {
    const bangY = top.y + bangDrop;
    ctx.beginPath();
    ctx.moveTo(leftHairline.x - sideV * 0.2, top.y);
    ctx.lineTo(rightHairline.x + sideV * 0.2, top.y);
    ctx.lineTo(rightHairline.x + sideV * 0.1, bangY);
    ctx.lineTo(leftHairline.x - sideV * 0.1, bangY);
    ctx.closePath();
  } else if (bt === "curtain") {
    const bangY = top.y + bangDrop;
    const gapWidth = faceWidth * 0.05;
    ctx.beginPath();
    // Left curtain
    ctx.moveTo(leftHairline.x - sideV * 0.3, top.y);
    ctx.lineTo(center.x - gapWidth, top.y);
    ctx.bezierCurveTo(
      center.x - gapWidth, top.y + bangDrop * 0.3,
      leftHairline.x - sideV * 0.1, bangY,
      leftHairline.x - sideV * 0.4, bangY * 0.95 + top.y * 0.05
    );
    ctx.closePath();
    // Right curtain
    ctx.moveTo(center.x + gapWidth, top.y);
    ctx.lineTo(rightHairline.x + sideV * 0.3, top.y);
    ctx.lineTo(rightHairline.x + sideV * 0.4, bangY * 0.95 + top.y * 0.05);
    ctx.bezierCurveTo(
      rightHairline.x + sideV * 0.1, bangY,
      center.x + gapWidth, top.y + bangDrop * 0.3,
      center.x + gapWidth, top.y
    );
    ctx.closePath();
  } else if (bt === "side-swept" || bt === "side-swept-short") {
    const bangY = top.y + bangDrop;
    ctx.beginPath();
    ctx.moveTo(leftHairline.x - sideV * 0.2, top.y);
    ctx.lineTo(rightHairline.x + sideV * 0.2, top.y);
    ctx.bezierCurveTo(
      rightHairline.x + sideV * 0.15, top.y + bangDrop * 0.3,
      center.x + faceWidth * 0.1, bangY,
      leftHairline.x - sideV * 0.1, bangY * 0.7 + top.y * 0.3
    );
    ctx.closePath();
  } else if (bt === "textured-fringe") {
    const bangY = top.y + bangDrop;
    ctx.beginPath();
    ctx.moveTo(leftHairline.x - sideV * 0.2, top.y);
    ctx.lineTo(rightHairline.x + sideV * 0.2, top.y);
    // Jagged bottom edge
    const steps = 7;
    const stepW = (rightHairline.x - leftHairline.x + sideV * 0.4) / steps;
    for (let i = steps; i >= 0; i--) {
      const px = rightHairline.x + sideV * 0.2 - (steps - i) * stepW;
      const jag = i % 2 === 0 ? bangDrop * 0.15 : 0;
      ctx.lineTo(px, bangY - jag);
    }
    ctx.closePath();
  } else if (bt === "face-framing") {
    const bangY = top.y + bangDrop;
    ctx.beginPath();
    // Left frame piece
    ctx.moveTo(leftHairline.x - sideV * 0.2, top.y);
    ctx.lineTo(leftHairline.x - sideV * 0.05, top.y);
    ctx.bezierCurveTo(
      leftHairline.x, top.y + bangDrop * 0.5,
      leftHairline.x - sideV * 0.3, bangY,
      leftHairline.x - sideV * 0.4, bangY + faceHeight * 0.1
    );
    ctx.lineTo(leftHairline.x - sideV * 0.5, top.y + faceHeight * 0.1);
    ctx.closePath();
    // Right frame piece
    ctx.moveTo(rightHairline.x + sideV * 0.05, top.y);
    ctx.lineTo(rightHairline.x + sideV * 0.2, top.y);
    ctx.lineTo(rightHairline.x + sideV * 0.5, top.y + faceHeight * 0.1);
    ctx.lineTo(rightHairline.x + sideV * 0.4, bangY + faceHeight * 0.1);
    ctx.bezierCurveTo(
      rightHairline.x + sideV * 0.3, bangY,
      rightHairline.x, top.y + bangDrop * 0.5,
      rightHairline.x + sideV * 0.05, top.y
    );
    ctx.closePath();
  }
}

function addTextureLines(ctx, anchors, profile, heightMul, widthMul) {
  const { top, leftTemple, rightTemple, faceWidth, faceHeight, center } = anchors;
  const td = profile.textureDetail;
  if (td === "minimal" || td === "smooth") return;

  const sideV = faceWidth * profile.sideVolume * widthMul;
  const crownH = faceHeight * profile.crownHeight * heightMul;
  const lineCount = td === "heavy" ? 12 : td === "wavy" || td === "curly" ? 10 : 6;

  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;

  for (let i = 0; i < lineCount; i++) {
    const t = (i + 1) / (lineCount + 1);
    const startX = leftTemple.x - sideV + (rightTemple.x + sideV - (leftTemple.x - sideV)) * t;
    const startY = top.y - crownH * 0.5;
    const endY = top.y + faceHeight * 0.3;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    if (td === "wavy" || td === "curly") {
      const amp = td === "curly" ? faceWidth * 0.02 : faceWidth * 0.01;
      const steps = td === "curly" ? 8 : 5;
      for (let j = 1; j <= steps; j++) {
        const py = startY + (endY - startY) * (j / steps);
        const px = startX + Math.sin(j * Math.PI) * amp * (j % 2 === 0 ? 1 : -1);
        ctx.lineTo(px, py);
      }
    } else {
      ctx.lineTo(startX + (center.x - startX) * 0.05, endY);
    }
    ctx.stroke();
  }
}

export function renderHairOverlay(ctx, landmarks, canvasWidth, canvasHeight, style, options = {}) {
  const {
    heightMultiplier = 1.0,
    widthMultiplier = 1.0,
    color = "#3d2b1f",
    opacity = 0.55,
  } = options;

  const anchors = getAnchorPoints(landmarks, canvasWidth, canvasHeight);
  const profile = style.profile;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Main hair body
  buildHairPath(ctx, anchors, profile, heightMultiplier, widthMultiplier);
  ctx.fillStyle = color;
  ctx.fill();

  // Bangs
  buildBangsPath(ctx, anchors, profile, heightMultiplier, widthMultiplier);
  ctx.fillStyle = color;
  ctx.fill();

  // Texture lines
  ctx.globalAlpha = opacity * 0.6;
  addTextureLines(ctx, anchors, profile, heightMultiplier, widthMultiplier);

  ctx.restore();
}

export function estimateHairColor(imageData, landmarks, width, height) {
  // Sample pixels in the hair region (above forehead, near temples)
  const top = landmarks[10];
  const leftHair = landmarks[21];
  const rightHair = landmarks[251];

  const samplePoints = [];
  // Above forehead
  for (let dy = -0.08; dy <= -0.02; dy += 0.02) {
    for (let dx = -0.06; dx <= 0.06; dx += 0.03) {
      samplePoints.push({ x: top.x + dx, y: top.y + dy });
    }
  }
  // Near temples
  samplePoints.push({ x: leftHair.x - 0.03, y: leftHair.y - 0.02 });
  samplePoints.push({ x: rightHair.x + 0.03, y: rightHair.y - 0.02 });

  let r = 0, g = 0, b = 0, count = 0;

  for (const pt of samplePoints) {
    const px = Math.round(pt.x * width);
    const py = Math.round(pt.y * height);
    if (px < 0 || px >= width || py < 0 || py >= height) continue;

    const idx = (py * width + px) * 4;
    r += imageData.data[idx];
    g += imageData.data[idx + 1];
    b += imageData.data[idx + 2];
    count++;
  }

  if (count === 0) return "#3d2b1f";

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
