import type { AppData, Company, DivergenceSignal, CorrelationData, PricePoint } from "../types";
import { calculateCorrelation, calculateReturns, calculateSlidingCorrelation } from "./divergence-calculator";

interface FetchOptions {
  cacheBust?: string;
}

function publicDataUrl(file: string, options: FetchOptions = {}) {
  const url = `${import.meta.env.BASE_URL}data/${file}`;
  return options.cacheBust ? `${url}?v=${encodeURIComponent(options.cacheBust)}` : url;
}

async function fetchJson<T>(file: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(publicDataUrl(file, options), { cache: options.cacheBust ? "reload" : "no-store" });
  if (!response.ok) throw new Error(`${file} ${response.status}`);
  return response.json() as Promise<T>;
}

async function fetchOptionalJson<T>(file: string, fallback: T, options: FetchOptions = {}): Promise<T> {
  try {
    return await fetchJson<T>(file, options);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) return fallback;
    throw error;
  }
}

/**
 * 从价格序列中提取数值数组
 * @param prices 价格点数组
 * @returns 数值数组
 */
function extractValues(prices: PricePoint[]): number[] {
  return prices.map((p) => p.value);
}

/**
 * 从价格序列中提取日期数组
 * @param prices 价格点数组
 * @returns 日期数组
 */
function extractDates(prices: PricePoint[]): string[] {
  return prices.map((p) => p.date);
}

/**
 * 对齐两个价格序列（按日期匹配）
 * @param stockPrices 股票价格
 * @param commodityPrices 商品价格
 * @returns 对齐后的数据
 */
function alignPriceSeries(
  stockPrices: PricePoint[],
  commodityPrices: PricePoint[],
): { alignedStock: number[]; alignedCommodity: number[]; dates: string[] } {
  const stockMap = new Map(stockPrices.map((p) => [p.date, p.value]));
  const commodityMap = new Map(commodityPrices.map((p) => [p.date, p.value]));

  const allDates = Array.from(new Set([...stockMap.keys(), ...commodityMap.keys()])).sort();

  const alignedStock: number[] = [];
  const alignedCommodity: number[] = [];
  const validDates: string[] = [];

  for (const date of allDates) {
    const stockVal = stockMap.get(date);
    const commodityVal = commodityMap.get(date);
    if (stockVal !== undefined && commodityVal !== undefined) {
      alignedStock.push(stockVal);
      alignedCommodity.push(commodityVal);
      validDates.push(date);
    }
  }

  return { alignedStock, alignedCommodity, dates: validDates };
}

/**
 * 计算单个公司的背离信号
 * @param company 公司信息
 * @param stockPrices 股票价格序列
 * @param commodityPrices 商品价格映射
 * @param weightType 权重类型
 * @returns 背离信号数组
 */
function calculateCompanyDivergence(
  company: Company,
  stockPrices: PricePoint[],
  commodityPrices: Record<string, PricePoint[]>,
  weightType: "revenue" | "profit" = "revenue",
): DivergenceSignal[] {
  const products = weightType === "revenue" ? company.productsByRevenue : company.productsByProfit;
  const signals: DivergenceSignal[] = [];

  for (const product of products) {
    const commodityPriceSeries = commodityPrices[product.commodityKey];
    if (!commodityPriceSeries || commodityPriceSeries.length === 0) continue;

    const { alignedStock, alignedCommodity, dates } = alignPriceSeries(stockPrices, commodityPriceSeries);

    if (alignedStock.length < 60) continue;

    const stockReturns = calculateReturns(alignedStock);
    const commodityReturns = calculateReturns(alignedCommodity);

    const windowSize = Math.min(60, alignedStock.length - 1);
    const stockCorrelations = calculateSlidingCorrelation(stockReturns, commodityReturns, windowSize);

    for (let i = windowSize; i < stockReturns.length; i++) {
      const correlation = stockCorrelations[i - windowSize] ?? 0;

      const stockCumReturn = stockReturns.slice(i - windowSize, i).reduce((a, b) => a + b, 0);
      const commodityCumReturn = commodityReturns.slice(i - windowSize, i).reduce((a, b) => a + b, 0);

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
          code: company.code,
          name: company.name,
          productName: product.productName,
          commodityName: product.commodityName,
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
  }

  return signals;
}

/**
 * 计算相关性数据
 * @param company 公司信息
 * @param stockPrices 股票价格序列
 * @param commodityPrices 商品价格映射
 * @returns 相关性数据
 */
function calculateCompanyCorrelation(
  company: Company,
  stockPrices: PricePoint[],
  commodityPrices: Record<string, PricePoint[]>,
): CorrelationData[] {
  const correlations: CorrelationData[] = [];
  const products = company.productsByRevenue;

  for (const product of products) {
    const commodityPriceSeries = commodityPrices[product.commodityKey];
    if (!commodityPriceSeries || commodityPriceSeries.length === 0) continue;

    const { alignedStock, alignedCommodity } = alignPriceSeries(stockPrices, commodityPriceSeries);

    if (alignedStock.length < 30) continue;

    const stockReturns = calculateReturns(alignedStock);
    const commodityReturns = calculateReturns(alignedCommodity);

    const correlation60d = alignedStock.length >= 60
      ? calculateCorrelation(stockReturns.slice(-60), commodityReturns.slice(-60))
      : calculateCorrelation(stockReturns, commodityReturns);

    const correlation120d = alignedStock.length >= 120
      ? calculateCorrelation(stockReturns.slice(-120), commodityReturns.slice(-120))
      : calculateCorrelation(stockReturns, commodityReturns);

    const correlation250d = alignedStock.length >= 250
      ? calculateCorrelation(stockReturns.slice(-250), commodityReturns.slice(-250))
      : calculateCorrelation(stockReturns, commodityReturns);

    correlations.push({
      code: company.code,
      name: company.name,
      productName: product.productName,
      commodityName: product.commodityName,
      correlation60d,
      correlation120d,
      correlation250d,
      lastUpdated: new Date().toISOString().split("T")[0] ?? "",
    });
  }

  return correlations;
}

export async function loadAppData(options: FetchOptions = {}): Promise<AppData> {
  const [companies, commodityPrices, stockPrices] = await Promise.all([
    fetchOptionalJson<Company[]>("companies.json", [], options),
    fetchOptionalJson<Record<string, PricePoint[]>>("commodity-prices.json", {}, options),
    fetchOptionalJson<Record<string, PricePoint[]>>("stock-prices.json", {}, options),
  ]);

  const allSignals: DivergenceSignal[] = [];
  const allCorrelations: CorrelationData[] = [];

  for (const company of companies) {
    const companyStockPrices = stockPrices[company.code];
    if (!companyStockPrices || companyStockPrices.length === 0) continue;

    const signals = calculateCompanyDivergence(company, companyStockPrices, commodityPrices);
    allSignals.push(...signals);

    const correlations = calculateCompanyCorrelation(company, companyStockPrices, commodityPrices);
    allCorrelations.push(...correlations);
  }

  const sortedSignals = allSignals.sort((a, b) => {
    const strengthOrder = { strong: 0, medium: 1, weak: 2 };
    return strengthOrder[a.signalStrength] - strengthOrder[b.signalStrength];
  });

  return {
    companies,
    signals: sortedSignals,
    correlations: allCorrelations,
    commodityPrices,
    stockPrices,
  };
}
