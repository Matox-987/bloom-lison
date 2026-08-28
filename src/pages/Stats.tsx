import { useMemo, useState } from "react";
import { useAppState } from "../lib/store";
import { dayIndexOf, lastDays, todayISO } from "../lib/dates";
import { consumedForDay, goalsAt, round1 } from "../lib/nutrition";
import { adherence, averages, slopePerWeek, smoothedWeights, streak, weightSeries } from "../lib/trend";
import WeightChart from "../components/WeightChart";
import KcalChart, { type KcalDay } from "../components/KcalChart";

const PERIODS = [
  { id: 7, label: "7 jours" },
  { id: 30, label: "30 jours" },
  { id: 90, label: "90 jours" },
] as const;

export default function Stats() {
  const state = useAppState();
  const [period, setPeriod] = useState<7 | 30 | 90>(7);

  const today = todayISO();
  const avg = useMemo(() => averages(state, period), [state, period]);
  const adh = useMemo(() => adherence(state, period), [state, period]);
  const currentStreak = streak(state);

  const kcalDays: KcalDay[] = useMemo(
    () =>
      lastDays(today, period).map((date) => ({
        date,
        kcal: consumedForDay(state, dayIndexOf(date), state.logs[date]).kcal,
        goal: goalsAt(state, date).kcal,
      })),
    [state, period, today]
  );

  const weights = useMemo(() => {
    const cutoff = lastDays(today, period)[0];
    return weightSeries(state).filter((p) => p.date >= cutoff);
  }, [state, period, today]);

  const trendSlope = useMemo(() => slopePerWeek(smoothedWeights(weights)), [weights]);

  return (
    <div className="animate-rise">
      <h1 className="mb-3 font-display text-2xl font-bold text-blossom-deep">Statistiques</h1>

      {/* Sélecteur de période */}
      <div className="mb-4 flex rounded-2xl bg-white p-1 shadow-card">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
              period === p.id ? "bg-blossom-strong text-white" : "text-ink-soft"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Score & streak */}
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Adhérence au plan</p>
          <p className="mt-1 font-display text-3xl font-bold text-blossom-strong">{Math.round(adh.pct)}%</p>
          <p className="text-xs text-ink-soft">
            {adh.checked} / {adh.planned} repas cochés
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-blossom transition-all duration-700"
              style={{ width: `${Math.min(adh.pct, 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Série en cours</p>
          <p className="mt-1 font-display text-3xl font-bold text-blossom-strong">
            🔥 {currentStreak} <span className="text-base">j</span>
          </p>
          <p className="text-xs leading-snug text-ink-soft">
            {currentStreak >= 7
              ? "Une semaine complète, machine ! 💪"
              : currentStreak > 0
                ? "Jours consécutifs avec ≥ 3 repas"
                : "Coche 3 repas pour lancer la série"}
          </p>
        </div>
      </div>

      {/* Moyennes */}
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-sm font-bold">Moyennes sur la période</h2>
        {avg ? (
          <>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "kcal", value: Math.round(avg.kcal), color: "text-mkcal" },
                { label: "Prot", value: `${round1(avg.prot)}`, color: "text-mprot" },
                { label: "Gluc", value: `${round1(avg.gluc)}`, color: "text-mgluc" },
                { label: "Lip", value: `${round1(avg.lip)}`, color: "text-mlip" },
              ].map((x) => (
                <div key={x.label} className="rounded-xl bg-paper px-1 py-2.5">
                  <p className={`text-base font-extrabold ${x.color}`}>{x.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{x.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-ink-soft">
              Sur {avg.days} jour{avg.days > 1 ? "s" : ""} loggé{avg.days > 1 ? "s" : ""} · objectif kcal atteint {avg.goalHit}{" "}
              jour{avg.goalHit > 1 ? "s" : ""} sur {avg.days}
            </p>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-ink-faint">Pas encore de repas loggés sur cette période</p>
        )}
      </section>

      {/* Poids */}
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-card">
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="text-sm font-bold">Évolution du poids</h2>
          {trendSlope !== null && (
            <span className={`text-xs font-bold ${trendSlope >= 0.1 ? "text-success" : "text-ink-soft"}`}>
              {trendSlope >= 0 ? "+" : ""}
              {trendSlope.toFixed(2)} kg/sem
            </span>
          )}
        </div>
        <WeightChart points={weights} />
      </section>

      {/* Calories */}
      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-1 text-sm font-bold">Calories par jour</h2>
        <KcalChart days={kcalDays} />
      </section>
    </div>
  );
}
