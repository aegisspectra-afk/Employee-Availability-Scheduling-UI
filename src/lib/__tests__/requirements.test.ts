import { describe, expect, it } from "vitest";
import { addDays, format } from "date-fns";
import type {
  AvailabilityEntry,
  AvailabilityStatus,
  ShiftType,
  WeekAvailability,
} from "../types";
import {
  createEmptyEntries,
  createWeekAvailability,
  setEntryStatus,
} from "../availability-utils";
import {
  canSaveDraft,
  canSubmitRequirements,
  evaluateMonthlyWeekendRequirements,
  evaluateRequirements,
  evaluateWeeklyRequirements,
  getFridaysInMonth,
  getMonthFromWeekId,
  toDateString,
} from "../requirements";
import { getWeekId } from "../week-utils";

function setMany(
  entries: AvailabilityEntry[],
  updates: Array<{ day: number; shift: ShiftType; status: AvailabilityStatus }>,
): AvailabilityEntry[] {
  return updates.reduce(
    (acc, u) => setEntryStatus(acc, u.day, u.shift, u.status),
    entries,
  );
}

/** Fixed week: Sunday 2026-11-15 … Saturday 2026-11-21 */
const WEEK_ID = "2026-11-15";

describe("weekly availability requirements", () => {
  it("1. exactly 2 morning, 2 afternoon, 2 night across 4 distinct weekdays is valid", () => {
    const entries = setMany(createEmptyEntries(), [
      { day: 0, shift: "morning", status: "available" },
      { day: 0, shift: "afternoon", status: "available" },
      { day: 1, shift: "night", status: "available" },
      { day: 2, shift: "morning", status: "available" },
      { day: 3, shift: "afternoon", status: "available" },
      { day: 4, shift: "night", status: "available" },
    ]);

    const result = evaluateWeeklyRequirements(WEEK_ID, entries);
    expect(result.morning.current).toBe(2);
    expect(result.afternoon.current).toBe(2);
    expect(result.night.current).toBe(2);
    expect(result.distinctWeekdays).toBe(5);
    expect(result.isComplete).toBe(true);
  });

  it("2. six shifts but only 3 distinct weekdays is invalid", () => {
    const entries = setMany(createEmptyEntries(), [
      { day: 0, shift: "morning", status: "available" },
      { day: 0, shift: "afternoon", status: "available" },
      { day: 0, shift: "night", status: "available" },
      { day: 1, shift: "morning", status: "available" },
      { day: 1, shift: "afternoon", status: "available" },
      { day: 2, shift: "night", status: "available" },
    ]);

    const result = evaluateWeeklyRequirements(WEEK_ID, entries);
    expect(result.availableShifts).toBe(6);
    expect(result.distinctWeekdays).toBe(3);
    expect(result.weekdaysComplete).toBe(false);
    expect(result.isComplete).toBe(false);
  });

  it("3. four morning shifts but only 1 night shift is invalid", () => {
    const entries = setMany(createEmptyEntries(), [
      { day: 0, shift: "morning", status: "available" },
      { day: 1, shift: "morning", status: "available" },
      { day: 2, shift: "morning", status: "available" },
      { day: 3, shift: "morning", status: "available" },
      { day: 0, shift: "afternoon", status: "available" },
      { day: 1, shift: "afternoon", status: "available" },
      { day: 2, shift: "night", status: "available" },
    ]);

    const result = evaluateWeeklyRequirements(WEEK_ID, entries);
    expect(result.morning.current).toBe(4);
    expect(result.morning.complete).toBe(true);
    expect(result.night.current).toBe(1);
    expect(result.night.complete).toBe(false);
    expect(result.isComplete).toBe(false);
  });

  it("4. Friday and Saturday availability does not count toward weekly requirements", () => {
    const entries = setMany(createEmptyEntries(), [
      // Weekend noise — must be ignored for weekly
      { day: 5, shift: "morning", status: "available" },
      { day: 5, shift: "afternoon", status: "available" },
      { day: 5, shift: "night", status: "available" },
      { day: 6, shift: "morning", status: "available" },
      { day: 6, shift: "afternoon", status: "available" },
      { day: 6, shift: "night", status: "available" },
      // Only 1 weekday available shift
      { day: 0, shift: "morning", status: "available" },
    ]);

    const result = evaluateWeeklyRequirements(WEEK_ID, entries);
    expect(result.availableShifts).toBe(1);
    expect(result.morning.current).toBe(1);
    expect(result.afternoon.current).toBe(0);
    expect(result.night.current).toBe(0);
    expect(result.distinctWeekdays).toBe(1);
    expect(result.isComplete).toBe(false);
  });
});

describe("monthly weekend requirements", () => {
  function weekWithFullWeekend(weekId: string): WeekAvailability {
    const entries = setMany(createEmptyEntries(), [
      { day: 5, shift: "morning", status: "available" },
      { day: 5, shift: "afternoon", status: "available" },
      { day: 5, shift: "night", status: "available" },
      { day: 6, shift: "morning", status: "available" },
      { day: 6, shift: "afternoon", status: "available" },
      { day: 6, shift: "night", status: "available" },
    ]);
    return createWeekAvailability(weekId, entries);
  }

  function weekWithPartialWeekend(weekId: string): WeekAvailability {
    const entries = setMany(createEmptyEntries(), [
      { day: 5, shift: "morning", status: "available" },
      { day: 5, shift: "afternoon", status: "available" },
      { day: 6, shift: "morning", status: "available" },
    ]);
    return createWeekAvailability(weekId, entries);
  }

  it("5. one fully available weekend — monthly requirement incomplete", () => {
    const fridays = getFridaysInMonth(2026, 11);
    expect(fridays.length).toBeGreaterThanOrEqual(2);

    const firstFridayWeek = getWeekId(fridays[0]);
    const weeks = {
      [firstFridayWeek]: weekWithFullWeekend(firstFridayWeek),
    };

    const result = evaluateMonthlyWeekendRequirements(2026, 11, weeks);
    expect(result.completed).toBe(1);
    expect(result.required).toBe(2);
    expect(result.isComplete).toBe(false);
    expect(result.message).toContain("2");
  });

  it("6. two fully available weekends — monthly requirement complete", () => {
    const fridays = getFridaysInMonth(2026, 11);
    const weeks: Record<string, WeekAvailability> = {};
    for (const friday of fridays.slice(0, 2)) {
      const weekId = getWeekId(friday);
      weeks[weekId] = weekWithFullWeekend(weekId);
    }

    const result = evaluateMonthlyWeekendRequirements(2026, 11, weeks);
    expect(result.completed).toBe(2);
    expect(result.isComplete).toBe(true);
    expect(result.message).toBeNull();
  });

  it("7. a partially available weekend does not count", () => {
    const fridays = getFridaysInMonth(2026, 11);
    const weekId = getWeekId(fridays[0]);
    const weeks = {
      [weekId]: weekWithPartialWeekend(weekId),
    };

    const result = evaluateMonthlyWeekendRequirements(2026, 11, weeks);
    expect(result.completed).toBe(0);
    expect(result.weekends[0].status).toBe("incomplete");
    expect(result.isComplete).toBe(false);
  });

  it("10. switching months recalculates the weekend requirement", () => {
    const novFridays = getFridaysInMonth(2026, 11);
    const decFridays = getFridaysInMonth(2026, 12);
    const novWeek = getWeekId(novFridays[0]);
    const decWeekA = getWeekId(decFridays[0]);
    const decWeekB = getWeekId(decFridays[1]);

    const weeks = {
      [novWeek]: weekWithFullWeekend(novWeek),
      [decWeekA]: weekWithFullWeekend(decWeekA),
      [decWeekB]: weekWithFullWeekend(decWeekB),
    };

    const november = evaluateMonthlyWeekendRequirements(2026, 11, weeks);
    const december = evaluateMonthlyWeekendRequirements(2026, 12, weeks);

    expect(november.completed).toBe(1);
    expect(november.isComplete).toBe(false);
    expect(december.completed).toBe(2);
    expect(december.isComplete).toBe(true);
    expect(getMonthFromWeekId(novWeek)).toEqual({ year: 2026, month: 11 });
    expect(getMonthFromWeekId(decWeekA)).toEqual({ year: 2026, month: 12 });
  });
});

describe("draft and submission gates", () => {
  it("8. saving an incomplete draft is allowed", () => {
    expect(canSaveDraft()).toBe(true);

    const entries = createEmptyEntries();
    const weeks = {
      [WEEK_ID]: createWeekAvailability(WEEK_ID, entries),
    };
    const snapshot = evaluateRequirements(WEEK_ID, entries, weeks);
    expect(snapshot.canSubmit).toBe(false);
    // Draft save is independent of requirement completion
    expect(canSaveDraft()).toBe(true);
  });

  it("9. display demo allows submit even when procedure is incomplete", () => {
    const entries = setMany(createEmptyEntries(), [
      { day: 0, shift: "morning", status: "available" },
    ]);
    const weeks = {
      [WEEK_ID]: createWeekAvailability(WEEK_ID, entries),
    };
    const snapshot = evaluateRequirements(WEEK_ID, entries, weeks, {
      enforceAvailabilityRequirements: false,
    });
    expect(snapshot.weekly.isComplete).toBe(false);
    expect(snapshot.procedureComplete).toBe(false);
    expect(canSubmitRequirements(snapshot)).toBe(true);
  });

  it("enforcement mode still blocks incomplete procedure when enabled", () => {
    const entries = createEmptyEntries();
    const weeks = {
      [WEEK_ID]: createWeekAvailability(WEEK_ID, entries),
    };
    const enforced = evaluateRequirements(WEEK_ID, entries, weeks, {
      enforceAvailabilityRequirements: true,
    });
    const demo = evaluateRequirements(WEEK_ID, entries, weeks, {
      enforceAvailabilityRequirements: false,
    });

    expect(enforced.procedureComplete).toBe(false);
    expect(enforced.canSubmit).toBe(false);
    expect(demo.canSubmit).toBe(true);
  });
});

describe("calendar ownership", () => {
  it("weekend belongs to the month containing its Friday", () => {
    // Friday 2026-10-30 / Saturday 2026-10-31 → October
    // Friday 2026-11-06 / Saturday 2026-11-07 → November
    const octFridays = getFridaysInMonth(2026, 10);
    const lastOctFriday = octFridays[octFridays.length - 1];
    expect(format(lastOctFriday, "yyyy-MM-dd")).toBe("2026-10-30");
    expect(toDateString(addDays(lastOctFriday, 1))).toBe("2026-10-31");

    const novFridays = getFridaysInMonth(2026, 11);
    expect(toDateString(novFridays[0])).toBe("2026-11-06");
  });
});
