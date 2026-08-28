import { useMemo, useState } from "react";
import {
  addExtra,
  dismissSuggestion,
  overrideMeal,
  removeExtra,
  setGoals,
  setWeight,
  toggleMeal,
  toggleOmega3,
  useAppState,
} from "../lib/store";
import { addDays, dayIndexOf, formatLong, todayISO } from "../lib/dates";
import { EMPTY_LOG, consumedForDay, goalsAt, macrosOfMeal, mealForSlot, round1 } from "../lib/nutrition";
import { SLOTS, SLOT_EMOJIS, SLOT_LABELS, type Slot } from "../lib/types";
import { streak, suggestPalier } from "../lib/trend";
import Ring from "../components/Ring";
import Sheet from "../components/Sheet";
import FoodPicker from "../components/FoodPicker";
import MealEditor from "../components/MealEditor";

export default function Today() {
  const state = useAppState();
  const [date, setDate] = useState(todayISO());
  const [openSlot, setOpenSlot] = useState<Slot | null>(null);
  const [editingSlot, setEditingSlot] = useState(false);
  const [addingFood, setAddingFood] = useState(false);
  const [justChecked, setJustChecked] = useState<Slot | null>(null);

  const isToday = date === todayISO();
  const dayIndex = dayIndexOf(date);
  const log = state.logs[date] ?? EMPTY_LOG;
  const consumed = consumedForDay(state, dayIndex, log);
  const goal = goalsAt(state, date);
  const currentStreak = streak(state);
  const suggestion = useMemo(() => (isToday ? suggestPalier(state) : null), [state, isToday]);

  const [weightInput, setWeightInput] = useState<string | null>(null);
  const weightValue = weightInput ?? (log.weight !== undefined ? String(log.weight) : "");

  const onCheck = (slot: Slot) => {
    toggleMeal(date, slot);
    if (!log.checked[slot]) {
      setJustChecked(slot);
      setTimeout(() => setJustChecked(null), 400);
    }
  };

  const macroRings = [
    { label: "Protéines", short: "P", value: consumed.prot, max: goal.prot, color: "#8B5CF6", text: "text-mprot" },
    { label: "Glucides", short: "G", value: consumed.gluc, max: goal.gluc, color: "#F59E0B", text: "text-mgluc" },
    { label: "Lipides", short: "L", value: consumed.lip, max: goal.lip, color: "#14B8A6", text: "text-mlip" },
  ];

  return (
    <div className="animate-rise">
      {/* En-tête */}
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-blossom-deep">Bloom</h1>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-ink-soft">
            <button onClick={() => setDate(addDays(date, -1))} className="rounded p-0.5 text-blossom-strong" aria-label="Jour précédent">
              ‹
            </button>
            <span className="font-semibold">{isToday ? `Aujourd'hui · ${formatLong(date)}` : formatLong(date)}</span>
            <button
              onClick={() => setDate(addDays(date, 1))}
              disabled={isToday}
              className="rounded p-0.5 text-blossom-strong disabled:opacity-30"
              aria-label="Jour suivant"
            >
              ›
            </button>
          </div>
        </div>
        {currentStreak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-card">
            <span className="text-base">🔥</span>
            <span className="text-sm font-extrabold text-blossom-strong">{currentStreak}</span>
            <span className="text-xs font-semibold text-ink-soft">j</span>
          </div>
        )}
      </header>

      {/* Suggestion de palier */}
      {suggestion && (
        <div className="mb-4 rounded-3xl border border-petal bg-white p-4 shadow-card">
          <p className="text-sm font-bold text-blossom-deep">📈 Le poids stagne depuis ~2 semaines</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Tendance : {suggestion.slopeKgPerWeek >= 0 ? "+" : ""}
            {suggestion.slopeKgPerWeek.toFixed(2)} kg/sem. C'est le moment de passer au palier suivant :{" "}
            <strong className="text-ink">+{suggestion.addKcal} kcal/jour</strong> (surtout en glucides).
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() =>
                setGoals({
                  from: todayISO(),
                  kcal: Math.round(goal.kcal + suggestion.addKcal),
                  prot: Math.round(goal.prot + 5),
                  gluc: Math.round(goal.gluc + 35),
                  lip: Math.round(goal.lip + 3),
                })
              }
              className="flex-1 rounded-xl bg-blossom-strong py-2 text-sm font-bold text-white active:scale-[0.98]"
            >
              Appliquer
            </button>
            <button
              onClick={() => dismissSuggestion(todayISO())}
              className="flex-1 rounded-xl border border-petal py-2 text-sm font-semibold text-ink-soft"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {/* Anneaux de progression */}
      <section className="mb-4 rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-center">
          <Ring value={consumed.kcal} max={goal.kcal} size={168} stroke={14} color="#EC4899">
            <p className="font-display text-4xl font-bold leading-none text-ink">{Math.round(consumed.kcal)}</p>
            <p className="mt-1 text-xs font-semibold text-ink-faint">/ {goal.kcal} kcal</p>
            {consumed.kcal >= goal.kcal && <p className="mt-0.5 text-xs font-bold text-success">Objectif atteint ✓</p>}
          </Ring>
        </div>
        <div className="mt-4 flex justify-around">
          {macroRings.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-1">
              <Ring value={m.value} max={m.max} size={64} stroke={7} color={m.color}>
                <span className={`text-sm font-extrabold ${m.text}`}>{Math.round(m.value)}</span>
              </Ring>
              <p className="text-[11px] font-semibold text-ink-soft">{m.label}</p>
              <p className="-mt-1 text-[10px] text-ink-faint">/ {m.max} g</p>
            </div>
          ))}
        </div>
      </section>

      {/* Repas du jour */}
      <section className="space-y-2.5">
        {SLOTS.map((slot) => {
          const meal = mealForSlot(state, dayIndex, slot, log);
          const m = macrosOfMeal(meal, state.foods, state.recipes);
          const checked = !!log.checked[slot];
          const overridden = !!log.overrides[slot];
          return (
            <div
              key={slot}
              className={`flex items-center gap-3 rounded-3xl bg-white p-3.5 shadow-card transition ${
                checked ? "ring-1 ring-blossom/40" : ""
              }`}
            >
              <button
                onClick={() => onCheck(slot)}
                aria-label={checked ? "Décocher le repas" : "Cocher le repas"}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  checked ? "border-blossom bg-blossom text-white" : "border-petal bg-white text-transparent"
                } ${justChecked === slot ? "animate-pop" : ""}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button onClick={() => setOpenSlot(slot)} className="min-w-0 flex-1 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">
                  {SLOT_EMOJIS[slot]} {SLOT_LABELS[slot]}
                  {overridden && <span className="ml-1.5 rounded bg-petal/60 px-1.5 py-0.5 text-[9px] text-blossom-deep">modifié</span>}
                </p>
                <p className={`truncate text-sm font-bold ${checked ? "text-ink-faint line-through decoration-2" : "text-ink"}`}>
                  {meal.title}
                </p>
                <p className="text-xs text-ink-soft">
                  <span className="font-bold text-mkcal">{Math.round(m.kcal)} kcal</span>
                  {" · "}P {round1(m.prot)} · G {round1(m.gluc)} · L {round1(m.lip)}
                </p>
              </button>
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
            </div>
          );
        })}
      </section>

      {/* Extras */}
      <section className="mt-4">
        {log.extras.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {log.extras.map((extra) => {
              const food = state.foods[extra.foodId];
              if (!food) return null;
              const kcal = Math.round((food.kcal * extra.grams) / 100);
              return (
                <div key={extra.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-card">
                  <span className="text-lg">🍴</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{food.nom}</p>
                    <p className="text-xs text-ink-soft">
                      {extra.grams} g · <span className="font-bold text-mkcal">{kcal} kcal</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeExtra(date, extra.id)}
                    className="p-1 text-ink-faint active:text-blossom-strong"
                    aria-label="Supprimer"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <button
          onClick={() => setAddingFood(true)}
          className="w-full rounded-3xl border-2 border-dashed border-petal py-3 text-sm font-bold text-blossom-strong active:bg-white"
        >
          + Ajouter un aliment (grignotage, hors plan…)
        </button>
      </section>

      {/* Oméga-3 & poids */}
      <section className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => toggleOmega3(date)}
          className={`flex flex-col items-start gap-1 rounded-3xl p-4 text-left shadow-card transition ${
            log.omega3 ? "bg-success-soft ring-1 ring-success/30" : "bg-white"
          }`}
        >
          <span className="text-xl">💊</span>
          <span className="text-xs font-bold leading-tight">Oméga-3</span>
          <span className={`text-[11px] font-semibold ${log.omega3 ? "text-success" : "text-ink-faint"}`}>
            {log.omega3 ? "Pris ✓" : "À prendre"}
          </span>
        </button>
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <span className="text-xl">⚖️</span>
          <p className="mt-1 text-xs font-bold leading-tight">Poids du jour</p>
          <div className="mt-1 flex items-baseline gap-1">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="57.0"
              value={weightValue}
              onChange={(e) => {
                const raw = e.target.value;
                setWeightInput(raw);
                // Enregistre dès qu'une valeur plausible est saisie : sur mobile, l'app peut être
                // fermée sans que le champ perde le focus, et le poids pilote les paliers.
                const v = parseFloat(raw.replace(",", "."));
                if (Number.isFinite(v) && v > 20 && v < 300) setWeight(date, Math.round(v * 10) / 10);
              }}
              onBlur={() => {
                if (weightInput === null) return;
                const v = parseFloat(weightInput.replace(",", "."));
                setWeight(date, Number.isFinite(v) && v > 20 && v < 300 ? Math.round(v * 10) / 10 : undefined);
                setWeightInput(null);
              }}
              className="w-16 border-b-2 border-petal bg-transparent pb-0.5 font-display text-lg font-bold outline-none focus:border-blossom"
            />
            <span className="text-xs font-semibold text-ink-faint">kg</span>
          </div>
        </div>
      </section>

      {/* Détail / modification d'un repas */}
      <Sheet
        open={openSlot !== null}
        onClose={() => {
          setOpenSlot(null);
          setEditingSlot(false);
        }}
        title={openSlot ? `${SLOT_EMOJIS[openSlot]} ${SLOT_LABELS[openSlot]}` : undefined}
      >
        {openSlot && !editingSlot && (
          <MealDetail
            slot={openSlot}
            dayIndex={dayIndex}
            date={date}
            onEdit={() => setEditingSlot(true)}
          />
        )}
        {openSlot && editingSlot && (
          <MealEditor
            meal={mealForSlot(state, dayIndex, openSlot, log)}
            foods={state.foods}
            recipes={state.recipes}
            saveLabel="Enregistrer pour ce jour"
            onSave={(meal) => {
              overrideMeal(date, openSlot, meal);
              setEditingSlot(false);
            }}
            onReset={
              log.overrides[openSlot]
                ? () => {
                    overrideMeal(date, openSlot, null);
                    setEditingSlot(false);
                  }
                : undefined
            }
          />
        )}
      </Sheet>

      {/* Ajout libre d'un aliment */}
      <Sheet open={addingFood} onClose={() => setAddingFood(false)} title="Ajouter un aliment">
        <FoodPicker
          foods={state.foods}
          onPick={(foodId, grams) => {
            addExtra(date, foodId, grams);
            setAddingFood(false);
          }}
        />
      </Sheet>
    </div>
  );
}

function MealDetail({ slot, dayIndex, date, onEdit }: { slot: Slot; dayIndex: number; date: string; onEdit: () => void }) {
  const state = useAppState();
  const log = state.logs[date] ?? EMPTY_LOG;
  const meal = mealForSlot(state, dayIndex, slot, log);
  const total = macrosOfMeal(meal, state.foods, state.recipes);

  // Détail ligne par ligne, recettes dépliées
  const lines: { label: string; grams?: number; kcal: number }[] = [];
  for (const part of meal.parts) {
    if ("foodId" in part) {
      const food = state.foods[part.foodId];
      if (food) lines.push({ label: food.nom, grams: part.grams, kcal: (food.kcal * part.grams) / 100 });
    } else {
      const recipe = state.recipes[part.recipeId];
      if (!recipe) continue;
      for (const item of recipe.items) {
        const food = state.foods[item.foodId];
        if (food) lines.push({ label: `${recipe.emoji ?? ""} ${food.nom}`.trim(), grams: item.grams, kcal: (food.kcal * item.grams) / 100 });
      }
    }
  }

  return (
    <div>
      <p className="mb-3 text-base font-bold">{meal.title}</p>
      <ul className="divide-y divide-paper">
        {lines.map((l, i) => (
          <li key={i} className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium">{l.label}</span>
            <span className="shrink-0 text-ink-soft">
              {l.grams !== undefined && <span className="mr-2 text-ink-faint">{l.grams} g</span>}
              <span className="font-bold">{Math.round(l.kcal)} kcal</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-2xl bg-paper px-4 py-3 text-center">
        <p className="text-sm font-bold">
          Total : <span className="text-mkcal">{Math.round(total.kcal)} kcal</span>
        </p>
        <p className="text-xs text-ink-soft">
          P {round1(total.prot)} g · G {round1(total.gluc)} g · L {round1(total.lip)} g
        </p>
      </div>
      <button
        onClick={onEdit}
        className="mt-4 w-full rounded-2xl bg-blossom-strong py-3.5 text-base font-bold text-white shadow-card transition active:scale-[0.98]"
      >
        Modifier pour ce jour
      </button>
      <p className="mt-2 text-center text-xs text-ink-faint">
        Les modifications ici ne changent que ce jour — le plan hebdo reste intact.
      </p>
    </div>
  );
}
