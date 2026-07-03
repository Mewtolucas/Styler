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
    case "under25": return "under25";
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

function buildHarmonySections(classification, gender) {
  const { faceShape, symmetry, chinProjection, undertone, textureSignals, hairType, skinDepth, proportions } = classification;
  const isMen = gender === "men";
  const sections = [];

  const addSection = (category, key, filter) => {
    const section = lookup(proportionHarmony, category, key);
    if (!section) return;
    let techniques = section.techniques;
    if (filter) techniques = techniques.filter(filter);
    if (techniques.length > 0) {
      sections.push({ title: section.title, techniques });
    }
  };

  const genderFilter = (t) => {
    if (isMen && t.area.includes("(Women)")) return false;
    if (!isMen && t.area.includes("(Men)")) return false;
    return true;
  };

  if (proportions?.faceShape) {
    const lr = proportions.faceShape.lengthCheekRatio;
    if (lr > 1.5) addSection("faceLength", "long", genderFilter);
    else if (lr < 1.2) addSection("faceLength", "short", genderFilter);
  }

  if (proportions?.faceShape) {
    const jcr = proportions.faceShape.jawCheekRatio;
    if (jcr > 0.88) addSection("jawWidth", "wide", genderFilter);
    else if (jcr < 0.72) addSection("jawWidth", "narrow", genderFilter);
  }

  if (proportions?.faceShape) {
    const fcr = proportions.faceShape.foreheadCheekRatio;
    if (fcr > 0.95) addSection("foreheadBalance", "wide", genderFilter);
    else if (fcr < 0.75) addSection("foreheadBalance", "narrow", genderFilter);
  }

  if (faceShape === "diamond") {
    addSection("cheekboneProminence", "prominent", genderFilter);
  } else if (faceShape === "round" || faceShape === "square") {
    addSection("cheekboneProminence", "flat", genderFilter);
  }

  if (chinProjection === "short") addSection("chinProjection", "short", genderFilter);
  else if (chinProjection === "long") addSection("chinProjection", "long", genderFilter);

  if (symmetry === "left-fuller") addSection("symmetry", "leftFuller", genderFilter);
  else if (symmetry === "right-fuller") addSection("symmetry", "rightFuller", genderFilter);

  const primaryEye = classification.eyeShape?.includes("-")
    ? classification.eyeShape.split("-")[0]
    : classification.eyeShape;
  const eyeMap = { round: "round", narrow: "narrow", upturned: "upturned", downturned: "downturned", monolid: "monolid" };
  if (eyeMap[primaryEye]) addSection("eyeShape", eyeMap[primaryEye], genderFilter);

  if (undertone) addSection("skinUndertone", undertone, genderFilter);

  if (textureSignals) {
    for (const signal of textureSignals) {
      const texMap = { oiliness: "oily", dryness: "dry", redness: "redness" };
      if (texMap[signal]) addSection("skinTexture", texMap[signal], genderFilter);
    }
  }

  const ht = hairType === "unknown" ? null : hairType;
  if (ht) addSection("hairTexture", ht, genderFilter);

  const depthKey = skinDepthCategory(skinDepth);
  addSection("skinDepth", depthKey, genderFilter);

  addSection("faceShapeOutfits", faceShape, genderFilter);

  return sections;
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

    if (ageBracket === "under25") {
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

    recommendations.glasses = lookup(menGlasses, faceShape);
    recommendations.glassesFit = menGlasses.fitNote;

    recommendations.styleArchetypes = Object.values(menStyleArchetypes);
  } else {
    recommendations.hairstyle =
      lookup(womenHairstyles, faceShape, ht) ||
      lookup(womenHairstyles, faceShape, "straight") ||
      lookup(womenHairstyles, "oval", ht);

    recommendations.contour = lookup(womenMakeup, "contourByFaceShape", faceShape);
    recommendations.makeupTechnique = Object.values(womenMakeup.generalTechnique);
    recommendations.makeupTone = lookup(womenMakeup, "toneByUndertone", undertone);

    const primaryEye = eyeShape.includes("-") ? eyeShape.split("-")[0] : eyeShape;
    recommendations.eyeMakeup =
      lookup(womenEyeMakeup, "byEyeShape", primaryEye) ||
      lookup(womenEyeMakeup, "byEyeShape", "almond");
    recommendations.eyeMakeupTechnique = Object.values(womenEyeMakeup.generalTechnique);

    recommendations.glasses = lookup(womenGlasses, faceShape);
    recommendations.glassesFit = womenGlasses.fitNote;

    recommendations.styleArchetypes = Object.values(womenStyleArchetypes);
  }

  recommendations.hairColor = lookup(hairColor, undertone);
  if (hairColor.contrastNote) {
    recommendations.hairColorNote = hairColor.contrastNote;
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

  recommendations.harmony = buildHarmonySections(classification, gender);

  return recommendations;
}
