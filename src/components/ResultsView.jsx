import { useState } from "react";

function Card({ item }) {
  if (!item) return null;
  return (
    <div className="border border-stone/50 rounded-sm p-5 bg-warm-white">
      <h4 className="font-display text-base font-semibold text-ink mb-2">
        {item.title}
      </h4>
      <p className="text-sm text-charcoal leading-relaxed">{item.body}</p>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-stone/40 pt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-4 group"
      >
        <h3 className="font-display text-xl font-semibold text-ink tracking-tight">
          {title}
        </h3>
        <span className="text-clay text-sm group-hover:text-ink transition-colors">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  );
}

function ShapeLabel({ label, description }) {
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <span className="font-display text-2xl font-bold text-ink capitalize">
        {label}
      </span>
      {description && (
        <span className="text-sm text-clay">{description}</span>
      )}
    </div>
  );
}

const SHAPE_DESCRIPTIONS = {
  oval: "Balanced proportions, slightly longer than wide",
  round: "Similar width and length, softer angles",
  square: "Strong jaw, similar width across forehead, cheeks, and jaw",
  heart: "Wider forehead tapering to a narrower chin",
  oblong: "Notably longer than wide, with even proportions",
  diamond: "Prominent cheekbones, narrower forehead and jaw",
  triangle: "Broader jaw, narrower forehead",
};

export default function ResultsView({ classification, recommendations, gender, frontPhoto, landmarks }) {
  const isMen = gender === "men";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-clay mb-2">
          Your results
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight">
          Style Recommendations
        </h2>
      </div>

      <div className="bg-warm-white border border-stone/40 rounded-sm p-6 text-center">
        <p className="text-sm text-clay italic leading-relaxed max-w-xl mx-auto">
          {recommendations.caveat.body}
        </p>
      </div>

      <div className="bg-warm-white border border-stone/40 rounded-sm p-6">
        <p className="text-xs uppercase tracking-[0.15em] text-clay mb-2">
          Face shape
        </p>
        <ShapeLabel
          label={classification.faceShape}
          description={SHAPE_DESCRIPTIONS[classification.faceShape]}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Hair type</span>
            <span className="text-ink capitalize">{classification.hairType === "unknown" ? "Not detected" : classification.hairType}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Undertone</span>
            <span className="text-ink capitalize">{classification.undertone}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Symmetry</span>
            <span className="text-ink capitalize">{classification.symmetry.replace("-", " ")}</span>
          </div>
          {!isMen && (
            <div>
              <span className="text-clay block text-xs uppercase tracking-wider mb-1">Eye shape</span>
              <span className="text-ink capitalize">{classification.eyeShape.replace("-", " / ")}</span>
            </div>
          )}
        </div>
      </div>

      <Section title={isMen ? "Haircut" : "Hairstyle"}>
        <Card item={isMen ? recommendations.haircut : recommendations.hairstyle} />
        {recommendations.symmetryNote && <Card item={recommendations.symmetryNote} />}
      </Section>

      {isMen && recommendations.facialHair && (
        <Section title="Facial Hair">
          {recommendations.facialHair.map((item, i) => (
            <Card key={i} item={item} />
          ))}
        </Section>
      )}

      {!isMen && (
        <Section title="Contour & Highlight">
          <Card item={recommendations.contour} />
          {recommendations.makeupTone && <Card item={recommendations.makeupTone} />}
          {recommendations.makeupTechnique?.map((item, i) => (
            <Card key={i} item={item} />
          ))}
        </Section>
      )}

      {!isMen && recommendations.eyeMakeup && (
        <Section title="Eye Makeup">
          <Card item={recommendations.eyeMakeup} />
          {recommendations.eyeMakeupTechnique?.map((item, i) => (
            <Card key={i} item={item} />
          ))}
        </Section>
      )}

      <Section title="Eyewear">
        <Card item={recommendations.glasses} />
        <Card item={recommendations.glassesFit} />
      </Section>

      <Section title="Hair Color">
        <Card item={recommendations.hairColor} />
        {recommendations.hairColorNote && <Card item={recommendations.hairColorNote} />}
      </Section>

      <Section title="Skincare Routine">
        {recommendations.skincare?.map((item, i) => (
          <Card key={i} item={item} />
        ))}
        {recommendations.skincareAge && <Card item={recommendations.skincareAge} />}
        {recommendations.skincarePrinciples?.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </Section>

      <Section title="Style Direction" defaultOpen={false}>
        {recommendations.styleArchetypes?.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </Section>

      <Section title="Confidence & Presentation" defaultOpen={false}>
        {recommendations.confidence?.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </Section>

      <Section title="Posture & Bearing" defaultOpen={false}>
        {recommendations.posture?.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </Section>

      <Section title="Lifestyle" defaultOpen={false}>
        {recommendations.lifestyle?.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </Section>

      <div className="border-t border-stone/40 pt-8 pb-12 text-center">
        <p className="text-xs text-clay">
          All photos were processed locally in your browser and are not stored or sent anywhere.
        </p>
      </div>
    </div>
  );
}
