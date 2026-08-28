interface RingProps {
  value: number;
  max: number;
  size: number;
  stroke: number;
  color: string;
  track?: string;
  children?: React.ReactNode;
}

/** Anneau de progression SVG animé (plafonné visuellement à 100 %). */
export default function Ring({ value, max, size, stroke, color, track = "#FBCFE8", children }: RingProps) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} opacity={0.5} />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
