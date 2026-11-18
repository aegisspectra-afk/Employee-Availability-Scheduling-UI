"use client";

import {
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  UserRound,
} from "lucide-react";
import type { DeadlineOverrideStatus, Employee, SubmissionStatus } from "@/lib/types";
import { SUBMISSION_STATUS_LABELS } from "@/lib/constants";
import {
  formatClosedWeekMessage,
  formatDeadline,
  formatTimestamp,
  isDeadlinePassed,
} from "@/lib/week-utils";
import { WeekSelector } from "./WeekSelector";
import { ViewModeToggle, type AppViewMode } from "./ViewModeToggle";

type AvailabilityHeaderProps = {
  employee: Employee;
  weekId: string;
  submissionStatus: SubmissionStatus;
  submittedAt: string | null;
  savedAt: string | null;
  weekClosed: boolean;
  deadlineOverrideStatus: DeadlineOverrideStatus;
  viewMode: AppViewMode;
  onViewModeChange: (mode: AppViewMode) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onRequestUnlock?: () => void;
};

function StatusBadge({
  status,
  submittedAt,
  savedAt,
  weekClosed,
}: {
  status: SubmissionStatus;
  submittedAt: string | null;
  savedAt: string | null;
  weekClosed: boolean;
}) {
  if (weekClosed) {
    return (
      <div className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 text-slate-600">
        <Lock className="h-3 w-3" aria-hidden />
        <span className="text-[11px] font-semibold">שבוע סגור</span>
      </div>
    );
  }

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
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1",
        styles[status],
      ].join(" ")}
      title={detail ?? undefined}
    >
      <span className="text-[11px] font-semibold">
        {SUBMISSION_STATUS_LABELS[status]}
      </span>
    </div>
  );
}

export function AvailabilityHeader({
  employee,
  weekId,
  submissionStatus,
  submittedAt,
  savedAt,
  weekClosed,
  deadlineOverrideStatus,
  viewMode,
  onViewModeChange,
  onPrevWeek,
  onNextWeek,
  onRequestUnlock,
}: AvailabilityHeaderProps) {
  const deadlinePassed = isDeadlinePassed(weekId);
  const overrideApproved = deadlineOverrideStatus === "approved";
  const overridePending = deadlineOverrideStatus === "pending";
  const canRequestUnlock =
    !weekClosed &&
    deadlinePassed &&
    !overrideApproved &&
    Boolean(onRequestUnlock);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl space-y-2.5 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold tracking-tight text-white"
              aria-label="לוגו G1"
            >
              G1
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  הגשת זמינות שבועית
                </h1>
                <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  דמו
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
              <UserRound className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-slate-900">
                  {employee.name}
                </p>
                <p className="text-[10px] text-slate-500">{employee.role}</p>
              </div>
            </div>
            <StatusBadge
              status={submissionStatus}
              submittedAt={submittedAt}
              savedAt={savedAt}
              weekClosed={weekClosed}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <WeekSelector
            weekId={weekId}
            onPrev={onPrevWeek}
            onNext={onNextWeek}
          />

          {weekClosed ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="font-medium">
                {formatClosedWeekMessage(weekId)}
              </span>
            </div>
          ) : overrideApproved && deadlinePassed ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="font-medium">
                אילוץ נפתח על ידי המנהל · אפשר להגיש זמינות
              </span>
            </div>
          ) : overridePending ? (
            <div
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800"
              title="הבקשה ממתינה לאישור מנהל"
            >
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="font-medium">
                בקשה ממתינה למנהל · מועד עבר: {formatDeadline(weekId)}
              </span>
            </div>
          ) : canRequestUnlock ? (
            <button
              type="button"
              onClick={onRequestUnlock}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
              title="לחצו לבקשת פתיחת אילוץ מהמנהל"
            >
              <Unlock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="font-medium">
                מועד ההגשה עבר: {formatDeadline(weekId)} · בקשה למנהל
              </span>
            </button>
          ) : (
            <div
              className={[
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
                deadlinePassed
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-blue-100 bg-blue-50/80 text-blue-800",
              ].join(" ")}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="font-medium">
                {deadlinePassed ? "מועד ההגשה עבר" : "מועד אחרון"}
                {": "}
                {formatDeadline(weekId)}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
