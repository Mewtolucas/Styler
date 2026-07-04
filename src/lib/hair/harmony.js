import { getStylesForGender } from "./database.js";

// Derives full harmony scores from a style's physical profile properties.
// This maps how crown height, side volume, bang coverage, and length
// physically interact with each facial proportion.
//
// Research basis for these mappings:
//
// FACE FRAME (ratio, length):
//   Crown height adds perceived face height → helps wide/short, hurts narrow/long
//   Side volume adds perceived face width → helps narrow/long, hurts wide/short
//   Length past chin extends visual face → helps short, hurts long
//
// VERTICAL THIRDS (forehead, midface, lower face):
//   Bang coverage shortens perceived forehead → helps long forehead, hurts short
//   Crown height extends perceived forehead upward → helps short forehead, hurts long
//   Cheekbone-level volume compresses midface → helps long midface, hurts short
//   Chin-level or jaw-level hair breaks lower face → helps long lower, hurts short
//   Length past chin extends lower face → helps short lower, hurts long
//
// HORIZONTAL WIDTHS (forehead, jaw):
//   Side-swept or curtain bangs narrow wide forehead → coversForeheadPct proxy
//   Temple volume widens narrow forehead → sideVolume at top
//   Jaw-level volume widens narrow jaw → length at chin level
//   Length past jaw softens wide jaw by drawing eye down
//   Tapered/faded sides narrow the head at ear level → helps wide jaw
//
// STRUCTURE (cheekbones, chin):
//   Hair at cheekbone level obscures prominent cheekbones
//   Side volume at midface builds cheekbone illusion for flat cheekbones
//   Chin-level framing adds chin presence → helps short/recessed chin
//   Length past chin draws eye past prominent chin → helps long chin
//
// DETAIL (eyes, brows):
//   Center part draws eyes inward → helps wide-set
//   Side part draws eyes outward → helps close-set
//   Heavy bangs obscure brows → relevant for high/low brow position
//   Fringe ending at brow line extends perceived brow height → helps low brows

function deriveHarmony(profile) {
  const {
    crownHeight = 0,
    sideVolume = 0,
    bangDrop = 0,
    bangType = "none",
    lengthLevel = "ear",
    taperSides = false,
    coversForeheadPct = 0,
  } = profile;

  // Normalize to 0-1 ranges based on observed maximums in the database
  const crownNorm = Math.min(crownHeight / 0.3, 1);   // 0.3 = mohawk level
  const sideNorm = Math.min(sideVolume / 0.2, 1);      // 0.2 = afro level
  const bangNorm = Math.min(bangDrop / 0.35, 1);       // 0.35 = full bangs
  const foreheadCover = coversForeheadPct || bangNorm * 0.9;

  // Length score: 0 = above-ear, 1 = chest
  const lengthScores = {
    "pulled-up": 0, "shaved-sides": 0, "above-ear": 0.1, "ear": 0.2,
    "below-ear": 0.35, "chin": 0.5, "shoulder": 0.65, "chest": 0.85,
  };
  const lengthNorm = lengthScores[lengthLevel] ?? 0.2;

  // Whether hair reaches chin/jaw level (for jaw-width interactions)
  const reachesChin = lengthNorm >= 0.5;
  const pastChin = lengthNorm > 0.5;

  // Taper effect: faded/tapered sides reduce visual width at ears
  const taperEffect = taperSides ? 0.3 : 0;

  // Bang type modifiers
  const isCurtain = bangType === "curtain";
  const isSideSweep = bangType === "side-swept" || bangType === "side-swept-short";
  const isBluntBang = bangType === "blunt-fringe" || bangType === "short-fringe";
  const hasFaceFraming = bangType === "face-framing";
  const hasBangs = bangNorm > 0.1;

  // ======= FACE FRAME =======
  // Crown height elongates → positive for wide/short face, negative for narrow/long
  const narrowFace = sideNorm * 0.8 + lengthNorm * 0.3 - crownNorm * 0.4 - taperEffect * 0.5;
  const wideFace = crownNorm * 0.8 + taperEffect * 0.4 - sideNorm * 0.5;

  // Long face needs horizontal breaks and width; short face needs height and length
  const longFace = sideNorm * 0.5 + (hasBangs ? bangNorm * 0.4 : 0) + (reachesChin ? 0.2 : 0) - crownNorm * 0.3;
  const shortFace = crownNorm * 0.7 + (pastChin ? lengthNorm * 0.3 : 0) - (hasBangs ? bangNorm * 0.3 : 0);

  // ======= VERTICAL THIRDS =======
  // Forehead: bangs cover it (helps long), crown height extends it (helps short)
  const longForehead = foreheadCover * 0.9 + (isSideSweep ? 0.2 : 0) - crownNorm * 0.2;
  const shortForehead = crownNorm * 0.8 - foreheadCover * 0.7;

  // Midface: side volume at cheekbone compresses it (helps long), sleek sides open it (helps short)
  const longMidface = sideNorm * 0.6 + (hasFaceFraming ? 0.3 : 0) + (hasBangs ? 0.15 : 0);
  const shortMidface = crownNorm * 0.4 - sideNorm * 0.5 + (taperSides ? 0.2 : 0);

  // Lower face: chin-level breaks shorten it, length past chin extends short lower face
  const longLowerFace = (reachesChin ? 0.5 : 0) + sideNorm * 0.3 - (pastChin ? lengthNorm * 0.2 : 0);
  const shortLowerFace = (pastChin ? lengthNorm * 0.6 : 0) - (reachesChin && !pastChin ? 0.4 : 0);

  // ======= HORIZONTAL WIDTHS =======
  // Wide forehead: curtain/side-swept bangs cover edges; blunt bangs create horizontal line
  const wideForehead = (isCurtain ? 0.5 : 0) + (isSideSweep ? 0.4 : 0) + foreheadCover * 0.2;
  const narrowForehead = sideNorm * 0.5 + crownNorm * 0.2 - foreheadCover * 0.4;

  // Wide jaw: tapered sides help, length past jaw draws eye down, avoid chin-level bobs
  const wideJaw = taperEffect * 0.5 + (pastChin ? 0.4 : 0) + crownNorm * 0.3 - (reachesChin && !pastChin ? 0.3 : 0);
  const narrowJaw = (reachesChin && !pastChin ? 0.6 : 0) + sideNorm * 0.3 - (pastChin ? 0.2 : 0);

  // ======= STRUCTURE =======
  // Prominent cheekbones: hair at cheekbone level can showcase or soften
  const prominentCheekbones = (hasFaceFraming ? 0.3 : 0) + sideNorm * 0.2;
  const flatCheekbones = sideNorm * 0.6 + (hasFaceFraming ? 0.3 : 0);

  // Chin: chin-level framing adds presence for short chin; length past draws eye past long chin
  const shortChin = (reachesChin ? 0.5 : 0) + sideNorm * 0.2 + (pastChin ? 0.1 : 0);
  const longChin = (pastChin ? 0.4 : 0) + crownNorm * 0.3 + (hasBangs ? 0.2 : 0) - (reachesChin && !pastChin ? 0.3 : 0);

  // ======= DETAIL =======
  // Eye spacing: center part narrows (helps wide-set), side part widens (helps close-set)
  // We approximate: curtain bangs = center part, side-swept = side part
  const wideSetEyes = (isCurtain ? 0.5 : 0) + (bangNorm > 0.2 ? 0.2 : 0) - (isSideSweep ? 0.2 : 0);
  const closeSetEyes = (isSideSweep ? 0.5 : 0) + sideNorm * 0.2 - (isCurtain ? 0.2 : 0);

  // Brow position: heavy bangs obscure high brows (good); low brows need forehead exposed
  const highBrows = (hasBangs ? bangNorm * 0.3 : 0);
  const lowBrows = crownNorm * 0.3 - (hasBangs ? bangNorm * 0.4 : 0);

  // Clamp all values to [-1, 1]
  const clamp = (v) => Math.max(-1, Math.min(1, v));

  return {
    narrowFace: clamp(narrowFace),
    wideFace: clamp(wideFace),
    longFace: clamp(longFace),
    shortFace: clamp(shortFace),
    longForehead: clamp(longForehead),
    shortForehead: clamp(shortForehead),
    longMidface: clamp(longMidface),
    shortMidface: clamp(shortMidface),
    longLowerFace: clamp(longLowerFace),
    shortLowerFace: clamp(shortLowerFace),
    wideForehead: clamp(wideForehead),
    narrowForehead: clamp(narrowForehead),
    wideJaw: clamp(wideJaw),
    narrowJaw: clamp(narrowJaw),
    prominentCheekbones: clamp(prominentCheekbones),
    flatCheekbones: clamp(flatCheekbones),
    shortChin: clamp(shortChin),
    longChin: clamp(longChin),
    wideSetEyes: clamp(wideSetEyes),
    closeSetEyes: clamp(closeSetEyes),
    highBrows: clamp(highBrows),
    lowBrows: clamp(lowBrows),
  };
}

// Merge derived harmony with any manual overrides from the database.
// Manual values take precedence.
function getFullHarmony(style) {
  const derived = deriveHarmony(style.profile);
  const manual = style.harmony || {};
  // Map old key names to new ones for backward compat
  const mapped = { ...derived };
  if ("strongJaw" in manual) mapped.wideJaw = manual.strongJaw;
  if ("weakChin" in manual) mapped.shortChin = manual.weakChin;
  // Overlay any explicitly set values
  for (const key of Object.keys(derived)) {
    if (key in manual) mapped[key] = manual[key];
  }
  return mapped;
}

// Impact weights — how much each proportion deviation should influence
// hairstyle selection. Based on visual perception research:
//   Overall face frame is perceived first (ratio, length)
//   Vertical thirds are next most salient
//   Horizontal widths affect framing
//   Structure features are secondary
//   Detail features are subtle
const WEIGHTS = {
  faceShape: 1.0,
  faceRatio: 0.95,
  faceLength: 0.9,
  foreheadThird: 0.85,
  midfaceThird: 0.75,
  lowerFaceThird: 0.75,
  foreheadWidth: 0.7,
  jawWidth: 0.7,
  cheekbones: 0.55,
  chinProjection: 0.55,
  eyeSpacing: 0.4,
  browPosition: 0.35,
  hairType: 0.5,
};

function scoreDimension(harmony, key, weight, reasons, posText, negText) {
  const benefit = harmony[key] || 0;
  const s = (benefit + 1) / 2 * weight;
  if (posText && benefit > 0.3) reasons.push({ type: "positive", text: posText });
  if (negText && benefit < -0.3) reasons.push({ type: "negative", text: negText });
  return { score: s, max: weight };
}

export function scoreHairstyle(style, classification) {
  const {
    faceShape, faceRatio, facialThirds, chinProjection, hairType,
    eyeSpacing, browPosition, proportions,
  } = classification;

  const harmony = getFullHarmony(style);
  let score = 0;
  let maxScore = 0;
  const reasons = [];

  const add = (s, m) => { score += s; maxScore += m; };

  // === Face shape affinity ===
  const shapeScore = style.faceShapeAffinity[faceShape] || 0.5;
  add(shapeScore * WEIGHTS.faceShape, WEIGHTS.faceShape);
  if (shapeScore >= 0.8) reasons.push({ type: "positive", text: `Suits your ${faceShape} face shape` });
  else if (shapeScore <= 0.4) reasons.push({ type: "negative", text: `Not ideal for ${faceShape} face shapes` });

  // === Face ratio (width-to-height) ===
  if (faceRatio === "narrow") {
    const r = scoreDimension(harmony, "narrowFace", WEIGHTS.faceRatio, reasons,
      "Adds width to balance your narrow face",
      "May make your face look even narrower");
    add(r.score, r.max);
  } else if (faceRatio === "wide") {
    const r = scoreDimension(harmony, "wideFace", WEIGHTS.faceRatio, reasons,
      "Elongates your wide face",
      "May make your face look wider");
    add(r.score, r.max);
  } else {
    add(0.5 * WEIGHTS.faceRatio, WEIGHTS.faceRatio);
  }

  // === Face length ===
  if (proportions?.faceShape) {
    const lr = proportions.faceShape.lengthCheekRatio;
    if (lr > 1.5) {
      const r = scoreDimension(harmony, "longFace", WEIGHTS.faceLength, reasons,
        "Breaks up your long face with horizontal elements",
        "Elongates an already long face");
      add(r.score, r.max);
    } else if (lr < 1.2) {
      const r = scoreDimension(harmony, "shortFace", WEIGHTS.faceLength, reasons,
        "Adds height to your shorter face",
        "May make your face look shorter");
      add(r.score, r.max);
    } else {
      add(0.5 * WEIGHTS.faceLength, WEIGHTS.faceLength);
    }
  }

  // === Facial thirds ===
  if (facialThirds && facialThirds !== "balanced") {
    if (facialThirds.includes("long forehead")) {
      const r = scoreDimension(harmony, "longForehead", WEIGHTS.foreheadThird, reasons,
        "Covers/shortens your longer forehead",
        "Exposes your forehead fully");
      add(r.score, r.max);
    } else if (facialThirds.includes("short forehead")) {
      const r = scoreDimension(harmony, "shortForehead", WEIGHTS.foreheadThird, reasons,
        "Opens up and extends your forehead",
        "Covers an already short forehead");
      add(r.score, r.max);
    } else {
      add(0.5 * WEIGHTS.foreheadThird, WEIGHTS.foreheadThird);
    }

    if (facialThirds.includes("long midface")) {
      const r = scoreDimension(harmony, "longMidface", WEIGHTS.midfaceThird, reasons,
        "Adds width at cheekbone level to compress the midface",
        "Doesn't interrupt the long midface");
      add(r.score, r.max);
    } else if (facialThirds.includes("short midface")) {
      const r = scoreDimension(harmony, "shortMidface", WEIGHTS.midfaceThird, reasons,
        "Keeps the midface visually open",
        "Compresses an already short midface");
      add(r.score, r.max);
    } else {
      add(0.5 * WEIGHTS.midfaceThird, WEIGHTS.midfaceThird);
    }

    if (facialThirds.includes("long lower face")) {
      const r = scoreDimension(harmony, "longLowerFace", WEIGHTS.lowerFaceThird, reasons,
        "Creates a visual break across the lower face",
        "Extends the visual length of the lower face");
      add(r.score, r.max);
    } else if (facialThirds.includes("short lower face")) {
      const r = scoreDimension(harmony, "shortLowerFace", WEIGHTS.lowerFaceThird, reasons,
        "Extends the visual lower face with length",
        "Cuts off at the jaw, emphasizing short lower face");
      add(r.score, r.max);
    } else {
      add(0.5 * WEIGHTS.lowerFaceThird, WEIGHTS.lowerFaceThird);
    }
  } else {
    add(0.5 * WEIGHTS.foreheadThird, WEIGHTS.foreheadThird);
    add(0.5 * WEIGHTS.midfaceThird, WEIGHTS.midfaceThird);
    add(0.5 * WEIGHTS.lowerFaceThird, WEIGHTS.lowerFaceThird);
  }

  // === Forehead width ===
  if (proportions?.faceShape) {
    const fcr = proportions.faceShape.foreheadCheekRatio;
    if (fcr > 0.95) {
      const r = scoreDimension(harmony, "wideForehead", WEIGHTS.foreheadWidth, reasons,
        "Covers the edges of your wide forehead",
        "Exposes your wide forehead");
      add(r.score, r.max);
    } else if (fcr < 0.75) {
      const r = scoreDimension(harmony, "narrowForehead", WEIGHTS.foreheadWidth, reasons,
        "Adds volume at the temples to widen the forehead",
        "Makes a narrow forehead look narrower");
      add(r.score, r.max);
    } else {
      add(0.5 * WEIGHTS.foreheadWidth, WEIGHTS.foreheadWidth);
    }
  }

  // === Jaw width ===
  if (proportions?.faceShape) {
    const jcr = proportions.faceShape.jawCheekRatio;
    if (jcr > 0.88) {
      const r = scoreDimension(harmony, "wideJaw", WEIGHTS.jawWidth, reasons,
        "Softens your strong jawline",
        "Emphasizes a wide jaw");
      add(r.score, r.max);
    } else if (jcr < 0.72) {
      const r = scoreDimension(harmony, "narrowJaw", WEIGHTS.jawWidth, reasons,
        "Adds volume around a narrow jawline",
        "Doesn't add volume where the jaw is narrow");
      add(r.score, r.max);
    } else {
      add(0.5 * WEIGHTS.jawWidth, WEIGHTS.jawWidth);
    }
  }

  // === Cheekbone prominence ===
  if (faceShape === "diamond") {
    const r = scoreDimension(harmony, "prominentCheekbones", WEIGHTS.cheekbones, reasons,
      "Works with your prominent cheekbones", null);
    add(r.score, r.max);
  } else if (faceShape === "round" || faceShape === "square") {
    const r = scoreDimension(harmony, "flatCheekbones", WEIGHTS.cheekbones, reasons,
      "Builds cheekbone definition with volume", null);
    add(r.score, r.max);
  } else {
    add(0.5 * WEIGHTS.cheekbones, WEIGHTS.cheekbones);
  }

  // === Chin projection ===
  if (chinProjection === "short") {
    const r = scoreDimension(harmony, "shortChin", WEIGHTS.chinProjection, reasons,
      "Adds fullness around the chin area",
      "Doesn't compensate for a recessed chin");
    add(r.score, r.max);
  } else if (chinProjection === "long") {
    const r = scoreDimension(harmony, "longChin", WEIGHTS.chinProjection, reasons,
      "Draws attention upward from a prominent chin",
      "Emphasizes a prominent chin");
    add(r.score, r.max);
  } else {
    add(0.5 * WEIGHTS.chinProjection, WEIGHTS.chinProjection);
  }

  // === Eye spacing ===
  if (eyeSpacing === "wide-set") {
    const r = scoreDimension(harmony, "wideSetEyes", WEIGHTS.eyeSpacing, reasons,
      "Center weight draws wide-set eyes inward", null);
    add(r.score, r.max);
  } else if (eyeSpacing === "close-set") {
    const r = scoreDimension(harmony, "closeSetEyes", WEIGHTS.eyeSpacing, reasons,
      "Side-swept styling draws close-set eyes outward", null);
    add(r.score, r.max);
  } else {
    add(0.5 * WEIGHTS.eyeSpacing, WEIGHTS.eyeSpacing);
  }

  // === Brow position ===
  if (browPosition === "high-set") {
    const r = scoreDimension(harmony, "highBrows", WEIGHTS.browPosition, reasons,
      null, null);
    add(r.score, r.max);
  } else if (browPosition === "low-set") {
    const r = scoreDimension(harmony, "lowBrows", WEIGHTS.browPosition, reasons,
      null, "Heavy bangs crowd already low-set brows");
    add(r.score, r.max);
  } else {
    add(0.5 * WEIGHTS.browPosition, WEIGHTS.browPosition);
  }

  // === Hair type compatibility ===
  const ht = hairType === "unknown" ? "straight" : hairType;
  const htMatch = style.hairTypes.includes(ht) ? 1.0 : 0.1;
  add(htMatch * WEIGHTS.hairType, WEIGHTS.hairType);
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
