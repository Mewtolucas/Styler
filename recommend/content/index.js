import menHaircuts from "./men/haircuts.js";
import menFacialHair from "./men/facialHair.js";
import menGlasses from "./men/glasses.js";
import menStyleArchetypes from "./men/styleArchetypes.js";

import womenHairstyles from "./women/hairstyles.js";
import womenMakeup from "./women/makeup.js";
import womenEyeMakeup from "./women/eyeMakeup.js";
import womenGlasses from "./women/glasses.js";
import womenStyleArchetypes from "./women/styleArchetypes.js";

import hairColor from "./shared/hairColor.js";
import skinClassification from "./shared/skinClassification.js";
import skincare from "./shared/skincare.js";
import styleBuilder from "./shared/styleBuilder.js";
import confidence from "./shared/confidence.js";
import posture from "./shared/posture.js";
import lifestyle from "./shared/lifestyle.js";
import caveat from "./shared/caveat.js";

import measurements from "./reference/measurements.js";

export default {
  men: {
    haircuts: menHaircuts,
    facialHair: menFacialHair,
    glasses: menGlasses,
    styleArchetypes: menStyleArchetypes,
  },
  women: {
    hairstyles: womenHairstyles,
    makeup: womenMakeup,
    eyeMakeup: womenEyeMakeup,
    glasses: womenGlasses,
    styleArchetypes: womenStyleArchetypes,
  },
  shared: {
    hairColor,
    skinClassification,
    skincare,
    styleBuilder,
    confidence,
    posture,
    lifestyle,
    caveat,
  },
  reference: {
    measurements,
  },
};
