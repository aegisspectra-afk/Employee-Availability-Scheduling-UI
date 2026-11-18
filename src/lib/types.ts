export type AvailabilityStatus = "available" | "unavailable";

export type ShiftType = "morning" | "afternoon" | "night";

/** Week-grid entry (day index within week starting Sunday). */
export type AvailabilityEntry = {
  day: number;
  shift: ShiftType;
  status: AvailabilityStatus;
};

/** Calendar-dated entry used for requirement calculations. */
export type DatedAvailabilityEntry = {
  date: string; // yyyy-MM-dd
  shift: ShiftType;
  status: AvailabilityStatus;
};

export type SubmissionStatus = "draft" | "saved" | "submitted";

/** Manager override after the submission deadline has passed. */
export type DeadlineOverrideStatus = "none" | "pending" | "approved";

export type WeekAvailability = {
  weekId: string;
  weekStart: string;
  entries: AvailabilityEntry[];
  /** Free-text notes / special shift requests for schedule builders. */
  notes: string;
  submissionStatus: SubmissionStatus;
  submittedAt: string | null;
  savedAt: string | null;
  /** Request that a manager reopen editing after the deadline. */
  deadlineOverrideStatus: DeadlineOverrideStatus;
  deadlineOverrideRequestedAt: string | null;
  deadlineOverrideNote: string;
  deadlineOverrideResolvedAt: string | null;
};

export type Employee = {
  name: string;
  role: string;
};

export type AvailabilitySummary = {
  available: number;
  unavailable: number;
  total: number;
};

export type ShiftRequirementProgress = {
  shift: ShiftType;
  current: number;
  required: number;
  complete: boolean;
  remaining: number;
};

export type WeeklyRequirementResult = {
  morning: ShiftRequirementProgress;
  afternoon: ShiftRequirementProgress;
  night: ShiftRequirementProgress;
  availableShifts: number;
  distinctWeekdays: number;
  requiredWeekdays: number;
  weekdaysComplete: boolean;
  isComplete: boolean;
  messages: string[];
};

export type WeekendStatus = "complete" | "incomplete" | "not_selected";

export type WeekendProgress = {
  index: number;
  friday: string;
  saturday: string;
  label: string;
  status: WeekendStatus;
};

export type MonthlyWeekendRequirementResult = {
  year: number;
  month: number; // 1-12
  monthLabel: string;
  completed: number;
  required: number;
  isComplete: boolean;
  weekends: WeekendProgress[];
  message: string | null;
};

export type RequirementsSnapshot = {
  weekly: WeeklyRequirementResult;
  monthly: MonthlyWeekendRequirementResult;
  /** True when procedure is satisfied, or when system policy overrides enforcement. */
  canSubmit: boolean;
  /** Raw procedure completeness, ignoring manager/system override. */
  procedureComplete: boolean;
  enforcementEnabled: boolean;
};

/** System policy — requirements are mandatory unless overridden. */
export type SystemPolicy = {
  /** When true, incomplete weekly/monthly requirements block submission. */
  enforceAvailabilityRequirements: boolean;
};

export type PersistedState = {
  version: number;
  employee: Employee;
  currentWeekId: string;
  weeks: Record<string, WeekAvailability>;
  previousWeekTemplate: AvailabilityEntry[];
  policy: SystemPolicy;
};
