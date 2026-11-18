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
        status: "unavailable",
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
      status: "unavailable",
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
  return current === "available" ? "unavailable" : "available";
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
  const total = entries.length;

  return { available, unavailable, total };
}

export function cloneEntries(entries: AvailabilityEntry[]): AvailabilityEntry[] {
  return entries.map((e) => ({ ...e }));
}
