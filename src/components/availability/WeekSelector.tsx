"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { formatWeekRange } from "@/lib/week-utils";

type WeekSelectorProps = {
  weekId: string;
  onPrev: () => void;
  onNext: () => void;
};

export function WeekSelector({ weekId, onPrev, onNext }: WeekSelectorProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="שבוע קודם"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      >
        {/* RTL: previous week is visually on the right, chevron points that way */}
        <ChevronRight className="h-4.5 w-4.5" aria-hidden />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:min-w-[16rem] sm:flex-none sm:px-4">
        <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
        <div className="min-w-0 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            שבוע נבחר
          </p>
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
            {formatWeekRange(weekId)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="שבוע הבא"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      >
        <ChevronLeft className="h-4.5 w-4.5" aria-hidden />
      </button>
    </div>
  );
}
