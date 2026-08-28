import { useSyncExternalStore } from "react";
import type { AppState, DayLog, Extra, Food, Meal, Palier, Slot } from "./types";
import { SEED_FOODS, SEED_GOALS, SEED_PLAN, SEED_RECIPES } from "./seed";
import { EMPTY_LOG } from "./nutrition";

const STORAGE_KEY = "bloom-state-v1";
const STATE_VERSION = 1;

function defaultState(): AppState {
  return {
    version: STATE_VERSION,
    foods: structuredClone(SEED_FOODS),
    recipes: structuredClone(SEED_RECIPES),
    plan: structuredClone(SEED_PLAN),
    logs: {},
    goals: structuredClone(SEED_GOALS),
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || typeof parsed !== "object" || !parsed.foods) return defaultState();
    // Nouveaux aliments/recettes du seed ajoutés sans écraser les modifs utilisateur
    for (const [id, food] of Object.entries(SEED_FOODS)) {
      if (!parsed.foods[id]) parsed.foods[id] = structuredClone(food);
    }
    for (const [id, recipe] of Object.entries(SEED_RECIPES)) {
      if (!parsed.recipes[id]) parsed.recipes[id] = structuredClone(recipe);
    }
    parsed.version = STATE_VERSION;
    return parsed;
  } catch {
    return defaultState();
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // stockage plein ou indisponible — on garde l'état en mémoire
    }
  }, 150);
}

export function getState(): AppState {
  return state;
}

export function setState(updater: (prev: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state
  );
}

// Demande au navigateur de ne pas purger le stockage (important sur iOS)
if (typeof navigator !== "undefined" && navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

// ---------- Actions ----------

function withLog(prev: AppState, date: string, fn: (log: DayLog) => DayLog): AppState {
  const log = prev.logs[date] ?? structuredClone(EMPTY_LOG);
  return { ...prev, logs: { ...prev.logs, [date]: fn(structuredClone(log)) } };
}

export function toggleMeal(date: string, slot: Slot) {
  setState((prev) =>
    withLog(prev, date, (log) => {
      log.checked = { ...log.checked, [slot]: !log.checked[slot] };
      return log;
    })
  );
}

export function toggleOmega3(date: string) {
  setState((prev) =>
    withLog(prev, date, (log) => {
      log.omega3 = !log.omega3;
      return log;
    })
  );
}

export function setWeight(date: string, weight: number | undefined) {
  setState((prev) =>
    withLog(prev, date, (log) => {
      log.weight = weight;
      return log;
    })
  );
}

export function addExtra(date: string, foodId: string, grams: number) {
  const extra: Extra = { id: `x${Date.now()}${Math.floor(Math.random() * 1000)}`, foodId, grams };
  setState((prev) =>
    withLog(prev, date, (log) => {
      log.extras = [...log.extras, extra];
      return log;
    })
  );
}

export function removeExtra(date: string, extraId: string) {
  setState((prev) =>
    withLog(prev, date, (log) => {
      log.extras = log.extras.filter((e) => e.id !== extraId);
      return log;
    })
  );
}

/** Remplace/modifie un repas pour ce jour uniquement (null = revenir au plan). */
export function overrideMeal(date: string, slot: Slot, meal: Meal | null) {
  setState((prev) =>
    withLog(prev, date, (log) => {
      const overrides = { ...log.overrides };
      if (meal === null) delete overrides[slot];
      else overrides[slot] = meal;
      log.overrides = overrides;
      return log;
    })
  );
}

/** Modifie le plan hebdo de façon permanente. */
export function updatePlanMeal(dayIndex: number, slot: Slot, meal: Meal) {
  setState((prev) => {
    const plan = prev.plan.map((d, i) => (i === dayIndex ? { ...d, [slot]: meal } : d));
    return { ...prev, plan };
  });
}

export function upsertFood(food: Food) {
  setState((prev) => ({ ...prev, foods: { ...prev.foods, [food.id]: { ...food, custom: true } } }));
}

export function deleteFood(foodId: string) {
  setState((prev) => {
    const foods = { ...prev.foods };
    delete foods[foodId];
    return { ...prev, foods };
  });
}

export function setGoals(palier: Palier) {
  setState((prev) => {
    // Un palier par date de début : on remplace s'il existe déjà
    const goals = [...prev.goals.filter((g) => g.from !== palier.from), palier].sort((a, b) =>
      a.from.localeCompare(b.from)
    );
    return { ...prev, goals, suggestionDismissedAt: undefined };
  });
}

export function dismissSuggestion(date: string) {
  setState((prev) => ({ ...prev, suggestionDismissedAt: date }));
}

// ---------- Export / import de sauvegarde ----------

export function exportStateJSON(): string {
  return JSON.stringify(state, null, 2);
}

export function importStateJSON(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as AppState;
    if (!parsed || typeof parsed !== "object" || !parsed.foods || !parsed.plan || !parsed.goals) return false;
    setState(() => parsed);
    return true;
  } catch {
    return false;
  }
}
