"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CalendarCheck } from "lucide-react";
import { formatTimestamp, formatWeekRange } from "@/lib/week-utils";

type SubmissionSuccessProps = {
  weekId: string;
  submittedAt: string;
  onContinue: () => void;
};

export function SubmissionSuccess({
  weekId,
  submittedAt,
  onContinue,
}: SubmissionSuccessProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
      <motion.div
        role="alertdialog"
        aria-labelledby="success-title"
        aria-describedby="success-desc"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 18 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
        >
          <CheckCircle2 className="h-9 w-9 text-emerald-600" aria-hidden />
        </motion.div>

        <h2
          id="success-title"
          className="mt-4 text-xl font-bold text-slate-900"
        >
          הזמינות נשלחה בהצלחה
        </h2>
        <p id="success-desc" className="mt-2 text-sm text-slate-500">
          ההגשה לשבוע {formatWeekRange(weekId)} נשמרה במערכת.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <CalendarCheck className="h-4 w-4 text-blue-600" aria-hidden />
          {formatTimestamp(submittedAt)}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          המשך
        </button>
      </motion.div>
    </div>
  );
}
