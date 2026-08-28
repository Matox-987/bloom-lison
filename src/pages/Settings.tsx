import { useRef, useState } from "react";
import { exportStateJSON, importStateJSON, setGoals, useAppState } from "../lib/store";
import { formatLong, todayISO } from "../lib/dates";
import { goalsAt } from "../lib/nutrition";

export default function Settings() {
  const state = useAppState();
  const today = todayISO();
  const current = goalsAt(state, today);
  const [form, setForm] = useState({
    kcal: String(current.kcal),
    prot: String(current.prot),
    gluc: String(current.gluc),
    lip: String(current.lip),
  });
  const [saved, setSaved] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => {
    setGoals({
      from: today,
      kcal: Math.round(parseFloat(form.kcal) || current.kcal),
      prot: Math.round(parseFloat(form.prot) || current.prot),
      gluc: Math.round(parseFloat(form.gluc) || current.gluc),
      lip: Math.round(parseFloat(form.lip) || current.lip),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const doExport = () => {
    const blob = new Blob([exportStateJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bloom-sauvegarde-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importStateJSON(String(reader.result));
      setImportMsg(ok ? "Sauvegarde restaurée ✓" : "Fichier invalide — rien n'a été modifié");
      setTimeout(() => setImportMsg(null), 3000);
    };
    reader.readAsText(file);
  };

  const field = (key: keyof typeof form, label: string, color: string) => (
    <div>
      <label className={`mb-1 block text-xs font-bold ${color}`}>{label}</label>
      <input
        type="number"
        inputMode="numeric"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full rounded-xl border border-petal bg-paper px-3 py-2.5 text-base font-bold outline-none focus:border-blossom"
      />
    </div>
  );

  return (
    <div className="animate-rise">
      <h1 className="mb-3 font-display text-2xl font-bold text-blossom-deep">Réglages</h1>

      {/* Objectifs */}
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-bold">Objectifs quotidiens</h2>
        <p className="mb-3 text-xs text-ink-soft">
          Palier actuel depuis le {formatLong(current.from).toLowerCase()}. Modifier crée un nouveau palier à partir
          d'aujourd'hui — l'historique garde les anciens objectifs.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {field("kcal", "Calories (kcal)", "text-mkcal")}
          {field("prot", "Protéines (g)", "text-mprot")}
          {field("gluc", "Glucides (g)", "text-mgluc")}
          {field("lip", "Lipides (g)", "text-mlip")}
        </div>
        <button
          onClick={save}
          className={`mt-4 w-full rounded-2xl py-3.5 text-base font-bold text-white shadow-card transition active:scale-[0.98] ${
            saved ? "bg-success" : "bg-blossom-strong"
          }`}
        >
          {saved ? "Enregistré ✓" : "Enregistrer le nouveau palier"}
        </button>
      </section>

      {/* Historique des paliers */}
      {state.goals.length > 1 && (
        <section className="mb-4 rounded-3xl bg-white p-4 shadow-card">
          <h2 className="mb-2 text-sm font-bold">Historique des paliers</h2>
          <ul className="divide-y divide-paper">
            {[...state.goals].reverse().map((g) => (
              <li key={g.from} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-soft">{formatLong(g.from)}</span>
                <span className="font-bold">
                  {g.kcal} kcal <span className="font-semibold text-ink-faint">· P{g.prot} G{g.gluc} L{g.lip}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Comment ça marche */}
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-2 text-sm font-bold">💡 La stratégie de prise de masse</h2>
        <ul className="space-y-1.5 text-xs leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">Progressivité :</strong> on démarre à ~2550 kcal et on monte par paliers de
            150-200 kcal plutôt qu'un gros choc calorique — le corps compense moins, la prise reste propre.
          </li>
          <li>
            <strong className="text-ink">Piloté par les données :</strong> pèse-toi le matin le plus souvent possible.
            Si la tendance stagne 10-14 jours, l'app te proposera le palier suivant sur l'écran Aujourd'hui.
          </li>
          <li>
            <strong className="text-ink">Cap :</strong> viser ~0.4-0.5 kg/semaine, jusqu'à ~2700-2900 kcal/jour.
          </li>
        </ul>
      </section>

      {/* Sauvegarde */}
      <section className="rounded-3xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-bold">Sauvegarde des données</h2>
        <p className="mb-3 text-xs leading-relaxed text-ink-soft">
          Tes données vivent sur ce téléphone. Exporte une sauvegarde de temps en temps (elle se restaure ici, sur
          n'importe quel appareil).
        </p>
        <div className="flex gap-2">
          <button
            onClick={doExport}
            className="flex-1 rounded-2xl bg-blossom-strong py-3 text-sm font-bold text-white shadow-card active:scale-[0.98]"
          >
            Exporter
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 rounded-2xl border border-petal bg-white py-3 text-sm font-bold text-blossom-strong active:bg-paper"
          >
            Restaurer
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = "";
            }}
          />
        </div>
        {importMsg && <p className="mt-2 text-center text-sm font-semibold text-success">{importMsg}</p>}
      </section>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Bloom 🌸 — fait avec amour pour Lison
      </p>
    </div>
  );
}
