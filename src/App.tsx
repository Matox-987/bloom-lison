import { useState } from "react";
import Today from "./pages/Today";
import Stats from "./pages/Stats";
import PlanPage from "./pages/Plan";
import Foods from "./pages/Foods";
import Settings from "./pages/Settings";

type Tab = "today" | "stats" | "plan" | "foods" | "settings";

const TABS: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: "today",
    label: "Aujourd'hui",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l8.5 7v10a1 1 0 01-1 1h-5v-6h-5v6h-5a1 1 0 01-1-1V10L12 3z"
        />
      </svg>
    ),
  },
  {
    id: "stats",
    label: "Stats",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.6 : 1.8}>
        <path strokeLinecap="round" d="M5 20V14M12 20V8M19 20V4" />
      </svg>
    ),
  },
  {
    id: "plan",
    label: "Plan",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.4 : 1.8}>
        <rect x="4" y="5" width="16" height="16" rx="3" />
        <path strokeLinecap="round" d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    ),
  },
  {
    id: "foods",
    label: "Aliments",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.4 : 1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21c-4.5-2.5-7.5-6-7.5-9.5C4.5 8 7 6 9.5 6c1 0 2 .4 2.5 1 .5-.6 1.5-1 2.5-1 2.5 0 5 2 5 5.5 0 3.5-3 7-7.5 9.5z"
        />
        <path strokeLinecap="round" d="M12 7V4.5c0-1 .8-1.5 2-1.5" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Réglages",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={a ? 2.4 : 1.8}>
        <circle cx="12" cy="12" r="3.2" />
        <path
          strokeLinecap="round"
          d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 00-2-1.2L14.2 3h-4l-.4 2.5a7 7 0 00-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 002 1.2l.4 2.5h4l.4-2.5a7 7 0 002-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"
        />
      </svg>
    ),
  },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <main className="flex-1 px-4 pb-28 pt-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        {tab === "today" && <Today />}
        {tab === "stats" && <Stats />}
        {tab === "plan" && <PlanPage />}
        {tab === "foods" && <Foods />}
        {tab === "settings" && <Settings />}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-petal/60 bg-white/90 backdrop-blur-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
                  active ? "text-blossom-strong" : "text-ink-faint"
                }`}
              >
                {t.icon(active)}
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
