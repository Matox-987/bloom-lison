import type { Food, Recipe, WeekPlan, Palier } from "./types";

/**
 * Base alimentaire de référence — valeurs pour 100 g, cru/sec sauf mention.
 * Source de vérité de tous les calculs : rien n'est hardcodé ailleurs.
 */
const FOOD_LIST: Food[] = [
  { id: "riz", nom: "Riz blanc (cru)", kcal: 355, prot: 7, gluc: 78, lip: 0.6, note: "Peser avant cuisson" },
  { id: "pates", nom: "Pâtes crues (blé dur)", kcal: 353, prot: 12.5, gluc: 71, lip: 1.5, note: "Peser avant cuisson" },
  { id: "haricots-verts", nom: "Haricots verts (cuits)", kcal: 31, prot: 1.8, gluc: 7, lip: 0.2 },
  { id: "avoine", nom: "Flocons d'avoine", kcal: 372, prot: 13.5, gluc: 58, lip: 7 },
  { id: "boeuf-5", nom: "Bœuf haché 5% (cru)", kcal: 140, prot: 21, gluc: 0, lip: 5 },
  { id: "poulet", nom: "Blanc de poulet (cru)", kcal: 110, prot: 23, gluc: 0, lip: 1.5 },
  { id: "porc", nom: "Filet de porc (cru)", kcal: 105, prot: 21, gluc: 0, lip: 3 },
  { id: "entrecote", nom: "Entrecôte de bœuf (crue)", kcal: 220, prot: 19, gluc: 0, lip: 15, note: "Pièce persillée" },
  { id: "oeuf", nom: "Œuf entier", kcal: 155, prot: 13, gluc: 1.1, lip: 11, note: "≈ 78 kcal / œuf de 50 g" },
  { id: "avocat", nom: "Avocat", kcal: 160, prot: 2, gluc: 8.5, lip: 14.7 },
  { id: "banane", nom: "Banane", kcal: 90, prot: 1.1, gluc: 23, lip: 0.3 },
  { id: "miel", nom: "Miel", kcal: 310, prot: 0.3, gluc: 82, lip: 0 },
  { id: "beurre-cacahuete", nom: "Beurre de cacahuète 100%", kcal: 590, prot: 25, gluc: 20, lip: 50 },
  { id: "yaourt-proteine", nom: "Yaourt protéiné vanille", kcal: 65, prot: 7, gluc: 6, lip: 1, note: "Variable selon marque — ajuster si besoin" },
  { id: "whey", nom: "Isolat de whey", kcal: 375, prot: 87, gluc: 2, lip: 2, note: "Variable selon marque — ~30 g = 1 dose" },
  { id: "amandes", nom: "Amandes / fruits secs", kcal: 580, prot: 21, gluc: 22, lip: 50 },
  { id: "salade", nom: "Salade verte", kcal: 15, prot: 1.4, gluc: 2.9, lip: 0.2 },
  { id: "tomate", nom: "Tomate", kcal: 18, prot: 0.9, gluc: 3.9, lip: 0.2 },
  { id: "concombre", nom: "Concombre", kcal: 15, prot: 0.7, gluc: 3.6, lip: 0.1 },
  { id: "carotte", nom: "Carotte (crue)", kcal: 41, prot: 0.9, gluc: 10, lip: 0.2 },
  { id: "chou-rouge", nom: "Chou rouge (cru)", kcal: 31, prot: 1.4, gluc: 7.4, lip: 0.2 },
  { id: "huile-olive", nom: "Huile d'olive", kcal: 900, prot: 0, gluc: 0, lip: 100, note: "≈ 90 kcal / c. à soupe (10 g)" },
  { id: "pain-complet", nom: "Pain complet", kcal: 250, prot: 9, gluc: 45, lip: 3 },
];

export const SEED_FOODS: Record<string, Food> = Object.fromEntries(FOOD_LIST.map((f) => [f.id, f]));

/** Composants récurrents du plan, définis une fois. */
const RECIPE_LIST: Recipe[] = [
  {
    id: "pdj-a",
    nom: "Porridge protéiné",
    emoji: "🥣",
    items: [
      { foodId: "avoine", grams: 70 },
      { foodId: "yaourt-proteine", grams: 200 },
      { foodId: "whey", grams: 30 },
      { foodId: "miel", grams: 20 },
      { foodId: "banane", grams: 120 },
      { foodId: "beurre-cacahuete", grams: 20 },
    ],
  },
  {
    id: "pdj-b",
    nom: "Omelette avocat toast",
    emoji: "🍳",
    items: [
      { foodId: "oeuf", grams: 150 },
      { foodId: "pain-complet", grams: 80 },
      { foodId: "avocat", grams: 60 },
      { foodId: "banane", grams: 100 },
      { foodId: "yaourt-proteine", grams: 100 },
    ],
  },
  {
    id: "pdj-c",
    nom: "Pancakes protéinés avoine-banane",
    emoji: "🥞",
    items: [
      { foodId: "avoine", grams: 60 },
      { foodId: "oeuf", grams: 100 },
      { foodId: "banane", grams: 100 },
      { foodId: "whey", grams: 20 },
      { foodId: "miel", grams: 15 },
      { foodId: "beurre-cacahuete", grams: 15 },
    ],
  },
  {
    id: "crudites-1",
    nom: "Crudités mix 1 (salade, tomate, concombre)",
    emoji: "🥗",
    items: [
      { foodId: "salade", grams: 50 },
      { foodId: "tomate", grams: 60 },
      { foodId: "concombre", grams: 40 },
    ],
  },
  {
    id: "crudites-2",
    nom: "Crudités mix 2 (carotte, chou rouge)",
    emoji: "🥕",
    items: [
      { foodId: "carotte", grams: 80 },
      { foodId: "chou-rouge", grams: 70 },
    ],
  },
];

export const SEED_RECIPES: Record<string, Recipe> = Object.fromEntries(RECIPE_LIST.map((r) => [r.id, r]));

const f = (foodId: string, grams: number) => ({ foodId, grams });
const r = (recipeId: string) => ({ recipeId });

/** Plan hebdo type — index 0 = lundi. Grammages en cru/sec. */
export const SEED_PLAN: WeekPlan = [
  // Lundi
  {
    petitdej: { title: "Porridge protéiné", parts: [r("pdj-a")] },
    dejeuner: { title: "Poulet, riz & crudités", parts: [f("poulet", 140), f("riz", 100), r("crudites-1"), f("huile-olive", 10)] },
    collation: { title: "Yaourt, amandes & banane", parts: [f("yaourt-proteine", 150), f("amandes", 30), f("banane", 100)] },
    diner: { title: "Bœuf haché, pâtes & crudités", parts: [f("boeuf-5", 140), f("pates", 100), r("crudites-2"), f("huile-olive", 10)] },
  },
  // Mardi
  {
    petitdej: { title: "Omelette avocat toast", parts: [r("pdj-b")] },
    dejeuner: { title: "Porc, riz & haricots verts", parts: [f("porc", 140), f("riz", 100), f("haricots-verts", 150), f("huile-olive", 10)] },
    collation: { title: "Shake whey-avoine", parts: [f("whey", 30), f("avoine", 40), f("beurre-cacahuete", 15)] },
    diner: { title: "Poulet, pâtes & crudités", parts: [f("poulet", 140), f("pates", 100), r("crudites-1"), f("huile-olive", 10)] },
  },
  // Mercredi
  {
    petitdej: { title: "Porridge protéiné", parts: [r("pdj-a")] },
    dejeuner: { title: "Bœuf haché, riz & haricots verts", parts: [f("boeuf-5", 140), f("riz", 100), f("haricots-verts", 150), f("huile-olive", 10)] },
    collation: { title: "Tartines beurre de cacahuète", parts: [f("pain-complet", 60), f("beurre-cacahuete", 25), f("banane", 100)] },
    diner: { title: "Entrecôte, pâtes & crudités", parts: [f("entrecote", 160), f("pates", 80), r("crudites-1"), f("huile-olive", 5)] },
  },
  // Jeudi
  {
    petitdej: { title: "Omelette avocat toast", parts: [r("pdj-b")] },
    dejeuner: { title: "Poulet, pâtes & crudités", parts: [f("poulet", 140), f("pates", 100), r("crudites-2"), f("huile-olive", 10)] },
    collation: { title: "Amandes, yaourt & miel", parts: [f("amandes", 40), f("yaourt-proteine", 150), f("miel", 15)] },
    diner: { title: "Porc, riz & haricots verts", parts: [f("porc", 140), f("riz", 100), f("haricots-verts", 150), f("huile-olive", 10)] },
  },
  // Vendredi
  {
    petitdej: { title: "Porridge protéiné", parts: [r("pdj-a")] },
    dejeuner: { title: "Entrecôte, riz & crudités", parts: [f("entrecote", 150), f("riz", 90), r("crudites-1"), f("huile-olive", 10)] },
    collation: { title: "Yaourt, amandes & banane", parts: [f("yaourt-proteine", 150), f("amandes", 30), f("banane", 100)] },
    diner: { title: "Bœuf haché, pâtes & haricots verts", parts: [f("boeuf-5", 140), f("pates", 90), f("haricots-verts", 150), f("huile-olive", 10)] },
  },
  // Samedi
  {
    petitdej: { title: "Pancakes protéinés", parts: [r("pdj-c")] },
    dejeuner: { title: "Poulet, riz & crudités", parts: [f("poulet", 140), f("riz", 100), r("crudites-2"), f("huile-olive", 10)] },
    collation: { title: "Shake whey-avoine", parts: [f("whey", 30), f("avoine", 40), f("beurre-cacahuete", 15)] },
    diner: { title: "Omelette, avocat & riz", parts: [f("oeuf", 150), f("avocat", 70), f("riz", 70), r("crudites-1")] },
  },
  // Dimanche
  {
    petitdej: { title: "Porridge protéiné", parts: [r("pdj-a")] },
    dejeuner: { title: "Entrecôte, pâtes & haricots verts", parts: [f("entrecote", 150), f("pates", 80), f("haricots-verts", 150), f("huile-olive", 10)] },
    collation: { title: "Amandes, yaourt & miel", parts: [f("amandes", 40), f("yaourt-proteine", 150), f("miel", 15)] },
    diner: { title: "Porc, riz & crudités", parts: [f("porc", 130), f("riz", 90), r("crudites-1"), f("huile-olive", 10)] },
  },
];

/** Palier de départ (semaines 1-2) — milieu des fourchettes cibles. */
export const SEED_GOALS: Palier[] = [
  { from: new Date().toISOString().slice(0, 10), kcal: 2550, prot: 115, gluc: 335, lip: 80 },
];
