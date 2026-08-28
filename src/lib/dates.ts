export const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const DAY_NAMES_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const MONTH_NAMES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Index lundi=0 … dimanche=6 pour une date ISO. */
export function dayIndexOf(iso: string): number {
  return (fromISO(iso).getDay() + 6) % 7;
}

export function addDays(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function formatLong(iso: string): string {
  const d = fromISO(iso);
  return `${DAY_NAMES[dayIndexOf(iso)]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

export function formatShort(iso: string): string {
  const d = fromISO(iso);
  return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Liste de dates ISO du plus ancien au plus récent, `count` jours en terminant à `end`. */
export function lastDays(end: string, count: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) out.push(addDays(end, -i));
  return out;
}
