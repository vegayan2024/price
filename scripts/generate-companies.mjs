import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DABAOZI_PATH = "C:/个人文件夹/vscode";
const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";

// 读取大包子项目数据
const legacyResearch = JSON.parse(
  readFileSync(join(DABAOZI_PATH, "public/data/legacy_research.json"), "utf-8")
);
const productProfiles = JSON.parse(
  readFileSync(join(DABAOZI_PATH, "public/data/product_profiles.json"), "utf-8")
);
const catalog = JSON.parse(
  readFileSync(join(DABAOZI_PATH, "public/data/chemical/catalog.json"), "utf-8")
);

// 读取手动映射
const manualMapping = JSON.parse(
  readFileSync(join(OUTPUT_PATH, "../../scripts/company-manual-mapping.json"), "utf-8")
);

// 手动定义公司分组（从 company-groups.ts 提取）
const companyGroups = {
  chemical: ['002408.SZ', '600500.SH', '600486.SH', '600378.SH', '600409.SH', '600328.SH', '000819.SZ', '002136.SZ', '600866.SH', '600298.SH', '000554.SZ', '000830.SZ', '600028.SH', '002597.SZ', '002637.SZ', '603599.SH', '600352.SH', '601117.SH', '002493.SZ', '601233.SH', '603077.SH', '600746.SH', '000731.SZ', '300758.SZ', '000990.SZ', '002648.SZ', '600955.SH', '603968.SH', '002469.SZ', '300927.SZ', '601678.SH', '601216.SH', '002092.SZ', '002748.SZ', '605399.SH', '600499.SH', '000792.SZ', '601857.SH', '601118.SH', '002100.SZ', '600299.SH', '600230.SH', '002258.SZ', '600160.SH', '600426.SH', '000930.SZ'],
  mining: ['600459.SH', '000878.SZ', '601061.SH', '000923.SZ', '002057.SZ', '600063.SH', '601600.SH', '000629.SZ', '000960.SZ', '000962.SZ', '000657.SZ', '600961.SH', '600301.SH', '600392.SH', '600111.SH', '600549.SH', '688778.SH', '002237.SZ'],
  explosive: ['002096.SZ', '002226.SZ', '002783.SZ', '603977.SH', '603227.SH'],
};

// 构建商品 key 到信息的映射
const catalogMap = new Map();
for (const item of catalog.items) {
  catalogMap.set(item.key, item);
}

// 产品名称到商品 key 的映射规则（关键词 -> catalog key）
const productToKeyMap = {
  // 化工品
  "纯碱": "cj:price:轻质纯碱（华东）",
  "轻质纯碱": "cj:price:轻质纯碱（华东）",
  "重质纯碱": "cj:price:重质纯碱（华东）",
  "烧碱": "cj:price:32%隔膜烧碱（华东）",
  "隔膜烧碱": "cj:price:32%隔膜烧碱（华东）",
  "离子膜烧碱": "cj:price:离子膜烧碱（99%）",
  "PVC": "cj:price:PVC（华东电石法）",
  "聚氯乙烯": "cj:price:PVC（华东电石法）",
  "甲醇": "cj:price:甲醇（长三角）",
  "尿素": "cj:price:尿素(华东)",
  "醋酸": "cj:price:醋酸（华东）",
  "钛白粉": "cj:price:钛白粉(金红石)",
  "草甘膦": "cj:price:草甘膦",
  "聚丙烯": "cj:price:PP（余姚市场J340/扬子）",
  "PP": "cj:price:PP（余姚市场J340/扬子）",
  "涤纶长丝": "cj:price:涤纶POY（华东）",
  "涤纶": "cj:price:涤纶POY（华东）",
  "PTA": "cj:price:PTA（华东）",
  "环氧丙烷": "cj:price:环氧丙烷（华东）",
  "丙烯酸": "cj:price:丙烯酸",
  "MDI": "cj:price:聚合MDI（华东）",
  "聚合MDI": "cj:price:聚合MDI（华东）",
  "纯MDI": "cj:price:纯MDI（华东）",
  "TDI": "cj:price:TDI（华东）",
  "维生素E": "cj:price:VE",
  "VE": "cj:price:VE",
  "维生素A": "cj:price:VA",
  "VA": "cj:price:VA",
  "蛋氨酸": "cj:price:蛋氨酸",
  "制冷剂": "cj:price:R32",
  "R32": "cj:price:R32",
  "粘胶短纤": "cj:price:粘胶短纤（华东）",
  "PVA": "cj:price:聚乙烯醇PVA",
  "聚乙烯醇": "cj:price:聚乙烯醇PVA",
  "碳酸锂": "cj:price:碳酸锂",
  "氯化钾": "cj:price:氯化钾",
  "多菌灵": "cj:price:多菌灵",
  "安赛蜜": "cj:price:安赛蜜",
  "三氯蔗糖": "cj:price:三氯蔗糖",
  "分散染料": "cj:price:分散染料",
  "活性染料": "cj:price:活性染料",
  "间苯二胺": "cj:price:间苯二胺",
  "环氧树脂": "cj:price:环氧树脂",
  "PVDF": "cj:price:PVDF",
  "PTFE": "cj:price:PTFE",
  "草铵膦": "cj:price:草铵膦",
  "己二酸": "cj:price:己二酸（华东）",
  "乙二醇": "cj:price:乙二醇",
  "DMF": "cj:price:DMF（华东）",
  "双酚A": "cj:price:双酚A",
  "丙烯": "cj:price:丙烯（汇丰石化）",
  "苯酚": "cj:price:苯酚(华东)",
  "丙酮": "cj:price:丙酮(华东)",
  "顺酐": "cj:price:顺酐",
  "BDO": "cj:price:BDO（长三角）",
  "PC": "cj:price:PC",
  "聚碳酸酯": "cj:price:PC",
  "丁酮": "cj:price:丁酮（华东）",
  "甲乙酮": "cj:price:丁酮（华东）",
  "苯乙烯": "cj:price:苯乙烯（华东）",
  "纯苯": "cj:price:纯苯（华东地区）",
  "己内酰胺": "cj:price:己内酰胺（CPL）",
  "CPL": "cj:price:己内酰胺（CPL）",
  "丙烯腈": "cj:price:丙烯腈",
  "氨纶": "cj:price:氨纶40D（华东）",
  "PA66": "cj:price:PA66长丝（华东）",

  // 能源
  "汽油": "cj:price:92#汽油",
  "柴油": "cj:price:0#柴油",
  "液化气": "cj:price:液化气",
  "LNG": "cj:price:LNG",
  "天然气": "cj:price:NYMEX天然气",
  "动力煤": "cj:price:动力煤",
  "石脑油": "cj:price:石脑油（中石化）",

  // 金属
  "铜": "lme:price:铜",
  "铝": "lme:price:铝",
  "锌": "lme:price:锌",
  "锡": "lme:price:锡",
  "镍": "lme:price:镍",
  "铅": "lme:price:铅",
  "黄金": "lme:price:黄金",
  "白银": "lme:price:白银",
  "铂": "lme:price:铂",
  "钯": "lme:price:钯",
  "铑": "lme:price:铑",
  "钴": "lme:price:钴",
  "铌": "lme:price:铌",
  "钽": "lme:price:钽",
  "铁矿石": "lme:price:铁矿石",
  "氧化铝": "lme:price:氧化铝",
  "氧化镨钕": "cj:price:氧化镨钕",
  "稀土": "cj:price:氧化镨钕",
  "仲钨酸铵": "cj:price:仲钨酸铵",
  "钨": "cj:price:仲钨酸铵",
  "五氧化二钒": "cj:price:五氧化二钒",
  "钒": "cj:price:五氧化二钒",
  "钼精矿": "cj:price:钼精矿",
  "钼": "cj:price:钼精矿",
  "锑锭": "cj:price:锑锭",
  "锑": "cj:price:锑锭",
  "金属镓": "cj:price:金属镓",
  "镓": "cj:price:金属镓",
  "金属铍": "cj:price:金属铍",
  "铍": "cj:price:金属铍",
  "金属铟": "cj:price:金属铟",
  "铟": "cj:price:金属铟",

  // 农产品相关
  "豆粕": "cj:price:豆粕",
  "生猪": "cj:price:生猪",
  "天然橡胶": "cj:price:天然橡胶（上海地区）",
  "橡胶": "cj:price:天然橡胶（上海地区）",
  "炭黑": "cj:price:炭黑（黑猫N330）",
};

// 模糊匹配函数
function findBestKey(productName, catalogMap) {
  // 精确匹配
  if (productToKeyMap[productName]) {
    const key = productToKeyMap[productName];
    if (catalogMap.has(key)) return key;
  }

  // 尝试去除括号内容后匹配
  const cleanName = productName.replace(/[（(][^）)]*[）)]/g, "").trim();
  if (productToKeyMap[cleanName]) {
    const key = productToKeyMap[cleanName];
    if (catalogMap.has(key)) return key;
  }

  // 尝试关键词匹配
  for (const [keyword, key] of Object.entries(productToKeyMap)) {
    if (productName.includes(keyword) || cleanName.includes(keyword)) {
      if (catalogMap.has(key)) return key;
    }
  }

  // 模糊匹配 - 尝试在 catalog 中查找包含该名称的条目
  const normalizedName = productName.toLowerCase().replace(/[\s\-]/g, "");
  for (const [key, item] of catalogMap) {
    const normalizedCatalogName = item.name.toLowerCase().replace(/[\s\-]/g, "");
    if (normalizedCatalogName.includes(normalizedName) || normalizedName.includes(normalizedCatalogName)) {
      return key;
    }
  }

  return null;
}

function getGroup(code) {
  if (companyGroups.chemical.includes(code)) return "chemical";
  if (companyGroups.mining.includes(code)) return "mining";
  if (companyGroups.explosive.includes(code)) return "explosive";
  return "chemical";
}

// 处理每家公司
const companies = [];

for (const research of legacyResearch.research) {
  const code = research.code;
  const group = getGroup(code);

  // 优先使用手动映射
  if (manualMapping[code]) {
    const products = manualMapping[code].map((p) => ({
      ...p,
      weight: 1 / manualMapping[code].length,
    }));
    companies.push({ code, name: research.name, group, products });
    continue;
  }

  // 从 product_profiles 获取产品信息
  const profiles = productProfiles.records[code] ?? [];
  let products = [];

  if (profiles.length > 0) {
    // 有详细产品信息，取前3个
    products = profiles.slice(0, 3).map((profile) => {
      const key = findBestKey(profile.name, catalogMap);
      const catalogItem = key ? catalogMap.get(key) : null;
      return {
        productName: profile.name,
        commodityKey: key ?? `unknown:${profile.name}`,
        commodityName: catalogItem?.name ?? profile.name,
      };
    });
  } else {
    // 从 mainBusiness 解析产品
    const mainBusiness = research.mainBusiness ?? "";
    // 提取括号内的产品列表，或按标点分割
    const bracketMatch = mainBusiness.match(/[（(]([^）)]+)[）)]/);
    let productStr = bracketMatch ? bracketMatch[1] : mainBusiness;

    // 按各种分隔符分割
    const productNames = productStr
      .split(/[,，、;；/和与]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 8)
      .slice(0, 3);

    products = productNames.map((name) => {
      const key = findBestKey(name, catalogMap);
      const catalogItem = key ? catalogMap.get(key) : null;
      return {
        productName: name,
        commodityKey: key ?? `unknown:${name}`,
        commodityName: catalogItem?.name ?? name,
      };
    });
  }

  // 如果没有匹配到产品，使用默认
  if (products.length === 0) {
    products = [{ productName: "-", commodityKey: "unknown:-", commodityName: "-" }];
  }

  // 均匀权重
  const weight = Math.round((1 / products.length) * 100) / 100;
  const productsWithWeight = products.map((p) => ({
    ...p,
    weight,
  }));

  companies.push({
    code,
    name: research.name,
    group,
    products: productsWithWeight,
  });
}

// 按分组和代码排序
companies.sort((a, b) => {
  const groupOrder = { chemical: 0, mining: 1, explosive: 2 };
  const groupDiff = (groupOrder[a.group] ?? 0) - (groupOrder[b.group] ?? 0);
  if (groupDiff !== 0) return groupDiff;
  return a.code.localeCompare(b.code);
});

// 输出结果
writeFileSync(
  join(OUTPUT_PATH, "companies.json"),
  JSON.stringify(companies, null, 2),
  "utf-8"
);

console.log(`生成 ${companies.length} 家公司的产品映射`);

// 输出匹配统计
let matchedCount = 0;
let unmatchedProducts = [];
for (const company of companies) {
  for (const product of company.products) {
    if (product.commodityKey.startsWith("unknown:")) {
      unmatchedProducts.push(`${company.name}: ${product.productName}`);
    } else {
      matchedCount++;
    }
  }
}

console.log(`成功匹配 ${matchedCount} 个产品到商品价格序列`);
if (unmatchedProducts.length > 0) {
  console.log(`未匹配的产品 (${unmatchedProducts.length}):`);
  unmatchedProducts.slice(0, 20).forEach((p) => console.log(`  - ${p}`));
  if (unmatchedProducts.length > 20) {
    console.log(`  ... 还有 ${unmatchedProducts.length - 20} 个未匹配`);
  }
}
