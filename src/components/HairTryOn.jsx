import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { getStylesForGender } from "../lib/hair/database.js";
import { rankStyles } from "../lib/hair/harmony.js";
import { renderHairOverlay, estimateHairColor } from "../lib/hair/renderer.js";

function StyleCard({ item, selected, onClick, rank }) {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full p-3 rounded-sm border transition-colors ${
        selected
          ? "border-ink bg-ink/5"
          : "border-stone/40 hover:border-clay"
      }`}
    >
      <div className="flex items-start gap-2">
        {rank != null && (
          <span className="text-xs font-bold text-sage bg-sage/10 px-1.5 py-0.5 rounded-sm shrink-0">
            #{rank}
          </span>
        )}
        <div className="min-w-0">
          <div className="font-display text-sm font-semibold text-ink truncate">
            {item.style.name}
          </div>
          <p className="text-xs text-clay mt-0.5 line-clamp-2">
            {item.style.description}
          </p>
          {item.reasons.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {item.reasons.slice(0, 2).map((r, i) => (
                <div
                  key={i}
                  className={`text-xs ${
                    r.type === "positive" ? "text-sage" : "text-clay"
                  }`}
                >
                  {r.type === "positive" ? "+" : "-"} {r.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function FlawCard({ currentAnalysis }) {
  if (!currentAnalysis) return null;
  const { flaws, strengths, summary } = currentAnalysis;

  return (
    <div className="border border-stone/50 rounded-sm p-4 bg-warm-white">
      <h4 className="font-display text-sm font-semibold text-ink mb-2">
        Your Current Style Analysis
      </h4>
      <p className="text-xs text-charcoal leading-relaxed mb-2">{summary}</p>
      {strengths.length > 0 && (
        <div className="mb-1.5">
          {strengths.map((s, i) => (
            <div key={i} className="text-xs text-sage">+ {s.text}</div>
          ))}
        </div>
      )}
      {flaws.length > 0 && (
        <div>
          {flaws.map((f, i) => (
            <div key={i} className="text-xs text-clay">- {f.text}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HairTryOn({
  frontPhotoUrl,
  landmarks,
  imageWidth,
  imageHeight,
  classification,
  gender,
  frontImageData,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [heightMul, setHeightMul] = useState(1.0);
  const [widthMul, setWidthMul] = useState(1.0);
  const [opacity, setOpacity] = useState(0.55);
  const [hairColor, setHairColor] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [filterMode, setFilterMode] = useState("recommended");
  const [currentStyleId, setCurrentStyleId] = useState(null);

  const detectedColor = useMemo(() => {
    if (!frontImageData || !landmarks) return "#3d2b1f";
    return estimateHairColor(frontImageData, landmarks, imageWidth, imageHeight);
  }, [frontImageData, landmarks, imageWidth, imageHeight]);

  const effectiveColor = hairColor || detectedColor;

  const ranked = useMemo(() => {
    if (!classification) return [];
    return rankStyles(classification, gender);
  }, [classification, gender]);

  const displayStyles = useMemo(() => {
    if (filterMode === "recommended") return ranked.slice(0, 10);
    if (filterMode === "all") return ranked;
    if (filterMode === "avoid") return [...ranked].reverse().slice(0, 5);
    return ranked;
  }, [ranked, filterMode]);

  const currentAnalysis = useMemo(() => {
    if (!currentStyleId || !ranked.length) return null;
    const match = ranked.find((r) => r.style.id === currentStyleId);
    if (!match) return null;
    return {
      style: match.style,
      score: match.score,
      flaws: match.reasons.filter((r) => r.type === "negative"),
      strengths: match.reasons.filter((r) => r.type === "positive"),
      summary: match.reasons.filter((r) => r.type === "negative").length === 0
        ? "This style works well with your proportions — no major issues."
        : `This style has some proportion mismatches: ${match.reasons
            .filter((r) => r.type === "negative")
            .map((f) => f.text.toLowerCase())
            .join("; ")}. Consider a style that better addresses these areas.`,
    };
  }, [currentStyleId, ranked]);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !landmarks) return;

    canvas.width = imageWidth;
    canvas.height = imageHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, imageWidth, imageHeight);

    if (!selectedStyle || !showOverlay) return;

    renderHairOverlay(ctx, landmarks, imageWidth, imageHeight, selectedStyle, {
      heightMultiplier: heightMul,
      widthMultiplier: widthMul,
      color: effectiveColor,
      opacity,
    });
  }, [landmarks, imageWidth, imageHeight, selectedStyle, heightMul, widthMul, effectiveColor, opacity, showOverlay]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  useEffect(() => {
    if (ranked.length > 0 && !selectedStyle) {
      setSelectedStyle(ranked[0].style);
    }
  }, [ranked, selectedStyle]);

  const allStyles = useMemo(() => {
    return getStylesForGender(gender === "men" ? "men" : "women");
  }, [gender]);

  return (
    <div className="space-y-6">
      {/* Preview area */}
      <div className="relative inline-block w-full max-w-lg mx-auto">
        <img
          ref={imgRef}
          src={frontPhotoUrl}
          alt="Front photo"
          className="w-full rounded-sm"
          style={{ display: "block" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        />
        {selectedStyle && (
          <div className="absolute bottom-2 left-2 bg-ink/80 text-paper px-2 py-1 rounded-sm text-xs">
            {selectedStyle.name}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-clay uppercase tracking-wider mb-1">
            Height
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={heightMul}
            onChange={(e) => setHeightMul(parseFloat(e.target.value))}
            className="w-full accent-ink"
          />
          <span className="text-xs text-clay">{(heightMul * 100).toFixed(0)}%</span>
        </div>
        <div>
          <label className="block text-xs text-clay uppercase tracking-wider mb-1">
            Width
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={widthMul}
            onChange={(e) => setWidthMul(parseFloat(e.target.value))}
            className="w-full accent-ink"
          />
          <span className="text-xs text-clay">{(widthMul * 100).toFixed(0)}%</span>
        </div>
        <div>
          <label className="block text-xs text-clay uppercase tracking-wider mb-1">
            Opacity
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full accent-ink"
          />
          <span className="text-xs text-clay">{(opacity * 100).toFixed(0)}%</span>
        </div>
        <div>
          <label className="block text-xs text-clay uppercase tracking-wider mb-1">
            Hair Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={effectiveColor}
              onChange={(e) => setHairColor(e.target.value)}
              className="w-8 h-8 rounded-sm border border-stone/40 cursor-pointer"
            />
            {hairColor && (
              <button
                onClick={() => setHairColor(null)}
                className="text-xs text-clay hover:text-ink"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
            showOverlay ? "border-ink bg-ink text-paper" : "border-stone text-charcoal"
          }`}
        >
          {showOverlay ? "Hide Overlay" : "Show Overlay"}
        </button>
      </div>

      {/* Current style analysis */}
      <div>
        <label className="block text-xs text-clay uppercase tracking-wider mb-2">
          Select your current hairstyle
        </label>
        <select
          value={currentStyleId || ""}
          onChange={(e) => setCurrentStyleId(e.target.value || null)}
          className="w-full border border-stone/40 rounded-sm p-2 text-sm text-ink bg-warm-white"
        >
          <option value="">— Select to see analysis —</option>
          {allStyles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {currentAnalysis && <div className="mt-3"><FlawCard currentAnalysis={currentAnalysis} /></div>}
      </div>

      {/* Style filter */}
      <div className="flex gap-2">
        {[
          { key: "recommended", label: "Top Picks" },
          { key: "all", label: "All Styles" },
          { key: "avoid", label: "Avoid" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterMode(f.key)}
            className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
              filterMode === f.key
                ? "border-ink bg-ink text-paper"
                : "border-stone text-charcoal hover:border-clay"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Style list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
        {displayStyles.map((item, i) => (
          <StyleCard
            key={item.style.id}
            item={item}
            rank={filterMode === "recommended" ? i + 1 : filterMode === "avoid" ? ranked.length - i : null}
            selected={selectedStyle?.id === item.style.id}
            onClick={() => {
              setSelectedStyle(item.style);
              setHeightMul(1.0);
              setWidthMul(1.0);
            }}
          />
        ))}
      </div>
    </div>
  );
}
