"use client";

import {
  Copy,
  Eraser,
  MessageSquareText,
  PencilLine,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";

type ActionBarProps = {
  notes: string;
  onNotesChange: (notes: string) => void;
  onClear: () => void;
  onCopyPrevious: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onResetDemo: () => void;
  onReopenForEdit?: () => void;
  isSubmitted: boolean;
  weekClosed: boolean;
  deadlineLocked?: boolean;
  isReadOnly: boolean;
};

const secondaryBtn =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50";

export function ActionBar({
  notes,
  onNotesChange,
  onClear,
  onCopyPrevious,
  onSaveDraft,
  onSubmit,
  onResetDemo,
  onReopenForEdit,
  isSubmitted,
  weekClosed,
  deadlineLocked = false,
  isReadOnly,
}: ActionBarProps) {
  const editingBlocked = isReadOnly;
  const submitBlocked = weekClosed || isSubmitted || deadlineLocked;

  return (
    <section
      aria-label="פעולות"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4">
        <label
          htmlFor="availability-notes"
          className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"
        >
          <MessageSquareText className="h-4 w-4 text-slate-400" aria-hidden />
          הערות
        </label>
        <textarea
          id="availability-notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={3}
          maxLength={500}
          disabled={editingBlocked}
          placeholder="כאן אפשר לכתוב בקשה מיוחדת לגבי משמרת, אילוץ אישי, או כל הערה שתעזור בבניית סידור העבודה…"
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        />
        <p className="mt-1.5 text-[11px] text-slate-400">
          ההערה תוצג למתכנני הסידור יחד עם הזמינות השבועית
          {notes.length > 0 ? ` · ${notes.length}/500` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={editingBlocked}
            className={secondaryBtn}
          >
            <Eraser className="h-4 w-4" aria-hidden />
            נקה בחירות
          </button>
          <button
            type="button"
            onClick={onCopyPrevious}
            disabled={editingBlocked}
            className={secondaryBtn}
          >
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
          {isSubmitted && !weekClosed && !deadlineLocked && onReopenForEdit && (
            <button
              type="button"
              onClick={onReopenForEdit}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 sm:flex-none"
            >
              <PencilLine className="h-4 w-4" aria-hidden />
              עריכה מחדש
            </button>
          )}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={submitBlocked}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <Save className="h-4 w-4" aria-hidden />
            שמירת טיוטה
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitBlocked}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-blue-600/50 sm:flex-none"
          >
            <Send className="h-4 w-4" aria-hidden />
            {isSubmitted ? "הוגש" : "שליחת זמינות"}
          </button>
        </div>
      </div>
    </section>
  );
}
