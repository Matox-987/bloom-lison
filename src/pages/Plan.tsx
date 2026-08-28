import { useState } from "react";
import { updatePlanMeal, useAppState } from "../lib/store";
import { DAY_NAMES, DAY_NAMES_SHORT, dayIndexOf, todayISO } from "../lib/dates";
import { goalsAt, macrosOfMeal, plannedForDay, round1 } from "../lib/nutrition";
import { SLOTS, SLOT_EMOJIS, SLOT_LABELS, type Slot } from "../lib/types";
import Sheet from "../components/Sheet";
import MealEditor from "../components/MealEditor";

export default function PlanPage() {
  const state = useAppState();
  const [day, setDay] = useState(dayIndexOf(todayISO()));
  const [editSlot, setEditSlot] = useState<Slot | null>(null);

  const planned = plannedForDay(state, day, undefined);
  const goal = goalsAt(state, todayISO());

  return (
    <div className="animate-rise">
      <h1 className="mb-3 font-display text-2xl font-bold text-blossom-deep">Plan hebdo</h1>

      {/* Sélecteur de jour */}
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {DAY_NAMES_SHORT.map((label, i) => (
          <button
            key={label}
            onClick={() => setDay(i)}
            className={`min-w-[3.2rem] rounded-2xl px-3 py-2 text-sm font-bold transition ${
              day === i ? "bg-blossom-strong text-white shadow-card" : "bg-white text-ink-soft shadow-card"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Total du jour planifié */}
      <div className="mb-4 rounded-3xl bg-white p-4 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">{DAY_NAMES[day]} — total prévu</p>
        <p className="mt-1 text-lg font-extrabold">
          <span className="text-mkcal">{Math.round(planned.kcal)} kcal</span>
          <span className="ml-2 text-sm font-semibold text-ink-soft">/ objectif {goal.kcal}</span>
        </p>
        <p className="text-xs text-ink-soft">
          P {round1(planned.prot)} g <span className="text-ink-faint">(obj. {goal.prot})</span> · G {round1(planned.gluc)} g{" "}
          <span className="text-ink-faint">(obj. {goal.gluc})</span> · L {round1(planned.lip)} g{" "}
          <span className="text-ink-faint">(obj. {goal.lip})</span>
        </p>
      </div>

      {/* Repas du jour sélectionné */}
      <div className="space-y-2.5">
        {SLOTS.map((slot) => {
          const meal = state.plan[day][slot];
          const m = macrosOfMeal(meal, state.foods, state.recipes);
          return (
            <button
              key={slot}
              onClick={() => setEditSlot(slot)}
              className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-card active:scale-[0.99]"
            >
              <span className="text-xl">{SLOT_EMOJIS[slot]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{SLOT_LABELS[slot]}</p>
                <p className="truncate text-sm font-bold">{meal.title}</p>
                <p className="text-xs text-ink-soft">
                  <span className="font-bold text-mkcal">{Math.round(m.kcal)} kcal</span>
                  {" · "}P {round1(m.prot)} · G {round1(m.gluc)} · L {round1(m.lip)}
                </p>
              </div>
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5l4 4L8 20l-5 1 1-5L16.5 3.5z" />
              </svg>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
        Modifier ici change le plan <strong>toutes les semaines</strong>.<br />
        Pour un changement ponctuel, passe par l'onglet Aujourd'hui.
      </p>

      <Sheet
        open={editSlot !== null}
        onClose={() => setEditSlot(null)}
        title={editSlot ? `${DAY_NAMES[day]} — ${SLOT_LABELS[editSlot]}` : undefined}
      >
        {editSlot && (
          <MealEditor
            meal={state.plan[day][editSlot]}
            foods={state.foods}
            recipes={state.recipes}
            saveLabel="Enregistrer dans le plan"
            onSave={(meal) => {
              updatePlanMeal(day, editSlot, meal);
              setEditSlot(null);
            }}
          />
        )}
      </Sheet>
    </div>
  );
}
