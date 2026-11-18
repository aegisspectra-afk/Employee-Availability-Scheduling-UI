"use client";

import { Check, X } from "lucide-react";

const items = [
  {
    label: "זמין",
    className:
      "bg-emerald-50 border-emerald-400 text-emerald-700",
    Icon: Check,
  },
  {
    label: "לא זמין",
    className:
      "bg-rose-50 border-rose-400 text-rose-700",
    Icon: X,
  },
] as const;

export function Legend() {
  return (
    <div
      className="flex flex-wrap items-center gap-3 text-xs text-slate-500"
      aria-label="מקרא צבעים"
    >
      <span className="font-medium text-slate-600">מקרא:</span>
      {items.map(({ label, className, Icon }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border-2 ${className}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          {label}
        </span>
      ))}
      <span className="hidden text-slate-400 sm:inline">
        · לחץ על תא כדי להחליף בין זמין ללא זמין
      </span>
    </div>
  );
}
