import { useState } from "react";
import type { DivergenceSignal } from "../types";
import { formatPercent } from "../lib/format";

interface SignalTableProps {
  signals: DivergenceSignal[];
  onSelectSignal?: (signal: DivergenceSignal) => void;
}

type SortField = "divergenceScore" | "correlation" | "stockChange" | "commodityChange";
type SortDirection = "asc" | "desc";

export default function SignalTable({ signals, onSelectSignal }: SignalTableProps) {
  const [sortField, setSortField] = useState<SortField>("divergenceScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedSignals = [...signals].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getStrengthClass = (strength: string) => {
    switch (strength) {
      case "strong":
        return "t-rise";
      case "medium":
        return "t-flat";
      default:
        return "t-fall";
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "positive" ? "正背离" : "负背离";
  };

  const getTypeClass = (type: string) => {
    return type === "positive" ? "t-rise" : "t-fall";
  };

  return (
    <div className="c-table-wrap">
      <table className="c-table">
        <thead>
          <tr>
            <th>公司</th>
            <th>产品</th>
            <th>类型</th>
            <th
              className="sortable"
              onClick={() => handleSort("divergenceScore")}
            >
              背离度 {sortField === "divergenceScore" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className="sortable"
              onClick={() => handleSort("correlation")}
            >
              相关性 {sortField === "correlation" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className="sortable"
              onClick={() => handleSort("stockChange")}
            >
              股票涨跌 {sortField === "stockChange" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className="sortable"
              onClick={() => handleSort("commodityChange")}
            >
              商品涨跌 {sortField === "commodityChange" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </th>
            <th>强度</th>
          </tr>
        </thead>
        <tbody>
          {sortedSignals.map((signal, index) => (
            <tr
              key={`${signal.code}-${signal.productName}-${index}`}
              onClick={() => onSelectSignal?.(signal)}
              className="clickable"
            >
              <td>
                <div className="cell-primary">{signal.name}</div>
                <div className="cell-secondary">{signal.code}</div>
              </td>
              <td>{signal.productName}</td>
              <td className={getTypeClass(signal.divergenceType)}>
                {getTypeLabel(signal.divergenceType)}
              </td>
              <td className="num">{signal.divergenceScore.toFixed(3)}</td>
              <td className="num">{signal.correlation.toFixed(2)}</td>
              <td className={`num ${signal.stockChange >= 0 ? "t-rise" : "t-fall"}`}>
                {formatPercent(signal.stockChange)}
              </td>
              <td className={`num ${signal.commodityChange >= 0 ? "t-rise" : "t-fall"}`}>
                {formatPercent(signal.commodityChange)}
              </td>
              <td className={getStrengthClass(signal.signalStrength)}>
                {signal.signalStrength === "strong" ? "强" : signal.signalStrength === "medium" ? "中" : "弱"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedSignals.length === 0 && (
        <div className="c-empty">暂无背离信号</div>
      )}
    </div>
  );
}
