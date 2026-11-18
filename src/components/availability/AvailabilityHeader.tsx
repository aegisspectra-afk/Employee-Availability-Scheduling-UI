"use client";

import { Clock, UserRound } from "lucide-react";
import type { Employee, SubmissionStatus } from "@/lib/types";
import { SUBMISSION_STATUS_LABELS } from "@/lib/constants";
import {
  formatDeadline,
  formatTimestamp,
  isDeadlinePassed,
} from "@/lib/week-utils";
import { WeekSelector } from "./WeekSelector";

type AvailabilityHeaderProps = {
  employee: Employee;
  weekId: string;
  submissionStatus: SubmissionStatus;
  submittedAt: string | null;
  savedAt: string | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
};

function StatusBadge({
  status,
  submittedAt,
  savedAt,
}: {
  status: SubmissionStatus;
  submittedAt: string | null;
  savedAt: string | null;
}) {
  const styles = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    saved: "bg-amber-50 text-amber-700 border-amber-200",
    submitted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  } as const;

  const detail =
    status === "submitted" && submittedAt
      ? formatTimestamp(submittedAt)
      : status === "saved" && savedAt
        ? formatTimestamp(savedAt)
        : null;

  return (
    <div
      className={[
        "inline-flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 sm:items-end",
        styles[status],
      ].join(" ")}
    >
      <span className="text-xs font-semibold">{SUBMISSION_STATUS_LABELS[status]}</span>
      {detail && (
        <span className="text-[11px] opacity-80">{detail}</span>
      )}
    </div>
  );
}

export function AvailabilityHeader({
  employee,
  weekId,
  submissionStatus,
  submittedAt,
  savedAt,
  onPrevWeek,
  onNextWeek,
}: AvailabilityHeaderProps) {
  const deadlinePassed = isDeadlinePassed(weekId);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold tracking-tight text-white shadow-sm sm:h-12 sm:w-12 sm:text-base"
              aria-label="לוגו G1"
            >
              G1
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                הגשת זמינות שבועית
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                סמן את המשמרות שבהן תהיה זמין לעבודה
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <UserRound className="h-4 w-4 text-slate-400" aria-hidden />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">
                  {employee.name}
                </p>
                <p className="text-xs text-slate-500">{employee.role}</p>
              </div>
            </div>
            <StatusBadge
              status={submissionStatus}
              submittedAt={submittedAt}
              savedAt={savedAt}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <WeekSelector
            weekId={weekId}
            onPrev={onPrevWeek}
            onNext={onNextWeek}
          />

          <div
            className={[
              "inline-flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
              deadlinePassed
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-blue-100 bg-blue-50/80 text-blue-800",
            ].join(" ")}
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              <p className="text-xs font-medium opacity-80">
                {deadlinePassed ? "מועד ההגשה עבר" : "מועד אחרון להגשה"}
              </p>
              <p className="font-semibold">{formatDeadline(weekId)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
