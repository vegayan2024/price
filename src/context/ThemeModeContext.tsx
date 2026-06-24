import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ThemeMode } from "../types";
import { loadThemeMode, saveThemeMode, applyThemeMode } from "../lib/theme-mode";

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: "dark",
  setMode: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(loadThemeMode);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    saveThemeMode(newMode);
    applyThemeMode(newMode);
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}
