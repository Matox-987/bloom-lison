import { useEffect } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Bottom sheet mobile. */
export default function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="animate-fade absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        className="animate-sheet absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="sticky top-0 z-10 bg-white px-5 pb-2 pt-3">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-petal" />
          {title && <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>}
        </div>
        <div className="px-5 pt-1">{children}</div>
      </div>
    </div>
  );
}
