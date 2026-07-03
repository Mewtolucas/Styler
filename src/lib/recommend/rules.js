import menHaircuts from "../../../recommend/content/men/haircuts.js";
import menFacialHair from "../../../recommend/content/men/facialHair.js";
import menGlasses from "../../../recommend/content/men/glasses.js";
import menStyleArchetypes from "../../../recommend/content/men/styleArchetypes.js";
import womenHairstyles from "../../../recommend/content/women/hairstyles.js";
import womenMakeup from "../../../recommend/content/women/makeup.js";
import womenEyeMakeup from "../../../recommend/content/women/eyeMakeup.js";
import womenGlasses from "../../../recommend/content/women/glasses.js";
import womenStyleArchetypes from "../../../recommend/content/women/styleArchetypes.js";
import hairColor from "../../../recommend/content/shared/hairColor.js";
import skincare from "../../../recommend/content/shared/skincare.js";
import confidence from "../../../recommend/content/shared/confidence.js";
import posture from "../../../recommend/content/shared/posture.js";
import lifestyle from "../../../recommend/content/shared/lifestyle.js";
import caveat from "../../../recommend/content/shared/caveat.js";
import proportionHarmony from "../../../recommend/content/shared/proportionHarmony.js";
import hairstyleProportions from "../../../recommend/content/shared/hairstyleThirds.js";

function lookup(obj, ...keys) {
  let current = obj;
  for (const key of keys) {
    if (!current || typeof current !== "object") return null;
    current = current[key];
  }
  return current || null;
}

function ageBracketKey(ageBracket) {
  switch (ageBracket) {
    case "under18": return "under18";
    case "18-24": return "age18to24";
    case "25-40": return "age25to40";
    case "40-60": return "age40to60";
    case "60+": return "over60";
    default: return "age25to40";
  }
}

function skinDepthCategory(shade) {
  if (shade <= 3) return "light";
  if (shade <= 6) return "medium";
  return "deep";
}

function buildHarmonySections(classification, gender, ageBracket) {
  const { faceShape, symmetry, chinProjection, undertone, textureSignals, hairType, skinDepth, proportions } = classification;
  const isMen = gender === "men";
  const isTeen = ageBracket === "under18";
  const sections = [];

  const teenExcludedAreas = ["Contouring", "Lip Color", "Facial Hair"];

  const addSection = (category, key, filter) => {
    const section = lookup(proportionHarmony, category, key);
    if (!section) return;
    let techniques = section.techniques;
    if (filter) techniques = techniques.filter(filter);
    if (techniques.length > 0) {
      sections.push({ title: section.title, techniques });
    }
  };

  const combinedFilter = (t) => {
    if (isMen && t.area.includes("(Women)")) return false;
    if (!isMen && t.area.includes("(Men)")) return false;
    if (isTeen && teenExcludedAreas.some((a) => t.area.includes(a))) return false;
    return true;
  };

  const { faceRatio, facialThirds, eyeSpacing: eyeSpacingLabel, noseLength, noseWidth,
    lipFullness, lipBalance, lipWidth, browArch, browPosition } = classification;

  // --- Face-slimming (shown first when applicable) ---
  if (faceShape === "round") addSection("faceSlimming", "round", combinedFilter);
  else if (faceShape === "square") addSection("faceSlimming", "square", combinedFilter);
  if (faceRatio === "wide") addSection("faceSlimming", "wide", combinedFilter);

  // --- Face structure proportions ---
  if (faceRatio === "narrow") addSection("faceRatio", "narrow", combinedFilter);
  else if (faceRatio === "wide") addSection("faceRatio", "wide", combinedFilter);

  if (proportions?.faceShape) {
    const lr = proportions.faceShape.lengthCheekRatio;
    if (lr > 1.5) addSection("faceLength", "long", combinedFilter);
    else if (lr < 1.2) addSection("faceLength", "short", combinedFilter);
  }

  if (facialThirds && facialThirds !== "balanced") {
    if (facialThirds.includes("long forehead")) addSection("facialThirds", "longForehead", combinedFilter);
    if (facialThirds.includes("short forehead")) addSection("facialThirds", "shortForehead", combinedFilter);
    if (facialThirds.includes("long midface")) addSection("facialThirds", "longMidface", combinedFilter);
    if (facialThirds.includes("short midface")) addSection("facialThirds", "shortMidface", combinedFilter);
    if (facialThirds.includes("long lower face")) addSection("facialThirds", "longLowerFace", combinedFilter);
    if (facialThirds.includes("short lower face")) addSection("facialThirds", "shortLowerFace", combinedFilter);
  }

  if (proportions?.faceShape) {
    const jcr = proportions.faceShape.jawCheekRatio;
    if (jcr > 0.88) addSection("jawWidth", "wide", combinedFilter);
    else if (jcr < 0.72) addSection("jawWidth", "narrow", combinedFilter);
  }

  if (proportions?.faceShape) {
    const fcr = proportions.faceShape.foreheadCheekRatio;
    if (fcr > 0.95) addSection("foreheadBalance", "wide", combinedFilter);
    else if (fcr < 0.75) addSection("foreheadBalance", "narrow", combinedFilter);
  }

  if (faceShape === "diamond") {
    addSection("cheekboneProminence", "prominent", combinedFilter);
  } else if (faceShape === "round" || faceShape === "square") {
    addSection("cheekboneProminence", "flat", combinedFilter);
  }

  if (chinProjection === "short") addSection("chinProjection", "short", combinedFilter);
  else if (chinProjection === "long") addSection("chinProjection", "long", combinedFilter);

  if (symmetry === "left-fuller") addSection("symmetry", "leftFuller", combinedFilter);
  else if (symmetry === "right-fuller") addSection("symmetry", "rightFuller", combinedFilter);

  // --- Individual feature proportions ---
  const primaryEye = classification.eyeShape?.includes("-")
    ? classification.eyeShape.split("-")[0]
    : classification.eyeShape;
  const eyeMap = { round: "round", narrow: "narrow", upturned: "upturned", downturned: "downturned", monolid: "monolid" };
  if (eyeMap[primaryEye]) addSection("eyeShape", eyeMap[primaryEye], combinedFilter);

  if (eyeSpacingLabel === "wide-set") addSection("eyeSpacing", "wideSet", combinedFilter);
  else if (eyeSpacingLabel === "close-set") addSection("eyeSpacing", "closeSet", combinedFilter);

  if (noseLength === "long") addSection("noseProportions", "long", combinedFilter);
  else if (noseLength === "short") addSection("noseProportions", "short", combinedFilter);
  if (noseWidth === "wide") addSection("noseProportions", "wide", combinedFilter);
  else if (noseWidth === "narrow") addSection("noseProportions", "narrow", combinedFilter);

  if (lipFullness === "full") addSection("lipProportions", "full", combinedFilter);
  else if (lipFullness === "thin") addSection("lipProportions", "thin", combinedFilter);
  if (lipBalance === "bottom-heavy") addSection("lipProportions", "bottomHeavy", combinedFilter);
  else if (lipBalance === "top-heavy") addSection("lipProportions", "topHeavy", combinedFilter);
  if (lipWidth === "wide") addSection("lipProportions", "wide", combinedFilter);
  else if (lipWidth === "narrow") addSection("lipProportions", "narrow", combinedFilter);

  // Lip posture
  const { lipPosture, browShape: browShapeLabel, browThickness } = classification;
  if (lipPosture === "upturned") addSection("lipPosture", "upturned", combinedFilter);
  else if (lipPosture === "downturned") addSection("lipPosture", "downturned", combinedFilter);

  // Brow arch and position
  if (browArch === "high-arched") addSection("browShape", "highArched", combinedFilter);
  else if (browArch === "flat") addSection("browShape", "flat", combinedFilter);
  if (browPosition === "high-set") addSection("browShape", "highSet", combinedFilter);
  else if (browPosition === "low-set") addSection("browShape", "lowSet", combinedFilter);

  // Brow shape type
  const browShapeMap = { straight: "straight", angled: "angled", rounded: "rounded", "S-shaped": "sShaped", "soft-angled": null };
  const browShapeKey = browShapeMap[browShapeLabel];
  if (browShapeKey) addSection("browShapeType", browShapeKey, combinedFilter);

  // Brow grooming/trimming
  if (browThickness) addSection("browGrooming", browThickness, combinedFilter);

  // --- Non-face-reliant tips (color, texture, styling) ---
  if (undertone) addSection("skinUndertone", undertone, combinedFilter);

  if (textureSignals) {
    for (const signal of textureSignals) {
      const texMap = { oiliness: "oily", dryness: "dry", redness: "redness" };
      if (texMap[signal]) addSection("skinTexture", texMap[signal], combinedFilter);
    }
  }

  const ht = hairType === "unknown" ? null : hairType;
  if (ht) addSection("hairTexture", ht, combinedFilter);

  const depthKey = skinDepthCategory(skinDepth);
  addSection("skinDepth", depthKey, combinedFilter);

  addSection("faceShapeOutfits", faceShape, combinedFilter);

  return sections;
}

// Impact weights for hairstyle proportion adjustments.
// Based on visual perception research: overall face frame dominates first
// impression, vertical thirds are the next most salient imbalance, then
// structural widths, then detail features.
const HAIRSTYLE_WEIGHTS = {
  faceRatio: 1.0,
  faceLength: 0.95,
  foreheadThird: 0.9,
  midfaceThird: 0.85,
  lowerFaceThird: 0.85,
  jawWidth: 0.75,
  foreheadWidth: 0.7,
  cheekbones: 0.6,
  chinProjection: 0.55,
  eyeSpacing: 0.4,
};

function buildHairstyleProportionNotes(classification) {
  const scored = [];
  const { facialThirds, faceRatio, eyeSpacing, chinProjection, faceShape, proportions } = classification;
  const thirds = proportions?.facialThirds;
  const shape = proportions?.faceShape;
  const eyeSp = proportions?.eyeSpacing;

  const add = (content, weight, deviation) => {
    if (content) scored.push({ content, score: weight * Math.abs(deviation) });
  };

  // Face width-to-height ratio — deviation from golden ratio 1.618
  if (proportions?.faceRatio) {
    const ratio = proportions.faceRatio.value;
    if (ratio > 1.7) add(hairstyleProportions.narrowFace, HAIRSTYLE_WEIGHTS.faceRatio, (ratio - 1.618) / 1.618);
    else if (ratio < 1.45) add(hairstyleProportions.wideFace, HAIRSTYLE_WEIGHTS.faceRatio, (1.618 - ratio) / 1.618);
  }

  // Face length — deviation from balanced lengthCheekRatio ~1.35
  if (shape) {
    const lr = shape.lengthCheekRatio;
    if (lr > 1.5) add(hairstyleProportions.longFace, HAIRSTYLE_WEIGHTS.faceLength, (lr - 1.35) / 1.35);
    else if (lr < 1.2) add(hairstyleProportions.shortFace, HAIRSTYLE_WEIGHTS.faceLength, (1.35 - lr) / 1.35);
  }

  // Facial thirds — use actual deviation percentages from equal thirds
  if (thirds && facialThirds !== "balanced") {
    const fd = Math.abs(thirds.foreheadDeviation);
    const md = Math.abs(thirds.midfaceDeviation);
    const ld = Math.abs(thirds.lowerFaceDeviation);
    if (thirds.foreheadDeviation > 0.15) add(hairstyleProportions.longForehead, HAIRSTYLE_WEIGHTS.foreheadThird, fd);
    if (thirds.foreheadDeviation < -0.15) add(hairstyleProportions.shortForehead, HAIRSTYLE_WEIGHTS.foreheadThird, fd);
    if (thirds.midfaceDeviation > 0.15) add(hairstyleProportions.longMidface, HAIRSTYLE_WEIGHTS.midfaceThird, md);
    if (thirds.midfaceDeviation < -0.15) add(hairstyleProportions.shortMidface, HAIRSTYLE_WEIGHTS.midfaceThird, md);
    if (thirds.lowerFaceDeviation > 0.15) add(hairstyleProportions.longLowerFace, HAIRSTYLE_WEIGHTS.lowerFaceThird, ld);
    if (thirds.lowerFaceDeviation < -0.15) add(hairstyleProportions.shortLowerFace, HAIRSTYLE_WEIGHTS.lowerFaceThird, ld);
  }

  // Jaw width — deviation from balanced jawCheekRatio ~0.80
  if (shape) {
    const jcr = shape.jawCheekRatio;
    if (jcr > 0.88) add(hairstyleProportions.wideJaw, HAIRSTYLE_WEIGHTS.jawWidth, (jcr - 0.80) / 0.80);
    else if (jcr < 0.72) add(hairstyleProportions.narrowJaw, HAIRSTYLE_WEIGHTS.jawWidth, (0.80 - jcr) / 0.80);
  }

  // Forehead width — deviation from balanced foreheadCheekRatio ~0.85
  if (shape) {
    const fcr = shape.foreheadCheekRatio;
    if (fcr > 0.95) add(hairstyleProportions.wideForehead, HAIRSTYLE_WEIGHTS.foreheadWidth, (fcr - 0.85) / 0.85);
    else if (fcr < 0.75) add(hairstyleProportions.narrowForehead, HAIRSTYLE_WEIGHTS.foreheadWidth, (0.85 - fcr) / 0.85);
  }

  // Cheekbone prominence — binary from face shape, deviation approximated
  if (faceShape === "diamond") add(hairstyleProportions.prominentCheekbones, HAIRSTYLE_WEIGHTS.cheekbones, 0.3);
  else if (faceShape === "round" || faceShape === "square") add(hairstyleProportions.flatCheekbones, HAIRSTYLE_WEIGHTS.cheekbones, 0.2);

  // Chin projection — binary label, use proportional chin data if available
  if (chinProjection === "short") {
    const dev = proportions?.chin?.ratio ? Math.abs(proportions.chin.ratio - 1.0) : 0.25;
    add(hairstyleProportions.shortChin, HAIRSTYLE_WEIGHTS.chinProjection, dev);
  } else if (chinProjection === "long") {
    const dev = proportions?.chin?.ratio ? Math.abs(proportions.chin.ratio - 1.0) : 0.25;
    add(hairstyleProportions.longChin, HAIRSTYLE_WEIGHTS.chinProjection, dev);
  }

  // Eye spacing — deviation from balanced ratio 1.0
  if (eyeSp) {
    const esr = eyeSp.ratio;
    if (esr > 1.2) add(hairstyleProportions.wideSetEyes, HAIRSTYLE_WEIGHTS.eyeSpacing, (esr - 1.0) / 1.0);
    else if (esr < 0.8) add(hairstyleProportions.closeSetEyes, HAIRSTYLE_WEIGHTS.eyeSpacing, (1.0 - esr) / 1.0);
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.content);
}

export function generateRecommendations(classification, gender, ageBracket) {
  const { faceShape, symmetry, chinProjection, undertone, textureSignals, hairType, eyeShape } = classification;
  const ht = hairType === "unknown" ? "straight" : hairType;

  const recommendations = { caveat: caveat.faceShapeDisclaimer };

  if (gender === "men") {
    recommendations.haircut =
      lookup(menHaircuts, faceShape, ht) ||
      lookup(menHaircuts, faceShape, "straight") ||
      lookup(menHaircuts, "oval", ht);

    if (ageBracket === "under18") {
      // Skip facial hair for teens — growth is typically sparse and still developing
    } else if (ageBracket === "18-24") {
      recommendations.facialHair = [
        menFacialHair.under25Tips.general,
        menFacialHair.under25Tips.edging,
        menFacialHair.under25Tips.skincare,
        menFacialHair.under25Tips.chinStrap,
      ];
    } else {
      const chinRec = lookup(menFacialHair, "byChinProjection", chinProjection);
      const faceRec = lookup(menFacialHair, "byFaceShape", faceShape);
      const maintenanceRecs = Object.values(menFacialHair.maintenanceLevels);
      recommendations.facialHair = [chinRec, faceRec, ...maintenanceRecs].filter(Boolean);
    }

    recommendations.hairstyleNotes = buildHairstyleProportionNotes(classification);

    recommendations.glasses = lookup(menGlasses, faceShape);
    recommendations.glassesFit = menGlasses.fitNote;

    recommendations.styleArchetypes = Object.values(menStyleArchetypes);
  } else {
    recommendations.hairstyle =
      lookup(womenHairstyles, faceShape, ht) ||
      lookup(womenHairstyles, faceShape, "straight") ||
      lookup(womenHairstyles, "oval", ht);

    recommendations.hairstyleNotes = buildHairstyleProportionNotes(classification);

    if (ageBracket !== "under18") {
      recommendations.contour = lookup(womenMakeup, "contourByFaceShape", faceShape);
      recommendations.makeupTechnique = Object.values(womenMakeup.generalTechnique);
      recommendations.makeupTone = lookup(womenMakeup, "toneByUndertone", undertone);

      const primaryEye = eyeShape.includes("-") ? eyeShape.split("-")[0] : eyeShape;
      recommendations.eyeMakeup =
        lookup(womenEyeMakeup, "byEyeShape", primaryEye) ||
        lookup(womenEyeMakeup, "byEyeShape", "almond");
      recommendations.eyeMakeupTechnique = Object.values(womenEyeMakeup.generalTechnique);
    }

    recommendations.glasses = lookup(womenGlasses, faceShape);
    recommendations.glassesFit = womenGlasses.fitNote;

    recommendations.styleArchetypes = Object.values(womenStyleArchetypes);
  }

  if (ageBracket !== "under18") {
    recommendations.hairColor = lookup(hairColor, undertone);
    if (hairColor.contrastNote) {
      recommendations.hairColorNote = hairColor.contrastNote;
    }
  }

  const skinRoutines = [];
  for (const signal of textureSignals) {
    const routine = lookup(skincare, "byTextureSignal", signal);
    if (routine) skinRoutines.push(routine);
  }
  if (skinRoutines.length === 0) {
    skinRoutines.push(skincare.byTextureSignal.balanced);
  }
  recommendations.skincare = skinRoutines;

  const ageKey = ageBracketKey(ageBracket);
  recommendations.skincareAge = lookup(skincare, "byAgeBracket", ageKey);
  recommendations.skincarePrinciples = Object.values(skincare.principles);

  recommendations.symmetryNote = symmetry !== "balanced"
    ? {
        title: "Part Direction Suggestion",
        body: symmetry === "left-fuller"
          ? "Your left side reads slightly fuller — parting your hair to the right can balance this, drawing the eye toward your more defined side."
          : "Your right side reads slightly fuller — parting your hair to the left can balance this, drawing the eye toward your more defined side.",
      }
    : null;

  recommendations.confidence = Object.values(confidence);
  recommendations.posture = Object.values(posture);
  recommendations.lifestyle = Object.values(lifestyle);

  recommendations.harmony = buildHarmonySections(classification, gender, ageBracket);

  if (ageBracket === "under18") {
    recommendations.teenNote = {
      title: "Your Features Are Still Developing",
      body: "Between ages 14 and 18, facial bones — especially the jaw, chin, and brow ridge — are still growing and reshaping. Your face shape, proportions, and even skin texture will continue to change through your late teens and into your early twenties. The recommendations here are based on how your features look right now, but don't take them as fixed — what fits today may shift as your bone structure matures. Focus on the basics (skincare, grooming habits, and personal style) rather than trying to correct proportions that are still in motion."
    };
  }

  return recommendations;
}
