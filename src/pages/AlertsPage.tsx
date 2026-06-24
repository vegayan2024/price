import { useNavigate } from "react-router-dom";
import type { AppData, DivergenceSignal } from "../types";
import { formatPercent } from "../lib/format";

interface AlertsPageProps {
  data: AppData;
}

export default function AlertsPage({ data }: AlertsPageProps) {
  const navigate = useNavigate();

  // 按强度排序，强信号在前
  const sortedSignals = [...data.signals].sort((a, b) => {
    const strengthOrder = { strong: 0, medium: 1, weak: 2 };
    return strengthOrder[a.signalStrength] - strengthOrder[b.signalStrength];
  });

  const strongSignals = sortedSignals.filter((s) => s.signalStrength === "strong");
  const mediumSignals = sortedSignals.filter((s) => s.signalStrength === "medium");

  const handleSignalClick = (signal: DivergenceSignal) => {
    navigate(`/divergence/${signal.code}`);
  };

  return (
    <div className="page-alerts">
      <div className="page-header">
        <h1>背离信号预警</h1>
        <p className="text-muted">按信号强度排序的背离预警</p>
      </div>

      {strongSignals.length > 0 && (
        <section className="alert-section">
          <h2 className="alert-section__title t-rise">
            <span className="c-dot c-dot--rise c-dot--pulse" />
            强信号 ({strongSignals.length})
          </h2>
          <div className="alert-list">
            {strongSignals.map((signal, index) => (
              <div
                key={`${signal.code}-${signal.productName}-${index}`}
                className="alert-card alert-card--strong"
                onClick={() => handleSignalClick(signal)}
              >
                <div className="alert-card__header">
                  <span className="alert-card__company">{signal.name}</span>
                  <span className="alert-card__code">{signal.code}</span>
                </div>
                <div className="alert-card__body">
                  <div className="alert-card__product">
                    {signal.productName} → {signal.commodityName}
                  </div>
                  <div className="alert-card__type">
                    {signal.divergenceType === "positive" ? "正背离（可能被低估）" : "负背离（可能被高估）"}
                  </div>
                </div>
                <div className="alert-card__metrics">
                  <div className="alert-card__metric">
                    <span className="label">股票涨跌</span>
                    <span className={`value num ${signal.stockChange >= 0 ? "t-rise" : "t-fall"}`}>
                      {formatPercent(signal.stockChange)}
                    </span>
                  </div>
                  <div className="alert-card__metric">
                    <span className="label">商品涨跌</span>
                    <span className={`value num ${signal.commodityChange >= 0 ? "t-rise" : "t-fall"}`}>
                      {formatPercent(signal.commodityChange)}
                    </span>
                  </div>
                  <div className="alert-card__metric">
                    <span className="label">相关性</span>
                    <span className="value num">{signal.correlation.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {mediumSignals.length > 0 && (
        <section className="alert-section">
          <h2 className="alert-section__title t-flat">
            <span className="c-dot c-dot--flat" />
            中等信号 ({mediumSignals.length})
          </h2>
          <div className="alert-list">
            {mediumSignals.map((signal, index) => (
              <div
                key={`${signal.code}-${signal.productName}-${index}`}
                className="alert-card alert-card--medium"
                onClick={() => handleSignalClick(signal)}
              >
                <div className="alert-card__header">
                  <span className="alert-card__company">{signal.name}</span>
                  <span className="alert-card__code">{signal.code}</span>
                </div>
                <div className="alert-card__body">
                  <div className="alert-card__product">
                    {signal.productName} → {signal.commodityName}
                  </div>
                  <div className="alert-card__type">
                    {signal.divergenceType === "positive" ? "正背离" : "负背离"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sortedSignals.length === 0 && (
        <div className="c-empty">
          <p>暂无背离信号</p>
        </div>
      )}
    </div>
  );
}
