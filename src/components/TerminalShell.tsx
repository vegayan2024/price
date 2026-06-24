import { BarChart3, Activity, Monitor, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useThemeMode } from "../context/ThemeModeContext";
import type { AppData } from "../types";

interface TerminalShellProps {
  data: AppData;
  children: ReactNode;
}

function ThemeToggle() {
  const { mode, setMode } = useThemeMode();

  return (
    <div className="c-theme-toggle c-segment" role="group" aria-label="主题">
      <button
        type="button"
        className={`c-segment__item ${mode === "dark" ? "c-segment__item--active" : ""}`}
        title="深色主题"
        aria-label="深色主题"
        aria-pressed={mode === "dark"}
        onClick={() => setMode("dark")}
      >
        <Moon size={13} />
      </button>
      <button
        type="button"
        className={`c-segment__item ${mode === "light" ? "c-segment__item--active" : ""}`}
        title="浅色主题"
        aria-label="浅色主题"
        aria-pressed={mode === "light"}
        onClick={() => setMode("light")}
      >
        <Sun size={13} />
      </button>
    </div>
  );
}

export default function TerminalShell({ data, children }: TerminalShellProps) {
  const signalCount = data.signals.length;
  const strongSignals = data.signals.filter((s) => s.signalStrength === "strong").length;

  return (
    <div className="terminal-shell">
      <nav className="c-navbar">
        <div className="c-navbar__brand">
          <Monitor size={18} />
          <span className="c-navbar__brand-name">价格背离信号终端</span>
        </div>
        <div className="c-navbar__menu">
          <NavLink className={({ isActive }) => (isActive ? "is-active" : "")} to="/">
            <span className="c-navbar__label c-navbar__label--full">仪表盘</span>
            <span className="c-navbar__label c-navbar__label--short">仪表盘</span>
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "is-active" : "")} to="/alerts">
            <span className="c-navbar__label c-navbar__label--full">预警</span>
            <span className="c-navbar__label c-navbar__label--short">预警</span>
          </NavLink>
        </div>
        <div className="c-navbar__meta">
          <ThemeToggle />
        </div>
      </nav>

      <div className="c-ticker">
        <div className="c-ticker__item">
          <span className="c-ticker__label">监控公司</span>
          <span className="c-ticker__value num">{data.companies.length}</span>
          <span className="c-ticker__change num t-flat">家</span>
        </div>
        <div className="c-ticker__item">
          <span className="c-ticker__label">背离信号</span>
          <span className="c-ticker__value num">{signalCount}</span>
          <span className="c-ticker__change num t-rise">个</span>
        </div>
        <div className="c-ticker__item">
          <span className="c-ticker__label">强信号</span>
          <span className="c-ticker__value num">{strongSignals}</span>
          <span className="c-ticker__change num t-fall">个</span>
        </div>
      </div>

      <main className="terminal-main">{children}</main>

      <div className="c-statusbar">
        <span className="row gap-3">
          <BarChart3 size={12} />
          价格背离监测
        </span>
        <span className="row gap-3">
          <Activity size={12} />
          延迟 · 本地
        </span>
      </div>
    </div>
  );
}
