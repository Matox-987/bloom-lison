import { useMemo, useState } from "react";
import type { Food } from "../lib/types";
import { macrosOfFood, round1 } from "../lib/nutrition";

interface FoodPickerProps {
  foods: Record<string, Food>;
  onPick: (foodId: string, grams: number) => void;
  confirmLabel?: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Recherche d'un aliment + saisie de la quantité, avec aperçu des macros en direct. */
export default function FoodPicker({ foods, onPick, confirmLabel = "Ajouter" }: FoodPickerProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState("100");

  const results = useMemo(() => {
    const q = normalize(query);
    const list = Object.values(foods).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    if (!q) return list;
    return list.filter((f) => normalize(f.nom).includes(q));
  }, [foods, query]);

  if (selected) {
    const g = parseFloat(grams) || 0;
    const m = macrosOfFood(selected, g);
    return (
      <div className="animate-rise">
        <button onClick={() => setSelected(null)} className="mb-3 text-sm font-semibold text-blossom-strong">
          ← Changer d'aliment
        </button>
        <p className="mb-1 text-lg font-bold">{selected.nom}</p>
        {selected.note && <p className="mb-2 text-xs text-ink-soft">{selected.note}</p>}
        <label className="mb-1 block text-sm font-semibold text-ink-soft">Quantité (g)</label>
        <input
          type="number"
          inputMode="decimal"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          autoFocus
          className="w-full rounded-2xl border border-petal bg-paper px-4 py-3 text-lg font-bold outline-none focus:border-blossom"
        />
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { label: "kcal", value: Math.round(m.kcal), color: "text-mkcal" },
            { label: "Prot", value: `${round1(m.prot)} g`, color: "text-mprot" },
            { label: "Gluc", value: `${round1(m.gluc)} g`, color: "text-mgluc" },
            { label: "Lip", value: `${round1(m.lip)} g`, color: "text-mlip" },
          ].map((x) => (
            <div key={x.label} className="rounded-xl bg-paper px-1 py-2">
              <p className={`text-sm font-extrabold ${x.color}`}>{x.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{x.label}</p>
            </div>
          ))}
        </div>
        <button
          disabled={g <= 0}
          onClick={() => onPick(selected.id, g)}
          className="mt-4 w-full rounded-2xl bg-blossom-strong py-3.5 text-base font-bold text-white shadow-card transition active:scale-[0.98] disabled:opacity-40"
        >
          {confirmLabel}
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="search"
        placeholder="Rechercher un aliment…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="mb-3 w-full rounded-2xl border border-petal bg-paper px-4 py-3 outline-none focus:border-blossom"
      />
      <ul className="max-h-[45dvh] divide-y divide-paper overflow-y-auto">
        {results.map((f) => (
          <li key={f.id}>
            <button
              onClick={() => setSelected(f)}
              className="flex w-full items-center justify-between gap-2 py-3 text-left active:bg-paper"
            >
              <span className="text-sm font-semibold">{f.nom}</span>
              <span className="shrink-0 text-xs text-ink-faint">{f.kcal} kcal/100g</span>
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="py-6 text-center text-sm text-ink-faint">Aucun résultat</li>}
      </ul>
    </div>
  );
}
