import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const DABAOZI_PATH = "C:/个人文件夹/vscode";
const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";

console.log("开始导入历史价格数据...");

// 1. 导入股票K线数据
console.log("\n1. 导入股票K线数据...");
const marketDir = join(DABAOZI_PATH, "public/data/market");
const stockPrices = {};

const klineFiles = readdirSync(marketDir).filter((f) => f.endsWith(".kline.json"));
console.log(`找到 ${klineFiles.length} 个K线数据文件`);

for (const file of klineFiles) {
  const code = file.replace(".kline.json", "");
  try {
    const data = JSON.parse(readFileSync(join(marketDir, file), "utf-8"));
    // 使用周线数据（更平滑）
    const weeklyData = data.periods?.weekly ?? data.periods?.daily ?? [];
    if (weeklyData.length > 0) {
      stockPrices[code] = weeklyData.map((item) => ({
        date: item.date,
        value: item.close,
      }));
    }
  } catch (error) {
    console.error(`导入 ${code} 失败:`, error.message);
  }
}

console.log(`成功导入 ${Object.keys(stockPrices).length} 只股票的价格数据`);

// 2. 导入商品价格数据
console.log("\n2. 导入商品价格数据...");
const catalog = JSON.parse(
  readFileSync(join(DABAOZI_PATH, "public/data/chemical/catalog.json"), "utf-8")
);
const seriesDir = join(DABAOZI_PATH, "public/data/chemical/series");
const commodityPrices = {};

// 构建 key 到文件名的映射
const keyToFileMap = new Map();
for (const item of catalog.items) {
  // 将 key 编码为文件名（base64url）
  const encodedKey = Buffer.from(item.key).toString("base64url");
  keyToFileMap.set(item.key, encodedKey);
}

// 读取 companies.json 获取需要的商品 key
const companies = JSON.parse(
  readFileSync(join(OUTPUT_PATH, "companies.json"), "utf-8")
);

const neededKeys = new Set();
for (const company of companies) {
  for (const product of company.productsByRevenue) {
    if (!product.commodityKey.startsWith("unknown:")) {
      neededKeys.add(product.commodityKey);
    }
  }
}

console.log(`需要导入 ${neededKeys.size} 个商品价格序列`);

let importedCount = 0;
for (const key of neededKeys) {
  const encodedKey = keyToFileMap.get(key);
  if (!encodedKey) {
    console.warn(`未找到 ${key} 的编码映射`);
    continue;
  }

  const filePath = join(seriesDir, `${encodedKey}.json`);
  try {
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    if (data.history && data.history.length > 0) {
      commodityPrices[key] = data.history.map((item) => ({
        date: item.date,
        value: item.value,
      }));
      importedCount++;
    }
  } catch (error) {
    // 文件可能不存在，跳过
  }
}

console.log(`成功导入 ${importedCount} 个商品价格序列`);

// 3. 保存数据
console.log("\n3. 保存数据...");
writeFileSync(
  join(OUTPUT_PATH, "stock-prices.json"),
  JSON.stringify(stockPrices, null, 2),
  "utf-8"
);
console.log(`保存股票价格数据: ${Object.keys(stockPrices).length} 只股票`);

writeFileSync(
  join(OUTPUT_PATH, "commodity-prices.json"),
  JSON.stringify(commodityPrices, null, 2),
  "utf-8"
);
console.log(`保存商品价格数据: ${Object.keys(commodityPrices).length} 个序列`);

// 4. 统计信息
console.log("\n=== 导入完成 ===");
console.log(`股票数量: ${Object.keys(stockPrices).length}`);
console.log(`商品序列: ${Object.keys(commodityPrices).length}`);

// 显示数据量最大的几个序列
const stockDataSizes = Object.entries(stockPrices)
  .map(([code, data]) => ({ code, count: data.length }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

console.log("\n股票数据量 TOP 5:");
stockDataSizes.forEach(({ code, count }) => {
  console.log(`  ${code}: ${count} 个数据点`);
});

const commodityDataSizes = Object.entries(commodityPrices)
  .map(([key, data]) => ({ key: key.split(":").pop(), count: data.length }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

console.log("\n商品数据量 TOP 5:");
commodityDataSizes.forEach(({ key, count }) => {
  console.log(`  ${key}: ${count} 个数据点`);
});
