import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import TerminalShell from "./components/TerminalShell";
import { useThemeMode } from "./context/ThemeModeContext";
import { loadAppData } from "./lib/data";
import type { AppData } from "./types";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DivergenceDetailPage = lazy(() => import("./pages/DivergenceDetailPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));

function RouteLoadingScreen() {
  return (
    <div className="route-loading" aria-live="polite">
      <span className="c-dot c-dot--brand c-dot--pulse" />
      <span className="label-mono">页面加载中</span>
    </div>
  );
}

export default function App() {
  const { mode: themeMode } = useThemeMode();
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadAppData()
      .then((loaded) => {
        if (active) setData(loaded);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : String(reason));
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="boot-screen">
        <div className="label-mono">启动错误</div>
        <h1>数据加载失败</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="boot-screen">
        <div className="c-dot c-dot--brand c-dot--pulse" />
        <div>
          <div className="label-mono">价格背离终端</div>
          <h1>读取数据中</h1>
        </div>
      </div>
    );
  }

  return (
    <TerminalShell data={data}>
      <Suspense fallback={<RouteLoadingScreen />}>
        <Routes key={themeMode}>
          <Route path="/" element={<DashboardPage data={data} />} />
          <Route path="/divergence/:code" element={<DivergenceDetailPage data={data} />} />
          <Route path="/alerts" element={<AlertsPage data={data} />} />
        </Routes>
      </Suspense>
    </TerminalShell>
  );
}
