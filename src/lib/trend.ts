import type { AppState } from "./types";
import { addDays, lastDays, todayISO } from "./dates";
import { consumedForDay, goalsAt } from "./nutrition";
import { dayIndexOf } from "./dates";
import { SLOTS } from "./types";

export interface WeightPoint {
  date: string;
  weight: number;
}

/** Points de poids triés par date. */
export function weightSeries(state: AppState): WeightPoint[] {
  return Object.entries(state.logs)
    .filter(([, log]) => typeof log.weight === "number")
    .map(([date, log]) => ({ date, weight: log.weight as number }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Tendance lissée : moyenne mobile exponentielle (EMA) sur les pesées,
 * plus robuste que le point brut du jour (variations d'eau, digestion…).
 */
export function smoothedWeights(points: WeightPoint[], alpha = 0.3): WeightPoint[] {
  if (points.length === 0) return [];
  const out: WeightPoint[] = [{ ...points[0] }];
  for (let i = 1; i < points.length; i++) {
    const prev = out[i - 1].weight;
    out.push({ date: points[i].date, weight: prev + alpha * (points[i].weight - prev) });
  }
  return out;
}

/** Pente de la régression linéaire sur les points donnés, en kg/semaine. */
export function slopePerWeek(points: WeightPoint[]): number | null {
  if (points.length < 2) return null;
  const t0 = new Date(points[0].date).getTime();
  const xs = points.map((p) => (new Date(p.date).getTime() - t0) / (1000 * 3600 * 24));
  const ys = points.map((p) => p.weight);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) * (xs[i] - mx);
  }
  if (den === 0) return null;
  return (num / den) * 7;
}

export interface PalierSuggestion {
  slopeKgPerWeek: number;
  addKcal: number;
}

/**
 * Logique de reverse dieting progressif : si le poids stagne (pente < 0.15 kg/sem)
 * sur les 14 derniers jours, avec assez de données et un palier en place depuis
 * au moins 14 jours, on suggère d'augmenter les calories de ~175 kcal.
 */
export function suggestPalier(state: AppState): PalierSuggestion | null {
  const today = todayISO();
  const current = goalsAt(state, today);
  if (!current) return null;

  // Palier en place depuis au moins 14 jours
  if (addDays(current.from, 13) > today) return null;

  // Suggestion refusée il y a moins de 10 jours → on attend
  if (state.suggestionDismissedAt && addDays(state.suggestionDismissedAt, 9) >= today) return null;

  const cutoff = addDays(today, -13);
  const recent = smoothedWeights(weightSeries(state)).filter((p) => p.date >= cutoff);
  if (recent.length < 6) return null;

  const slope = slopePerWeek(recent);
  if (slope === null || slope >= 0.15) return null;

  return { slopeKgPerWeek: slope, addKcal: 175 };
}

/** Adhérence : repas cochés / repas prévus sur les `days` derniers jours (au plus tôt : première utilisation). */
export function adherence(state: AppState, days: number): { checked: number; planned: number; pct: number } {
  const logDates = Object.keys(state.logs).sort();
  const firstUse = logDates[0];
  let dates = lastDays(todayISO(), days);
  if (firstUse) dates = dates.filter((d) => d >= firstUse);
  let checked = 0;
  const planned = dates.length * SLOTS.length;
  for (const date of dates) {
    const log = state.logs[date];
    if (!log) continue;
    for (const slot of SLOTS) if (log.checked[slot]) checked++;
  }
  return { checked, planned, pct: planned > 0 ? (checked / planned) * 100 : 0 };
}

/** Streak : jours consécutifs (en remontant depuis aujourd'hui ou hier) avec ≥ 3 repas cochés. */
export function streak(state: AppState): number {
  const today = todayISO();
  const countFor = (date: string) => {
    const log = state.logs[date];
    if (!log) return 0;
    return SLOTS.filter((s) => log.checked[s]).length;
  };
  let start = today;
  // Le jour en cours ne casse pas le streak s'il n'est pas fini
  if (countFor(today) < 3) start = addDays(today, -1);
  let n = 0;
  let d = start;
  while (countFor(d) >= 3) {
    n++;
    d = addDays(d, -1);
  }
  // Si aujourd'hui est déjà validé, il compte
  return n;
}

/** Moyennes kcal/macros sur les jours où au moins un repas a été loggé. */
export function averages(state: AppState, days: number) {
  const dates = lastDays(todayISO(), days);
  let sum = { kcal: 0, prot: 0, gluc: 0, lip: 0 };
  let counted = 0;
  let goalHit = 0;
  for (const date of dates) {
    const log = state.logs[date];
    if (!log) continue;
    const hasData = SLOTS.some((s) => log.checked[s]) || log.extras.length > 0;
    if (!hasData) continue;
    const c = consumedForDay(state, dayIndexOf(date), log);
    sum = { kcal: sum.kcal + c.kcal, prot: sum.prot + c.prot, gluc: sum.gluc + c.gluc, lip: sum.lip + c.lip };
    counted++;
    const goal = goalsAt(state, date);
    if (goal && c.kcal >= goal.kcal * 0.9) goalHit++;
  }
  if (counted === 0) return null;
  return {
    days: counted,
    goalHit,
    kcal: sum.kcal / counted,
    prot: sum.prot / counted,
    gluc: sum.gluc / counted,
    lip: sum.lip / counted,
  };
}
