import {
  addDays,
  addWeeks,
  format,
  startOfWeek,
  parseISO,
} from "date-fns";
import { he } from "date-fns/locale";

/** Week starts on Sunday (Israeli work week). */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 0 });
}

export function getWeekId(date: Date = new Date()): string {
  return format(getWeekStart(date), "yyyy-MM-dd");
}

export function parseWeekId(weekId: string): Date {
  return parseISO(weekId);
}

export function shiftWeek(weekId: string, delta: number): string {
  return getWeekId(addWeeks(parseWeekId(weekId), delta));
}

/**
 * Past weeks are closed once a new week begins.
 * Example: after 15–21 Nov ends, that week can no longer be edited.
 */
export function isPastWeek(weekId: string, now: Date = new Date()): boolean {
  return weekId < getWeekId(now);
}

export function isWeekendDayIndex(dayIndex: number): boolean {
  return dayIndex === 5 || dayIndex === 6;
}

export function getWeekEnd(weekId: string): Date {
  return addDays(parseWeekId(weekId), 6);
}

export function formatClosedWeekMessage(weekId: string): string {
  const end = format(getWeekEnd(weekId), "d בMMMM", { locale: he });
  return `השבוע הסתיים ב־${end} ונסגר לעריכה`;
}

export function getWeekDates(weekId: string): Date[] {
  const start = parseWeekId(weekId);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatWeekRange(weekId: string): string {
  const dates = getWeekDates(weekId);
  const start = format(dates[0], "d בMMMM", { locale: he });
  const end = format(dates[6], "d בMMMM yyyy", { locale: he });
  return `${start} – ${end}`;
}

export function formatDayHeader(date: Date): { dayLabel: string; dateLabel: string } {
  return {
    dayLabel: format(date, "EEEE", { locale: he }),
    dateLabel: format(date, "d/M"),
  };
}

/** Deadline: Wednesday 10:00 of the week before the target week. */
export function getSubmissionDeadline(weekId: string): Date {
  const weekStart = parseWeekId(weekId);
  // Previous week's Wednesday = Sunday − 4 days
  const prevWednesday = addDays(weekStart, -4);
  prevWednesday.setHours(10, 0, 0, 0);
  return prevWednesday;
}

export function formatDeadline(weekId: string): string {
  const deadline = getSubmissionDeadline(weekId);
  return format(deadline, "EEEE, d בMMMM · HH:mm", { locale: he });
}

export function isDeadlinePassed(weekId: string): boolean {
  return new Date() > getSubmissionDeadline(weekId);
}

export function formatTimestamp(iso: string): string {
  return format(parseISO(iso), "d בMMMM yyyy · HH:mm", { locale: he });
}
