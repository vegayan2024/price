import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DABAOZI_PATH = "C:/个人文件夹/vscode";
const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";

console.log("开始导入财务数据...");

const financialData = JSON.parse(
  readFileSync(join(DABAOZI_PATH, "public/data/financial_metrics_full.json"), "utf-8")
);

const result = {};

for (const company of financialData.companies) {
  const annualData = company.annual ?? [];

  // 获取最新的年度数据
  const latestYear = annualData[annualData.length - 1];

  if (!latestYear) continue;

  // 获取扣非利润同比增长率
  const deductedProfitYoY = latestYear.yoy?.deductedProfit ?? null;

  // 获取资产负债率
  const debtToAssets = latestYear.debtToAssets ?? null;

  // 获取最新年份
  const year = latestYear.year ?? null;

  result[company.code] = {
    code: company.code,
    name: company.name,
    year,
    deductedProfitYoY,
    debtToAssets,
  };
}

console.log(`成功导入 ${Object.keys(result).length} 家公司的财务数据`);

// 保存数据
writeFileSync(
  join(OUTPUT_PATH, "financial-data.json"),
  JSON.stringify(result, null, 2),
  "utf-8"
);

console.log("财务数据已保存");

// 统计
const withDeducted = Object.values(result).filter((r) => r.deductedProfitYoY !== null).length;
const withDebt = Object.values(result).filter((r) => r.debtToAssets !== null).length;
console.log(`有扣非利润数据: ${withDeducted} 家`);
console.log(`有资产负债率数据: ${withDebt} 家`);
