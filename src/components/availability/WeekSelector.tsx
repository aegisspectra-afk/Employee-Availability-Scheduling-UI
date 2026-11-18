"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { formatWeekRange } from "@/lib/week-utils";

type WeekSelectorProps = {
  weekId: string;
  onPrev: () => void;
  onNext: () => void;
};

const navBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40";

export function WeekSelector({ weekId, onPrev, onNext }: WeekSelectorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={onPrev} aria-label="שבוע קודם" className={navBtn}>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>

      <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 sm:min-w-[14rem]">
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
        <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
          {formatWeekRange(weekId)}
        </p>
      </div>

      <button type="button" onClick={onNext} aria-label="שבוע הבא" className={navBtn}>
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
