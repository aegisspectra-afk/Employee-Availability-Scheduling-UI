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
import { clearState, loadState, saveState } from "@/lib/storage";
import { shiftWeek } from "@/lib/week-utils";

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

  const summary = useMemo(
    () => getSummary(currentWeek?.entries ?? []),
    [currentWeek],
  );

  const updateCurrentWeek = useCallback(
    (
      updater: (week: WeekAvailability) => WeekAvailability,
      options?: { markDirty?: boolean },
    ) => {
      setState((prev) => {
        if (!prev) return prev;
        const week = prev.weeks[prev.currentWeekId];
        if (!week) return prev;

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
      updateCurrentWeek((week) => {
        const entry = week.entries.find(
          (e) => e.day === day && e.shift === shift,
        );
        const next = toggleStatus(entry?.status ?? "unset");
        return {
          ...week,
          entries: setEntryStatus(week.entries, day, shift, next),
        };
      });
      setUndo(null);
    },
    [updateCurrentWeek],
  );

  const setCellStatus = useCallback(
    (day: number, shift: ShiftType, status: AvailabilityStatus) => {
      updateCurrentWeek((week) => ({
        ...week,
        entries: setEntryStatus(week.entries, day, shift, status),
      }));
    },
    [updateCurrentWeek],
  );

  const applyBulk = useCallback(
    (status: AvailabilityStatus, label: string) => {
      if (!currentWeek) return;
      setUndo({ entries: cloneEntries(currentWeek.entries), label });
      updateCurrentWeek((week) => ({
        ...week,
        entries: setAllStatus(week.entries, status),
      }));
      setToast(label);
    },
    [currentWeek, updateCurrentWeek],
  );

  const clearSelections = useCallback(() => {
    applyBulk("unset", "כל הבחירות נוקו");
  }, [applyBulk]);

  const markAllAvailable = useCallback(() => {
    applyBulk("available", "כל המשמרות סומנו כזמינות");
  }, [applyBulk]);

  const markAllUnavailable = useCallback(() => {
    applyBulk("unavailable", "כל המשמרות סומנו כלא זמינות");
  }, [applyBulk]);

  const undoBulk = useCallback(() => {
    if (!undo) return;
    const snapshot = undo.entries;
    updateCurrentWeek((week) => ({
      ...week,
      entries: cloneEntries(snapshot),
    }));
    setUndo(null);
    setToast("השינוי בוטל");
  }, [undo, updateCurrentWeek]);

  const copyPreviousWeek = useCallback(() => {
    if (!state || !currentWeek) return;
    setUndo({
      entries: cloneEntries(currentWeek.entries),
      label: "העתקת שבוע קודם",
    });
    updateCurrentWeek((week) => ({
      ...week,
      entries: cloneEntries(state.previousWeekTemplate),
    }));
    setToast("הועתק משבוע קודם");
  }, [state, currentWeek, updateCurrentWeek]);

  const saveDraft = useCallback(() => {
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
  }, [updateCurrentWeek]);

  const submitAvailability = useCallback(() => {
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
    setToast("הזמינות נשלחה בהצלחה");
  }, [updateCurrentWeek]);

  const goToWeek = useCallback((delta: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const nextId = shiftWeek(prev.currentWeekId, delta);
      const withWeek = ensureWeek(
        { ...prev, currentWeekId: nextId },
        nextId,
      );
      return withWeek;
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
    undo,
    toast,
    clearToast: () => setToast(null),
    toggleCell,
    setCellStatus,
    markAllAvailable,
    markAllUnavailable,
    clearSelections,
    undoBulk,
    copyPreviousWeek,
    saveDraft,
    submitAvailability,
    goToWeek,
    resetDemo,
  };
}
