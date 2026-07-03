const womenHairstyles = {
  oval: {
    straight: {
      title: "Blunt or Layered Cut — Most Lengths Work",
      body: "Oval faces handle most lengths and styles well. Both blunt and layered cuts suit your balanced proportions — this is more about personal preference than correction. Choose based on maintenance level and styling time rather than face-shape rules."
    },
    wavy: {
      title: "Loose Layers with Natural Wave",
      body: "Loose layers that let your natural wave pattern show through. Oval faces handle volume at any length, so the main consideration is how much wave definition you want rather than face-shape correction."
    },
    curly: {
      title: "Layered Curly Cut with Curl-by-Curl Shaping",
      body: "A layered curly cut with curl-by-curl shaping that accounts for shrinkage as curls dry. Length is flexible given your balanced proportions — the key is a cutting technique that respects curl pattern rather than treating it like straight hair."
    },
    coily: {
      title: "Defined Coily Styles at Any Length",
      body: "Defined coily styles — twist-outs, natural curl shapes — work well at most lengths with oval proportions. You have the flexibility to choose based on preference and maintenance level rather than needing to correct for face shape."
    }
  },
  square: {
    straight: {
      title: "Soft Layers with Side-Swept Fringe",
      body: "Soft layers around the face with a side-swept fringe soften jaw angularity. The layers create movement that contrasts the jaw's straight lines — avoid blunt, one-length cuts that echo the angular shape."
    },
    wavy: {
      title: "Long Layers with Face-Framing Waves",
      body: "Long layers with face-framing waves — the movement softens strong jaw angles naturally. Your wave pattern does much of the softening work on its own; long layers direct that movement around the face."
    },
    curly: {
      title: "Longer Curls Past the Jawline",
      body: "Longer curl length falling past the jawline softens angularity more than a blunt curly bob at jaw-length would. The curls below the jaw create a visual transition rather than ending right at the face's sharpest angle."
    },
    coily: {
      title: "Longer Coily Styles or Above-Jaw Volume",
      body: "Longer coily styles or volume concentrated above the jaw rather than at jaw-width levels. The goal is to avoid framing the jaw at its widest point — place the volume higher or let length fall past it."
    }
  },
  round: {
    straight: {
      title: "Long Layers or Lob Past the Jawline",
      body: "Long layers or a lob (long bob) extending past the jawline elongates rather than adding width at the face's widest point. The vertical line created by length past the jaw is the main elongating effect."
    },
    wavy: {
      title: "Longer Waves with Crown Height",
      body: "Longer waves with some height at the crown. The vertical lift at the crown combined with length creates an elongating effect that balances a round face's equal width and height."
    },
    curly: {
      title: "Longer Curls — Avoid Jaw-Length Bobs",
      body: "Longer curl length is the key — avoid width-heavy curly bobs sitting right at the jawline, which adds width at the widest point. Let curls fall past the jaw to create a longer visual line."
    },
    coily: {
      title: "Height-Focused Styling",
      body: "Height-focused styling — higher crown volume rather than width at the sides. Build the volume upward to elongate, not outward to widen. The crown is where vertical lift makes the most difference."
    }
  },
  heart: {
    straight: {
      title: "Chin-Length or Longer with Side-Swept Fringe",
      body: "Chin-length or longer with a side-swept fringe to balance a wider forehead. The fringe narrows the forehead visually while length at or below the chin adds weight where the face is narrower."
    },
    wavy: {
      title: "Face-Framing Waves Starting Below the Chin",
      body: "Face-framing waves starting below the chin add width at the jaw and chin area, balancing the wider forehead. Direct the wave volume lower rather than at the crown or temple level."
    },
    curly: {
      title: "Curl Volume Concentrated Lower",
      body: "Curl volume concentrated from chin-length downward balances forehead width. Avoid building too much volume at the crown, which adds visual weight where the face is already widest."
    },
    coily: {
      title: "Fuller Volume Lower, Not at Crown",
      body: "Fuller volume concentrated lower down rather than at the crown or forehead area. Building volume below the cheekbone line adds width where a heart face is narrower, balancing the proportions."
    }
  },
  oblong: {
    straight: {
      title: "Blunt Cut with Fringe",
      body: "A blunt cut with fringe shortens visual face length — the horizontal fringe line interrupts the vertical. Avoid very long, straight-down styles that emphasize length. Shoulder-length or shorter with a fringe is the most effective combination."
    },
    wavy: {
      title: "Shoulder-Length Waves with Width",
      body: "Shoulder-length waves with some width add horizontal volume that balances a longer face. The wave pattern naturally builds outward, which is exactly what an oblong face benefits from."
    },
    curly: {
      title: "Fuller, Wider Curl Shape",
      body: "A fuller, wider curl shape rather than long and narrow. Let curls build horizontal volume — width is the balancing element for face length here."
    },
    coily: {
      title: "Wider Volume Shape",
      body: "A wider volume shape rather than elongated vertical styling. Build outward rather than upward — horizontal volume is what balances an oblong face's length."
    }
  },
  diamond: {
    straight: {
      title: "Side-Swept Fringe with Forehead Volume",
      body: "A side-swept fringe or volume at the forehead, kept narrower through the cheekbone area. The fringe fills out a narrow forehead while drawing attention away from the widest point at the cheekbones."
    },
    wavy: {
      title: "Temple-Starting Waves for Forehead Width",
      body: "Waves starting at the temple add width at the forehead, filling out the narrower area above the cheekbones. Direct wave volume toward the forehead and away from the cheekbone level."
    },
    curly: {
      title: "Curls Framing Forehead and Jaw",
      body: "Curl volume framing the forehead and jaw rather than the cheekbones. The goal is to add width where the face is narrower (top and bottom) rather than at its widest point."
    },
    coily: {
      title: "Fuller Front Volume, Tapered Mid-Face",
      body: "Fuller volume at the front with more taper through the mid-face. Build volume at the forehead level while keeping the cheekbone area less voluminous."
    }
  },
  triangle: {
    straight: {
      title: "Crown and Temple Layering",
      body: "Volume and layering concentrated at the crown and temple area to add width up top. Keep length past the jaw sleek rather than full — avoid adding more width at an already-broad jawline."
    },
    wavy: {
      title: "Higher-Starting Waves",
      body: "Waves starting higher — at the temple and cheekbone level — rather than at the jaw. Build wave volume above the jaw line to add width where the face is narrower."
    },
    curly: {
      title: "Fuller Curls Higher, Controlled at Jaw",
      body: "Fuller curl volume higher up, more controlled and sleek at the jaw and below. The volume should build above the jaw to add width at the narrower forehead area, not at the already-broad lower face."
    },
    coily: {
      title: "Rounded Crown Volume, Tapered Lower Sides",
      body: "A rounded, higher-volume shape at the crown with taper through the lower sides — the inverse of the heart-shape approach. Build up top where the face is narrower, taper where it's wider."
    }
  }
};

module.exports = womenHairstyles;
