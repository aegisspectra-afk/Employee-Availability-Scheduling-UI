"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, CheckCircle2, Send, X } from "lucide-react";
import type { AvailabilitySummary, RequirementsSnapshot } from "@/lib/types";
import { formatWeekRange } from "@/lib/week-utils";

type SubmissionDialogProps = {
  open: boolean;
  weekId: string;
  summary: AvailabilitySummary;
  requirements: RequirementsSnapshot;
  onConfirm: () => void;
  onClose: () => void;
};

export function SubmissionDialog({
  open,
  weekId,
  summary,
  requirements,
  onConfirm,
  onClose,
}: SubmissionDialogProps) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { weekly, monthly, canSubmit } = requirements;

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

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
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              אישור שליחת זמינות
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

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 px-2 py-3">
              <p className="text-xl font-bold text-emerald-700">
                {summary.available}
              </p>
              <p className="text-[11px] text-emerald-700/80">
                זמין
              </p>
            </div>
            <div className="rounded-xl bg-rose-50 px-2 py-3">
              <p className="text-xl font-bold text-rose-700">
                {summary.unavailable}
              </p>
              <p className="text-[11px] text-rose-700/80">
                לא זמין
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              סיכום דרישות שבועיות
            </h3>
            <ul className="space-y-1.5">
              {weekly.messages.map((message) => (
                <li
                  key={message}
                  className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  {message.includes("הושלם") ? (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                  ) : (
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                      aria-hidden
                    />
                  )}
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={[
              "rounded-xl border px-3 py-3 text-sm",
              monthly.isComplete
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800",
            ].join(" ")}
          >
            <p className="font-semibold">
              סופי שבוע בחודש: {monthly.completed}/{monthly.required}
            </p>
            <p className="mt-1">
              {monthly.isComplete
                ? "דרישת סופי השבוע לחודש הושלמה."
                : monthly.message}
            </p>
          </div>

          {!canSubmit && (
            <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                לא ניתן לשלוח סידור עבודה. לפי הנוהל יש להשלים את דרישות הזמינות
                השבועיות ואת סופי השבוע בחודש. ניתן לשמור טיוטה ולהמשיך מאוחר יותר.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            חזרה לעריכה
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden />
            אישור ושליחה
          </button>
        </div>
      </div>
    </div>
  );
}
