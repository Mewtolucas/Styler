const menHaircuts = require("./men/haircuts");
const menFacialHair = require("./men/facialHair");
const menGlasses = require("./men/glasses");
const menStyleArchetypes = require("./men/styleArchetypes");

const womenHairstyles = require("./women/hairstyles");
const womenMakeup = require("./women/makeup");
const womenGlasses = require("./women/glasses");
const womenStyleArchetypes = require("./women/styleArchetypes");

const hairColor = require("./shared/hairColor");
const skincare = require("./shared/skincare");
const confidence = require("./shared/confidence");
const posture = require("./shared/posture");
const lifestyle = require("./shared/lifestyle");
const caveat = require("./shared/caveat");

const measurements = require("./reference/measurements");

module.exports = {
  men: {
    haircuts: menHaircuts,
    facialHair: menFacialHair,
    glasses: menGlasses,
    styleArchetypes: menStyleArchetypes,
  },
  women: {
    hairstyles: womenHairstyles,
    makeup: womenMakeup,
    glasses: womenGlasses,
    styleArchetypes: womenStyleArchetypes,
  },
  shared: {
    hairColor,
    skincare,
    confidence,
    posture,
    lifestyle,
    caveat,
  },
  reference: {
    measurements,
  },
};
