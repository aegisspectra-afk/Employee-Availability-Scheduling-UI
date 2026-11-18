import type {
  AvailabilityEntry,
  AvailabilityStatus,
  AvailabilitySummary,
  ShiftType,
  WeekAvailability,
} from "./types";
import { DAYS, SHIFTS } from "./constants";

export function createEmptyEntries(): AvailabilityEntry[] {
  const entries: AvailabilityEntry[] = [];
  for (const day of DAYS) {
    for (const shift of SHIFTS) {
      entries.push({
        day: day.index,
        shift: shift.type,
        status: "unset",
      });
    }
  }
  return entries;
}

export function createWeekAvailability(
  weekId: string,
  entries?: AvailabilityEntry[],
): WeekAvailability {
  return {
    weekId,
    weekStart: weekId,
    entries: entries ?? createEmptyEntries(),
    submissionStatus: "draft",
    submittedAt: null,
    savedAt: null,
  };
}

export function getEntry(
  entries: AvailabilityEntry[],
  day: number,
  shift: ShiftType,
): AvailabilityEntry {
  return (
    entries.find((e) => e.day === day && e.shift === shift) ?? {
      day,
      shift,
      status: "unset",
    }
  );
}

export function setEntryStatus(
  entries: AvailabilityEntry[],
  day: number,
  shift: ShiftType,
  status: AvailabilityStatus,
): AvailabilityEntry[] {
  return entries.map((entry) =>
    entry.day === day && entry.shift === shift
      ? { ...entry, status }
      : entry,
  );
}

export function toggleStatus(current: AvailabilityStatus): AvailabilityStatus {
  if (current === "unset") return "available";
  if (current === "available") return "unavailable";
  return "unset";
}

export function setAllStatus(
  entries: AvailabilityEntry[],
  status: AvailabilityStatus,
): AvailabilityEntry[] {
  return entries.map((entry) => ({ ...entry, status }));
}

export function getSummary(entries: AvailabilityEntry[]): AvailabilitySummary {
  const available = entries.filter((e) => e.status === "available").length;
  const unavailable = entries.filter((e) => e.status === "unavailable").length;
  const unset = entries.filter((e) => e.status === "unset").length;
  const total = entries.length;
  const completionPercent = Math.round(((total - unset) / total) * 100);

  return { available, unavailable, unset, total, completionPercent };
}

export function cloneEntries(entries: AvailabilityEntry[]): AvailabilityEntry[] {
  return entries.map((e) => ({ ...e }));
}
