import type { ShiftType } from "./types";

export const STORAGE_KEY = "g1-availability-v1";
export const STORAGE_VERSION = 6;

/** Display-only demo — interactions work locally, nothing is really submitted. */
export const IS_DISPLAY_DEMO = true;

/** Procedure checks exist for demo logic, but are not enforced in display mode. */
export const DEFAULT_SYSTEM_POLICY = {
  enforceAvailabilityRequirements: false,
} as const;

export const DAYS = [
  { index: 0, label: "ראשון", short: "א׳" },
  { index: 1, label: "שני", short: "ב׳" },
  { index: 2, label: "שלישי", short: "ג׳" },
  { index: 3, label: "רביעי", short: "ד׳" },
  { index: 4, label: "חמישי", short: "ה׳" },
  { index: 5, label: "שישי", short: "ו׳" },
  { index: 6, label: "שבת", short: "ש׳" },
] as const;

export const SHIFTS: {
  type: ShiftType;
  label: string;
  time: string;
}[] = [
  { type: "morning", label: "בוקר", time: "07:00–15:00" },
  { type: "afternoon", label: "צהריים", time: "15:00–23:00" },
  { type: "night", label: "לילה", time: "23:00–07:00" },
];

export const EMPLOYEE = {
  name: "איליה קרנר",
  role: "סייר",
} as const;

export const STATUS_LABELS = {
  available: "זמין",
  unavailable: "לא זמין",
} as const;

export const SUBMISSION_STATUS_LABELS = {
  draft: "טיוטה",
  saved: "טיוטה נשמרה",
  submitted: "נשלח בהצלחה",
} as const;
