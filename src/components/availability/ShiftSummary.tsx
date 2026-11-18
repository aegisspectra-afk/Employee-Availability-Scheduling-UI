"use client";

import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import type { AvailabilitySummary } from "@/lib/types";

type ShiftSummaryProps = {
  summary: AvailabilitySummary;
};

export function ShiftSummary({ summary }: ShiftSummaryProps) {
  const metrics = [
    {
      key: "available",
      label: "זמין",
      value: summary.available,
      icon: CheckCircle2,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-100",
      iconTone: "text-emerald-600",
    },
    {
      key: "unavailable",
      label: "לא זמין",
      value: summary.unavailable,
      icon: XCircle,
      tone: "text-rose-700 bg-rose-50 border-rose-100",
      iconTone: "text-rose-600",
    },
    {
      key: "unset",
      label: "לא נבחר",
      value: summary.unset,
      icon: CircleDashed,
      tone: "text-slate-600 bg-slate-50 border-slate-200",
      iconTone: "text-slate-400",
    },
  ] as const;

  return (
    <section
      aria-label="סיכום זמינות"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">סיכום שבועי</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            זמינות כוללת:{" "}
            <span className="font-semibold text-slate-800">
              {summary.available}/{summary.total} משמרות
            </span>
          </p>
        </div>

        <div className="w-full sm:max-w-xs">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>השלמת הטופס</span>
            <span className="font-semibold text-slate-700">
              {summary.completionPercent}%
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={summary.completionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="אחוז השלמת הטופס"
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${summary.completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.key}
              className={[
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 sm:flex-row sm:justify-center sm:gap-2 sm:px-3",
                metric.tone,
              ].join(" ")}
            >
              <Icon className={`h-4 w-4 ${metric.iconTone}`} aria-hidden />
              <div className="text-center sm:text-right">
                <p className="text-lg font-bold leading-none sm:text-xl">
                  {metric.value}
                </p>
                <p className="mt-1 text-[11px] font-medium opacity-80 sm:text-xs">
                  {metric.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
