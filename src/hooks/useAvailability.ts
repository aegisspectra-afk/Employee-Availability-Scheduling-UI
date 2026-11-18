"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AvailabilityEntry,
  AvailabilityStatus,
  PersistedState,
  ShiftType,
  WeekAvailability,
} from "@/lib/types";
import {
  cloneEntries,
  getSummary,
  setAllStatus,
  setEntryStatus,
  toggleStatus,
} from "@/lib/availability-utils";
import { createInitialState, ensureWeek } from "@/lib/demo-data";
import { evaluateRequirements } from "@/lib/requirements";
import { clearState, loadState, saveState } from "@/lib/storage";
import { isDeadlinePassed, isPastWeek, shiftWeek } from "@/lib/week-utils";

export type UndoSnapshot = {
  entries: AvailabilityEntry[];
  label: string;
};

export function useAvailability() {
  const [state, setState] = useState<PersistedState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [undo, setUndo] = useState<UndoSnapshot | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadState();
    setState(ensureWeek(loaded, loaded.currentWeekId));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !state) return;
    saveState(state);
  }, [state, isHydrated]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!undo) return;
    const id = window.setTimeout(() => setUndo(null), 8000);
    return () => window.clearTimeout(id);
  }, [undo]);

  const currentWeek: WeekAvailability | null = useMemo(() => {
    if (!state) return null;
    return state.weeks[state.currentWeekId] ?? null;
  }, [state]);

  const weekClosed = useMemo(
    () => (currentWeek ? isPastWeek(currentWeek.weekId) : false),
    [currentWeek],
  );

  const deadlinePassed = useMemo(
    () => (currentWeek ? isDeadlinePassed(currentWeek.weekId) : false),
    [currentWeek],
  );

  const deadlineOverrideApproved = useMemo(
    () => currentWeek?.deadlineOverrideStatus === "approved",
    [currentWeek],
  );

  /** Deadline blocks edits/submit until a manager unlocks this employee/week. */
  const deadlineLocked = useMemo(
    () =>
      Boolean(
        currentWeek &&
          !weekClosed &&
          deadlinePassed &&
          !deadlineOverrideApproved,
      ),
    [currentWeek, weekClosed, deadlinePassed, deadlineOverrideApproved],
  );

  const isReadOnly = useMemo(() => {
    if (!currentWeek) return true;
    if (weekClosed) return true;
    if (deadlineLocked) return true;
    return currentWeek.submissionStatus === "submitted";
  }, [currentWeek, weekClosed, deadlineLocked]);

  const summary = useMemo(
    () => getSummary(currentWeek?.entries ?? []),
    [currentWeek],
  );

  const requirements = useMemo(() => {
    if (!state || !currentWeek) return null;
    return evaluateRequirements(
      currentWeek.weekId,
      currentWeek.entries,
      state.weeks,
      { enforceAvailabilityRequirements: false },
    );
  }, [state, currentWeek]);

  const updateCurrentWeek = useCallback(
    (
      updater: (week: WeekAvailability) => WeekAvailability,
      options?: { markDirty?: boolean; allowClosed?: boolean },
    ) => {
      setState((prev) => {
        if (!prev) return prev;
        const week = prev.weeks[prev.currentWeekId];
        if (!week) return prev;

        if (!options?.allowClosed && isPastWeek(week.weekId)) {
          return prev;
        }

        let nextWeek = updater(week);
        if (
          options?.markDirty !== false &&
          nextWeek.submissionStatus === "submitted"
        ) {
          nextWeek = {
            ...nextWeek,
            submissionStatus: "draft",
            submittedAt: null,
          };
        }

        return {
          ...prev,
          weeks: {
            ...prev.weeks,
            [prev.currentWeekId]: nextWeek,
          },
        };
      });
    },
    [],
  );

  const toggleCell = useCallback(
    (day: number, shift: ShiftType) => {
      if (!currentWeek || isPastWeek(currentWeek.weekId)) {
        setToast("שבוע זה נסגר ולא ניתן לערוך אותו");
        return;
      }
      if (
        isDeadlinePassed(currentWeek.weekId) &&
        currentWeek.deadlineOverrideStatus !== "approved"
      ) {
        setToast("מועד ההגשה עבר — בקשו מהמנהל לפתוח אילוץ לעריכה");
        return;
      }
      if (currentWeek.submissionStatus === "submitted") {
        setToast("השבוע הוגש — לחץ על עריכה מחדש כדי לשנות");
        return;
      }
      updateCurrentWeek((week) => {
        const entry = week.entries.find(
          (e) => e.day === day && e.shift === shift,
        );
        const next = toggleStatus(entry?.status ?? "unavailable");
        return {
          ...week,
          entries: setEntryStatus(week.entries, day, shift, next),
        };
      });
      setUndo(null);
    },
    [currentWeek, updateCurrentWeek],
  );

  const setCellStatus = useCallback(
    (day: number, shift: ShiftType, status: AvailabilityStatus) => {
      if (!currentWeek || isReadOnly) return;
      updateCurrentWeek((week) => ({
        ...week,
        entries: setEntryStatus(week.entries, day, shift, status),
      }));
    },
    [currentWeek, isReadOnly, updateCurrentWeek],
  );

  const applyBulk = useCallback(
    (status: AvailabilityStatus, label: string) => {
      if (!currentWeek || isReadOnly) {
        setToast(
          weekClosed
            ? "שבוע זה נסגר ולא ניתן לערוך אותו"
            : deadlineLocked
              ? "מועד ההגשה עבר — בקשו מהמנהל לפתוח אילוץ לעריכה"
              : "השבוע הוגש — לחץ על עריכה מחדש כדי לשנות",
        );
        return;
      }
      setUndo({ entries: cloneEntries(currentWeek.entries), label });
      updateCurrentWeek((week) => ({
        ...week,
        entries: setAllStatus(week.entries, status),
      }));
      setToast(label);
    },
    [currentWeek, isReadOnly, weekClosed, deadlineLocked, updateCurrentWeek],
  );

  const setNotes = useCallback(
    (notes: string) => {
      if (!currentWeek || isReadOnly) return;
      updateCurrentWeek((week) => ({
        ...week,
        notes,
      }));
    },
    [currentWeek, isReadOnly, updateCurrentWeek],
  );

  const clearSelections = useCallback(() => {
    applyBulk("unavailable", "כל המשמרות סומנו כלא זמינות");
  }, [applyBulk]);

  const markAllAvailable = useCallback(() => {
    applyBulk("available", "כל המשמרות סומנו כזמינות");
  }, [applyBulk]);

  const markAllUnavailable = useCallback(() => {
    applyBulk("unavailable", "כל המשמרות סומנו כלא זמינות");
  }, [applyBulk]);

  const undoBulk = useCallback(() => {
    if (!undo || isReadOnly) return;
    const snapshot = undo.entries;
    updateCurrentWeek((week) => ({
      ...week,
      entries: cloneEntries(snapshot),
    }));
    setUndo(null);
    setToast("השינוי בוטל");
  }, [undo, isReadOnly, updateCurrentWeek]);

  const copyPreviousWeek = useCallback(() => {
    if (!state || !currentWeek || isReadOnly) {
      setToast(
        weekClosed
          ? "שבוע זה נסגר ולא ניתן לערוך אותו"
          : deadlineLocked
            ? "מועד ההגשה עבר — בקשו מהמנהל לפתוח אילוץ לעריכה"
            : "השבוע הוגש — לחץ על עריכה מחדש כדי לשנות",
      );
      return;
    }
    setUndo({
      entries: cloneEntries(currentWeek.entries),
      label: "העתקת שבוע קודם",
    });
    updateCurrentWeek((week) => ({
      ...week,
      entries: cloneEntries(state.previousWeekTemplate),
    }));
    setToast("הועתק משבוע קודם");
  }, [
    state,
    currentWeek,
    isReadOnly,
    weekClosed,
    deadlineLocked,
    updateCurrentWeek,
  ]);

  const saveDraft = useCallback(() => {
    if (!currentWeek || weekClosed) {
      setToast("שבוע זה נסגר ולא ניתן לשמור אותו");
      return;
    }
    if (deadlineLocked) {
      setToast("מועד ההגשה עבר — בקשו מהמנהל לפתוח אילוץ לעריכה");
      return;
    }
    const now = new Date().toISOString();
    updateCurrentWeek(
      (week) => ({
        ...week,
        submissionStatus:
          week.submissionStatus === "submitted" ? "submitted" : "saved",
        savedAt: now,
      }),
      { markDirty: false },
    );
    setToast("הטיוטה נשמרה בהצלחה");
  }, [currentWeek, weekClosed, deadlineLocked, updateCurrentWeek]);

  const submitAvailability = useCallback((): boolean => {
    if (!currentWeek) return false;
    if (weekClosed) {
      setToast("שבוע זה נסגר ולא ניתן לשלוח אותו");
      return false;
    }
    if (deadlineLocked) {
      setToast("מועד ההגשה עבר — בקשו מהמנהל לפתוח אילוץ לעריכה");
      return false;
    }

    const now = new Date().toISOString();
    updateCurrentWeek(
      (week) => ({
        ...week,
        submissionStatus: "submitted",
        submittedAt: now,
        savedAt: now,
      }),
      { markDirty: false },
    );
    setUndo(null);
    setToast("הדגמת שליחה הושלמה (דמו לתצוגה)");
    return true;
  }, [currentWeek, weekClosed, deadlineLocked, updateCurrentWeek]);

  const requestDeadlineOverride = useCallback(
    (note = "") => {
      if (!currentWeek || weekClosed) {
        setToast("שבוע זה נסגר ולא ניתן לבקש פתיחה");
        return false;
      }
      if (!isDeadlinePassed(currentWeek.weekId)) {
        setToast("מועד ההגשה עדיין פתוח — אין צורך בבקשה");
        return false;
      }
      if (currentWeek.deadlineOverrideStatus === "approved") {
        setToast("האילוץ כבר נפתח על ידי המנהל");
        return false;
      }
      if (currentWeek.deadlineOverrideStatus === "pending") {
        setToast("הבקשה כבר ממתינה לאישור מנהל");
        return false;
      }

      const now = new Date().toISOString();
      updateCurrentWeek(
        (week) => ({
          ...week,
          deadlineOverrideStatus: "pending",
          deadlineOverrideRequestedAt: now,
          deadlineOverrideNote: note.trim(),
          deadlineOverrideResolvedAt: null,
        }),
        { markDirty: false },
      );
      setToast("הבקשה נשלחה למנהל (דמו)");
      return true;
    },
    [currentWeek, weekClosed, updateCurrentWeek],
  );

  const approveDeadlineOverride = useCallback(() => {
    if (!currentWeek || weekClosed) {
      setToast("לא ניתן לאשר פתיחה לשבוע סגור");
      return;
    }
    if (currentWeek.deadlineOverrideStatus !== "pending") {
      setToast("אין בקשה ממתינה לאישור");
      return;
    }
    const now = new Date().toISOString();
    updateCurrentWeek(
      (week) => ({
        ...week,
        deadlineOverrideStatus: "approved",
        deadlineOverrideResolvedAt: now,
      }),
      { markDirty: false },
    );
    setToast("האילוץ נפתח — העובד יכול להגיש זמינות");
  }, [currentWeek, weekClosed, updateCurrentWeek]);

  const reopenForEdit = useCallback(() => {
    if (!currentWeek || weekClosed) {
      setToast("שבוע זה נסגר ולא ניתן לפתוח אותו לעריכה");
      return;
    }
    if (deadlineLocked) {
      setToast("מועד ההגשה עבר — בקשו מהמנהל לפתוח אילוץ לעריכה");
      return;
    }
    updateCurrentWeek(
      (week) => ({
        ...week,
        submissionStatus: "draft",
        submittedAt: null,
      }),
      { markDirty: false },
    );
    setToast("השבוע נפתח מחדש לעריכה");
  }, [currentWeek, weekClosed, deadlineLocked, updateCurrentWeek]);

  const goToWeek = useCallback((delta: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const nextId = shiftWeek(prev.currentWeekId, delta);
      return ensureWeek({ ...prev, currentWeekId: nextId }, nextId);
    });
    setUndo(null);
  }, []);

  const resetDemo = useCallback(() => {
    clearState();
    const fresh = createInitialState();
    setState(fresh);
    setUndo(null);
    setToast("הנתונים אופסו לנתוני הדגמה");
  }, []);

  return {
    isHydrated,
    state,
    currentWeek,
    summary,
    requirements,
    weekClosed,
    deadlinePassed,
    deadlineLocked,
    isReadOnly,
    undo,
    toast,
    clearToast: () => setToast(null),
    toggleCell,
    setCellStatus,
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
  };
}
