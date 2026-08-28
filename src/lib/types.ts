/** Valeurs nutritionnelles pour 100 g (cru/sec sauf mention contraire dans la note). */
export interface Food {
  id: string;
  nom: string;
  kcal: number;
  prot: number;
  gluc: number;
  lip: number;
  note?: string;
  /** Aliment ajouté/modifié par l'utilisatrice (vs seed d'origine) */
  custom?: boolean;
}

/** Recette réutilisable = liste d'aliments avec grammages. */
export interface Recipe {
  id: string;
  nom: string;
  emoji?: string;
  items: { foodId: string; grams: number }[];
}

/** Un composant d'un repas : soit un aliment pesé, soit une recette entière. */
export type Part = { foodId: string; grams: number } | { recipeId: string };

export interface Meal {
  title: string;
  parts: Part[];
}

export type Slot = "petitdej" | "dejeuner" | "collation" | "diner";
export const SLOTS: Slot[] = ["petitdej", "dejeuner", "collation", "diner"];
export const SLOT_LABELS: Record<Slot, string> = {
  petitdej: "Petit-déj",
  dejeuner: "Déjeuner",
  collation: "Collation",
  diner: "Dîner",
};
export const SLOT_EMOJIS: Record<Slot, string> = {
  petitdej: "🌅",
  dejeuner: "🍽️",
  collation: "🥜",
  diner: "🌙",
};

/** Plan hebdo : index 0 = lundi … 6 = dimanche. */
export type WeekPlan = Record<Slot, Meal>[];

export interface Extra {
  id: string;
  foodId: string;
  grams: number;
}

export interface DayLog {
  checked: Partial<Record<Slot, boolean>>;
  /** Repas remplacé/modifié pour ce jour uniquement (le plan reste intact). */
  overrides: Partial<Record<Slot, Meal>>;
  extras: Extra[];
  omega3: boolean;
  weight?: number;
}

/** Palier d'objectifs, actif à partir de `from` (ISO date). */
export interface Palier {
  from: string;
  kcal: number;
  prot: number;
  gluc: number;
  lip: number;
}

export interface Macros {
  kcal: number;
  prot: number;
  gluc: number;
  lip: number;
}

export interface AppState {
  version: number;
  foods: Record<string, Food>;
  recipes: Record<string, Recipe>;
  plan: WeekPlan;
  logs: Record<string, DayLog>;
  goals: Palier[];
  /** Date ISO du dernier refus de suggestion de palier (pour ne pas la re-proposer trop vite). */
  suggestionDismissedAt?: string;
}
