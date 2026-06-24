import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import { applyThemeMode, loadThemeMode } from "./lib/theme-mode";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/app.css";

applyThemeMode(loadThemeMode());

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeModeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeModeProvider>
  </StrictMode>,
);
