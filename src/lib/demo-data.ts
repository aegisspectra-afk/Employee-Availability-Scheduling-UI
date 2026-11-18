import type { AvailabilityEntry, PersistedState } from "./types";
import { DEFAULT_SYSTEM_POLICY, EMPLOYEE, STORAGE_VERSION } from "./constants";
import {
  createEmptyEntries,
  createWeekAvailability,
} from "./availability-utils";
import {
  ensureWeeksForMonth,
  getMonthFromWeekId,
} from "./requirements";
import { getWeekId, shiftWeek } from "./week-utils";

/** Demo week: close to weekly targets but not automatically complete. */
export function createDemoEntries(): AvailabilityEntry[] {
  const pattern: Record<string, "available" | "unavailable"> = {
    "0-morning": "available",
    "0-afternoon": "available",
    "0-night": "unavailable",
    "1-morning": "unavailable",
    "1-afternoon": "unavailable",
    "1-night": "available",
    "2-morning": "available",
    "2-afternoon": "available",
    "2-night": "unavailable",
    "3-morning": "unavailable",
    "3-afternoon": "unavailable",
    "3-night": "available",
    "4-morning": "unavailable",
    "4-afternoon": "unavailable",
    "4-night": "unavailable",
    "5-morning": "unavailable",
    "5-afternoon": "unavailable",
    "5-night": "unavailable",
    "6-morning": "unavailable",
    "6-afternoon": "unavailable",
    "6-night": "unavailable",
  };

  return createEmptyEntries().map((entry) => ({
    ...entry,
    status: pattern[`${entry.day}-${entry.shift}`] ?? "unavailable",
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

function seedMonthWeeks(
  weeks: Record<string, ReturnType<typeof createWeekAvailability>>,
  weekId: string,
) {
  const { year, month } = getMonthFromWeekId(weekId);
  return ensureWeeksForMonth(weeks, year, month, (id) =>
    createWeekAvailability(
      id,
      id === weekId ? createDemoEntries() : createEmptyEntries(),
    ),
  );
}

export function createInitialState(): PersistedState {
  const currentWeekId = getWeekId();
  const demoWeek = createWeekAvailability(currentWeekId, createDemoEntries());
  const weeks = seedMonthWeeks({ [currentWeekId]: demoWeek }, currentWeekId);

  return {
    version: STORAGE_VERSION,
    employee: { ...EMPLOYEE },
    currentWeekId,
    weeks,
    previousWeekTemplate: createPreviousWeekTemplate(),
    policy: { ...DEFAULT_SYSTEM_POLICY },
  };
}

export function ensureWeek(
  state: PersistedState,
  weekId: string,
): PersistedState {
  let weeks = { ...state.weeks };

  if (!weeks[weekId]) {
    const prevId = shiftWeek(weekId, -1);
    if (!weeks[prevId]) {
      weeks[prevId] = createWeekAvailability(
        prevId,
        createPreviousWeekTemplate(),
      );
    }
    weeks[weekId] = createWeekAvailability(weekId, createEmptyEntries());
  }

  weeks = seedMonthWeeks(weeks, weekId);

  // Keep the actively selected week demo-seeded only on first create above;
  // re-apply demo only if this is a brand-new current week without entries logic.
  return {
    ...state,
    currentWeekId: weekId,
    weeks,
    policy: state.policy ?? { ...DEFAULT_SYSTEM_POLICY },
  };
}
