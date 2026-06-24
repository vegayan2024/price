import { useState, useMemo } from "react";
import type { Company, CorrelationData, DivergenceSignal, WeightType } from "../types";

interface CompanyListTableProps {
  companies: Company[];
  correlations: CorrelationData[];
  signals: DivergenceSignal[];
  weightType: WeightType;
  onSelectCompany?: (code: string) => void;
}

type SortField = "code" | "name" | "group" | "correlation60d" | "signal";
type SortDirection = "asc" | "desc";
type GroupFilter = "all" | "chemical" | "mining" | "explosive";

export default function CompanyListTable({
  companies,
  correlations,
  signals,
  weightType,
  onSelectCompany,
}: CompanyListTableProps) {
  const [sortField, setSortField] = useState<SortField>("code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");

  // 构建公司数据
  const companyData = useMemo(() => {
    const correlationMap = new Map(correlations.map((c) => [c.code, c]));
    const signalMap = new Map(signals.map((s) => [s.code, s]));

    return companies.map((company) => {
      const correlation = correlationMap.get(company.code);
      const signal = signalMap.get(company.code);
      const products = weightType === "revenue" ? company.productsByRevenue : company.productsByProfit;
      const firstProduct = products[0];
      return {
        ...company,
        products,
        correlation60d: correlation?.correlation60d ?? null,
        correlation120d: correlation?.correlation120d ?? null,
        correlation250d: correlation?.correlation250d ?? null,
        hasSignal: !!signal,
        signalType: signal?.divergenceType ?? null,
        signalStrength: signal?.signalStrength ?? null,
        productName: firstProduct?.productName ?? "-",
        commodityName: firstProduct?.commodityName ?? "-",
      };
    });
  }, [companies, correlations, signals, weightType]);

  // 筛选
  const filteredData = useMemo(() => {
    if (groupFilter === "all") return companyData;
    return companyData.filter((c) => c.group === groupFilter);
  }, [companyData, groupFilter]);

  // 排序
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal: number | string | null;
      let bVal: number | string | null;

      switch (sortField) {
        case "code":
          aVal = a.code;
          bVal = b.code;
          break;
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "group":
          aVal = a.group;
          bVal = b.group;
          break;
        case "correlation60d":
          aVal = a.correlation60d;
          bVal = b.correlation60d;
          break;
        case "signal":
          aVal = a.hasSignal ? 1 : 0;
          bVal = b.hasSignal ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getGroupLabel = (group: string) => {
    switch (group) {
      case "chemical":
        return "化工";
      case "mining":
        return "矿业";
      case "explosive":
        return "民爆";
      default:
        return group;
    }
  };

  const getGroupClass = (group: string) => {
    switch (group) {
      case "chemical":
        return "group-chemical";
      case "mining":
        return "group-mining";
      case "explosive":
        return "group-explosive";
      default:
        return "";
    }
  };

  const getCorrelationClass = (value: number | null) => {
    if (value === null) return "";
    if (value >= 0.6) return "t-fall";
    if (value >= 0.3) return "t-flat";
    return "t-rise";
  };

  const getSignalBadge = (hasSignal: boolean, type: string | null, strength: string | null) => {
    if (!hasSignal) return <span className="badge badge--none">无信号</span>;
    const typeLabel = type === "positive" ? "正背离" : "负背离";
    const strengthLabel = strength === "strong" ? "强" : strength === "medium" ? "中" : "弱";
    return (
      <span className={`badge badge--${type} badge--${strength}`}>
        {typeLabel} {strengthLabel}
      </span>
    );
  };

  return (
    <div className="company-list">
      <div className="company-list__filters">
        <div className="filter-group">
          <span className="filter-label">行业分类:</span>
          <button
            className={`filter-btn ${groupFilter === "all" ? "filter-btn--active" : ""}`}
            onClick={() => setGroupFilter("all")}
          >
            全部 ({companies.length})
          </button>
          <button
            className={`filter-btn ${groupFilter === "chemical" ? "filter-btn--active" : ""}`}
            onClick={() => setGroupFilter("chemical")}
          >
            化工 ({companies.filter((c) => c.group === "chemical").length})
          </button>
          <button
            className={`filter-btn ${groupFilter === "mining" ? "filter-btn--active" : ""}`}
            onClick={() => setGroupFilter("mining")}
          >
            矿业 ({companies.filter((c) => c.group === "mining").length})
          </button>
          <button
            className={`filter-btn ${groupFilter === "explosive" ? "filter-btn--active" : ""}`}
            onClick={() => setGroupFilter("explosive")}
          >
            民爆 ({companies.filter((c) => c.group === "explosive").length})
          </button>
        </div>
      </div>

      <div className="c-table-wrap">
        <table className="c-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort("code")}>
                代码 {sortField === "code" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="sortable" onClick={() => handleSort("name")}>
                名称 {sortField === "name" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="sortable" onClick={() => handleSort("group")}>
                分类 {sortField === "group" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </th>
              <th>主营产品</th>
              <th>对应商品</th>
              <th className="sortable" onClick={() => handleSort("correlation60d")}>
                60日相关性 {sortField === "correlation60d" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </th>
              <th>120日相关性</th>
              <th>250日相关性</th>
              <th className="sortable" onClick={() => handleSort("signal")}>
                背离信号 {sortField === "signal" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((company) => (
              <tr
                key={company.code}
                onClick={() => onSelectCompany?.(company.code)}
                className="clickable"
              >
                <td className="num">{company.code}</td>
                <td>
                  <div className="cell-primary">{company.name}</div>
                </td>
                <td>
                  <span className={`group-tag ${getGroupClass(company.group)}`}>
                    {getGroupLabel(company.group)}
                  </span>
                </td>
                <td>{company.productName}</td>
                <td>{company.commodityName}</td>
                <td className={`num ${getCorrelationClass(company.correlation60d)}`}>
                  {company.correlation60d !== null ? company.correlation60d.toFixed(2) : "-"}
                </td>
                <td className={`num ${getCorrelationClass(company.correlation120d)}`}>
                  {company.correlation120d !== null ? company.correlation120d.toFixed(2) : "-"}
                </td>
                <td className={`num ${getCorrelationClass(company.correlation250d)}`}>
                  {company.correlation250d !== null ? company.correlation250d.toFixed(2) : "-"}
                </td>
                <td>
                  {getSignalBadge(company.hasSignal, company.signalType, company.signalStrength)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
