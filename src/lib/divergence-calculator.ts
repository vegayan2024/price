import type { PricePoint, DivergenceSignal } from "../types";

/**
 * 计算两个价格序列的 Pearson 相关系数
 * @param x 第一个价格序列
 * @param y 第二个价格序列
 * @returns 相关系数，范围 [-1, 1]
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);

  const xMean = xSlice.reduce((a, b) => a + b, 0) / n;
  const yMean = ySlice.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = xSlice[i]! - xMean;
    const yDiff = ySlice[i]! - yMean;
    numerator += xDiff * yDiff;
    denominatorX += xDiff * xDiff;
    denominatorY += yDiff * yDiff;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * 计算价格变化率
 * @param prices 价格序列
 * @param period 计算周期（天数）
 * @returns 变化率数组
 */
export function calculateReturns(prices: number[], period: number = 1): number[] {
  const returns: number[] = [];
  for (let i = period; i < prices.length; i++) {
    const prev = prices[i - period]!;
    if (prev === 0) {
      returns.push(0);
    } else {
      returns.push((prices[i]! - prev) / prev);
    }
  }
  return returns;
}

/**
 * 计算滑动窗口相关性
 * @param x 第一个价格序列
 * @param y 第二个价格序列
 * @param windowSize 窗口大小
 * @returns 相关系数时序
 */
export function calculateSlidingCorrelation(
  x: number[],
  y: number[],
  windowSize: number,
): number[] {
  const correlations: number[] = [];
  const n = Math.min(x.length, y.length);

  for (let i = windowSize; i <= n; i++) {
    const xWindow = x.slice(i - windowSize, i);
    const yWindow = y.slice(i - windowSize, i);
    correlations.push(calculateCorrelation(xWindow, yWindow));
  }

  return correlations;
}

/**
 * 检测背离信号
 * @param stockPrices 股票价格序列
 * @param commodityPrices 商品价格序列
 * @param dates 日期序列
 * @param windowSize 检测窗口大小
 * @returns 背离信号数组
 */
export function detectDivergence(
  stockPrices: number[],
  commodityPrices: number[],
  dates: string[],
  windowSize: number = 60,
): DivergenceSignal[] {
  const signals: DivergenceSignal[] = [];
  const n = Math.min(stockPrices.length, commodityPrices.length);

  if (n < windowSize) return signals;

  // 计算收益率
  const stockReturns = calculateReturns(stockPrices);
  const commodityReturns = calculateReturns(commodityPrices);

  // 计算滑动窗口相关性
  const stockCorrelations = calculateSlidingCorrelation(stockReturns, commodityReturns, windowSize);

  // 检测背离
  for (let i = windowSize; i < n; i++) {
    const correlation = stockCorrelations[i - windowSize] ?? 0;

    // 计算窗口内的累计收益
    const stockCumReturn = stockReturns.slice(i - windowSize, i).reduce((a, b) => a + b, 0);
    const commodityCumReturn = commodityReturns.slice(i - windowSize, i).reduce((a, b) => a + b, 0);

    // 背离条件：相关性较低且方向相反
    const divergenceThreshold = 0.3;
    const returnThreshold = 0.05;

    if (
      Math.abs(correlation) < divergenceThreshold &&
      stockCumReturn * commodityCumReturn < 0 &&
      Math.abs(stockCumReturn) > returnThreshold &&
      Math.abs(commodityCumReturn) > returnThreshold
    ) {
      const divergenceType = stockCumReturn > 0 ? "negative" : "positive";
      const divergenceScore = Math.abs(stockCumReturn - commodityCumReturn);

      signals.push({
        code: "",
        name: "",
        productName: "",
        commodityName: "",
        divergenceType,
        divergenceScore,
        correlation,
        stockChange: stockCumReturn,
        commodityChange: commodityCumReturn,
        startDate: dates[i - windowSize] ?? "",
        endDate: dates[i] ?? "",
        signalStrength: divergenceScore > 0.2 ? "strong" : divergenceScore > 0.1 ? "medium" : "weak",
      });
    }
  }

  return signals;
}

/**
 * 计算 Z-Score
 * @param values 数值数组
 * @returns Z-Score 数组
 */
export function calculateZScore(values: number[]): number[] {
  const n = values.length;
  if (n < 2) return values.map(() => 0);

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);

  if (std === 0) return values.map(() => 0);

  return values.map((v) => (v - mean) / std);
}
