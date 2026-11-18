import type { AvailabilityEntry, PersistedState } from "./types";
import { EMPLOYEE, STORAGE_VERSION } from "./constants";
import { createEmptyEntries, createWeekAvailability } from "./availability-utils";
import { getWeekId, shiftWeek } from "./week-utils";

/** Realistic partial selections for first-load demo. */
export function createDemoEntries(): AvailabilityEntry[] {
  const pattern: Record<string, "available" | "unavailable" | "unset"> = {
    "0-morning": "available",
    "0-afternoon": "unavailable",
    "0-night": "available",
    "1-morning": "unavailable",
    "1-afternoon": "available",
    "1-night": "available",
    "2-morning": "available",
    "2-afternoon": "available",
    "2-night": "unavailable",
    "3-morning": "available",
    "3-afternoon": "unavailable",
    "3-night": "available",
    "4-morning": "unavailable",
    "4-afternoon": "available",
    "4-night": "available",
    "5-morning": "available",
    "5-afternoon": "available",
    "5-night": "unset",
    "6-morning": "available",
    "6-afternoon": "unavailable",
    "6-night": "unset",
  };

  return createEmptyEntries().map((entry) => ({
    ...entry,
    status: pattern[`${entry.day}-${entry.shift}`] ?? "unset",
  }));
}

/** Simulated previous-week template for "העתק שבוע קודם". */
export function createPreviousWeekTemplate(): AvailabilityEntry[] {
  const pattern: Record<string, "available" | "unavailable"> = {
    "0-morning": "available",
    "0-afternoon": "available",
    "0-night": "unavailable",
    "1-morning": "available",
    "1-afternoon": "unavailable",
    "1-night": "available",
    "2-morning": "unavailable",
    "2-afternoon": "available",
    "2-night": "available",
    "3-morning": "available",
    "3-afternoon": "available",
    "3-night": "unavailable",
    "4-morning": "available",
    "4-afternoon": "unavailable",
    "4-night": "available",
    "5-morning": "unavailable",
    "5-afternoon": "available",
    "5-night": "unavailable",
    "6-morning": "available",
    "6-afternoon": "available",
    "6-night": "unavailable",
  };

  return createEmptyEntries().map((entry) => ({
    ...entry,
    status: pattern[`${entry.day}-${entry.shift}`] ?? "unavailable",
  }));
}

export function createInitialState(): PersistedState {
  const currentWeekId = getWeekId();
  const demoWeek = createWeekAvailability(currentWeekId, createDemoEntries());

  return {
    version: STORAGE_VERSION,
    employee: { ...EMPLOYEE },
    currentWeekId,
    weeks: {
      [currentWeekId]: demoWeek,
    },
    previousWeekTemplate: createPreviousWeekTemplate(),
  };
}

export function ensureWeek(
  state: PersistedState,
  weekId: string,
): PersistedState {
  if (state.weeks[weekId]) return state;

  // Seed adjacent weeks lightly for demo continuity
  const prevId = shiftWeek(weekId, -1);
  const nextEntries =
    weekId === state.currentWeekId
      ? createDemoEntries()
      : createEmptyEntries();

  return {
    ...state,
    weeks: {
      ...state.weeks,
      ...(state.weeks[prevId]
        ? {}
        : {
            [prevId]: createWeekAvailability(
              prevId,
              createPreviousWeekTemplate(),
            ),
          }),
      [weekId]: createWeekAvailability(weekId, nextEntries),
    },
  };
}
