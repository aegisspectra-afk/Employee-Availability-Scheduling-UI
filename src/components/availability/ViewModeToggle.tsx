"use client";

import { ClipboardList, UserRound } from "lucide-react";

export type AppViewMode = "employee" | "manager";

type ViewModeToggleProps = {
  mode: AppViewMode;
  onChange: (mode: AppViewMode) => void;
};

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
      role="tablist"
      aria-label="מצב תצוגה"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "employee"}
        onClick={() => onChange("employee")}
        className={[
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition",
          mode === "employee"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700",
        ].join(" ")}
      >
        <UserRound className="h-3 w-3" aria-hidden />
        עובד
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "manager"}
        onClick={() => onChange("manager")}
        className={[
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition",
          mode === "manager"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700",
        ].join(" ")}
      >
        <ClipboardList className="h-3 w-3" aria-hidden />
        מתכנן
      </button>
    </div>
  );
}
