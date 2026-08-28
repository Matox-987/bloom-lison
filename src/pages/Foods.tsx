import { useMemo, useState } from "react";
import { deleteFood, upsertFood, useAppState } from "../lib/store";
import type { Food } from "../lib/types";
import Sheet from "../components/Sheet";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function slugify(s: string): string {
  return normalize(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const EMPTY_FORM = { nom: "", kcal: "", prot: "", gluc: "", lip: "", note: "" };

export default function Foods() {
  const state = useAppState();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Food | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const foods = useMemo(() => {
    const q = normalize(query);
    return Object.values(state.foods)
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
      .filter((food) => !q || normalize(food.nom).includes(q));
  }, [state.foods, query]);

  const openEdit = (food: Food | "new") => {
    setEditing(food);
    setForm(
      food === "new"
        ? EMPTY_FORM
        : {
            nom: food.nom,
            kcal: String(food.kcal),
            prot: String(food.prot),
            gluc: String(food.gluc),
            lip: String(food.lip),
            note: food.note ?? "",
          }
    );
  };

  const save = () => {
    const nom = form.nom.trim();
    if (!nom) return;
    const id = editing !== null && editing !== "new" ? editing.id : slugify(nom) || `food-${Date.now()}`;
    upsertFood({
      id,
      nom,
      kcal: parseFloat(form.kcal) || 0,
      prot: parseFloat(form.prot) || 0,
      gluc: parseFloat(form.gluc) || 0,
      lip: parseFloat(form.lip) || 0,
      note: form.note.trim() || undefined,
    });
    setEditing(null);
  };

  const field = (key: keyof typeof EMPTY_FORM, label: string, props: Record<string, unknown> = {}) => (
    <div>
      <label className="mb-1 block text-xs font-bold text-ink-soft">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full rounded-xl border border-petal bg-paper px-3 py-2 text-sm font-semibold outline-none focus:border-blossom"
        {...props}
      />
    </div>
  );

  return (
    <div className="animate-rise">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-blossom-deep">Aliments</h1>
        <button
          onClick={() => openEdit("new")}
          className="rounded-2xl bg-blossom-strong px-4 py-2 text-sm font-bold text-white shadow-card active:scale-[0.97]"
        >
          + Nouveau
        </button>
      </div>

      <input
        type="search"
        placeholder="Rechercher…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3 w-full rounded-2xl border border-petal bg-white px-4 py-3 shadow-card outline-none focus:border-blossom"
      />

      <p className="mb-2 text-xs text-ink-faint">Valeurs pour 100 g, cru/sec sauf mention. Appuie sur un aliment pour l'ajuster.</p>

      <div className="space-y-1.5">
        {foods.map((food) => (
          <button
            key={food.id}
            onClick={() => openEdit(food)}
            className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-card active:scale-[0.99]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {food.nom}
                {food.custom && <span className="ml-1.5 rounded bg-petal/60 px-1.5 py-0.5 text-[9px] font-bold text-blossom-deep">perso</span>}
              </p>
              <p className="text-xs text-ink-soft">
                <span className="font-bold text-mkcal">{food.kcal} kcal</span> · P {food.prot} · G {food.gluc} · L {food.lip}
              </p>
              {food.note && <p className="text-[11px] text-ink-faint">{food.note}</p>}
            </div>
          </button>
        ))}
      </div>

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Nouvel aliment" : "Modifier l'aliment"}>
        <div className="space-y-3">
          {field("nom", "Nom", { placeholder: "Ex : Skyr nature" })}
          <div className="grid grid-cols-2 gap-3">
            {field("kcal", "kcal / 100 g", { type: "number", inputMode: "decimal" })}
            {field("prot", "Protéines (g)", { type: "number", inputMode: "decimal" })}
            {field("gluc", "Glucides (g)", { type: "number", inputMode: "decimal" })}
            {field("lip", "Lipides (g)", { type: "number", inputMode: "decimal" })}
          </div>
          {field("note", "Note (optionnel)", { placeholder: "Ex : peser avant cuisson" })}
          <button
            onClick={save}
            disabled={!form.nom.trim()}
            className="w-full rounded-2xl bg-blossom-strong py-3.5 text-base font-bold text-white shadow-card transition active:scale-[0.98] disabled:opacity-40"
          >
            Enregistrer
          </button>
          {editing !== null && editing !== "new" && (
            <button
              onClick={() => {
                if (confirm(`Supprimer « ${editing.nom} » de la base ?`)) {
                  deleteFood(editing.id);
                  setEditing(null);
                }
              }}
              className="w-full py-2 text-sm font-semibold text-blossom-deep"
            >
              Supprimer cet aliment
            </button>
          )}
        </div>
      </Sheet>
    </div>
  );
}
