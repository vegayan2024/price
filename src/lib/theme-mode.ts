import type { ThemeMode } from "../types";

const STORAGE_KEY = "terminal-theme-mode";

export function loadThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage not available
  }
  return "dark";
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // localStorage not available
  }
}

export function applyThemeMode(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
}
