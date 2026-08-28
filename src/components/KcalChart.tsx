import { useRef, useState } from "react";
import { formatShort } from "../lib/dates";

export interface KcalDay {
  date: string;
  kcal: number;
  goal: number;
}

interface KcalChartProps {
  days: KcalDay[];
  height?: number;
}

const PAD = { top: 16, right: 8, bottom: 22, left: 8 };

/** Barres de calories consommées par jour, avec la ligne d'objectif du jour. */
export default function KcalChart({ days, height = 180 }: KcalChartProps) {
  const width = 360;
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const withData = days.filter((d) => d.kcal > 0);
  if (withData.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center text-sm text-ink-faint">
        Coche des repas pour voir tes calories ici 💪
      </div>
    );
  }

  const maxVal = Math.max(...days.map((d) => Math.max(d.kcal, d.goal))) * 1.1;
  const innerW = width - PAD.left - PAD.right;
  const bw = innerW / days.length;
  const barW = Math.min(Math.max(bw - 2, 3), 26);
  const y = (v: number) => PAD.top + (1 - v / maxVal) * (height - PAD.top - PAD.bottom);
  const xc = (i: number) => PAD.left + i * bw + bw / 2;

  // Ligne d'objectif : en escalier si l'objectif change au fil des paliers
  const goalPath = days
    .map((d, i) => {
      const gy = y(d.goal).toFixed(1);
      const x0 = (PAD.left + i * bw).toFixed(1);
      const x1 = (PAD.left + (i + 1) * bw).toFixed(1);
      return `${i === 0 ? "M" : "L"}${x0},${gy} L${x1},${gy}`;
    })
    .join(" ");

  const pick = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((clientX - rect.left) / rect.width) * width;
    const i = Math.min(days.length - 1, Math.max(0, Math.floor((px - PAD.left) / bw)));
    setHover(i);
  };

  const h = hover !== null ? days[hover] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none select-none"
        onMouseMove={(e) => pick(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => pick(e.touches[0].clientX)}
        onTouchMove={(e) => pick(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        {days.map((d, i) => {
          const reached = d.kcal >= d.goal * 0.9;
          return (
            d.kcal > 0 && (
              <rect
                key={d.date}
                x={xc(i) - barW / 2}
                y={y(d.kcal)}
                width={barW}
                height={Math.max(height - PAD.bottom - y(d.kcal), 2)}
                rx={Math.min(4, barW / 2)}
                fill={reached ? "#EC4899" : "#FBCFE8"}
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
            )
          );
        })}
        <path d={goalPath} fill="none" stroke="#2D2233" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />
        {days.length <= 10 &&
          days.map((d, i) => (
            <text key={d.date} x={xc(i)} y={height - 6} textAnchor="middle" fontSize="9" fill="#A294A8">
              {formatShort(d.date)}
            </text>
          ))}
        {days.length > 10 && (
          <>
            <text x={PAD.left} y={height - 6} fontSize="10" fill="#A294A8">
              {formatShort(days[0].date)}
            </text>
            <text x={width - PAD.right} y={height - 6} textAnchor="end" fontSize="10" fill="#A294A8">
              {formatShort(days[days.length - 1].date)}
            </text>
          </>
        )}
      </svg>
      {h && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-xl bg-ink px-3 py-1.5 text-center text-xs font-semibold text-white shadow-lg">
          {formatShort(h.date)} · {Math.round(h.kcal)} kcal
          <span className="block text-[10px] font-medium opacity-70">objectif {Math.round(h.goal)}</span>
        </div>
      )}
      <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-mkcal" /> Objectif ≥ 90 % atteint
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-petal" /> En dessous
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2 border-dashed border-ink/50" /> Objectif
        </span>
      </div>
    </div>
  );
}
