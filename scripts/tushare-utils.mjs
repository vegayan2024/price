import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const API_URL = "https://api.tushare.pro";

export function requireToken() {
  loadLocalEnv();
  const token = process.env.TUSHARE_TOKEN?.trim();
  if (!token) {
    throw new Error("Missing TUSHARE_TOKEN. 请在 .env.local 中设置 TUSHARE_TOKEN");
  }
  return token;
}

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), file);
    if (!fsSync.existsSync(filePath)) continue;
    const text = fsSync.readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index <= 0) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export function normalizeCode(input) {
  const raw = String(input || "").trim().toUpperCase();
  if (!raw) return "";
  if (raw.includes(".")) return raw;
  if (raw.startsWith("6") || raw.startsWith("5")) return `${raw}.SH`;
  return `${raw}.SZ`;
}

export function todayCompact() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
}

export function compactDate(value) {
  const s = String(value || "");
  if (s.length !== 8) return s;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

export async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function writeJson(filePath, data) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function callTushare(token, apiName, params = {}, fields = "") {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_name: apiName,
      token,
      params,
      fields,
    }),
  });
  if (!response.ok) throw new Error(`${apiName} HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.code !== 0) {
    throw new Error(`${apiName} failed: ${payload.msg || "unknown error"}`);
  }
  const columns = payload.data?.fields || [];
  return (payload.data?.items || []).map((item) =>
    Object.fromEntries(columns.map((field, index) => [field, item[index]])),
  );
}

export function ascendingBy(field) {
  return (a, b) => String(a[field] || "").localeCompare(String(b[field] || ""));
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapKlineRows(rows) {
  return rows.sort(ascendingBy("trade_date")).map((row) => ({
    date: compactDate(row.trade_date),
    open: toNumber(row.open),
    close: toNumber(row.close),
    high: toNumber(row.high),
    low: toNumber(row.low),
    volume: toNumber(row.vol),
    amount: toNumber(row.amount),
  }));
}
