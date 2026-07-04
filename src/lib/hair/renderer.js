// Strand-based hair renderer.
// Draws realistic hair using individual bezier curve strands
// with color gradients, depth layers, highlights, and texture variation.
// Strands are grouped into clumps for natural appearance and flow
// away from a part line, curving around the face.

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

function pointDist(a, b) {
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

  const faceWidth = pointDist(leftTemple, rightTemple);
  const faceHeight = pointDist(top, chin);
  const center = midpoint(leftTemple, rightTemple);

  return {
    top, leftTemple, rightTemple, leftEar, rightEar,
    leftJaw, rightJaw, chin, leftHairline, rightHairline,
    browCenter, leftCheek, rightCheek, noseBottom,
    faceWidth, faceHeight, center,
  };
}

// ===== Color utilities =====

function parseHexColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgba(c, a) {
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a})`;
}

function darken(c, f) {
  return { r: c.r * f, g: c.g * f, b: c.b * f };
}

function lighten(c, f) {
  return { r: c.r + (255 - c.r) * f, g: c.g + (255 - c.g) * f, b: c.b + (255 - c.b) * f };
}

// ===== Seeded RNG =====

function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ===== Hair geometry computation =====

function getEndY(profile, anchors, hMul) {
  const { leftEar, rightEar, leftJaw, rightJaw, chin, faceHeight } = anchors;
  const ll = profile.lengthLevel;
  const earY = (leftEar.y + rightEar.y) / 2;
  const jawY = (leftJaw.y + rightJaw.y) / 2;
  if (ll === "pulled-up" || ll === "shaved-sides" || ll === "above-ear")
    return earY - faceHeight * 0.03 * hMul;
  if (ll === "ear") return earY + faceHeight * 0.05 * hMul;
  if (ll === "below-ear") return jawY - faceHeight * 0.03 * hMul;
  if (ll === "chin") return chin.y + faceHeight * 0.02;
  if (ll === "shoulder") return chin.y + faceHeight * 0.3 * hMul;
  if (ll === "chest") return chin.y + faceHeight * 0.55 * hMul;
  return earY;
}

function computeBounds(anchors, profile, hMul, wMul) {
  const { top, leftTemple, rightTemple, faceWidth, faceHeight, center } = anchors;
  const crownH = faceHeight * profile.crownHeight * hMul;
  const sideV = faceWidth * profile.sideVolume * wMul;
  const endY = getEndY(profile, anchors, hMul);
  return {
    crownY: top.y - crownH, leftX: leftTemple.x - sideV,
    rightX: rightTemple.x + sideV, endY, crownH, sideV,
    centerX: center.x, topY: top.y,
  };
}

// ===== Face mask: clear the face area so strands don't cover it =====

function clearFaceRegion(ctx, landmarks, W, H) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();

  // Use the face oval landmarks to trace face boundary
  // Then inset slightly so hair overlaps the hairline naturally
  const pts = FACE_OVAL_INDICES.map(i => lm(landmarks, i, W, H));

  if (pts.length < 3) { ctx.restore(); return; }

  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;

  // Inset toward center so hair overlaps hairline naturally
  const inset = 0.88;
  const insetPts = pts.map(p => ({
    x: cx + (p.x - cx) * inset,
    y: cy + (p.y - cy) * inset,
  }));

  ctx.moveTo(insetPts[0].x, insetPts[0].y);
  for (let i = 1; i < insetPts.length; i++) {
    const prev = insetPts[i - 1];
    const curr = insetPts[i];
    const next = insetPts[Math.min(i + 1, insetPts.length - 1)];
    const mx = (curr.x + next.x) / 2;
    const my = (curr.y + next.y) / 2;
    ctx.quadraticCurveTo(curr.x, curr.y, mx, my);
  }
  ctx.closePath();

  // Feathered edge using radial gradient would be ideal but complex;
  // instead use a solid clear with slight feather via shadow
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.filter = "blur(4px)";
  ctx.fill();
  ctx.filter = "none";
  ctx.restore();
}

// ===== Strand generation =====

// A "clump" is a group of strands that flow together
function generateClump(rootX, rootY, endY, flowAngle, spread, count, texture, rng, fW) {
  const strands = [];
  for (let i = 0; i < count; i++) {
    const offX = (rng() - 0.5) * spread;
    const offY = (rng() - 0.5) * spread * 0.3;
    const sRootX = rootX + offX;
    const sRootY = rootY + offY;

    const length = endY - sRootY;
    if (length < 5) continue;

    const segments = Math.max(3, Math.min(8, Math.ceil(Math.abs(length) / (fW * 0.06))));
    const points = [{ x: sRootX, y: sRootY }];

    const baseFlowX = Math.sin(flowAngle) * 0.7;
    const baseFlowY = Math.cos(flowAngle) * 0.3;

    for (let j = 1; j <= segments; j++) {
      const t = j / segments;

      // Base flow: gentle outward curve
      let x = sRootX + baseFlowX * t * fW * 0.2;
      let y = sRootY + length * t;

      // Gravity: strands curve downward more at the ends
      x += baseFlowX * t * t * fW * 0.08;

      // Texture displacement
      const phase = rng() * Math.PI * 2;
      if (texture === "wavy") {
        x += Math.sin(t * Math.PI * 2.5 + phase) * fW * 0.015 * (0.4 + t);
      } else if (texture === "curly") {
        const curl = fW * 0.022 * (0.4 + t * 0.8);
        x += Math.sin(t * Math.PI * 5 + phase) * curl;
        y += Math.cos(t * Math.PI * 4 + phase) * curl * 0.4;
      } else if (texture === "coily") {
        const coil = fW * 0.018;
        x += Math.sin(t * Math.PI * 8 + phase) * coil;
        y += Math.cos(t * Math.PI * 7 + phase) * coil * 0.6;
      }

      // Per-strand randomness (within clump cohesion)
      x += (rng() - 0.5) * fW * 0.004;

      points.push({ x, y });
    }

    strands.push({
      points,
      width: fW * (0.003 + rng() * 0.005),
      colorShift: (rng() - 0.5) * 15,
      alpha: 0.5 + rng() * 0.35,
      isHighlight: rng() < 0.06,
    });
  }
  return strands;
}

function generateAllStrands(bounds, profile, anchors, hMul, wMul, rng, texture) {
  const { crownY, leftX, rightX, endY, centerX, topY, sideV, crownH } = bounds;
  const { faceWidth, faceHeight, leftTemple, rightTemple, leftEar, rightEar } = anchors;

  const allStrands = [];
  const hairWidth = rightX - leftX;
  const isShort = ["above-ear", "ear", "pulled-up", "shaved-sides"].includes(profile.lengthLevel);
  const isMed = ["below-ear", "chin"].includes(profile.lengthLevel);

  // Part line position
  const bt = profile.bangType;
  const partRatio = (bt === "side-swept" || bt === "side-swept-short") ? 0.3
    : bt === "curtain" ? 0.5 : 0.5;
  const partX = leftX + hairWidth * partRatio;

  // Clump parameters — high density for realistic look
  const clumpCount = isShort ? 40 : isMed ? 55 : 70;
  const strandsPerClump = texture === "coily" ? 14 : texture === "curly" ? 12 : 10;
  const clumpSpread = faceWidth * (texture === "coily" ? 0.02 : texture === "curly" ? 0.025 : 0.03);

  for (let c = 0; c < clumpCount; c++) {
    const t = (c + rng() * 0.5) / clumpCount;
    const rootX = leftX + hairWidth * t;
    const rootY = crownY + rng() * crownH * 0.5;

    // Flow direction: away from part
    const relPos = (rootX - partX) / hairWidth;
    const flowAngle = relPos * 0.8 + (rng() - 0.5) * 0.15;

    // End Y varies: edge strands shorter, center strands reach full length
    const edgeFactor = 1 - Math.pow(Math.abs(t - 0.5) * 2, 2) * 0.3;
    let clumpEndY = topY + (endY - topY) * edgeFactor + (rng() - 0.5) * faceHeight * 0.04;

    // For short styles, sides end higher
    if (isShort) {
      const sideAmount = Math.abs(t - 0.5) * 2;
      clumpEndY = topY + (endY - topY) * (0.6 + (1 - sideAmount) * 0.4);
    }

    const clump = generateClump(
      rootX, rootY, clumpEndY, flowAngle,
      clumpSpread, strandsPerClump, texture, rng, faceWidth
    );
    allStrands.push(...clump);
  }

  // Add flyaway strands at edges for natural look
  for (let i = 0; i < 20; i++) {
    const side = rng() < 0.5 ? 0 : 1;
    const rootX = side === 0
      ? leftX + rng() * hairWidth * 0.15
      : rightX - rng() * hairWidth * 0.15;
    const rootY = crownY + rng() * crownH;
    const flowAngle = side === 0 ? -0.5 - rng() * 0.3 : 0.5 + rng() * 0.3;
    const flyEndY = rootY + (endY - rootY) * (0.3 + rng() * 0.4);

    const strand = generateClump(rootX, rootY, flyEndY, flowAngle,
      clumpSpread * 0.3, 2, texture, rng, faceWidth);
    for (const s of strand) { s.alpha *= 0.5; s.width *= 0.7; }
    allStrands.push(...strand);
  }

  return allStrands;
}

function generateBangStrands(bounds, profile, anchors, hMul, wMul, rng, texture) {
  const { crownY, leftX, rightX, centerX, topY, sideV, crownH } = bounds;
  const { faceWidth, faceHeight, leftHairline, rightHairline } = anchors;
  const bangDrop = faceHeight * profile.bangDrop * hMul;
  if (bangDrop < 3) return [];

  const bt = profile.bangType;
  const strands = [];
  const hlWidth = rightHairline.x - leftHairline.x;
  const bangY = topY + bangDrop;

  const clumpSpread = faceWidth * (texture === "curly" ? 0.02 : 0.025);
  const spc = texture === "curly" ? 8 : 6;

  if (bt === "blunt-fringe" || bt === "short-fringe") {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const rx = leftHairline.x - sideV * 0.1 + (hlWidth + sideV * 0.2) * t;
      const ry = topY - crownH * 0.15 + rng() * crownH * 0.2;
      const ey = bangY + (rng() - 0.5) * faceHeight * 0.015;
      const clump = generateClump(rx, ry, ey, (rng() - 0.5) * 0.1, clumpSpread, spc, texture, rng, faceWidth);
      for (const s of clump) s.alpha = Math.min(s.alpha + 0.15, 0.85);
      strands.push(...clump);
    }
  } else if (bt === "curtain") {
    const gapW = faceWidth * 0.03;
    for (let i = 0; i < 10; i++) {
      const t = (i + 0.5) / 10;
      const rx = leftHairline.x - sideV * 0.15 + (hlWidth + sideV * 0.3) * t;
      if (Math.abs(rx - centerX) < gapW) continue;
      const ry = topY - crownH * 0.1 + rng() * crownH * 0.15;
      const distC = (rx - centerX) / hlWidth;
      const ey = bangY + Math.abs(distC) * faceHeight * 0.04;
      const flow = distC * 1.2;
      const clump = generateClump(rx, ry, ey, flow, clumpSpread, spc, texture, rng, faceWidth);
      for (const s of clump) s.alpha = Math.min(s.alpha + 0.12, 0.85);
      strands.push(...clump);
    }
  } else if (bt === "side-swept" || bt === "side-swept-short") {
    for (let i = 0; i < 10; i++) {
      const t = (i + 0.5) / 10;
      const rx = leftHairline.x + hlWidth * t;
      const ry = topY - crownH * 0.1 + rng() * crownH * 0.15;
      const ey = bangY * (0.6 + t * 0.4) + topY * (0.4 - t * 0.4);
      const clump = generateClump(rx, ry, ey, -0.5 - rng() * 0.3, clumpSpread, spc, texture, rng, faceWidth);
      for (const s of clump) s.alpha = Math.min(s.alpha + 0.12, 0.85);
      strands.push(...clump);
    }
  } else if (bt === "textured-fringe") {
    for (let i = 0; i < 11; i++) {
      const t = (i + 0.5) / 11;
      const rx = leftHairline.x - sideV * 0.05 + (hlWidth + sideV * 0.1) * t;
      const ry = topY - crownH * 0.15 + rng() * crownH * 0.2;
      const ey = topY + bangDrop * (0.55 + rng() * 0.45);
      const clump = generateClump(rx, ry, ey, (rng() - 0.5) * 0.3, clumpSpread * 0.8, spc, texture, rng, faceWidth);
      for (const s of clump) s.alpha = Math.min(s.alpha + 0.1, 0.8);
      strands.push(...clump);
    }
  } else if (bt === "face-framing") {
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.5) / 5;
      // Left framing
      const lx = leftHairline.x - sideV * 0.25 + t * faceWidth * 0.06;
      const ly = topY + rng() * crownH * 0.1;
      const ley = bangY + faceHeight * 0.08 * (1 - t);
      const lClump = generateClump(lx, ly, ley, -0.4, clumpSpread, spc - 1, texture, rng, faceWidth);
      for (const s of lClump) s.alpha = Math.min(s.alpha + 0.12, 0.85);
      strands.push(...lClump);
      // Right framing
      const rx2 = rightHairline.x + sideV * 0.25 - t * faceWidth * 0.06;
      const ry2 = topY + rng() * crownH * 0.1;
      const rey = bangY + faceHeight * 0.08 * (1 - t);
      const rClump = generateClump(rx2, ry2, rey, 0.4, clumpSpread, spc - 1, texture, rng, faceWidth);
      for (const s of rClump) s.alpha = Math.min(s.alpha + 0.12, 0.85);
      strands.push(...rClump);
    }
  } else if (bt === "short-textured" || bt === "lifted" || bt === "natural" || bt === "variable") {
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8;
      const rx = leftHairline.x + hlWidth * t;
      const ry = topY - crownH * 0.2 + rng() * crownH * 0.2;
      const ey = topY + bangDrop * (0.4 + rng() * 0.5);
      const clump = generateClump(rx, ry, ey, (rng() - 0.5) * 0.3, clumpSpread * 0.7, spc - 1, texture, rng, faceWidth);
      for (const s of clump) s.alpha = Math.min(s.alpha + 0.08, 0.75);
      strands.push(...clump);
    }
  }

  return strands;
}

// ===== Rendering =====

function drawStrand(ctx, strand, baseColor) {
  const pts = strand.points;
  if (pts.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length; i++) {
    if (i < pts.length - 1) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    } else {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
  }

  const shift = strand.colorShift;
  const c = {
    r: Math.max(0, Math.min(255, baseColor.r + shift)),
    g: Math.max(0, Math.min(255, baseColor.g + shift * 0.8)),
    b: Math.max(0, Math.min(255, baseColor.b + shift * 0.6)),
  };

  if (strand.isHighlight) {
    const hl = lighten(c, 0.5);
    ctx.strokeStyle = rgba(hl, strand.alpha * 0.4);
    ctx.lineWidth = strand.width * 0.5;
  } else {
    // Gradient from dark roots to slightly lighter tips
    const grad = ctx.createLinearGradient(
      pts[0].x, pts[0].y,
      pts[pts.length - 1].x, pts[pts.length - 1].y
    );
    const rootC = darken(c, 0.8);
    const tipC = lighten(c, 0.08);
    grad.addColorStop(0, rgba(rootC, strand.alpha * 0.9));
    grad.addColorStop(0.2, rgba(c, strand.alpha));
    grad.addColorStop(0.8, rgba(c, strand.alpha * 0.85));
    grad.addColorStop(1, rgba(tipC, strand.alpha * 0.5));
    ctx.strokeStyle = grad;
    ctx.lineWidth = strand.width;
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function renderShadowBase(ctx, bounds, profile, anchors, baseColor, opacity) {
  const { crownY, leftX, rightX, endY, centerX, crownH, sideV } = bounds;
  const { faceWidth, leftEar, rightEar } = anchors;

  // Dark semi-transparent mass underneath
  ctx.beginPath();
  const pad = faceWidth * 0.02;
  ctx.moveTo(leftX + pad, endY);
  ctx.bezierCurveTo(
    leftX - pad, (leftEar.y + crownY) / 2,
    leftX, crownY + crownH * 0.3,
    centerX, crownY - crownH * 0.05
  );
  ctx.bezierCurveTo(
    rightX, crownY + crownH * 0.3,
    rightX + pad, (rightEar.y + crownY) / 2,
    rightX - pad, endY
  );
  ctx.closePath();

  const shadow = darken(baseColor, 0.4);
  ctx.fillStyle = rgba(shadow, opacity * 0.45);
  ctx.fill();
}

function renderShine(ctx, bounds, baseColor, opacity) {
  const { crownY, centerX, crownH, leftX, rightX } = bounds;
  const w = (rightX - leftX) * 0.35;

  const grad = ctx.createRadialGradient(
    centerX, crownY + crownH * 0.6, w * 0.05,
    centerX, crownY + crownH * 0.6, w
  );
  const hl = lighten(baseColor, 0.55);
  grad.addColorStop(0, rgba(hl, opacity * 0.18));
  grad.addColorStop(0.6, rgba(hl, opacity * 0.06));
  grad.addColorStop(1, rgba(hl, 0));

  ctx.fillStyle = grad;
  ctx.fillRect(centerX - w, crownY, w * 2, crownH * 2);
}

// ===== Public API =====

export function renderHairOverlay(ctx, landmarks, canvasWidth, canvasHeight, style, options = {}) {
  const {
    heightMultiplier = 1.0,
    widthMultiplier = 1.0,
    color = "#3d2b1f",
    opacity = 0.55,
  } = options;

  const anchors = getAnchorPoints(landmarks, canvasWidth, canvasHeight);
  const profile = style.profile;
  const bounds = computeBounds(anchors, profile, heightMultiplier, widthMultiplier);
  const baseColor = parseHexColor(color);

  // Determine texture from style
  const texture = style.hairTypes.includes("coily") && style.hairTypes.length <= 2 ? "coily"
    : style.hairTypes.includes("curly") && style.hairTypes.length === 1 ? "curly"
    : style.hairTypes.includes("wavy") && !style.hairTypes.includes("straight") ? "wavy"
    : profile.textureDetail === "curly" ? "curly"
    : profile.textureDetail === "wavy" ? "wavy"
    : "straight";

  // Seeded RNG for stable rendering
  const seed = style.id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);

  // Generate all strands
  const bodyStrands = generateAllStrands(bounds, profile, anchors, heightMultiplier, widthMultiplier, rng, texture);
  const bangStrands = generateBangStrands(bounds, profile, anchors, heightMultiplier, widthMultiplier, rng, texture);

  // Use offscreen canvas for compositing
  let offCanvas, offCtx;
  if (typeof OffscreenCanvas !== "undefined") {
    offCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    offCtx = offCanvas.getContext("2d");
  } else {
    offCanvas = document.createElement("canvas");
    offCanvas.width = canvasWidth;
    offCanvas.height = canvasHeight;
    offCtx = offCanvas.getContext("2d");
  }

  // Shadow base
  renderShadowBase(offCtx, bounds, profile, anchors, baseColor, opacity);

  // Draw body strands
  for (const strand of bodyStrands) {
    drawStrand(offCtx, strand, baseColor);
  }

  // Clear face region so strands behind the face boundary disappear
  clearFaceRegion(offCtx, landmarks, canvasWidth, canvasHeight);

  // Draw bang strands (on top of everything, including over face edge)
  for (const strand of bangStrands) {
    drawStrand(offCtx, strand, baseColor);
  }

  // Add shine
  renderShine(offCtx, bounds, baseColor, opacity);

  // Composite onto main canvas
  ctx.drawImage(offCanvas, 0, 0);
}

export function estimateHairColor(imageData, landmarks, width, height) {
  const top = landmarks[10];
  const leftHair = landmarks[21];
  const rightHair = landmarks[251];

  const samplePoints = [];
  for (let dy = -0.08; dy <= -0.02; dy += 0.02) {
    for (let dx = -0.06; dx <= 0.06; dx += 0.03) {
      samplePoints.push({ x: top.x + dx, y: top.y + dy });
    }
  }
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
