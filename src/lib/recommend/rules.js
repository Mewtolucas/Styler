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

  return recommendations;
}
