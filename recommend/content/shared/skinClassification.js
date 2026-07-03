const skinClassification = {
  twoAxes: {
    title: "Undertone and Depth Are Independent",
    body: "Skin has two genuinely independent properties: undertone (warm/cool/neutral/olive cast beneath the skin, constant regardless of tanning) and depth/shade (how light or dark the skin is). A deep skin tone can be warm, cool, neutral, or olive — exactly the same as a light skin tone. The tool tracks these separately so recommendations stay accurate rather than collapsing them into fixed combined buckets."
  },

  monkScale: {
    title: "Monk Skin Tone Scale for Depth",
    body: "The tool uses the Monk Skin Tone (MST) Scale — a 10-shade scale developed by Harvard sociologist Dr. Ellis Monk in partnership with Google (CC BY 4.0, skintone.google) — rather than Fitzpatrick. Fitzpatrick was designed to predict sunburn/UV risk and was originally built on light/Caucasian skin; it systematically under-represents darker tones. The MST scale is specifically designed to be perceptually distinct and evenly representative across the full range of human skin tones, validated in peer-reviewed dermatology research, and already used in FDA-facing clinical trials. Ten shades is close to the practical limit of what people can reliably distinguish — more sounds precise but reduces real-world reliability."
  },

  depthInTool: {
    title: "How Depth Drives Recommendations",
    body: "The 10 MST shades map to which foundation/concealer depth range to suggest and which contour/highlight shade-offset range is realistic. The '1–2 shades darker/lighter' guidance for contour and highlight is relative to the person's actual MST shade, not a generic assumption. This is purely descriptive placement on an evenly-spaced scale — never framed as a score, never compared to an ideal."
  },

  uiFraming: {
    title: "Depth Shown as Description, Not Number",
    body: "Don't show a raw 'MST shade 6' label — that reads clinically. Instead, use it internally to select the right depth range of product suggestions (e.g. 'look for foundation shades described as deep golden') the same way undertone classification drives descriptive guidance rather than a raw label."
  }
};

module.exports = skinClassification;
