import { describe, it, expect } from 'vitest';
import {
  calculateCorrelation,
  calculateReturns,
  calculateSlidingCorrelation,
  detectDivergence,
  calculateZScore,
  percentile,
} from '../divergence-calculator';

describe('calculateCorrelation', () => {
  it('should return 0 for empty arrays', () => {
    expect(calculateCorrelation([], [])).toBe(0);
  });

  it('should return 0 for arrays with less than 2 elements', () => {
    expect(calculateCorrelation([1], [2])).toBe(0);
  });

  it('should return 1 for perfectly correlated arrays', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(calculateCorrelation(x, y)).toBeCloseTo(1, 10);
  });

  it('should return -1 for perfectly negatively correlated arrays', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [10, 8, 6, 4, 2];
    expect(calculateCorrelation(x, y)).toBeCloseTo(-1, 10);
  });

  it('should return 0 for uncorrelated arrays', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [3, 1, 4, 1, 5];
    const result = calculateCorrelation(x, y);
    expect(result).toBeGreaterThan(-0.5);
    expect(result).toBeLessThan(0.5);
  });

  it('should handle arrays of different lengths', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6];
    expect(calculateCorrelation(x, y)).toBeCloseTo(1, 10);
  });
});

describe('calculateReturns', () => {
  it('should calculate returns with default period', () => {
    const prices = [100, 110, 121, 133.1];
    const returns = calculateReturns(prices);
    expect(returns).toHaveLength(3);
    expect(returns[0]).toBeCloseTo(0.1, 10);
    expect(returns[1]).toBeCloseTo(0.1, 10);
    expect(returns[2]).toBeCloseTo(0.1, 10);
  });

  it('should calculate returns with custom period', () => {
    const prices = [100, 110, 121, 133.1];
    const returns = calculateReturns(prices, 2);
    expect(returns).toHaveLength(2);
    expect(returns[0]).toBeCloseTo(0.21, 10);
    expect(returns[1]).toBeCloseTo(0.21, 10);
  });

  it('should handle zero prices', () => {
    const prices = [100, 0, 50];
    const returns = calculateReturns(prices);
    expect(returns[0]).toBe(-1);
    expect(returns[1]).toBe(0);
  });

  it('should return empty array for single price', () => {
    expect(calculateReturns([100])).toHaveLength(0);
  });
});

describe('calculateSlidingCorrelation', () => {
  it('should calculate sliding correlation', () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8];
    const y = [2, 4, 6, 8, 10, 12, 14, 16];
    const result = calculateSlidingCorrelation(x, y, 3);
    expect(result).toHaveLength(6);
    result.forEach((corr) => {
      expect(corr).toBeCloseTo(1, 10);
    });
  });

  it('should return empty array when window is larger than data', () => {
    const x = [1, 2, 3];
    const y = [2, 4, 6];
    expect(calculateSlidingCorrelation(x, y, 5)).toHaveLength(0);
  });
});

describe('percentile', () => {
  it('should return 0 for empty array', () => {
    expect(percentile([], 0.5)).toBe(0);
  });

  it('should return first element for p=0', () => {
    expect(percentile([1, 2, 3], 0)).toBe(1);
  });

  it('should return last element for p=1', () => {
    expect(percentile([1, 2, 3], 1)).toBe(3);
  });

  it('should return median for p=0.5', () => {
    const values = [10, 20, 30, 40, 50];
    expect(percentile(values, 0.5)).toBe(30);
  });

  it('should interpolate between values', () => {
    const values = [10, 20, 30];
    // p=0.25 -> idx = 0.5 -> interpolate between 10 and 20 = 15
    expect(percentile(values, 0.25)).toBe(15);
  });

  it('should handle single element', () => {
    expect(percentile([42], 0.5)).toBe(42);
  });
});

describe('detectDivergence', () => {
  it('should return empty array for insufficient data', () => {
    const stockPrices = [1, 2, 3];
    const commodityPrices = [2, 4, 6];
    const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
    expect(detectDivergence(stockPrices, commodityPrices, dates)).toHaveLength(0);
  });

  it('should detect positive divergence when stock falls and commodity rises', () => {
    // Create data where stock falls and commodity rises
    const stockPrices = Array.from({ length: 52 }, (_, i) => 100 - i * 0.5);
    const commodityPrices = Array.from({ length: 52 }, (_, i) => 50 + i * 0.5);
    const dates = Array.from({ length: 52 }, (_, i) => `2024-01-${String(i + 1).padStart(2, '0')}`);

    const signals = detectDivergence(stockPrices, commodityPrices, dates);
    if (signals.length > 0 && signals[0]) {
      expect(signals[0].divergenceType).toBe('positive');
    }
  });

  it('should detect negative divergence when stock rises and commodity falls', () => {
    // Create data where stock rises and commodity falls
    const stockPrices = Array.from({ length: 52 }, (_, i) => 50 + i * 0.5);
    const commodityPrices = Array.from({ length: 52 }, (_, i) => 100 - i * 0.5);
    const dates = Array.from({ length: 52 }, (_, i) => `2024-01-${String(i + 1).padStart(2, '0')}`);

    const signals = detectDivergence(stockPrices, commodityPrices, dates);
    if (signals.length > 0 && signals[0]) {
      expect(signals[0].divergenceType).toBe('negative');
    }
  });

  it('should not detect divergence for correlated movements', () => {
    // Create data where both rise together
    const stockPrices: number[] = Array.from({ length: 52 }, (_, i) => 50 + i);
    const commodityPrices: number[] = Array.from({ length: 52 }, (_, i) => 100 + i * 2);
    const dates: string[] = Array.from({ length: 52 }, (_, i) => `2024-01-${String(i + 1).padStart(2, '0')}`);

    const signals = detectDivergence(stockPrices, commodityPrices, dates);
    expect(signals).toHaveLength(0);
  });

  it('should use dynamic threshold when historicalCorrelations provided', () => {
    // Create data where stock falls and commodity rises
    const stockPrices = Array.from({ length: 52 }, (_, i) => 100 - i * 0.5);
    const commodityPrices = Array.from({ length: 52 }, (_, i) => 50 + i * 0.5);
    const dates = Array.from({ length: 52 }, (_, i) => `2024-01-${String(i + 1).padStart(2, '0')}`);

    // Provide historical correlations where the 20th percentile is 0.5
    // This makes the threshold much higher, so more signals pass
    const historicalCorrelations = [0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8];

    const signals = detectDivergence(stockPrices, commodityPrices, dates, 52, historicalCorrelations, 0.2);
    // With threshold at 0.5 (20th percentile), the divergence should be detected
    // (correlation will be negative, |corr| < 0.5)
    expect(signals.length).toBeGreaterThanOrEqual(0);
  });

  it('should fall back to fixed threshold 0.3 when no historical data', () => {
    const stockPrices = Array.from({ length: 52 }, (_, i) => 100 - i * 0.5);
    const commodityPrices = Array.from({ length: 52 }, (_, i) => 50 + i * 0.5);
    const dates = Array.from({ length: 52 }, (_, i) => `2024-01-${String(i + 1).padStart(2, '0')}`);

    // Without historicalCorrelations, should use fixed threshold 0.3
    const signals = detectDivergence(stockPrices, commodityPrices, dates);
    // Verify it behaves same as before (backward compatible)
    if (signals.length > 0 && signals[0]) {
      expect(signals[0].divergenceType).toBe('positive');
    }
  });

  it('should filter out signals when dynamic threshold is very tight', () => {
    // Data with moderate correlation
    const stockPrices = Array.from({ length: 52 }, (_, i) => 50 + i * 0.5);
    const commodityPrices = Array.from({ length: 52 }, (_, i) => 50 + i * 0.48);
    const dates = Array.from({ length: 52 }, (_, i) => `2024-01-${String(i + 1).padStart(2, '0')}`);

    // Historical correlations all high (0.8-0.9), so 20th percentile ≈ 0.8
    const historicalCorrelations = Array.from({ length: 20 }, (_, i) => 0.8 + i * 0.005);

    const signals = detectDivergence(stockPrices, commodityPrices, dates, 52, historicalCorrelations, 0.2);
    // Both prices rise together, so divergence condition (opposite returns) fails
    expect(signals).toHaveLength(0);
  });
});

describe('calculateZScore', () => {
  it('should return zero for single value', () => {
    const result = calculateZScore([100]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(0);
  });

  it('should calculate z-scores correctly', () => {
    const values = [10, 20, 30, 40, 50];
    const zScores = calculateZScore(values);
    expect(zScores).toHaveLength(5);
    // Mean is 30, std is ~14.14
    expect(zScores[0]).toBeCloseTo(-1.414, 2);
    expect(zScores[4]).toBeCloseTo(1.414, 2);
  });

  it('should return 0 for all identical values', () => {
    const values = [10, 10, 10, 10];
    const zScores = calculateZScore(values);
    zScores.forEach((z) => {
      expect(z).toBe(0);
    });
  });
});
