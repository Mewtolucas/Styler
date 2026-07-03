const styleBuilder = {
  description: {
    title: "Mix-and-Match Style Dimensions",
    body: "Rather than sorting into one of three fixed archetypes, combine independent style dimensions for a genuinely unique direction per person. Cross-reference dimension choices with face shape, hair type, and undertone classifications to generate specific suggestions under that combination."
  },

  dimensions: {
    silhouette: {
      title: "Silhouette Preference",
      body: "Choose your fit direction: structured/tailored (fitted, defined lines), relaxed/flowing (loose, soft draping), or mixed (structured on top or bottom, relaxed on the other — e.g. fitted top with wide-leg trousers)."
    },
    colorApproach: {
      title: "Color Approach",
      body: "Choose your palette direction: monochrome/neutral-based (tonal outfits, black/white/grey/beige core), bold/statement color (one strong color as focal point per outfit), or earthy/muted palette (olive, rust, cream, warm browns). Earthy/muted suggestions should lean into whichever specific tones complement your undertone rather than a generic set."
    },
    textureDetail: {
      title: "Texture and Detail Level",
      body: "Choose your complexity level: minimal and clean (simple lines, little pattern or embellishment), layered and textured (knits, layering pieces, varied fabric textures), or eclectic/mixed-pattern (more willing to combine prints and textures)."
    },
    eraInfluence: {
      title: "Era Influence (Optional)",
      body: "A lower-stakes, more playful dimension: classic/timeless, retro-inflected (specific decade influence like 70s or 90s), contemporary/current, or avant-garde/directional."
    },
    groomingIntensity: {
      title: "Grooming Intensity",
      body: "Maps onto existing maintenance-level content: low-effort/natural, polished/defined, or high-maintenance/editorial. This connects directly to the facial hair maintenance levels and makeup routine complexity already in the tool."
    }
  },

  outputFormat: {
    title: "Combinatorial Output, Not Single Archetype",
    body: "Rather than naming a single archetype, describe the combination directly — e.g. 'Your style direction: structured silhouettes, earthy muted palette suited to your warm undertone, minimal detail, classic-leaning, with a polished grooming routine' — followed by 4–6 concrete suggestions (specific piece types, a haircut/style pairing from the face-shape sections, a grooming routine level) that embody that specific combination."
  }
};

export default styleBuilder;
