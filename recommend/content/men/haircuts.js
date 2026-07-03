const menHaircuts = {
  oval: {
    straight: {
      title: "Textured Crop with Light Fringe",
      body: "A textured crop cut at low-to-medium elevation keeps weight through the top while the fringe adds casual structure. Oval is the most flexible shape — most cuts work — so this is about personal preference more than correction. A low or mid fade both work well here."
    },
    wavy: {
      title: "Medium-Length Textured Cut",
      body: "A medium-length cut at medium elevation lets your natural wave show through as texture. A side part is optional. Waves add volume on their own, so avoid over-thinning — the goal is to let the wave pattern do the work rather than fighting it."
    },
    curly: {
      title: "Curly Crop with Textured Fringe",
      body: "Keep the sides shorter and the top loose enough for curl definition. A curl-by-curl cutting approach (not a blunt uniform cut) preserves your curl shape as it dries and shrinks — this matters more than the overall length. Your balanced oval proportions handle most lengths well."
    },
    coily: {
      title: "Fade with Defined Top Texture",
      body: "A low-to-mid fade keeps the silhouette clean while the top carries volume — twist-outs or coil-out styles work well. The balanced oval proportions suit the tapered sides without needing much correction. Let the top texture be the focal point."
    }
  },
  square: {
    straight: {
      title: "Side-Swept Fringe with Textured Top",
      body: "A side-swept fringe with shorter sides, cut at moderate-to-high elevation on top, adds texture that softens the angularity of a square jaw rather than echoing it. A subtle side part with movement works better than very short, sharp-edged styles — boxy cuts emphasize the jaw's squareness."
    },
    wavy: {
      title: "Textured Quiff or Side Part",
      body: "Your wave pattern adds rounded softness at the crown that naturally balances a strong jawline — lean into that. A textured quiff or side part with visible movement contrasts the jaw's angularity through shape rather than length alone."
    },
    curly: {
      title: "Looser Curl Definition, Faded Sides",
      body: "Keep curl definition looser and longer on top with faded sides. Avoid very short, boxy silhouettes that echo the jaw shape — length and roundness on top contrasts the square jaw instead of repeating it."
    },
    coily: {
      title: "Rounded Top Shape with Tapered Sides",
      body: "A rounded top shape — afro, twist-out with a curved silhouette — works against the jaw's angularity. Tapered sides keep the look clean while the curved top provides the contrast a square face benefits from."
    }
  },
  round: {
    straight: {
      title: "Textured Crop with Crown Height",
      body: "Build vertical height at the crown using high elevation on top and tighter, shorter sides. Vertical height elongates a round face — avoid flat, wide silhouettes on top which emphasize roundness. The contrast between height and close sides is the key lever here."
    },
    wavy: {
      title: "Pompadour or Quiff with Upward Volume",
      body: "Concentrate volume upward rather than out to the sides. A pompadour or quiff uses your natural wave to build height, which elongates a round face. Keep the sides close to maximize the vertical contrast."
    },
    curly: {
      title: "High Textured Curl Volume",
      body: "Build height, not width — high, textured curl volume rather than a wide, full shape. The goal is vertical elongation, so keep the sides tighter and let the curls stack upward at the crown."
    },
    coily: {
      title: "High-Top Fade or Vertical Afro",
      body: "A high-top fade or vertically-shaped afro elongates a round face through height-focused styling. A high fade specifically (rather than low) adds the sharper contrast that works against a round face's soft angles — the bold transition from skin to volume creates the definition this shape benefits from."
    }
  },
  heart: {
    straight: {
      title: "Textured Fringe with Moderate Length",
      body: "A textured fringe with moderate length and medium sides — not faded too high, which would leave too much visual weight at the forehead. The goal is balancing a wider forehead against a narrower jaw and chin. Keep some weight at the sides rather than taking them very short."
    },
    wavy: {
      title: "Side-Swept Style with Side Weight",
      body: "A side-swept style that leaves some weight at the sides rather than fading them away. Keeping volume at the sides avoids emphasizing forehead width — your waves add natural movement that draws the eye away from the forehead-to-chin taper."
    },
    curly: {
      title: "Medium Curl Volume, Balanced Height",
      body: "Keep curl volume moderate — avoid extreme crown height which would further emphasize the forehead-to-chin taper. Medium volume distributed evenly works better than a tall, top-heavy shape for a heart-shaped face."
    },
    coily: {
      title: "Rounded Moderate-Height Shape",
      body: "A rounded, moderate-height shape rather than a high vertical silhouette keeps proportion balanced. Too much height draws the eye to the forehead area, which is already the widest point — a rounder, more contained shape works better."
    }
  },
  oblong: {
    straight: {
      title: "Fringe with Horizontal Weight",
      body: "A textured crop with fringe — not swept fully back — adds horizontal visual weight that balances face length. Keep overall length shorter and use a low fade to preserve width at the sides rather than add height. Avoid excessive crown height, which elongates further."
    },
    wavy: {
      title: "Side Part with Fuller Sides",
      body: "A side part with fuller sides adds horizontal volume that balances your face's length. Let the waves build outward rather than upward — the width is what provides the correction here, not height."
    },
    curly: {
      title: "Fuller, Wider Curl Shape",
      body: "Let your curls build a fuller, wider shape rather than a tall one. Width balances length for an oblong face — allow the curls to expand horizontally and keep overall height moderate."
    },
    coily: {
      title: "Wider Afro or Twist Shape",
      body: "A wider afro or twist shape rather than a high-top builds the horizontal volume an oblong face benefits from. A low fade preserves width at the sides rather than creating a tall, narrow silhouette."
    }
  },
  diamond: {
    straight: {
      title: "Fringe with Forehead Width",
      body: "A textured fringe swept forward adds visual width at the forehead, balancing it against prominent cheekbones. Tapered sides keep the cheekbone area from looking wider. The fringe is the key — it fills out a naturally narrow forehead."
    },
    wavy: {
      title: "Side-Swept with Front Volume",
      body: "A side-swept style with volume concentrated toward the front and top. The wave pattern adds natural fullness at the forehead area, which balances against the cheekbones — the widest point of a diamond face."
    },
    curly: {
      title: "Moderate Curl Volume at Front Hairline",
      body: "Concentrate curl volume toward the front hairline rather than at the sides. This fills out the forehead area and balances against the cheekbone width that dominates a diamond face shape."
    },
    coily: {
      title: "Rounded Shape with Fuller Front",
      body: "A rounded shape with more fullness toward the front of the head and tapered sides. The fuller front balances a narrow forehead while the taper avoids adding width at the cheekbones."
    }
  },
  triangle: {
    straight: {
      title: "Crown and Temple Volume",
      body: "Concentrate volume and texture at the crown and temples to widen the visual forehead area. Keep sides closer to avoid adding more width at the jaw, which is already the broadest point. Fringe or texture swept up and forward rather than down works best."
    },
    wavy: {
      title: "Temple Volume with Wave Movement",
      body: "Build volume through the top and sides at the temple level, not at the jawline. Your wave pattern adds natural fullness — direct it higher on the head to balance a broader jaw against a narrower forehead."
    },
    curly: {
      title: "Fuller Curls Higher, Closer Lower",
      body: "Build fuller curl volume higher on the head and keep it closer through the lower sides. The volume should be above the jaw line to add width where the face is narrower — at the forehead and temples."
    },
    coily: {
      title: "Higher-Volume Top, Tapered Lower Sides",
      body: "A rounded, higher-volume top shape with tapered lower sides — the inverse of the heart-shape approach. Build volume at the top and forehead area while keeping the jaw area visually quieter to balance a broad jaw against a narrower forehead."
    }
  }
};

export default menHaircuts;
