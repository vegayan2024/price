import { describe, it, expect } from 'vitest';
import { formatPercent, formatNumber, formatAmountYi } from '../format';

describe('formatPercent', () => {
  it('should format decimal to percentage', () => {
    expect(formatPercent(0.1)).toBe('10.00%');
    expect(formatPercent(0.5)).toBe('50.00%');
    expect(formatPercent(1)).toBe('100.00%');
  });

  it('should handle custom decimal places', () => {
    expect(formatPercent(0.12345, 0)).toBe('12%');
    expect(formatPercent(0.12345, 1)).toBe('12.3%');
    expect(formatPercent(0.12345, 3)).toBe('12.345%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });

  it('should handle negative values', () => {
    expect(formatPercent(-0.1)).toBe('-10.00%');
  });
});

describe('formatNumber', () => {
  it('should format number with default decimals', () => {
    const result = formatNumber(1234.5678);
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('57'); // rounded to 2 decimals
  });

  it('should format number with custom decimals', () => {
    const result = formatNumber(1234.5678, 0);
    expect(result).toContain('1');
    expect(result).toContain('235'); // rounded
  });

  it('should handle zero', () => {
    const result = formatNumber(0);
    expect(result).toContain('0');
  });
});

describe('formatAmountYi', () => {
  it('should format amount in yi (亿)', () => {
    expect(formatAmountYi(100000000)).toBe('1.00亿');
    expect(formatAmountYi(500000000)).toBe('5.00亿');
  });

  it('should handle custom decimals', () => {
    expect(formatAmountYi(123456789, 0)).toBe('1亿');
    expect(formatAmountYi(123456789, 1)).toBe('1.2亿');
  });

  it('should handle zero', () => {
    expect(formatAmountYi(0)).toBe('0.00亿');
  });

  it('should handle small values', () => {
    expect(formatAmountYi(10000000)).toBe('0.10亿');
  });
});
