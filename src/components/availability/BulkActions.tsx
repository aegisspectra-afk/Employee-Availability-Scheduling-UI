"use client";

import { CheckCheck, Ban, Undo2 } from "lucide-react";

type BulkActionsProps = {
  onMarkAllAvailable: () => void;
  onMarkAllUnavailable: () => void;
  undoLabel: string | null;
  onUndo: () => void;
  disabled?: boolean;
};

export function BulkActions({
  onMarkAllAvailable,
  onMarkAllUnavailable,
  undoLabel,
  onUndo,
  disabled = false,
}: BulkActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onMarkAllAvailable}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" aria-hidden />
          הכול זמין
        </button>
        <button
          type="button"
          onClick={onMarkAllUnavailable}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Ban className="h-4 w-4" aria-hidden />
          הכול לא זמין
        </button>
      </div>

      {undoLabel && (
        <button
          type="button"
          onClick={onUndo}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" aria-hidden />
          בטל שינוי אחרון
        </button>
      )}
    </div>
  );
}
