import { useState, useMemo } from "react";
import type { DivergenceSignal, ValuationData } from "../types";
import { formatPercent } from "../lib/format";

interface GroupedSignalTableProps {
  signals: DivergenceSignal[];
  valuationData: Record<string, ValuationData>;
  onSelectSignal?: (signal: DivergenceSignal) => void;
}

interface CompanySignals {
  code: string;
  name: string;
  signals: DivergenceSignal[];
  valuation?: ValuationData;
  stockInLow10?: boolean;
  pbInLow20?: boolean;
}

export default function GroupedSignalTable({
  signals,
  valuationData,
  onSelectSignal,
}: GroupedSignalTableProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  // 按公司分组
  const groupedSignals = useMemo(() => {
    const companyMap = new Map<string, CompanySignals>();

    for (const signal of signals) {
      const existing = companyMap.get(signal.code);
      if (existing) {
        existing.signals.push(signal);
      } else {
        const valuation = valuationData[signal.code];

        // 计算股价是否在历史10%低位
        let stockInLow10 = false;
        if (valuation?.priceHistory && valuation.priceHistory.length > 0) {
          const sortedPrices = [...valuation.priceHistory].sort((a, b) => a - b);
          const low10Index = Math.floor(sortedPrices.length * 0.1);
          const low10Price = sortedPrices[low10Index];
          stockInLow10 = valuation.close !== null && valuation.close <= (low10Price ?? 0);
        }

        // 计算PB是否在历史20%分位点
        const pbInLow20 = valuation?.pbPercentile !== null && valuation?.pbPercentile !== undefined && valuation.pbPercentile <= 20;

        companyMap.set(signal.code, {
          code: signal.code,
          name: signal.name,
          signals: [signal],
          valuation,
          stockInLow10,
          pbInLow20,
        });
      }
    }

    return Array.from(companyMap.values());
  }, [signals, valuationData]);

  const toggleExpand = (code: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedCompanies(newExpanded);
  };

  const getSignalTypeLabel = (type: string) => {
    return type === "positive" ? "正背离" : "负背离";
  };

  const getSignalTypeClass = (type: string) => {
    return type === "positive" ? "t-rise" : "t-fall";
  };

  const getStrengthClass = (strength: string) => {
    switch (strength) {
      case "strong":
        return "strength-strong";
      case "medium":
        return "strength-medium";
      default:
        return "strength-weak";
    }
  };

  return (
    <div className="grouped-signal-table">
      <div className="table-header">
        <div className="col-company">公司</div>
        <div className="col-signals">信号数</div>
        <div className="col-type">主要类型</div>
        <div className="col-stock">股价位置</div>
        <div className="col-pb">PB分位</div>
        <div className="col-expand"></div>
      </div>

      {groupedSignals.map((company) => {
        const isExpanded = expandedCompanies.has(company.code);
        const mainType = company.signals[0]?.divergenceType ?? "";
        const maxStrength = company.signals.reduce((max, s) => {
          const order = { strong: 2, medium: 1, weak: 0 };
          return order[s.signalStrength] > order[max] ? s.signalStrength : max;
        }, "weak");

        return (
          <div key={company.code} className="company-group">
            <div
              className={`table-row ${isExpanded ? "expanded" : ""}`}
              onClick={() => toggleExpand(company.code)}
            >
              <div className="col-company">
                <div className="company-name">{company.name}</div>
                <div className="company-code">{company.code}</div>
              </div>
              <div className="col-signals">
                <span className="signal-count">{company.signals.length}</span>
              </div>
              <div className="col-type">
                <span className={`signal-type ${getSignalTypeClass(mainType)}`}>
                  {getSignalTypeLabel(mainType)}
                </span>
              </div>
              <div className="col-stock">
                {company.stockInLow10 ? (
                  <span className="badge badge-low10">历史10%低位</span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </div>
              <div className="col-pb">
                {company.pbInLow20 ? (
                  <span className="badge badge-pb20">PB {company.valuation?.pbPercentile?.toFixed(1)}%</span>
                ) : company.valuation?.pbPercentile !== null && company.valuation?.pbPercentile !== undefined ? (
                  <span className="text-muted">PB {company.valuation.pbPercentile.toFixed(1)}%</span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </div>
              <div className="col-expand">
                <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>▶</span>
              </div>
            </div>

            {isExpanded && (
              <div className="expanded-content">
                {company.signals.map((signal, index) => (
                  <div
                    key={index}
                    className="signal-row"
                    onClick={() => onSelectSignal?.(signal)}
                  >
                    <div className="signal-product">
                      {signal.productName} → {signal.commodityName}
                    </div>
                    <div className="signal-details">
                      <span className={`signal-type ${getSignalTypeClass(signal.divergenceType)}`}>
                        {getSignalTypeLabel(signal.divergenceType)}
                      </span>
                      <span className={`signal-strength ${getStrengthClass(signal.signalStrength)}`}>
                        {signal.signalStrength === "strong" ? "强" : signal.signalStrength === "medium" ? "中" : "弱"}
                      </span>
                      <span className="signal-score">
                        背离度: {(signal.divergenceScore * 100).toFixed(1)}%
                      </span>
                      <span className="signal-change">
                        股票: <span className={signal.stockChange >= 0 ? "t-rise" : "t-fall"}>{formatPercent(signal.stockChange)}</span>
                        商品: <span className={signal.commodityChange >= 0 ? "t-rise" : "t-fall"}>{formatPercent(signal.commodityChange)}</span>
                      </span>
                      <span className="signal-date">
                        {signal.startDate} ~ {signal.endDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
