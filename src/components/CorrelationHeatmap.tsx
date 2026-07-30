import type { CorrelationData } from "../types";
import EChart from "./EChart";
import { useThemeMode } from "../context/ThemeModeContext";

interface CorrelationHeatmapProps {
  correlations: CorrelationData[];
}

export default function CorrelationHeatmap({ correlations }: CorrelationHeatmapProps) {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  // 按公司分组
  const companyMap = new Map<string, CorrelationData[]>();
  for (const c of correlations) {
    const existing = companyMap.get(c.code) ?? [];
    existing.push(c);
    companyMap.set(c.code, existing);
  }

  const companies = Array.from(companyMap.entries());
  const allCommodities = Array.from(new Set(correlations.map((c) => c.commodityName)));

  // 构建热力图数据
  const heatmapData: [number, number, number][] = [];
  companies.forEach(([_code, items], companyIndex) => {
    allCommodities.forEach((commodity, commodityIndex) => {
      const item = items.find((i) => i.commodityName === commodity);
      if (item) {
        heatmapData.push([commodityIndex, companyIndex, item.correlation60d]);
      }
    });
  });

  const companyNames = companies.map(([, items]) => items[0]?.name ?? "");

  // 配色：负相关(蓝) → 零(灰白) → 正相关(红)，简洁三段式
  const inRangeColor = isDark
    ? ["#1e5fbf", "#2a2e35", "#c93535"]
    : ["#3b82f6", "#f3f4f6", "#dc2626"];

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      position: "top" as const,
      backgroundColor: isDark ? "#181c23" : "#ffffff",
      borderColor: isDark ? "#242a33" : "#e5e7eb",
      textStyle: {
        color: isDark ? "#a8b0bc" : "#374151",
        fontSize: 12,
      },
      formatter: (params: { data: [number, number, number] }) => {
        const [x, y, value] = params.data;
        const company = companyNames[y] ?? "";
        const commodity = allCommodities[x] ?? "";
        const label = value >= 0.5 ? "强正相关" : value >= 0.2 ? "弱正相关" : value >= -0.2 ? "不相关" : value >= -0.5 ? "弱负相关" : "强负相关";
        return `<b>${company}</b> × <b>${commodity}</b><br/>相关性: <b>${value.toFixed(2)}</b>（${label}）`;
      },
    },
    grid: {
      left: 100,
      right: 100,
      top: 10,
      bottom: 80,
    },
    xAxis: {
      type: "category" as const,
      data: allCommodities,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: isDark ? "#6b7380" : "#9ca3af",
        rotate: 45,
        fontSize: 11,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category" as const,
      data: companyNames,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: isDark ? "#a8b0bc" : "#374151",
        fontSize: 11,
      },
      splitLine: { show: false },
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: false,
      orient: "vertical" as const,
      right: 10,
      top: "center" as const,
      itemWidth: 14,
      itemHeight: 180,
      inRange: {
        color: inRangeColor,
      },
      text: ["+1.0", "−1.0"],
      textStyle: {
        color: isDark ? "#6b7380" : "#9ca3af",
        fontSize: 11,
      },
    },
    series: [
      {
        name: "相关性",
        type: "heatmap",
        data: heatmapData,
        label: {
          show: true,
          fontSize: 10,
          fontWeight: 500,
          color: isDark ? "#e6e8eb" : "#111827",
          formatter: (params: { data: [number, number, number] }) => {
            return params.data[2].toFixed(2);
          },
        },
        itemStyle: {
          borderColor: isDark ? "#181c23" : "#ffffff",
          borderWidth: 1,
          borderRadius: 2,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 6,
            shadowColor: "rgba(0, 0, 0, 0.4)",
            borderColor: isDark ? "#f5a524" : "#d97706",
            borderWidth: 2,
          },
        },
      },
    ],
  };

  return (
    <div>
      <EChart option={option} height={Math.max(400, companyNames.length * 40 + 80)} />
      <div style={{
        padding: "12px 16px",
        fontSize: 12,
        color: isDark ? "#6b7380" : "#6b7280",
        lineHeight: 1.6,
        borderTop: `1px solid ${isDark ? "#242a33" : "#e5e7eb"}`,
      }}>
        <b style={{ color: isDark ? "#a8b0bc" : "#374151" }}>如何阅读此图：</b>
        每个格子表示一家公司股价与对应商品价格的<b>60日滑动相关系数</b>（Pearson r）。
        <b style={{ color: isDark ? "#1e5fbf" : "#3b82f6" }}>蓝色</b>代表负相关（股价涨、商品跌，或反之），
        <b style={{ color: isDark ? "#c93535" : "#dc2626" }}>红色</b>代表正相关（同涨同跌），
        灰白色代表不相关。
        数值越接近 ±1 相关性越强；接近 0 则两者走势独立。
        当格子颜色与数值<b>不符</b>（如正相关但股价反向运动），即为<b>背离信号</b>。
      </div>
    </div>
  );
}
