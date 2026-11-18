"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Send, Unlock, X } from "lucide-react";
import { formatDeadline, formatWeekRange } from "@/lib/week-utils";

type UnlockRequestDialogProps = {
  open: boolean;
  weekId: string;
  employeeName: string;
  onConfirm: (note: string) => void;
  onClose: () => void;
};

export function UnlockRequestDialog({
  open,
  weekId,
  employeeName,
  onConfirm,
  onClose,
}: UnlockRequestDialogProps) {
  const titleId = useId();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setNote("");
    const id = window.setTimeout(() => noteRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
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
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Unlock className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2
                id={titleId}
                className="text-base font-semibold text-slate-900"
              >
                בקשה לפתיחת אילוץ
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                מועד ההגשה עבר ({formatDeadline(weekId)}). הבקשה תישלח למנהל עבור{" "}
                {employeeName} לשבוע {formatWeekRange(weekId)}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="סגור"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label
          htmlFor="unlock-note"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          סיבת הבקשה (אופציונלי)
        </label>
        <textarea
          id="unlock-note"
          ref={noteRef}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={300}
          placeholder="לדוגמה: לא הצלחתי להגיש בזמן בגלל חופשה / תקלה…"
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <Send className="h-4 w-4" aria-hidden />
            שליחת בקשה למנהל
          </button>
        </div>
      </div>
    </div>
  );
}
