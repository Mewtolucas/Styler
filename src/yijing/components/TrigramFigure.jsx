export default function TrigramFigure({ bits, size = 'sm' }) {
  const sizes = {
    sm: { w: 32, h: 28, lineH: 4, gap: 4 },
    md: { w: 48, h: 40, lineH: 5, gap: 5 },
    lg: { w: 64, h: 52, lineH: 6, gap: 7 },
  };
  const s = sizes[size] || sizes.sm;
  const padX = 4;
  const totalH = 3 * s.lineH + 2 * s.gap;
  const padY = (s.h - totalH) / 2;
  const lineW = s.w - padX * 2;
  const gapW = lineW * 0.22;

  return (
    <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`} className="text-ink" role="img" aria-label="Trigram">
      {[0, 1, 2].map(i => {
        const isYin = bits[i] === '0';
        const y = padY + (2 - i) * (s.lineH + s.gap);
        return isYin ? (
          <g key={i}>
            <rect x={padX} y={y} width={(lineW - gapW) / 2} height={s.lineH} rx={1} fill="currentColor" />
            <rect x={padX + (lineW + gapW) / 2} y={y} width={(lineW - gapW) / 2} height={s.lineH} rx={1} fill="currentColor" />
          </g>
        ) : (
          <rect key={i} x={padX} y={y} width={lineW} height={s.lineH} rx={1} fill="currentColor" />
        );
      })}
    </svg>
  );
}
