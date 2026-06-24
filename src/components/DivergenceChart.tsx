import type { PricePoint } from "../types";
import EChart from "./EChart";
import { useThemeMode } from "../context/ThemeModeContext";

interface DivergenceChartProps {
  stockPrices: PricePoint[];
  commodityPrices: PricePoint[];
  stockName: string;
  commodityName: string;
}

export default function DivergenceChart({
  stockPrices,
  commodityPrices,
  stockName,
  commodityName,
}: DivergenceChartProps) {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  // 对齐日期
  const stockMap = new Map(stockPrices.map((p) => [p.date, p.value]));
  const commodityMap = new Map(commodityPrices.map((p) => [p.date, p.value]));
  const allDates = Array.from(new Set([...stockMap.keys(), ...commodityMap.keys()])).sort();

  const stockData = allDates.map((d) => stockMap.get(d) ?? null);
  const commodityData = allDates.map((d) => commodityMap.get(d) ?? null);

  // 标准化为指数（基期=100）
  const stockBase = stockData.find((v) => v !== null) ?? 1;
  const commodityBase = commodityData.find((v) => v !== null) ?? 1;
  const stockIndex = stockData.map((v) => (v !== null ? (v / stockBase) * 100 : null));
  const commodityIndex = commodityData.map((v) => (v !== null ? (v / commodityBase) * 100 : null));

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: isDark ? "#181c23" : "#ffffff",
      borderColor: isDark ? "#242a33" : "#e5e7eb",
      textStyle: {
        color: isDark ? "#a8b0bc" : "#374151",
        fontSize: 12,
      },
      axisPointer: {
        type: "cross" as const,
        crossStyle: {
          color: isDark ? "#6b7380" : "#9ca3af",
        },
      },
    },
    legend: {
      data: [stockName, commodityName],
      textStyle: {
        color: isDark ? "#a8b0bc" : "#374151",
      },
      top: 10,
    },
    grid: {
      left: 60,
      right: 60,
      top: 50,
      bottom: 80,
    },
    xAxis: {
      type: "category" as const,
      data: allDates,
      axisLine: {
        lineStyle: { color: isDark ? "#242a33" : "#e5e7eb" },
      },
      axisLabel: {
        color: isDark ? "#6b7380" : "#9ca3af",
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: "value" as const,
        name: stockName,
        position: "left" as const,
        axisLine: {
          show: true,
          lineStyle: { color: "#f5a524" },
        },
        axisLabel: {
          color: isDark ? "#6b7380" : "#9ca3af",
        },
        splitLine: {
          lineStyle: { color: isDark ? "#242a33" : "#e5e7eb" },
        },
      },
      {
        type: "value" as const,
        name: commodityName,
        position: "right" as const,
        axisLine: {
          show: true,
          lineStyle: { color: "#3da9fc" },
        },
        axisLabel: {
          color: isDark ? "#6b7380" : "#9ca3af",
        },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: "inside" as const,
        start: 0,
        end: 100,
      },
      {
        type: "slider" as const,
        start: 0,
        end: 100,
        height: 20,
        bottom: 10,
        borderColor: isDark ? "#242a33" : "#e5e7eb",
        backgroundColor: isDark ? "#181c23" : "#f9fafb",
        fillerColor: "rgba(245, 165, 36, 0.2)",
        handleStyle: {
          color: "#f5a524",
        },
        textStyle: {
          color: isDark ? "#6b7380" : "#9ca3af",
        },
      },
    ],
    series: [
      {
        name: stockName,
        type: "line",
        yAxisIndex: 0,
        data: stockIndex,
        symbol: "none",
        lineStyle: {
          color: "#f5a524",
          width: 2,
        },
        itemStyle: {
          color: "#f5a524",
        },
      },
      {
        name: commodityName,
        type: "line",
        yAxisIndex: 1,
        data: commodityIndex,
        symbol: "none",
        lineStyle: {
          color: "#3da9fc",
          width: 2,
        },
        itemStyle: {
          color: "#3da9fc",
        },
      },
    ],
  };

  return <EChart option={option} height={500} />;
}
