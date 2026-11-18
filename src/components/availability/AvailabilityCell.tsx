"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import type { AvailabilityStatus, ShiftType } from "@/lib/types";
import { DAYS, SHIFTS, STATUS_LABELS } from "@/lib/constants";

type AvailabilityCellProps = {
  day: number;
  shift: ShiftType;
  status: AvailabilityStatus;
  dateLabel: string;
  disabled?: boolean;
  onToggle: () => void;
};

const styles: Record<
  AvailabilityStatus,
  { cell: string; icon: string; label: string }
> = {
  available: {
    cell: "bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 focus-visible:ring-emerald-500/40",
    icon: "text-emerald-600",
    label: STATUS_LABELS.available,
  },
  unavailable: {
    cell: "bg-rose-50 border-rose-400 text-rose-700 hover:bg-rose-100 hover:border-rose-500 focus-visible:ring-rose-500/40",
    icon: "text-rose-600",
    label: STATUS_LABELS.unavailable,
  },
};

export function AvailabilityCell({
  day,
  shift,
  status,
  dateLabel,
  disabled = false,
  onToggle,
}: AvailabilityCellProps) {
  const dayLabel = DAYS.find((d) => d.index === day)?.label ?? "";
  const shiftLabel = SHIFTS.find((s) => s.type === shift)?.label ?? "";
  const visual = styles[status];
  const Icon = status === "available" ? Check : X;

  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onClick={onToggle}
      disabled={disabled}
      aria-label={`${dayLabel} ${dateLabel}, משמרת ${shiftLabel}: ${visual.label}. לחץ לשינוי`}
      aria-pressed={status === "available"}
      className={[
        "group relative flex h-14 w-full min-w-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-xl border-2 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "sm:h-16 md:h-[4.5rem]",
        visual.cell,
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      ].join(" ")}
    >
      <motion.span
        key={status}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        className={visual.icon}
      >
        <Icon
          className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]"
          strokeWidth={2.5}
          aria-hidden
        />
      </motion.span>
      <span className="hidden text-[10px] font-medium leading-none sm:block md:text-[11px]">
        {visual.label}
      </span>
    </motion.button>
  );
}
