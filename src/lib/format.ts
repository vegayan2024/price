/**
 * 格式化百分比
 * @param value 小数值（如 0.1 = 10%）
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化数字（带千分位）
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化金额（亿元）
 * @param value 金额
 * @param decimals 小数位数
 * @returns 格式化后的金额字符串
 */
export function formatAmountYi(value: number, decimals: number = 2): string {
  return `${(value / 100000000).toFixed(decimals)}亿`;
}
