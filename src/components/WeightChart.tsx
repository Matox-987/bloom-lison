import { useMemo, useRef, useState } from "react";
import type { WeightPoint } from "../lib/trend";
import { smoothedWeights } from "../lib/trend";
import { formatShort } from "../lib/dates";

interface WeightChartProps {
  points: WeightPoint[];
  height?: number;
}

const PAD = { top: 14, right: 12, bottom: 24, left: 38 };

/** Courbe de poids : pesées brutes en points pâles, tendance lissée (EMA) en trait plein. */
export default function WeightChart({ points, height = 200 }: WeightChartProps) {
  const width = 360;
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trend = useMemo(() => smoothedWeights(points), [points]);

  if (points.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-ink-faint">
        Enregistre ton poids sur quelques jours pour voir la tendance 🌱
      </div>
    );
  }

  const t0 = new Date(points[0].date).getTime();
  const t1 = new Date(points[points.length - 1].date).getTime();
  const span = Math.max(t1 - t0, 1);
  const ws = points.map((p) => p.weight);
  const wMin = Math.min(...ws) - 0.4;
  const wMax = Math.max(...ws) + 0.4;

  const x = (date: string) => PAD.left + ((new Date(date).getTime() - t0) / span) * (width - PAD.left - PAD.right);
  const y = (w: number) => PAD.top + (1 - (w - wMin) / (wMax - wMin)) * (height - PAD.top - PAD.bottom);

  const trendPath = trend.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)},${y(p.weight).toFixed(1)}`).join(" ");

  // Graduations : lignes horizontales arrondies au 0.5 kg, sans doublon
  const step = (wMax - wMin) / 3;
  const ticks = [...new Set(Array.from({ length: 4 }, (_, i) => Math.round((wMin + i * step) * 2) / 2))];

  const onMove = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((clientX - rect.left) / rect.width) * width;
    let best = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(x(p.date) - px);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover(best);
  };

  const h = hover !== null ? points[hover] : null;
  const hTrend = hover !== null ? trend[hover] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none select-none"
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => onMove(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="#FBCFE8" strokeWidth="1" opacity="0.6" />
            <text x={PAD.left - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#A294A8">
              {t}
            </text>
          </g>
        ))}
        <text x={PAD.left} y={height - 6} fontSize="10" fill="#A294A8">
          {formatShort(points[0].date)}
        </text>
        <text x={width - PAD.right} y={height - 6} textAnchor="end" fontSize="10" fill="#A294A8">
          {formatShort(points[points.length - 1].date)}
        </text>

        {/* Pesées brutes */}
        {points.map((p) => (
          <circle key={p.date} cx={x(p.date)} cy={y(p.weight)} r="3" fill="#FBCFE8" stroke="#fff" strokeWidth="1" />
        ))}
        {/* Tendance lissée */}
        <path d={trendPath} fill="none" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {h && hTrend && (
          <g>
            <line x1={x(h.date)} x2={x(h.date)} y1={PAD.top} y2={height - PAD.bottom} stroke="#9D174D" strokeWidth="1" opacity="0.35" />
            <circle cx={x(h.date)} cy={y(hTrend.weight)} r="5" fill="#BE185D" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {h && hTrend && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-xl bg-ink px-3 py-1.5 text-center text-xs font-semibold text-white shadow-lg">
          {formatShort(h.date)} · {h.weight.toFixed(1)} kg
          <span className="block text-[10px] font-medium opacity-70">tendance {hTrend.weight.toFixed(1)} kg</span>
        </div>
      )}
      <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-petal" /> Pesées
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-blossom-strong" /> Tendance
        </span>
      </div>
    </div>
  );
}
