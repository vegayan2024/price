import type { AppData, Company, DivergenceSignal, CorrelationData, PricePoint, ValuationData, FinancialData } from "../types";
import { calculateCorrelation, calculateReturns, calculateSlidingCorrelation, detectDivergence } from "./divergence-calculator";
import { lazyLoad, prefetch } from "./lazy-data";

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
 *
 * 使用动态百分位阈值检测背离：
 * 基于全量历史数据计算52周滑动相关性序列，取其20%分位作为当前相关性阈值，
 * 以自适应不同市场体制下的相关性变化（Gorton & Rouwenhorst 2006, Engle 2002）。
 *
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

    // 只取最近一年的数据（52周）
    const recentAlignedStock = alignedStock.slice(-52);
    const recentAlignedCommodity = alignedCommodity.slice(-52);
    const recentDates = dates.slice(-52);

    if (recentAlignedStock.length < 52) continue;

    // 计算全量历史的52周滑动相关性，用于动态百分位阈值
    const allStockReturns = calculateReturns(alignedStock);
    const allCommodityReturns = calculateReturns(alignedCommodity);
    const historicalCorrelations = calculateSlidingCorrelation(
      allStockReturns, allCommodityReturns, 52,
    );

    // 使用 detectDivergence 函数检测背离，传入历史相关性用于动态阈值
    const companySignals = detectDivergence(
      recentAlignedStock, recentAlignedCommodity, recentDates, 52,
      historicalCorrelations,
    );

    // 添加公司信息
    for (const signal of companySignals) {
      signals.push({
        ...signal,
        code: company.code,
        name: company.name,
        productName: product.productName,
        commodityName: product.commodityName,
      });
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
  const [companies, commodityPrices, stockPrices, valuationData, financialData] = await Promise.all([
    fetchOptionalJson<Company[]>("companies.json", [], options),
    fetchOptionalJson<Record<string, PricePoint[]>>("commodity-prices.json", {}, options),
    fetchOptionalJson<Record<string, PricePoint[]>>("stock-prices.json", {}, options),
    fetchOptionalJson<Record<string, ValuationData>>("valuation-data.json", {}, options),
    fetchOptionalJson<Record<string, FinancialData>>("financial-data.json", {}, options),
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
    valuationData,
    financialData,
  };
}

/**
 * 懒加载版本的应用数据加载
 * 使用缓存机制避免重复加载大型数据文件
 */
export async function loadAppDataLazy(options: FetchOptions = {}): Promise<AppData> {
  const cacheKey = options.cacheBust ?? 'default';

  const [companies, commodityPrices, stockPrices, valuationData, financialData] = await Promise.all([
    lazyLoad(`companies-${cacheKey}`, () => fetchOptionalJson<Company[]>("companies.json", [], options)),
    lazyLoad(`commodity-prices-${cacheKey}`, () => fetchOptionalJson<Record<string, PricePoint[]>>("commodity-prices.json", {}, options)),
    lazyLoad(`stock-prices-${cacheKey}`, () => fetchOptionalJson<Record<string, PricePoint[]>>("stock-prices.json", {}, options)),
    lazyLoad(`valuation-data-${cacheKey}`, () => fetchOptionalJson<Record<string, ValuationData>>("valuation-data.json", {}, options)),
    lazyLoad(`financial-data-${cacheKey}`, () => fetchOptionalJson<Record<string, FinancialData>>("financial-data.json", {}, options)),
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
    valuationData,
    financialData,
  };
}

/**
 * 预加载常用数据
 * 可在应用启动时调用，提前加载数据
 */
export function preloadAppData(): void {
  prefetch('companies-default', () => fetchOptionalJson<Company[]>("companies.json", []));
  prefetch('commodity-prices-default', () => fetchOptionalJson<Record<string, PricePoint[]>>("commodity-prices.json", {}));
  prefetch('stock-prices-default', () => fetchOptionalJson<Record<string, PricePoint[]>>("stock-prices.json", {}));
}
