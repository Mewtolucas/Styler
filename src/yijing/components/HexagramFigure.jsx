import { lineValueToType } from '../logic/casting.js';

export default function HexagramFigure({ lines, size = 'md', showChanging = true, animate = false, binary = null }) {
  const sizes = {
    sm: { w: 48, h: 56, lineH: 4, gap: 5, strokeW: 2 },
    md: { w: 80, h: 96, lineH: 6, gap: 8, strokeW: 3 },
    lg: { w: 120, h: 140, lineH: 8, gap: 11, strokeW: 4 },
    xl: { w: 160, h: 180, lineH: 10, gap: 14, strokeW: 5 },
  };
  const s = sizes[size] || sizes.md;
  const totalH = 6 * s.lineH + 5 * s.gap;
  const padX = 16;
  const padY = (s.h - totalH) / 2;
  const markerSize = size === 'sm' ? 6 : size === 'lg' || size === 'xl' ? 12 : 8;

  const getLineData = (index) => {
    if (binary) {
      return { yin: binary[index] === '0', changing: false, marker: '' };
    }
    if (lines && lines[index]) {
      const val = typeof lines[index] === 'object' ? lines[index].lineValue : lines[index];
      const type = lineValueToType(val);
      return type;
    }
    return null;
  };

  const renderLine = (index) => {
    const data = getLineData(index);
    if (!data) return null;

    const y = padY + (5 - index) * (s.lineH + s.gap);
    const lineW = s.w - padX * 2;
    const gapW = lineW * 0.2;
    const delay = animate ? `${index * 0.15}s` : '0s';

    return (
      <g key={index} className={animate ? 'animate-build-line' : ''} style={{ animationDelay: delay }}>
        {data.yin ? (
          <>
            <rect x={padX} y={y} width={(lineW - gapW) / 2} height={s.lineH} rx={1} fill="currentColor" />
            <rect x={padX + (lineW + gapW) / 2} y={y} width={(lineW - gapW) / 2} height={s.lineH} rx={1} fill="currentColor" />
          </>
        ) : (
          <rect x={padX} y={y} width={lineW} height={s.lineH} rx={1} fill="currentColor" />
        )}
        {showChanging && data.changing && data.marker === '○' && (
          <circle
            cx={s.w / 2}
            cy={y + s.lineH / 2}
            r={markerSize / 2}
            fill="none"
            stroke="var(--color-cinnabar)"
            strokeWidth={1.5}
          />
        )}
        {showChanging && data.changing && data.marker === '×' && (
          <>
            <line
              x1={s.w / 2 - markerSize / 2.5} y1={y + s.lineH / 2 - markerSize / 2.5}
              x2={s.w / 2 + markerSize / 2.5} y2={y + s.lineH / 2 + markerSize / 2.5}
              stroke="var(--color-cinnabar)" strokeWidth={1.5}
            />
            <line
              x1={s.w / 2 + markerSize / 2.5} y1={y + s.lineH / 2 - markerSize / 2.5}
              x2={s.w / 2 - markerSize / 2.5} y2={y + s.lineH / 2 + markerSize / 2.5}
              stroke="var(--color-cinnabar)" strokeWidth={1.5}
            />
          </>
        )}
      </g>
    );
  };

  return (
    <svg
      width={s.w}
      height={s.h}
      viewBox={`0 0 ${s.w} ${s.h}`}
      className="text-ink"
      role="img"
      aria-label="Hexagram figure"
    >
      {[0, 1, 2, 3, 4, 5].map(renderLine)}
    </svg>
  );
}
