import { readFileSync } from "fs";
import { join } from "path";
import {
  callTushare,
  compactDate,
  ensureDir,
  normalizeCode,
  requireToken,
  todayCompact,
  writeJson,
} from "./tushare-utils.mjs";

const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";
const startDate = process.env.KLINE_START_DATE || "20200101";
const endDate = process.env.KLINE_END_DATE || todayCompact();
const fields = "ts_code,trade_date,open,high,low,close,vol,amount";

async function fetchStockKline(token, code) {
  const allRows = [];
  let offset = 0;
  const limit = 6000;

  while (true) {
    const rows = await callTushare(
      token,
      "weekly",
      { ts_code: code, start_date: startDate, end_date: endDate, offset, limit },
      fields,
    );
    if (!rows.length) break;
    allRows.push(...rows);
    if (rows.length < limit) break;
    offset += limit;
    if (allRows.length >= 12000) break;
  }

  return allRows
    .sort((a, b) => String(a.trade_date || "").localeCompare(String(b.trade_date || "")))
    .map((row) => ({
      date: compactDate(row.trade_date),
      value: Number(row.close) || 0,
    }));
}

async function main() {
  console.log("=== 股票价格数据获取 ===\n");

  const token = requireToken();
  console.log("Tushare Token 已加载\n");

  // 读取公司列表
  const companies = JSON.parse(
    readFileSync(join(OUTPUT_PATH, "companies.json"), "utf-8")
  );

  const stockPrices = {};
  let successCount = 0;
  let failCount = 0;

  console.log(`开始获取 ${companies.length} 只股票的价格数据...\n`);

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const code = normalizeCode(company.code);

    try {
      process.stdout.write(`[${i + 1}/${companies.length}] ${company.name} (${code})... `);
      const klineData = await fetchStockKline(token, code);

      if (klineData.length > 0) {
        stockPrices[company.code] = klineData;
        console.log(`✓ ${klineData.length} 个数据点`);
        successCount++;
      } else {
        console.log(`✗ 无数据`);
        failCount++;
      }

      // Tushare 限流：每分钟约200次请求
      await new Promise((resolve) => setTimeout(resolve, 350));
    } catch (error) {
      console.log(`✗ ${error.message}`);
      failCount++;
    }
  }

  // 保存数据
  console.log("\n保存数据...");
  await writeJson(join(OUTPUT_PATH, "stock-prices.json"), stockPrices);

  console.log("\n=== 完成 ===");
  console.log(`成功: ${successCount} 只`);
  console.log(`失败: ${failCount} 只`);
  console.log(`总计数据点: ${Object.values(stockPrices).reduce((sum, data) => sum + data.length, 0)}`);
}

main().catch((error) => {
  console.error("错误:", error.message);
  process.exitCode = 1;
});
