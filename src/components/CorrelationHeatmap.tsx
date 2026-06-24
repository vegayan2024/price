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
  companies.forEach(([code, items], companyIndex) => {
    allCommodities.forEach((commodity, commodityIndex) => {
      const item = items.find((i) => i.commodityName === commodity);
      if (item) {
        heatmapData.push([commodityIndex, companyIndex, item.correlation60d]);
      }
    });
  });

  const companyNames = companies.map(([, items]) => items[0]?.name ?? "");

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
        return `${company} × ${commodity}<br/>相关性: ${value.toFixed(2)}`;
      },
    },
    grid: {
      left: 120,
      right: 80,
      top: 20,
      bottom: 100,
    },
    xAxis: {
      type: "category" as const,
      data: allCommodities,
      splitArea: {
        show: true,
      },
      axisLabel: {
        color: isDark ? "#6b7380" : "#9ca3af",
        rotate: 45,
      },
    },
    yAxis: {
      type: "category" as const,
      data: companyNames,
      splitArea: {
        show: true,
      },
      axisLabel: {
        color: isDark ? "#6b7380" : "#9ca3af",
      },
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: "vertical" as const,
      right: 10,
      top: "center" as const,
      inRange: {
        color: ["#3da9fc", "#ffffff", "#ef4d4d"],
      },
      textStyle: {
        color: isDark ? "#6b7380" : "#9ca3af",
      },
    },
    series: [
      {
        name: "相关性",
        type: "heatmap",
        data: heatmapData,
        label: {
          show: true,
          color: isDark ? "#a8b0bc" : "#374151",
          fontSize: 10,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return <EChart option={option} height={Math.max(400, companyNames.length * 40 + 100)} />;
}
