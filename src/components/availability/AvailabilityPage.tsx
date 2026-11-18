"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import { AvailabilityHeader } from "./AvailabilityHeader";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { ActionBar } from "./ActionBar";
import { SubmissionDialog } from "./SubmissionDialog";
import { SubmissionSuccess } from "./SubmissionSuccess";
import { Toast } from "./Toast";

export function AvailabilityPage() {
  const {
    isHydrated,
    state,
    currentWeek,
    summary,
    requirements,
    undo,
    toast,
    clearToast,
    toggleCell,
    markAllAvailable,
    markAllUnavailable,
    clearSelections,
    undoBulk,
    copyPreviousWeek,
    saveDraft,
    submitAvailability,
    goToWeek,
    resetDemo,
  } = useAvailability();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAt, setSuccessAt] = useState<string | null>(null);

  if (!isHydrated || !state || !currentWeek || !requirements) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden />
          <p className="text-sm font-medium">טוען את טופס הזמינות…</p>
        </div>
      </div>
    );
  }

  const handleSubmitClick = () => {
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

  return (
    <div className="min-h-screen bg-[image:var(--page-gradient)] text-slate-900">
      <AvailabilityHeader
        employee={state.employee}
        weekId={currentWeek.weekId}
        submissionStatus={currentWeek.submissionStatus}
        submittedAt={currentWeek.submittedAt}
        savedAt={currentWeek.savedAt}
        onPrevWeek={() => goToWeek(-1)}
        onNextWeek={() => goToWeek(1)}
      />

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <AvailabilityGrid
          weekId={currentWeek.weekId}
          entries={currentWeek.entries}
          onToggle={toggleCell}
          onMarkAllAvailable={markAllAvailable}
          onMarkAllUnavailable={markAllUnavailable}
          undoLabel={undo?.label ?? null}
          onUndo={undoBulk}
        />

        <ActionBar
          onClear={clearSelections}
          onCopyPrevious={copyPreviousWeek}
          onSaveDraft={saveDraft}
          onSubmit={handleSubmitClick}
          onResetDemo={resetDemo}
          isSubmitted={currentWeek.submissionStatus === "submitted"}
          canSubmit={requirements.canSubmit}
        />

        <footer className="pb-8 pt-2 text-center text-xs text-slate-400">
          אב־טיפוס להגשת זמינות עובדים · G1 · הנתונים נשמרים מקומית בדפדפן
        </footer>
      </main>

      <SubmissionDialog
        open={dialogOpen}
        weekId={currentWeek.weekId}
        summary={summary}
        requirements={requirements}
        onConfirm={handleConfirmSubmit}
        onClose={() => setDialogOpen(false)}
      />

      {showSuccess && successAt && (
        <SubmissionSuccess
          weekId={currentWeek.weekId}
          submittedAt={currentWeek.submittedAt ?? successAt}
          onContinue={() => setShowSuccess(false)}
        />
      )}

      <Toast message={toast} onDismiss={clearToast} />
    </div>
  );
}
