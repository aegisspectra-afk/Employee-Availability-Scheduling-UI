export type AvailabilityStatus = "available" | "unavailable" | "unset";

export type ShiftType = "morning" | "afternoon" | "night";

export type AvailabilityEntry = {
  day: number;
  shift: ShiftType;
  status: AvailabilityStatus;
};

export type SubmissionStatus = "draft" | "saved" | "submitted";

export type WeekAvailability = {
  weekId: string;
  weekStart: string;
  entries: AvailabilityEntry[];
  submissionStatus: SubmissionStatus;
  submittedAt: string | null;
  savedAt: string | null;
};

export type Employee = {
  name: string;
  role: string;
};

export type AvailabilitySummary = {
  available: number;
  unavailable: number;
  unset: number;
  total: number;
  completionPercent: number;
};

export type PersistedState = {
  version: number;
  employee: Employee;
  currentWeekId: string;
  weeks: Record<string, WeekAvailability>;
  previousWeekTemplate: AvailabilityEntry[];
};
