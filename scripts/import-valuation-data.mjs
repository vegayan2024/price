import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const DABAOZI_PATH = "C:/个人文件夹/vscode";
const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";

console.log("开始导入估值数据...");

const marketDir = join(DABAOZI_PATH, "public/data/market");
const valuationData = {};

const valuationFiles = readdirSync(marketDir).filter((f) => f.endsWith(".valuation.json"));
console.log(`找到 ${valuationFiles.length} 个估值数据文件`);

let successCount = 0;

for (const file of valuationFiles) {
  const code = file.replace(".valuation.json", "");
  try {
    const data = JSON.parse(readFileSync(join(marketDir, file), "utf-8"));

    // 提取当前值
    const current = data.current ?? {};
    const pb = current.pb ?? null;
    const pe = current.peTtm ?? current.pe ?? null;
    const close = current.close ?? null;

    // 提取PB分位点（最新）
    const pbBands = data.valuationBands?.pb ?? [];
    const latestPbPercentile = pbBands.length > 0 ? pbBands[pbBands.length - 1]?.percentile ?? null : null;

    // 提取股价历史分位点
    const peBands = data.valuationBands?.peTtm ?? [];
    const latestPePercentile = peBands.length > 0 ? peBands[peBands.length - 1]?.percentile ?? null : null;

    // 提取股价历史（用于计算10%低位）
    const priceHistory = pbBands.map((item) => item.price).filter((p) => p !== null);
    const latestPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : close;

    valuationData[code] = {
      code,
      name: data.name ?? code,
      close,
      pb,
      pe,
      pbPercentile: latestPbPercentile,
      pePercentile: latestPePercentile,
      priceHistory,
    };

    successCount++;
  } catch (error) {
    console.error(`导入 ${code} 失败:`, error.message);
  }
}

console.log(`成功导入 ${successCount} 只股票的估值数据`);

// 保存数据
writeFileSync(
  join(OUTPUT_PATH, "valuation-data.json"),
  JSON.stringify(valuationData, null, 2),
  "utf-8"
);

console.log("估值数据已保存");
