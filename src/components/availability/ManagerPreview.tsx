"use client";

import {
  CalendarRange,
  MessageSquareText,
  Unlock,
  UserRound,
} from "lucide-react";
import type {
  AvailabilityEntry,
  AvailabilitySummary,
  DeadlineOverrideStatus,
  Employee,
  SubmissionStatus,
} from "@/lib/types";
import { DAYS, SHIFTS, STATUS_LABELS, SUBMISSION_STATUS_LABELS } from "@/lib/constants";
import { getEntry } from "@/lib/availability-utils";
import {
  formatTimestamp,
  formatWeekRange,
  getWeekDates,
  isWeekendDayIndex,
} from "@/lib/week-utils";

type ManagerPreviewProps = {
  employee: Employee;
  weekId: string;
  entries: AvailabilityEntry[];
  notes: string;
  summary: AvailabilitySummary;
  submissionStatus: SubmissionStatus;
  submittedAt: string | null;
  deadlineOverrideStatus: DeadlineOverrideStatus;
  deadlineOverrideNote: string;
  deadlineOverrideRequestedAt: string | null;
  onApproveUnlock?: () => void;
};

export function ManagerPreview({
  employee,
  weekId,
  entries,
  notes,
  summary,
  submissionStatus,
  submittedAt,
  deadlineOverrideStatus,
  deadlineOverrideNote,
  deadlineOverrideRequestedAt,
  onApproveUnlock,
}: ManagerPreviewProps) {
  const dates = getWeekDates(weekId);
  const pendingUnlock = deadlineOverrideStatus === "pending";
  const unlocked = deadlineOverrideStatus === "approved";

  return (
    <section
      aria-label="תצוגת מתכנן סידור"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            תצוגת מתכנן סידור
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            איך נראית הזמינות של העובד לצוות התכנון
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <UserRound className="h-4 w-4 text-slate-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-slate-900">{employee.name}</p>
            <p className="text-xs text-slate-500">{employee.role}</p>
          </div>
        </div>
      </div>

      {pendingUnlock && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                בקשה לפתיחת אילוץ מ־{employee.name}
              </p>
              <p className="mt-1 text-sm text-amber-800/90">
                מועד ההגשה עבר. אישור יפתח לעובד אפשרות למלא ולשלוח זמינות לשבוע
                זה.
              </p>
              {deadlineOverrideRequestedAt && (
                <p className="mt-1 text-xs text-amber-700/80">
                  נשלח ב־{formatTimestamp(deadlineOverrideRequestedAt)}
                </p>
              )}
              {deadlineOverrideNote.trim() && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm text-amber-900">
                  {deadlineOverrideNote}
                </p>
              )}
            </div>
            {onApproveUnlock && (
              <button
                type="button"
                onClick={onApproveUnlock}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
              >
                <Unlock className="h-4 w-4" aria-hidden />
                פתיחת אילוץ
              </button>
            )}
          </div>
        </div>
      )}

      {unlocked && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          אילוץ פתוח לעובד זה — ניתן להגיש זמינות גם אחרי המועד.
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-600">
          <CalendarRange className="h-3.5 w-3.5" aria-hidden />
          {formatWeekRange(weekId)}
        </span>
        <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700">
          {SUBMISSION_STATUS_LABELS[submissionStatus]}
        </span>
        {submittedAt && (
          <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-500">
            {formatTimestamp(submittedAt)}
          </span>
        )}
        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
          זמין {summary.available}
        </span>
        <span className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-rose-700">
          לא זמין {summary.unavailable}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2 text-right text-xs font-semibold text-slate-400">
                משמרת
              </th>
              {DAYS.map((day, index) => (
                <th
                  key={day.index}
                  className={[
                    "px-2 py-2 text-center text-xs font-semibold",
                    isWeekendDayIndex(index)
                      ? "text-indigo-600"
                      : "text-slate-600",
                  ].join(" ")}
                >
                  <div>{day.label}</div>
                  <div className="font-normal text-slate-400">
                    {format(dates[index])}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFTS.map((shift) => (
              <tr key={shift.type}>
                <td className="px-2 py-2 text-xs font-semibold text-slate-700">
                  {shift.label}
                </td>
                {DAYS.map((day) => {
                  const entry = getEntry(entries, day.index, shift.type);
                  const available = entry.status === "available";
                  return (
                    <td key={`${day.index}-${shift.type}`} className="px-1 py-1">
                      <div
                        className={[
                          "rounded-lg border px-2 py-2 text-center text-[11px] font-semibold",
                          available
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-600",
                          isWeekendDayIndex(day.index) ? "ring-1 ring-indigo-100" : "",
                        ].join(" ")}
                      >
                        {STATUS_LABELS[entry.status]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <MessageSquareText className="h-3.5 w-3.5" aria-hidden />
          הערות העובד
        </div>
        <p className="whitespace-pre-wrap text-sm text-slate-700">
          {notes.trim() || "לא הוזנו הערות לשבוע זה."}
        </p>
      </div>
    </section>
  );
}

function format(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}
