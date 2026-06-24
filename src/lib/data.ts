import type { AppData, Company, DivergenceSignal, CorrelationData, PricePoint } from "../types";

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

export async function loadAppData(options: FetchOptions = {}): Promise<AppData> {
  const [companies, signals, correlations, commodityPrices, stockPrices] = await Promise.all([
    fetchOptionalJson<Company[]>("companies.json", [], options),
    fetchOptionalJson<DivergenceSignal[]>("divergence-signals.json", [], options),
    fetchOptionalJson<CorrelationData[]>("correlations.json", [], options),
    fetchOptionalJson<Record<string, PricePoint[]>>("commodity-prices.json", {}, options),
    fetchOptionalJson<Record<string, PricePoint[]>>("stock-prices.json", {}, options),
  ]);

  return {
    companies,
    signals,
    correlations,
    commodityPrices,
    stockPrices,
  };
}
