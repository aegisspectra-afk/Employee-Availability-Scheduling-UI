"use client";

import { useEffect, useId, useRef } from "react";
import { Send, X } from "lucide-react";
import type { AvailabilitySummary } from "@/lib/types";
import { formatWeekRange } from "@/lib/week-utils";

type SubmissionDialogProps = {
  open: boolean;
  weekId: string;
  summary: AvailabilitySummary;
  notes?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function SubmissionDialog({
  open,
  weekId,
  summary,
  notes = "",
  onConfirm,
  onClose,
}: SubmissionDialogProps) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onConfirm();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="סגור"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              הדגמת שליחת זמינות
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {formatWeekRange(weekId)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="סגור דיאלוג"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 px-2 py-3">
              <p className="text-xl font-bold text-emerald-700">
                {summary.available}
              </p>
              <p className="text-[11px] text-emerald-700/80">זמין</p>
            </div>
            <div className="rounded-xl bg-rose-50 px-2 py-3">
              <p className="text-xl font-bold text-rose-700">
                {summary.unavailable}
              </p>
              <p className="text-[11px] text-rose-700/80">לא זמין</p>
            </div>
          </div>

          {notes.trim() && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-700">
              <p className="mb-1 text-xs font-semibold text-slate-500">הערות</p>
              <p className="whitespace-pre-wrap">{notes.trim()}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            זהו דמו לתצוגה בלבד — אין שליחה אמיתית למערכת.
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            חזרה
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Send className="h-4 w-4" aria-hidden />
            אישור הדגמה
          </button>
        </div>
      </div>
    </div>
  );
}
