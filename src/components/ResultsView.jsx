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

function ProportionGroup({ title, data, result }) {
  if (!data) return null;
  const fmt = (v) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(4);
    return String(v);
  };
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-semibold text-ink text-sm">{title}</span>
        {result && <span className="text-sage font-bold">{result}</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-0.5">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <span className="text-clay">{k}</span>
            <span className="text-ink tabular-nums">{fmt(v)}</span>
          </div>
        ))}
      </div>
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

      {recommendations.teenNote && (
        <div className="bg-warm-white border border-stone/40 rounded-sm p-6">
          <h3 className="font-display text-base font-semibold text-ink mb-2">
            {recommendations.teenNote.title}
          </h3>
          <p className="text-sm text-charcoal leading-relaxed">
            {recommendations.teenNote.body}
          </p>
        </div>
      )}

      <div className="bg-warm-white border border-stone/40 rounded-sm p-6">
        <p className="text-xs uppercase tracking-[0.15em] text-clay mb-2">
          Face shape
        </p>
        <ShapeLabel
          label={classification.faceShape}
          description={SHAPE_DESCRIPTIONS[classification.faceShape]}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-3 text-sm">
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Face ratio</span>
            <span className="text-ink capitalize">{classification.faceRatio}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Facial thirds</span>
            <span className="text-ink capitalize">{classification.facialThirds}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Eye spacing</span>
            <span className="text-ink capitalize">{classification.eyeSpacing?.replace("-", " ")}</span>
          </div>
          {!isMen && (
            <div>
              <span className="text-clay block text-xs uppercase tracking-wider mb-1">Eye shape</span>
              <span className="text-ink capitalize">{classification.eyeShape.replace("-", " / ")}</span>
            </div>
          )}
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Nose length</span>
            <span className="text-ink capitalize">{classification.noseLength}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Nose width</span>
            <span className="text-ink capitalize">{classification.noseWidth}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Lip fullness</span>
            <span className="text-ink capitalize">{classification.lipFullness}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Lip balance</span>
            <span className="text-ink capitalize">{classification.lipBalance}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Lip posture</span>
            <span className="text-ink capitalize">{classification.lipPosture}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Brow arch</span>
            <span className="text-ink capitalize">{classification.browArch?.replace("-", " ")}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Brow shape</span>
            <span className="text-ink capitalize">{classification.browShape}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Brow thickness</span>
            <span className="text-ink capitalize">{classification.browThickness}</span>
          </div>
          <div>
            <span className="text-clay block text-xs uppercase tracking-wider mb-1">Brow position</span>
            <span className="text-ink capitalize">{classification.browPosition?.replace("-", " ")}</span>
          </div>
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

      {recommendations.harmony?.length > 0 && (
        <>
          <div className="text-center mt-12 mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-clay mb-2">
              Personalized for your features
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
              Proportion Harmony
            </h2>
          </div>
          {recommendations.harmony.map((section, si) => (
            <Section key={si} title={section.title} defaultOpen={si < 3}>
              {section.techniques.map((tech, ti) => (
                <Card key={ti} item={{ title: tech.area, body: tech.body }} />
              ))}
            </Section>
          ))}
        </>
      )}

      {classification.proportions && (
        <Section title="Debug: Raw Proportions" defaultOpen={false}>
          <div className="bg-ink/5 rounded-sm p-4 space-y-5 text-xs font-mono overflow-x-auto">
            <ProportionGroup title="Face Shape" data={{
              "Jaw width": classification.proportions.faceShape?.jawWidth,
              "Cheekbone width": classification.proportions.faceShape?.cheekboneWidth,
              "Forehead width": classification.proportions.faceShape?.foreheadWidth,
              "Face length": classification.proportions.faceShape?.faceLength,
              "Jaw/Cheek ratio": classification.proportions.faceShape?.jawCheekRatio,
              "Forehead/Cheek ratio": classification.proportions.faceShape?.foreheadCheekRatio,
              "Length/Cheek ratio": classification.proportions.faceShape?.lengthCheekRatio,
            }} result={classification.faceShape} />

            <ProportionGroup title="Symmetry" data={{
              "Left total": classification.proportions.symmetry?.leftTotal,
              "Right total": classification.proportions.symmetry?.rightTotal,
              "Normalized diff": classification.proportions.symmetry?.normalizedDiff,
              "Face width": classification.proportions.symmetry?.faceWidth,
            }} result={classification.symmetry} />

            <ProportionGroup title="Chin Projection" data={{
              "Source": classification.proportions.chin?.source,
              "Front ratio": classification.proportions.chin?.frontRatio,
              "Chin-up ratio": classification.proportions.chin?.chinUpRatio,
              "Avg profile ratio": classification.proportions.chin?.avgProfileRatio,
              "Combined ratio": classification.proportions.chin?.combinedRatio,
              ...(classification.proportions.chin?.profileRatios?.length > 0
                ? Object.fromEntries(classification.proportions.chin.profileRatios.map(
                    (p, i) => [`Profile ${p.side} (${p.method})`, p.ratio]
                  ))
                : {}),
            }} result={classification.chinProjection} />

            <ProportionGroup title="Eyes (Left)" data={{
              "Width": classification.proportions.eyes?.leftEye?.width,
              "Height": classification.proportions.eyes?.leftEye?.height,
              "Aspect ratio": classification.proportions.eyes?.leftEye?.aspect,
              "Canthal tilt": classification.proportions.eyes?.leftEye?.canthalTilt,
              "Tilt normalized": classification.proportions.eyes?.leftEye?.tiltNorm,
              "Crease space": classification.proportions.eyes?.leftEye?.creaseSpace,
              "Crease ratio": classification.proportions.eyes?.leftEye?.creaseRatio,
            }} result={classification.proportions.eyes?.leftEye?.shape} />

            <ProportionGroup title="Eyes (Right)" data={{
              "Width": classification.proportions.eyes?.rightEye?.width,
              "Height": classification.proportions.eyes?.rightEye?.height,
              "Aspect ratio": classification.proportions.eyes?.rightEye?.aspect,
              "Canthal tilt": classification.proportions.eyes?.rightEye?.canthalTilt,
              "Tilt normalized": classification.proportions.eyes?.rightEye?.tiltNorm,
              "Crease space": classification.proportions.eyes?.rightEye?.creaseSpace,
              "Crease ratio": classification.proportions.eyes?.rightEye?.creaseRatio,
            }} result={classification.proportions.eyes?.rightEye?.shape} />

            <ProportionGroup title="Skin Undertone" data={{
              "Avg R": classification.proportions.undertone?.avgRgb?.r,
              "Avg G": classification.proportions.undertone?.avgRgb?.g,
              "Avg B": classification.proportions.undertone?.avgRgb?.b,
              "LAB L": classification.proportions.undertone?.lab?.L,
              "LAB a": classification.proportions.undertone?.lab?.a,
              "LAB b": classification.proportions.undertone?.lab?.b,
              "Green dominance": classification.proportions.undertone?.greenDominance,
            }} result={classification.undertone} />

            <ProportionGroup title="Skin Depth (MST)" data={{
              "Avg R": classification.proportions.skinDepth?.avgRgb?.r,
              "Avg G": classification.proportions.skinDepth?.avgRgb?.g,
              "Avg B": classification.proportions.skinDepth?.avgRgb?.b,
              "LAB L": classification.proportions.skinDepth?.lab?.L,
              "LAB a": classification.proportions.skinDepth?.lab?.a,
              "LAB b": classification.proportions.skinDepth?.lab?.b,
              "Closest distance": classification.proportions.skinDepth?.closestDistance,
            }} result={`Shade ${classification.skinDepth}`} />

            <ProportionGroup title="Skin Texture" data={{
              "Texture score": classification.proportions.texture?.textureScore,
              "Redness": classification.proportions.texture?.redness,
              "Dry/oily bright ratio": classification.proportions.texture?.dryOilyBrightRatio,
            }} result={classification.textureSignals?.join(", ")} />

            <ProportionGroup title="Hair Type" data={{
              "Avg edge magnitude": classification.proportions.hair?.avgEdge,
              "Sample count": classification.proportions.hair?.sampleCount,
            }} result={classification.hairType} />

            <ProportionGroup title="Face Ratio (W:H)" data={{
              "Value": classification.proportions.faceRatio?.value,
            }} result={classification.faceRatio} />

            <ProportionGroup title="Facial Thirds" data={{
              "Forehead height": classification.proportions.facialThirds?.foreheadHeight,
              "Midface height": classification.proportions.facialThirds?.midfaceHeight,
              "Lower face height": classification.proportions.facialThirds?.lowerFaceHeight,
              "Forehead deviation": classification.proportions.facialThirds?.foreheadDeviation,
              "Midface deviation": classification.proportions.facialThirds?.midfaceDeviation,
              "Lower face deviation": classification.proportions.facialThirds?.lowerFaceDeviation,
            }} result={classification.facialThirds} />

            <ProportionGroup title="Facial Fifths" data={{
              "Fifth 1 (edge→L eye)": classification.proportions.facialFifths?.fifth1,
              "Fifth 2 (L eye width)": classification.proportions.facialFifths?.fifth2,
              "Fifth 3 (eye spacing)": classification.proportions.facialFifths?.fifth3,
              "Fifth 4 (R eye width)": classification.proportions.facialFifths?.fifth4,
              "Fifth 5 (R eye→edge)": classification.proportions.facialFifths?.fifth5,
              "Ideal fifth": classification.proportions.facialFifths?.fifthIdeal,
            }} result={classification.eyeSpacing} />

            <ProportionGroup title="Eye Spacing" data={{
              "Spacing value": classification.proportions.eyeSpacing?.value,
              "L eye width": classification.proportions.eyeSpacing?.leftEyeWidth,
              "R eye width": classification.proportions.eyeSpacing?.rightEyeWidth,
              "Spacing/eye ratio": classification.proportions.eyeSpacing?.ratio,
            }} result={classification.eyeSpacing} />

            <ProportionGroup title="Nose" data={{
              "Length": classification.proportions.nose?.length?.value,
              "Face ratio": classification.proportions.nose?.length?.faceRatio,
              "Nostril width": classification.proportions.nose?.width?.nostrilWidth,
              "Bridge width": classification.proportions.nose?.width?.bridgeWidth,
              "Nostril/bridge ratio": classification.proportions.nose?.width?.ratio,
            }} result={`${classification.noseLength} length, ${classification.noseWidth} width`} />

            <ProportionGroup title="Lips" data={{
              "Upper thickness": classification.proportions.lips?.upperThickness,
              "Lower thickness": classification.proportions.lips?.lowerThickness,
              "Lip ratio (lower/upper)": classification.proportions.lips?.lipRatio,
              "Mouth width": classification.proportions.lips?.mouthWidth,
              "Mouth/face ratio": classification.proportions.lips?.mouthFaceRatio,
              "Cupid's bow dip": classification.proportions.lips?.cupidBowDip,
              "Corner tilt ratio": classification.proportions.lips?.cornerTiltRatio,
            }} result={`${classification.lipFullness}, ${classification.lipBalance}, ${classification.lipWidth} width, ${classification.lipPosture}`} />

            <ProportionGroup title="Brows" data={{
              "Avg length": classification.proportions.brows?.avgLength,
              "R arch height": classification.proportions.brows?.rightArchHeight,
              "L arch height": classification.proportions.brows?.leftArchHeight,
              "Avg arch position": classification.proportions.brows?.avgArchPosition,
              "Avg brow-eye gap": classification.proportions.brows?.avgBrowEyeGap,
              "Avg thickness": classification.proportions.brows?.avgThickness,
              "Thickness/length": classification.proportions.brows?.thicknessToLength,
              "Tail drop norm": classification.proportions.brows?.tailDropNorm,
            }} result={`${classification.browShape}, ${classification.browArch}, ${classification.browThickness}, ${classification.browPosition}`} />
          </div>
        </Section>
      )}

      <div className="border-t border-stone/40 pt-8 pb-12 text-center">
        <p className="text-xs text-clay">
          All photos were processed locally in your browser and are not stored or sent anywhere.
        </p>
      </div>
    </div>
  );
}
