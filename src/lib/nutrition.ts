import type { AppState, DayLog, Food, Macros, Meal, Part, Recipe, Slot } from "./types";
import { SLOTS } from "./types";

export const ZERO: Macros = { kcal: 0, prot: 0, gluc: 0, lip: 0 };

export function addMacros(a: Macros, b: Macros): Macros {
  return { kcal: a.kcal + b.kcal, prot: a.prot + b.prot, gluc: a.gluc + b.gluc, lip: a.lip + b.lip };
}

export function scaleMacros(m: Macros, factor: number): Macros {
  return { kcal: m.kcal * factor, prot: m.prot * factor, gluc: m.gluc * factor, lip: m.lip * factor };
}

export function macrosOfFood(food: Food, grams: number): Macros {
  const k = grams / 100;
  return { kcal: food.kcal * k, prot: food.prot * k, gluc: food.gluc * k, lip: food.lip * k };
}

export function macrosOfPart(part: Part, foods: Record<string, Food>, recipes: Record<string, Recipe>): Macros {
  if ("foodId" in part) {
    const food = foods[part.foodId];
    return food ? macrosOfFood(food, part.grams) : ZERO;
  }
  const recipe = recipes[part.recipeId];
  if (!recipe) return ZERO;
  return recipe.items.reduce((acc, item) => {
    const food = foods[item.foodId];
    return food ? addMacros(acc, macrosOfFood(food, item.grams)) : acc;
  }, ZERO);
}

export function macrosOfParts(parts: Part[], foods: Record<string, Food>, recipes: Record<string, Recipe>): Macros {
  return parts.reduce((acc, p) => addMacros(acc, macrosOfPart(p, foods, recipes)), ZERO);
}

export function macrosOfMeal(meal: Meal, foods: Record<string, Food>, recipes: Record<string, Recipe>): Macros {
  return macrosOfParts(meal.parts, foods, recipes);
}

export const EMPTY_LOG: DayLog = { checked: {}, overrides: {}, extras: [], omega3: false };

/** Le repas effectif d'un slot pour un jour donné (override du jour, sinon plan). */
export function mealForSlot(state: AppState, dayIndex: number, slot: Slot, log: DayLog | undefined): Meal {
  return log?.overrides?.[slot] ?? state.plan[dayIndex][slot];
}

/** Total consommé sur un jour : repas cochés (avec overrides) + extras. */
export function consumedForDay(state: AppState, dayIndex: number, log: DayLog | undefined): Macros {
  if (!log) return ZERO;
  let total = ZERO;
  for (const slot of SLOTS) {
    if (log.checked[slot]) {
      total = addMacros(total, macrosOfMeal(mealForSlot(state, dayIndex, slot, log), state.foods, state.recipes));
    }
  }
  for (const extra of log.extras) {
    const food = state.foods[extra.foodId];
    if (food) total = addMacros(total, macrosOfFood(food, extra.grams));
  }
  return total;
}

/** Total prévu du jour (les 4 repas du plan, overrides inclus). */
export function plannedForDay(state: AppState, dayIndex: number, log: DayLog | undefined): Macros {
  let total = ZERO;
  for (const slot of SLOTS) {
    total = addMacros(total, macrosOfMeal(mealForSlot(state, dayIndex, slot, log), state.foods, state.recipes));
  }
  return total;
}

/** Palier d'objectifs actif à une date donnée. */
export function goalsAt(state: AppState, isoDate: string) {
  const applicable = state.goals.filter((g) => g.from <= isoDate);
  return applicable.length > 0 ? applicable[applicable.length - 1] : state.goals[0];
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
