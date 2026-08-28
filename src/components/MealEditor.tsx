import { useState } from "react";
import type { Food, Meal, Part, Recipe } from "../lib/types";
import { macrosOfPart, macrosOfParts, round1 } from "../lib/nutrition";
import FoodPicker from "./FoodPicker";

interface MealEditorProps {
  meal: Meal;
  foods: Record<string, Food>;
  recipes: Record<string, Recipe>;
  onSave: (meal: Meal) => void;
  onReset?: () => void;
  resetLabel?: string;
  saveLabel?: string;
}

export function partLabel(part: Part, foods: Record<string, Food>, recipes: Record<string, Recipe>): string {
  if ("foodId" in part) return `${foods[part.foodId]?.nom ?? "?"} — ${part.grams} g`;
  const r = recipes[part.recipeId];
  return r ? `${r.emoji ?? "🍴"} ${r.nom}` : "?";
}

/** Éditeur de composition d'un repas : grammages, suppression, ajout d'aliments ou de recettes. */
export default function MealEditor({ meal, foods, recipes, onSave, onReset, resetLabel, saveLabel = "Enregistrer" }: MealEditorProps) {
  const [title, setTitle] = useState(meal.title);
  const [parts, setParts] = useState<Part[]>(meal.parts);
  const [adding, setAdding] = useState<"food" | "recipe" | null>(null);

  const total = macrosOfParts(parts, foods, recipes);

  const setGrams = (index: number, grams: number) => {
    setParts((prev) => prev.map((p, i) => (i === index && "foodId" in p ? { ...p, grams } : p)));
  };
  const removePart = (index: number) => setParts((prev) => prev.filter((_, i) => i !== index));

  if (adding === "food") {
    return (
      <div>
        <button onClick={() => setAdding(null)} className="mb-3 text-sm font-semibold text-blossom-strong">
          ← Retour au repas
        </button>
        <FoodPicker
          foods={foods}
          onPick={(foodId, grams) => {
            setParts((prev) => [...prev, { foodId, grams }]);
            setAdding(null);
          }}
        />
      </div>
    );
  }

  if (adding === "recipe") {
    return (
      <div>
        <button onClick={() => setAdding(null)} className="mb-3 text-sm font-semibold text-blossom-strong">
          ← Retour au repas
        </button>
        <ul className="divide-y divide-paper">
          {Object.values(recipes).map((r) => {
            const m = macrosOfParts([{ recipeId: r.id }], foods, recipes);
            return (
              <li key={r.id}>
                <button
                  onClick={() => {
                    setParts((prev) => [...prev, { recipeId: r.id }]);
                    setAdding(null);
                  }}
                  className="flex w-full items-center justify-between gap-2 py-3 text-left active:bg-paper"
                >
                  <span className="text-sm font-semibold">
                    {r.emoji} {r.nom}
                  </span>
                  <span className="shrink-0 text-xs text-ink-faint">{Math.round(m.kcal)} kcal</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nom du repas"
        className="mb-3 w-full rounded-2xl border border-petal bg-paper px-4 py-2.5 font-semibold outline-none focus:border-blossom"
      />

      <ul className="space-y-2">
        {parts.map((part, i) => {
          const m = macrosOfPart(part, foods, recipes);
          return (
            <li key={i} className="flex items-center gap-2 rounded-2xl bg-paper px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {"recipeId" in part ? partLabel(part, foods, recipes) : foods[part.foodId]?.nom ?? "?"}
                </p>
                <p className="text-xs text-ink-faint">
                  {Math.round(m.kcal)} kcal · P {round1(m.prot)} · G {round1(m.gluc)} · L {round1(m.lip)}
                </p>
              </div>
              {"foodId" in part && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={part.grams}
                    onChange={(e) => setGrams(i, parseFloat(e.target.value) || 0)}
                    className="w-16 rounded-lg border border-petal bg-white px-1.5 py-1 text-right text-sm font-bold outline-none focus:border-blossom"
                  />
                  <span className="text-xs text-ink-faint">g</span>
                </div>
              )}
              <button onClick={() => removePart(i)} className="p-1 text-ink-faint active:text-blossom-strong" aria-label="Retirer">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setAdding("food")}
          className="flex-1 rounded-2xl border border-petal bg-white py-2.5 text-sm font-bold text-blossom-strong active:bg-paper"
        >
          + Aliment
        </button>
        <button
          onClick={() => setAdding("recipe")}
          className="flex-1 rounded-2xl border border-petal bg-white py-2.5 text-sm font-bold text-blossom-strong active:bg-paper"
        >
          + Recette
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-paper px-4 py-3 text-center">
        <p className="text-sm font-bold">
          Total : <span className="text-mkcal">{Math.round(total.kcal)} kcal</span>
        </p>
        <p className="text-xs text-ink-soft">
          P {round1(total.prot)} g · G {round1(total.gluc)} g · L {round1(total.lip)} g
        </p>
      </div>

      <button
        onClick={() => onSave({ title: title.trim() || meal.title, parts })}
        className="mt-4 w-full rounded-2xl bg-blossom-strong py-3.5 text-base font-bold text-white shadow-card transition active:scale-[0.98]"
      >
        {saveLabel}
      </button>
      {onReset && (
        <button onClick={onReset} className="mt-2 w-full py-2 text-sm font-semibold text-ink-soft">
          {resetLabel ?? "Revenir au plan d'origine"}
        </button>
      )}
    </div>
  );
}
