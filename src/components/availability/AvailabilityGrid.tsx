"use client";

import type { AvailabilityEntry, ShiftType } from "@/lib/types";
import { DAYS, SHIFTS } from "@/lib/constants";
import { getEntry } from "@/lib/availability-utils";
import { formatDayHeader, getWeekDates } from "@/lib/week-utils";
import { AvailabilityCell } from "./AvailabilityCell";
import { Legend } from "./Legend";
import { BulkActions } from "./BulkActions";

type AvailabilityGridProps = {
  weekId: string;
  entries: AvailabilityEntry[];
  onToggle: (day: number, shift: ShiftType) => void;
  onMarkAllAvailable: () => void;
  onMarkAllUnavailable: () => void;
  undoLabel: string | null;
  onUndo: () => void;
  locked?: boolean;
};

export function AvailabilityGrid({
  weekId,
  entries,
  onToggle,
  onMarkAllAvailable,
  onMarkAllUnavailable,
  undoLabel,
  onUndo,
  locked = false,
}: AvailabilityGridProps) {
  const dates = getWeekDates(weekId);

  return (
    <section
      aria-label="טבלת זמינות שבועית"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              רשת זמינות
            </h2>
            <p className="text-sm text-slate-500">
              סמן זמינות לכל משמרת בכל יום בשבוע
            </p>
          </div>
          <Legend />
        </div>

        <BulkActions
          onMarkAllAvailable={onMarkAllAvailable}
          onMarkAllUnavailable={onMarkAllUnavailable}
          undoLabel={undoLabel}
          onUndo={onUndo}
          disabled={locked}
        />
      </div>

      {/* Desktop / tablet: full 7-day CSS grid */}
      <div className="hidden md:block">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "7.5rem repeat(7, minmax(0, 1fr))",
          }}
          role="grid"
          aria-label="זמינות לפי יום ומשמרת"
        >
          <div className="flex items-end px-1 pb-2 text-xs font-semibold text-slate-400">
            משמרת
          </div>
          {dates.map((date, dayIndex) => {
            const { dayLabel, dateLabel } = formatDayHeader(date);
            return (
              <div
                key={dayIndex}
                role="columnheader"
                className="rounded-xl bg-slate-50 px-2 py-2 text-center"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {DAYS[dayIndex].label}
                </p>
                <p className="text-[11px] text-slate-400">{dateLabel}</p>
                <span className="sr-only">{dayLabel}</span>
              </div>
            );
          })}

          {SHIFTS.map((shift) => (
            <div key={shift.type} className="contents" role="row">
              <div
                role="rowheader"
                className="flex flex-col justify-center rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="text-sm font-semibold text-slate-800">
                  {shift.label}
                </span>
                <span className="text-[11px] text-slate-400">{shift.time}</span>
              </div>
              {DAYS.map((day) => {
                const entry = getEntry(entries, day.index, shift.type);
                const dateLabel = formatDayHeader(dates[day.index]).dateLabel;
                return (
                  <div key={`${day.index}-${shift.type}`} role="gridcell">
                    <AvailabilityCell
                      day={day.index}
                      shift={shift.type}
                      status={entry.status}
                      dateLabel={dateLabel}
                      disabled={locked}
                      onToggle={() => onToggle(day.index, shift.type)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: horizontal day scroller with sticky shift labels */}
      <div className="md:hidden">
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="inline-grid min-w-[40rem] grid-cols-[4.75rem_repeat(7,minmax(4.75rem,1fr))] gap-2 px-1">
            <div className="sticky right-0 z-10 bg-white px-1 pb-2 text-[11px] font-semibold text-slate-400">
              משמרת
            </div>
            {dates.map((date, dayIndex) => {
              const { dateLabel } = formatDayHeader(date);
              return (
                <div
                  key={dayIndex}
                  className="rounded-xl bg-slate-50 px-1.5 py-2 text-center"
                >
                  <p className="text-xs font-semibold text-slate-800">
                    {DAYS[dayIndex].short}
                  </p>
                  <p className="text-[10px] text-slate-400">{dateLabel}</p>
                </div>
              );
            })}

            {SHIFTS.map((shift) => (
              <div key={shift.type} className="contents">
                <div className="sticky right-0 z-10 flex flex-col justify-center rounded-xl bg-white px-2 py-1 shadow-[4px_0_8px_-6px_rgba(15,23,42,0.15)]">
                  <span className="text-xs font-semibold text-slate-800">
                    {shift.label}
                  </span>
                  <span className="text-[9px] leading-tight text-slate-400">
                    {shift.time}
                  </span>
                </div>
                {DAYS.map((day) => {
                  const entry = getEntry(entries, day.index, shift.type);
                  const dateLabel = formatDayHeader(dates[day.index]).dateLabel;
                  return (
                    <AvailabilityCell
                      key={`${day.index}-${shift.type}-m`}
                      day={day.index}
                      shift={shift.type}
                      status={entry.status}
                      dateLabel={dateLabel}
                      disabled={locked}
                      onToggle={() => onToggle(day.index, shift.type)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          החלק אופקית כדי לראות את כל הימים
        </p>
      </div>
    </section>
  );
}
