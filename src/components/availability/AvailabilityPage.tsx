"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Unlock } from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import { formatClosedWeekMessage } from "@/lib/week-utils";
import { AvailabilityHeader } from "./AvailabilityHeader";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { ActionBar } from "./ActionBar";
import { SubmissionDialog } from "./SubmissionDialog";
import { UnlockRequestDialog } from "./UnlockRequestDialog";
import { SubmissionSuccess } from "./SubmissionSuccess";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ManagerPreview } from "./ManagerPreview";
import type { AppViewMode } from "./ViewModeToggle";
import { Toast } from "./Toast";

export function AvailabilityPage() {
  const {
    isHydrated,
    state,
    currentWeek,
    summary,
    weekClosed,
    deadlineLocked,
    isReadOnly,
    undo,
    toast,
    clearToast,
    toggleCell,
    markAllAvailable,
    markAllUnavailable,
    clearSelections,
    setNotes,
    undoBulk,
    copyPreviousWeek,
    saveDraft,
    submitAvailability,
    requestDeadlineOverride,
    approveDeadlineOverride,
    reopenForEdit,
    goToWeek,
    resetDemo,
  } = useAvailability();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAt, setSuccessAt] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<AppViewMode>("employee");

  if (!isHydrated || !state || !currentWeek || !summary) {
    return <LoadingSkeleton />;
  }

  const isSubmitted = currentWeek.submissionStatus === "submitted";
  const overrideStatus = currentWeek.deadlineOverrideStatus ?? "none";

  const handleSubmitClick = () => {
    if (weekClosed || deadlineLocked || isSubmitted) return;
    setDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    const ok = submitAvailability();
    if (!ok) return;
    const now = new Date().toISOString();
    setSuccessAt(now);
    setDialogOpen(false);
    setShowSuccess(true);
  };

  const handleUnlockRequest = (note: string) => {
    const ok = requestDeadlineOverride(note);
    if (ok) setUnlockDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-[image:var(--page-gradient)] text-slate-900">
      <AvailabilityHeader
        employee={state.employee}
        weekId={currentWeek.weekId}
        submissionStatus={currentWeek.submissionStatus}
        submittedAt={currentWeek.submittedAt}
        savedAt={currentWeek.savedAt}
        weekClosed={weekClosed}
        deadlineOverrideStatus={overrideStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevWeek={() => goToWeek(-1)}
        onNextWeek={() => goToWeek(1)}
        onRequestUnlock={() => setUnlockDialogOpen(true)}
      />

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {weekClosed && (
          <div
            role="status"
            className="flex gap-3 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700"
          >
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
            <div>
              <p className="font-semibold">שבוע זה נסגר לעריכה</p>
              <p className="mt-0.5 text-slate-600">
                {formatClosedWeekMessage(currentWeek.weekId)}. אפשר לצפות בזמינות,
                אך לא למלא או לשנות אילוצים לשבוע קודם.
              </p>
            </div>
          </div>
        )}

        {!weekClosed && deadlineLocked && (
          <div
            role="status"
            className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            <Unlock className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
            <div>
              <p className="font-semibold">מועד ההגשה עבר</p>
              <p className="mt-0.5 text-rose-700/90">
                {overrideStatus === "pending"
                  ? "הבקשה לפתיחת אילוץ ממתינה לאישור מנהל. עברו לתצוגת מתכנן כדי לאשר."
                  : "לחצו על תג המועד בכותרת כדי לבקש מהמנהל לפתוח אילוץ — ואז תוכלו למלא ולשלוח זמינות."}
              </p>
            </div>
          </div>
        )}

        {!weekClosed && !deadlineLocked && isSubmitted && (
          <div
            role="status"
            className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
              aria-hidden
            />
            <div>
              <p className="font-semibold">הזמינות הוגשה לשבוע זה</p>
              <p className="mt-0.5 text-emerald-700/90">
                הגריד במצב קריאה בלבד. אפשר ללחוץ על &quot;עריכה מחדש&quot; כדי
                לשנות (דמו לתצוגה).
              </p>
            </div>
          </div>
        )}

        {viewMode === "manager" ? (
          <ManagerPreview
            employee={state.employee}
            weekId={currentWeek.weekId}
            entries={currentWeek.entries}
            notes={currentWeek.notes ?? ""}
            summary={summary}
            submissionStatus={currentWeek.submissionStatus}
            submittedAt={currentWeek.submittedAt}
            deadlineOverrideStatus={overrideStatus}
            deadlineOverrideNote={currentWeek.deadlineOverrideNote ?? ""}
            deadlineOverrideRequestedAt={
              currentWeek.deadlineOverrideRequestedAt
            }
            onApproveUnlock={approveDeadlineOverride}
          />
        ) : (
          <>
            <AvailabilityGrid
              weekId={currentWeek.weekId}
              entries={currentWeek.entries}
              onToggle={toggleCell}
              onMarkAllAvailable={markAllAvailable}
              onMarkAllUnavailable={markAllUnavailable}
              undoLabel={undo?.label ?? null}
              onUndo={undoBulk}
              locked={isReadOnly}
            />

            <ActionBar
              notes={currentWeek.notes ?? ""}
              onNotesChange={setNotes}
              onClear={clearSelections}
              onCopyPrevious={copyPreviousWeek}
              onSaveDraft={saveDraft}
              onSubmit={handleSubmitClick}
              onResetDemo={resetDemo}
              onReopenForEdit={reopenForEdit}
              isSubmitted={isSubmitted}
              weekClosed={weekClosed}
              deadlineLocked={deadlineLocked}
              isReadOnly={isReadOnly}
            />
          </>
        )}

        <footer className="pb-8 pt-2 text-center text-xs text-slate-400">
          דמו לתצוגה בלבד · אין שליחה אמיתית · G1
        </footer>
      </main>

      <SubmissionDialog
        open={dialogOpen}
        weekId={currentWeek.weekId}
        summary={summary}
        notes={currentWeek.notes ?? ""}
        onConfirm={handleConfirmSubmit}
        onClose={() => setDialogOpen(false)}
      />

      <UnlockRequestDialog
        open={unlockDialogOpen}
        weekId={currentWeek.weekId}
        employeeName={state.employee.name}
        onConfirm={handleUnlockRequest}
        onClose={() => setUnlockDialogOpen(false)}
      />

      {showSuccess && successAt && (
        <SubmissionSuccess
          weekId={currentWeek.weekId}
          submittedAt={currentWeek.submittedAt ?? successAt}
          summary={summary}
          notes={currentWeek.notes ?? ""}
          onContinue={() => setShowSuccess(false)}
        />
      )}

      <Toast message={toast} onDismiss={clearToast} />
    </div>
  );
}
