const skincare = {
  byTextureSignal: {
    dryness: {
      title: "Hydration-Focused Routine",
      body: "AM: Gentle, non-foaming cream or lotion cleanser → lightweight hydrating serum (hyaluronic acid) if desired → cream-based moisturizer → SPF 30+. PM: Same gentle cleanser → richer, thicker moisturizer, ideally with ceramides to support the skin barrier. Avoid high-alcohol toners and harsh foaming cleansers, which strip natural oils. Gentle chemical exfoliation only, 1–2 times weekly max."
    },
    oiliness: {
      title: "Oil-Control Routine",
      body: "AM: Gel or foam cleanser → lightweight, oil-free moisturizer (yes, oily skin still needs moisturizer — skipping it can trigger more oil production) → SPF 30+ (look for oil-free or matte formulas). PM: Same cleanser → lightweight moisturizer; optional clay mask once weekly. Non-comedogenic product labeling matters more here than for other skin types."
    },
    redness: {
      title: "Soothing, Minimal-Ingredient Routine",
      body: "AM and PM: Fragrance-free, minimal-ingredient products throughout. Ceramide or centella-based soothing formulas work well. Avoid physical (scrub-based) exfoliants entirely. Patch-test new products on the inner arm for 48 hours before facial use. If redness is persistent rather than occasional, a dermatologist can help identify whether it's a routine issue or something like rosacea that benefits from professional guidance."
    },
    textured: {
      title: "Texture-Smoothing Routine",
      body: "AM: Gentle cleanser → vitamin C serum (antioxidant, pollution protection) → moisturizer → SPF 30+ (non-negotiable — sun exposure is a major driver of visible texture over time). PM: Cleanser → gentle chemical exfoliant (AHA/BHA, low concentration, 2–3 times weekly, not nightly) → moisturizer. Consistency over time matters more than product-switching for texture specifically."
    },
    balanced: {
      title: "Maintenance Routine",
      body: "AM: Gentle cleanser → lightweight moisturizer → daily SPF. PM: Cleanser → moisturizer. Maintenance-focused — no active correction needed. This is a good baseline routine regardless of other signals if you want to keep things simple."
    }
  },

  byAgeBracket: {
    under25: {
      title: "Establish the Basics",
      body: "Focus on establishing consistent basics — cleanse, moisturize, daily SPF — before introducing actives. SPF is the single highest-impact long-term habit at any age, and establishing it early compounds over time. Get the foundation right before adding serums or treatments."
    },
    age25to40: {
      title: "Introduce Targeted Actives",
      body: "You can introduce actives alongside your basics if not already using them — retinoid at night, vitamin C in the morning. Start slowly (a few nights a week) and increase as tolerated rather than starting nightly. Introduce one new product at a time so you can tell what's helping or causing irritation."
    },
    age40to60: {
      title: "Hydration and Barrier Support",
      body: "Emphasis on hydration and consistent SPF. Add barrier-supporting ingredients — ceramides, peptides — alongside any existing actives. If using both retinoid and exfoliating acids, alternate nights rather than stacking them, since combining strong actives increases irritation risk."
    },
    over60: {
      title: "Gentle, Hydrating Formulas",
      body: "Emphasis on gentle, hydrating formulas over strong actives. Consistent SPF remains the highest-impact habit at any age. Prioritize comfort and hydration — the skin barrier needs more support and less aggressive treatment."
    }
  },

  principles: {
    applicationOrder: {
      title: "Product Application Order",
      body: "Apply thinnest and lightest formulas first, thickest last. Sunscreen is always the final morning step, never layered under other products. This ensures each product can absorb properly rather than being blocked by a heavier layer above it."
    },
    oneAtATime: {
      title: "Introduce Products One at a Time",
      body: "Introduce one new product at a time. This isn't just cautious advice — it's the only way to identify what's helping or causing irritation. If you add three products at once and your skin improves or reacts, you won't know which one did it."
    }
  }
};

module.exports = skincare;
