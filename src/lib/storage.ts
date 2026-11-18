import type { PersistedState } from "./types";
import { STORAGE_KEY, STORAGE_VERSION } from "./constants";
import { createInitialState } from "./demo-data";

export function loadState(): PersistedState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();

    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      return createInitialState();
    }

    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private mode — fail silently for prototype
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
