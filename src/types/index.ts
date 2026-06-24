/** 价格数据点 */
export interface PricePoint {
  date: string;
  value: number;
}

/** 公司基本信息 */
export interface Company {
  code: string;
  name: string;
  group: "chemical" | "mining" | "explosive";
  productsByRevenue: ProductMapping[];
  productsByProfit: ProductMapping[];
}

/** 权重类型 */
export type WeightType = "revenue" | "profit";

/** 公司产品映射 */
export interface ProductMapping {
  productName: string;
  commodityKey: string;
  commodityName: string;
  weight: number;
}

/** 背离信号 */
export interface DivergenceSignal {
  code: string;
  name: string;
  productName: string;
  commodityName: string;
  divergenceType: "positive" | "negative";
  divergenceScore: number;
  correlation: number;
  stockChange: number;
  commodityChange: number;
  startDate: string;
  endDate: string;
  signalStrength: "strong" | "medium" | "weak";
}

/** 相关性数据 */
export interface CorrelationData {
  code: string;
  name: string;
  productName: string;
  commodityName: string;
  correlation60d: number;
  correlation120d: number;
  correlation250d: number;
  lastUpdated: string;
}

/** 估值数据 */
export interface ValuationData {
  code: string;
  name: string;
  close: number | null;
  pb: number | null;
  pe: number | null;
  pbPercentile: number | null;
  pePercentile: number | null;
  priceHistory: number[];
  low20DurationYears: number;
}

/** 应用数据 */
export interface AppData {
  companies: Company[];
  signals: DivergenceSignal[];
  correlations: CorrelationData[];
  commodityPrices: Record<string, PricePoint[]>;
  stockPrices: Record<string, PricePoint[]>;
  valuationData: Record<string, ValuationData>;
}

/** 主题模式 */
export type ThemeMode = "dark" | "light";
