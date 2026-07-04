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

// Proportion-first weights. Face shape label is deliberately low — it's a
// coarse bucket that can conflict with the actual measurements (e.g. a face
// labeled "round" can still have a high length-to-cheek ratio). The continuous
// proportion measurements are the primary drivers.
//
// Weights also scale by deviation magnitude — a jaw that's barely wide
// matters less than one that's extremely wide. The `deviationScale` function
// converts a raw ratio into a 0–1 intensity that multiplies the base weight.
const BASE_WEIGHTS = {
  faceRatio: 1.0,
  faceLength: 0.95,
  foreheadThird: 0.9,
  midfaceThird: 0.8,
  lowerFaceThird: 0.8,
  foreheadWidth: 0.75,
  jawWidth: 0.75,
  cheekbones: 0.55,
  chinProjection: 0.55,
  eyeSpacing: 0.45,
  browPosition: 0.35,
  hairType: 0.5,
  faceShape: 0.15,
};

// Maps a raw ratio to a 0–1 deviation intensity.
// `center` is the balanced value, `threshold` is where it starts mattering,
// `extreme` is a strong deviation. Returns 0 when at center, 1 at extreme.
function deviationScale(value, center, threshold, extreme) {
  const dist = Math.abs(value - center);
  if (dist <= threshold) return 0;
  return Math.min(1, (dist - threshold) / (extreme - threshold));
}

function scoreDimension(harmony, key, weight, deviation, reasons, posText, negText) {
  const benefit = harmony[key] || 0;
  const effectiveWeight = weight * deviation;
  const s = (benefit + 1) / 2 * effectiveWeight;
  if (posText && benefit > 0.3 && deviation > 0.2) reasons.push({ type: "positive", text: posText });
  if (negText && benefit < -0.3 && deviation > 0.2) reasons.push({ type: "negative", text: negText });
  return { score: s, max: effectiveWeight };
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

  // === Face ratio (width-to-height) — continuous from proportions ===
  const ratioValue = proportions?.faceRatio?.value ?? 1.55;
  // Deviation from golden ratio 1.618; threshold 0.07, extreme 0.25
  const ratioDev = deviationScale(ratioValue, 1.618, 0.07, 0.25);
  if (ratioValue > 1.618) {
    const r = scoreDimension(harmony, "narrowFace", BASE_WEIGHTS.faceRatio, ratioDev, reasons,
      "Adds width to balance your narrow face",
      "May make your face look even narrower");
    add(r.score, r.max);
  } else {
    const r = scoreDimension(harmony, "wideFace", BASE_WEIGHTS.faceRatio, ratioDev, reasons,
      "Elongates your wider face",
      "May make your face look wider");
    add(r.score, r.max);
  }

  // === Face length — continuous from lengthCheekRatio ===
  const lcr = proportions?.faceShape?.lengthCheekRatio ?? 1.35;
  // Center 1.35, threshold 0.1, extreme 0.3
  const lengthDev = deviationScale(lcr, 1.35, 0.1, 0.3);
  if (lcr > 1.35) {
    const r = scoreDimension(harmony, "longFace", BASE_WEIGHTS.faceLength, lengthDev, reasons,
      "Breaks up your long face with horizontal elements",
      "Elongates an already long face");
    add(r.score, r.max);
  } else {
    const r = scoreDimension(harmony, "shortFace", BASE_WEIGHTS.faceLength, lengthDev, reasons,
      "Adds height to your shorter face",
      "May make your face look shorter");
    add(r.score, r.max);
  }

  // === Facial thirds — continuous deviations ===
  const thirds = proportions?.facialThirds;
  if (thirds) {
    const fdAbs = Math.abs(thirds.foreheadDeviation || 0);
    const fdSign = (thirds.foreheadDeviation || 0) > 0;
    // threshold 0.1, extreme 0.35
    const fdDev = Math.min(1, Math.max(0, (fdAbs - 0.1) / 0.25));
    if (fdSign) {
      const r = scoreDimension(harmony, "longForehead", BASE_WEIGHTS.foreheadThird, fdDev, reasons,
        "Covers/shortens your longer forehead",
        "Exposes your forehead fully");
      add(r.score, r.max);
    } else {
      const r = scoreDimension(harmony, "shortForehead", BASE_WEIGHTS.foreheadThird, fdDev, reasons,
        "Opens up and extends your forehead",
        "Covers an already short forehead");
      add(r.score, r.max);
    }

    const mdAbs = Math.abs(thirds.midfaceDeviation || 0);
    const mdSign = (thirds.midfaceDeviation || 0) > 0;
    const mdDev = Math.min(1, Math.max(0, (mdAbs - 0.1) / 0.25));
    if (mdSign) {
      const r = scoreDimension(harmony, "longMidface", BASE_WEIGHTS.midfaceThird, mdDev, reasons,
        "Adds width at cheekbone level to compress the midface",
        "Doesn't interrupt the long midface");
      add(r.score, r.max);
    } else {
      const r = scoreDimension(harmony, "shortMidface", BASE_WEIGHTS.midfaceThird, mdDev, reasons,
        "Keeps the midface visually open",
        "Compresses an already short midface");
      add(r.score, r.max);
    }

    const ldAbs = Math.abs(thirds.lowerFaceDeviation || 0);
    const ldSign = (thirds.lowerFaceDeviation || 0) > 0;
    const ldDev = Math.min(1, Math.max(0, (ldAbs - 0.1) / 0.25));
    if (ldSign) {
      const r = scoreDimension(harmony, "longLowerFace", BASE_WEIGHTS.lowerFaceThird, ldDev, reasons,
        "Creates a visual break across the lower face",
        "Extends the visual length of the lower face");
      add(r.score, r.max);
    } else {
      const r = scoreDimension(harmony, "shortLowerFace", BASE_WEIGHTS.lowerFaceThird, ldDev, reasons,
        "Extends the visual lower face with length",
        "Cuts off at the jaw, emphasizing short lower face");
      add(r.score, r.max);
    }
  }

  // === Forehead width — continuous from foreheadCheekRatio ===
  const fcr = proportions?.faceShape?.foreheadCheekRatio ?? 0.85;
  // Center 0.85, threshold 0.05, extreme 0.2
  const fwDev = deviationScale(fcr, 0.85, 0.05, 0.2);
  if (fcr > 0.85) {
    const r = scoreDimension(harmony, "wideForehead", BASE_WEIGHTS.foreheadWidth, fwDev, reasons,
      "Covers the edges of your wide forehead",
      "Exposes your wide forehead");
    add(r.score, r.max);
  } else {
    const r = scoreDimension(harmony, "narrowForehead", BASE_WEIGHTS.foreheadWidth, fwDev, reasons,
      "Adds volume at the temples to widen the forehead",
      "Makes a narrow forehead look narrower");
    add(r.score, r.max);
  }

  // === Jaw width — continuous from jawCheekRatio ===
  const jcr = proportions?.faceShape?.jawCheekRatio ?? 0.80;
  // Center 0.80, threshold 0.04, extreme 0.18
  const jwDev = deviationScale(jcr, 0.80, 0.04, 0.18);
  if (jcr > 0.80) {
    const r = scoreDimension(harmony, "wideJaw", BASE_WEIGHTS.jawWidth, jwDev, reasons,
      "Softens your strong jawline",
      "Emphasizes a wide jaw");
    add(r.score, r.max);
  } else {
    const r = scoreDimension(harmony, "narrowJaw", BASE_WEIGHTS.jawWidth, jwDev, reasons,
      "Adds volume around a narrow jawline",
      "Doesn't add volume where the jaw is narrow");
    add(r.score, r.max);
  }

  // === Cheekbone prominence — derived from face shape ratios ===
  // High cheekbone-to-jaw ratio = prominent; low = flat
  if (jcr < 0.75) {
    const cbDev = deviationScale(jcr, 0.80, 0.05, 0.15);
    const r = scoreDimension(harmony, "prominentCheekbones", BASE_WEIGHTS.cheekbones, cbDev, reasons,
      "Works with your prominent cheekbones", null);
    add(r.score, r.max);
  } else if (jcr > 0.90) {
    const cbDev = deviationScale(jcr, 0.80, 0.1, 0.2);
    const r = scoreDimension(harmony, "flatCheekbones", BASE_WEIGHTS.cheekbones, cbDev, reasons,
      "Builds cheekbone definition with volume", null);
    add(r.score, r.max);
  } else {
    add(0.5 * BASE_WEIGHTS.cheekbones * 0.3, BASE_WEIGHTS.cheekbones * 0.3);
  }

  // === Chin projection ===
  const chinDev = proportions?.chin?.ratio
    ? deviationScale(proportions.chin.ratio, 1.0, 0.1, 0.35)
    : 0.5;
  if (chinProjection === "short") {
    const r = scoreDimension(harmony, "shortChin", BASE_WEIGHTS.chinProjection, chinDev, reasons,
      "Adds fullness around the chin area",
      "Doesn't compensate for a recessed chin");
    add(r.score, r.max);
  } else if (chinProjection === "long") {
    const r = scoreDimension(harmony, "longChin", BASE_WEIGHTS.chinProjection, chinDev, reasons,
      "Draws attention upward from a prominent chin",
      "Emphasizes a prominent chin");
    add(r.score, r.max);
  } else {
    add(0.5 * BASE_WEIGHTS.chinProjection * 0.2, BASE_WEIGHTS.chinProjection * 0.2);
  }

  // === Eye spacing — continuous from eye spacing ratio ===
  const esr = proportions?.eyeSpacing?.ratio ?? 1.0;
  const esDev = deviationScale(esr, 1.0, 0.1, 0.35);
  if (esr > 1.0) {
    const r = scoreDimension(harmony, "wideSetEyes", BASE_WEIGHTS.eyeSpacing, esDev, reasons,
      "Center weight draws wide-set eyes inward", null);
    add(r.score, r.max);
  } else {
    const r = scoreDimension(harmony, "closeSetEyes", BASE_WEIGHTS.eyeSpacing, esDev, reasons,
      "Side-swept styling draws close-set eyes outward", null);
    add(r.score, r.max);
  }

  // === Brow position ===
  const browGap = proportions?.brows?.avgBrowEyeGap ?? 0.027;
  const browDev = deviationScale(browGap, 0.027, 0.005, 0.015);
  if (browGap > 0.027) {
    const r = scoreDimension(harmony, "highBrows", BASE_WEIGHTS.browPosition, browDev, reasons,
      null, null);
    add(r.score, r.max);
  } else {
    const r = scoreDimension(harmony, "lowBrows", BASE_WEIGHTS.browPosition, browDev, reasons,
      null, "Heavy bangs crowd already low-set brows");
    add(r.score, r.max);
  }

  // === Hair type compatibility ===
  const ht = hairType === "unknown" ? "straight" : hairType;
  const htMatch = style.hairTypes.includes(ht) ? 1.0 : 0.1;
  add(htMatch * BASE_WEIGHTS.hairType, BASE_WEIGHTS.hairType);
  if (!style.hairTypes.includes(ht)) {
    reasons.push({ type: "negative", text: `Not designed for ${ht} hair` });
  }

  // === Face shape — minor tiebreaker only ===
  const shapeScore = style.faceShapeAffinity[faceShape] || 0.5;
  add(shapeScore * BASE_WEIGHTS.faceShape, BASE_WEIGHTS.faceShape);

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
