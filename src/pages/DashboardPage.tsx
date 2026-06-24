import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AppData, DivergenceSignal } from "../types";
import SignalTable from "../components/SignalTable";
import CorrelationHeatmap from "../components/CorrelationHeatmap";

interface DashboardPageProps {
  data: AppData;
}

type Tab = "signals" | "heatmap";

export default function DashboardPage({ data }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("signals");
  const navigate = useNavigate();

  const handleSelectSignal = (signal: DivergenceSignal) => {
    navigate(`/divergence/${signal.code}`);
  };

  return (
    <div className="page-dashboard">
      <div className="page-header">
        <h1>价格背离信号仪表盘</h1>
        <p className="text-muted">监控股票价格与商品价格的背离信号</p>
      </div>

      <div className="c-tabs">
        <button
          className={`c-tab ${activeTab === "signals" ? "c-tab--active" : ""}`}
          onClick={() => setActiveTab("signals")}
        >
          背离信号列表
        </button>
        <button
          className={`c-tab ${activeTab === "heatmap" ? "c-tab--active" : ""}`}
          onClick={() => setActiveTab("heatmap")}
        >
          相关性热力图
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "signals" && (
          <SignalTable signals={data.signals} onSelectSignal={handleSelectSignal} />
        )}
        {activeTab === "heatmap" && (
          <CorrelationHeatmap correlations={data.correlations} />
        )}
      </div>
    </div>
  );
}
