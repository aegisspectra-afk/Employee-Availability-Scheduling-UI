import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  getMonth,
  getYear,
  isFriday,
  parseISO,
  startOfMonth,
} from "date-fns";
import { he } from "date-fns/locale";
import type {
  AvailabilityEntry,
  AvailabilityStatus,
  DatedAvailabilityEntry,
  MonthlyWeekendRequirementResult,
  RequirementsSnapshot,
  ShiftRequirementProgress,
  ShiftType,
  WeekAvailability,
  WeekendProgress,
  WeekendStatus,
  WeeklyRequirementResult,
} from "./types";
import { SHIFTS } from "./constants";
import { getWeekId, parseWeekId } from "./week-utils";

/** Sunday–Thursday day indexes in a week that starts on Sunday. */
export const WEEKDAY_DAY_INDEXES = [0, 1, 2, 3, 4] as const;
export const WEEKLY_SHIFT_REQUIRED = 2;
export const WEEKLY_DISTINCT_DAYS_REQUIRED = 4;
export const MONTHLY_WEEKENDS_REQUIRED = 2;

const SHIFT_LABELS: Record<ShiftType, string> = {
  morning: "בוקר",
  afternoon: "צהריים",
  night: "לילה",
};

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function weekEntriesToDated(
  weekId: string,
  entries: AvailabilityEntry[],
): DatedAvailabilityEntry[] {
  const start = parseWeekId(weekId);
  return entries.map((entry) => ({
    date: toDateString(addDays(start, entry.day)),
    shift: entry.shift,
    status: entry.status,
  }));
}

export function flattenWeeksToDated(
  weeks: Record<string, WeekAvailability>,
): DatedAvailabilityEntry[] {
  return Object.values(weeks).flatMap((week) =>
    weekEntriesToDated(week.weekId, week.entries),
  );
}

export function buildStatusLookup(
  dated: DatedAvailabilityEntry[],
): Map<string, AvailabilityStatus> {
  const map = new Map<string, AvailabilityStatus>();
  for (const entry of dated) {
    map.set(`${entry.date}|${entry.shift}`, entry.status);
  }
  return map;
}

function getStatus(
  lookup: Map<string, AvailabilityStatus>,
  date: string,
  shift: ShiftType,
): AvailabilityStatus {
  return lookup.get(`${date}|${shift}`) ?? "unavailable";
}

function makeShiftProgress(
  shift: ShiftType,
  current: number,
): ShiftRequirementProgress {
  const required = WEEKLY_SHIFT_REQUIRED;
  const remaining = Math.max(0, required - current);
  return {
    shift,
    current,
    required,
    complete: current >= required,
    remaining,
  };
}

/**
 * Weekly requirements apply only to Sunday–Thursday.
 * Friday/Saturday availability must not count.
 */
export function evaluateWeeklyRequirements(
  weekId: string,
  entries: AvailabilityEntry[],
): WeeklyRequirementResult {
  const dated = weekEntriesToDated(weekId, entries);
  const weekdayEntries = dated.filter((entry) => {
    const dow = getDay(parseISO(entry.date));
    return dow >= 0 && dow <= 4;
  });

  const availableWeekday = weekdayEntries.filter(
    (e) => e.status === "available",
  );

  const countShift = (shift: ShiftType) =>
    availableWeekday.filter((e) => e.shift === shift).length;

  const morning = makeShiftProgress("morning", countShift("morning"));
  const afternoon = makeShiftProgress("afternoon", countShift("afternoon"));
  const night = makeShiftProgress("night", countShift("night"));

  const distinctWeekdays = new Set(
    availableWeekday.map((e) => e.date),
  ).size;
  const weekdaysComplete = distinctWeekdays >= WEEKLY_DISTINCT_DAYS_REQUIRED;

  const messages: string[] = [];
  for (const progress of [morning, afternoon, night]) {
    if (progress.complete) {
      messages.push(
        `משמרות ${SHIFT_LABELS[progress.shift]}: ${progress.current}/${progress.required} – הושלם.`,
      );
    } else {
      messages.push(
        `משמרות ${SHIFT_LABELS[progress.shift]}: ${progress.current}/${progress.required} – נדרש עוד ${progress.remaining}.`,
      );
    }
  }

  if (weekdaysComplete) {
    messages.push(
      `ימי עבודה: ${distinctWeekdays}/${WEEKLY_DISTINCT_DAYS_REQUIRED} – הושלם.`,
    );
  } else {
    const remaining = WEEKLY_DISTINCT_DAYS_REQUIRED - distinctWeekdays;
    messages.push(
      `ימי עבודה: ${distinctWeekdays}/${WEEKLY_DISTINCT_DAYS_REQUIRED} – נדרש עוד ${remaining} יום נפרד.`,
    );
  }

  const isComplete =
    morning.complete &&
    afternoon.complete &&
    night.complete &&
    weekdaysComplete;

  return {
    morning,
    afternoon,
    night,
    availableShifts: availableWeekday.length,
    distinctWeekdays,
    requiredWeekdays: WEEKLY_DISTINCT_DAYS_REQUIRED,
    weekdaysComplete,
    isComplete,
    messages,
  };
}

export function getFridaysInMonth(year: number, month: number): Date[] {
  // month is 1-12
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end }).filter((d) => isFriday(d));
}

export function evaluateWeekendStatus(
  friday: string,
  saturday: string,
  lookup: Map<string, AvailabilityStatus>,
): WeekendStatus {
  const shifts = SHIFTS.map((s) => s.type);
  const friStatuses = shifts.map((shift) => getStatus(lookup, friday, shift));
  const satStatuses = shifts.map((shift) => getStatus(lookup, saturday, shift));
  const all = [...friStatuses, ...satStatuses];

  const availableCount = all.filter((s) => s === "available").length;
  if (availableCount === 0) return "not_selected";
  if (availableCount === 6) return "complete";
  return "incomplete";
}

/**
 * A weekend belongs to the month containing its Friday.
 */
export function evaluateMonthlyWeekendRequirements(
  year: number,
  month: number,
  weeks: Record<string, WeekAvailability>,
): MonthlyWeekendRequirementResult {
  const lookup = buildStatusLookup(flattenWeeksToDated(weeks));
  const fridays = getFridaysInMonth(year, month);

  const weekends: WeekendProgress[] = fridays.map((fridayDate, index) => {
    const saturdayDate = addDays(fridayDate, 1);
    const friday = toDateString(fridayDate);
    const saturday = toDateString(saturdayDate);
    const status = evaluateWeekendStatus(friday, saturday, lookup);

    return {
      index: index + 1,
      friday,
      saturday,
      label: `סוף שבוע ${index + 1} (${format(fridayDate, "d/M")}–${format(saturdayDate, "d/M")})`,
      status,
    };
  });

  const completed = weekends.filter((w) => w.status === "complete").length;
  const isComplete = completed >= MONTHLY_WEEKENDS_REQUIRED;
  const monthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy", {
    locale: he,
  });

  return {
    year,
    month,
    monthLabel,
    completed,
    required: MONTHLY_WEEKENDS_REQUIRED,
    isComplete,
    weekends,
    message: isComplete
      ? null
      : "יש להגיש זמינות מלאה ל־2 סופי שבוע בחודש זה.",
  };
}

export function getMonthFromWeekId(weekId: string): {
  year: number;
  month: number;
} {
  // Use the Friday of the selected week to determine the calendar month.
  const friday = addDays(parseWeekId(weekId), 5);
  return { year: getYear(friday), month: getMonth(friday) + 1 };
}

export function evaluateRequirements(
  weekId: string,
  entries: AvailabilityEntry[],
  weeks: Record<string, WeekAvailability>,
  options?: {
    year?: number;
    month?: number;
    enforceAvailabilityRequirements?: boolean;
  },
): RequirementsSnapshot {
  const monthlyKey =
    options?.year && options?.month
      ? { year: options.year, month: options.month }
      : getMonthFromWeekId(weekId);
  const weekly = evaluateWeeklyRequirements(weekId, entries);
  const monthly = evaluateMonthlyWeekendRequirements(
    monthlyKey.year,
    monthlyKey.month,
    weeks,
  );

  const procedureComplete = weekly.isComplete && monthly.isComplete;
  const enforcementEnabled =
    options?.enforceAvailabilityRequirements !== false;

  return {
    weekly,
    monthly,
    procedureComplete,
    enforcementEnabled,
    canSubmit: enforcementEnabled ? procedureComplete : true,
  };
}

/** Ensure every week that contains a Friday of the month exists in state. */
export function ensureWeeksForMonth(
  weeks: Record<string, WeekAvailability>,
  year: number,
  month: number,
  createWeek: (weekId: string) => WeekAvailability,
): Record<string, WeekAvailability> {
  const next = { ...weeks };
  for (const friday of getFridaysInMonth(year, month)) {
    const weekId = getWeekId(friday);
    if (!next[weekId]) {
      next[weekId] = createWeek(weekId);
    }
  }
  return next;
}

export function canSaveDraft(): boolean {
  return true;
}

export function canSubmitRequirements(snapshot: RequirementsSnapshot): boolean {
  return snapshot.canSubmit;
}
