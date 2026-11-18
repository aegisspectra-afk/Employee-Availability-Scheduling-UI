"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import type { AvailabilityEntry, ShiftType } from "@/lib/types";
import { DAYS, SHIFTS } from "@/lib/constants";
import { getEntry } from "@/lib/availability-utils";
import {
  formatDayHeader,
  getWeekDates,
  isWeekendDayIndex,
} from "@/lib/week-utils";
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
  const [mobileDay, setMobileDay] = useState(0);

  const allUnavailable = entries.every((e) => e.status === "unavailable");
  const mobileDate = dates[mobileDay];
  const mobileHeader = formatDayHeader(mobileDate);

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

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
            א׳–ה׳ ימי חול
          </span>
          <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-700">
            ו׳–ש׳ סוף שבוע
          </span>
        </div>

        {!locked && (
          <BulkActions
            onMarkAllAvailable={onMarkAllAvailable}
            onMarkAllUnavailable={onMarkAllUnavailable}
            undoLabel={undoLabel}
            onUndo={onUndo}
            disabled={locked}
          />
        )}
      </div>

      {allUnavailable && !locked && (
        <div className="mb-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            כל המשמרות מסומנות כלא זמינות. סמן לפחות כמה משמרות כזמינות כדי
            שהסידור יוכל להיבנות.
          </p>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden md:block">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "4.25rem repeat(7, minmax(0, 1fr))",
          }}
          role="grid"
          aria-label="זמינות לפי יום ומשמרת"
        >
          <div className="flex items-end px-1 pb-2 text-xs font-semibold text-slate-400">
            משמרת
          </div>
          {dates.map((date, dayIndex) => {
            const { dayLabel, dateLabel } = formatDayHeader(date);
            const weekend = isWeekendDayIndex(dayIndex);
            return (
              <div
                key={dayIndex}
                role="columnheader"
                className={[
                  "rounded-xl px-2 py-2 text-center",
                  weekend
                    ? "bg-indigo-50 ring-1 ring-indigo-100"
                    : "bg-slate-50",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-sm font-semibold",
                    weekend ? "text-indigo-800" : "text-slate-800",
                  ].join(" ")}
                >
                  {DAYS[dayIndex].label}
                </p>
                <p
                  className={[
                    "text-[11px]",
                    weekend ? "text-indigo-400" : "text-slate-400",
                  ].join(" ")}
                >
                  {dateLabel}
                </p>
                <span className="sr-only">{dayLabel}</span>
              </div>
            );
          })}

          {SHIFTS.map((shift) => (
            <div key={shift.type} className="contents" role="row">
              <div
                role="rowheader"
                className="flex items-center justify-center rounded-lg bg-slate-50 px-1.5 py-1"
              >
                <span className="text-xs font-semibold text-slate-800">
                  {shift.label}
                </span>
              </div>
              {DAYS.map((day) => {
                const entry = getEntry(entries, day.index, shift.type);
                const dateLabel = formatDayHeader(dates[day.index]).dateLabel;
                const weekend = isWeekendDayIndex(day.index);
                return (
                  <div
                    key={`${day.index}-${shift.type}`}
                    role="gridcell"
                    className={weekend ? "rounded-lg bg-indigo-50/40 p-0.5" : ""}
                  >
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

      {/* Mobile: day-by-day */}
      <div className="md:hidden">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="יום קודם"
            disabled={mobileDay <= 0}
            onClick={() => setMobileDay((d) => Math.max(0, d - 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <div
            className={[
              "min-w-0 flex-1 rounded-xl px-3 py-2 text-center",
              isWeekendDayIndex(mobileDay)
                ? "bg-indigo-50 ring-1 ring-indigo-100"
                : "bg-slate-50",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-slate-900">
              {DAYS[mobileDay].label}
            </p>
            <p className="text-xs text-slate-500">{mobileHeader.dateLabel}</p>
          </div>
          <button
            type="button"
            aria-label="יום הבא"
            disabled={mobileDay >= 6}
            onClick={() => setMobileDay((d) => Math.min(6, d + 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mb-3 flex justify-center gap-1">
          {DAYS.map((day) => (
            <button
              key={day.index}
              type="button"
              aria-label={day.label}
              onClick={() => setMobileDay(day.index)}
              className={[
                "h-2 w-2 rounded-full transition",
                mobileDay === day.index
                  ? isWeekendDayIndex(day.index)
                    ? "bg-indigo-500"
                    : "bg-slate-700"
                  : "bg-slate-200",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="space-y-2">
          {SHIFTS.map((shift) => {
            const entry = getEntry(entries, mobileDay, shift.type);
            return (
              <div
                key={shift.type}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2"
              >
                <div className="w-16 shrink-0 text-sm font-semibold text-slate-800">
                  {shift.label}
                </div>
                <div className="flex-1">
                  <AvailabilityCell
                    day={mobileDay}
                    shift={shift.type}
                    status={entry.status}
                    dateLabel={mobileHeader.dateLabel}
                    disabled={locked}
                    onToggle={() => onToggle(mobileDay, shift.type)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
