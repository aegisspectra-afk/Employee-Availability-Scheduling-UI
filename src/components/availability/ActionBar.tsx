"use client";

import { Copy, Eraser, RotateCcw, Save, Send } from "lucide-react";

type ActionBarProps = {
  onClear: () => void;
  onCopyPrevious: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onResetDemo: () => void;
  isSubmitted: boolean;
  canSubmit: boolean;
};

const secondaryBtn =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40";

export function ActionBar({
  onClear,
  onCopyPrevious,
  onSaveDraft,
  onSubmit,
  onResetDemo,
  isSubmitted,
  canSubmit,
}: ActionBarProps) {
  return (
    <section
      aria-label="פעולות"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onClear} className={secondaryBtn}>
            <Eraser className="h-4 w-4" aria-hidden />
            נקה בחירות
          </button>
          <button type="button" onClick={onCopyPrevious} className={secondaryBtn}>
            <Copy className="h-4 w-4" aria-hidden />
            העתק שבוע קודם
          </button>
          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            איפוס להדגמה
          </button>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:flex-none"
          >
            <Save className="h-4 w-4" aria-hidden />
            שמירת טיוטה
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className={[
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:flex-none",
              canSubmit
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600/90 hover:bg-blue-700",
            ].join(" ")}
            title={
              canSubmit
                ? undefined
                : "השליחה תיחסם עד להשלמת נוהל הזמינות"
            }
          >
            <Send className="h-4 w-4" aria-hidden />
            {isSubmitted ? "שלח שוב" : "שליחת זמינות"}
          </button>
        </div>
      </div>
    </section>
  );
}
