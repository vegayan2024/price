import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DABAOZI_PATH = "C:/个人文件夹/vscode";
const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";

console.log("开始修复商品价格映射...\n");

// 读取 catalog
const catalog = JSON.parse(
  readFileSync(join(DABAOZI_PATH, "public/data/chemical/catalog.json"), "utf-8")
);

// 构建 key 到名称的映射
const keyToName = new Map();
const nameToKey = new Map();

for (const item of catalog.items) {
  keyToName.set(item.key, item.name);
  nameToKey.set(item.name, item.key);
}

// 正确的商品价格映射（基于 catalog 中的实际 key）
const correctMapping = {
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
  "尿素": "cj:price:尿素（华鲁恒升小颗粒）",
  "醋酸": "cj:price:醋酸（华东）",
  "钛白粉": "cj:price:钛白粉（金红石型）",
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
  "蛋氨酸": "cj:price:蛋氨酸（固体北京）",
  "制冷剂": "cj:price:R32（市场均价）",
  "R32": "cj:price:R32（市场均价）",
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
  "PTFE": "cj:price:聚四氟乙烯（PTFE）",
  "草铵膦": "cj:price:草铵膦",
  "己二酸": "cj:price:己二酸（华东）",
  "乙二醇": "cj:price:乙二醇",
  "DMF": "cj:price:DMF（华东）",
  "双酚A": "cj:price:双酚A（华东）",
  "丙烯": "cj:price:丙烯（汇丰石化）",
  "苯酚": "cj:price:苯酚（华东）",
  "丙酮": "cj:price:丙酮（华东）",
  "顺酐": "cj:price:顺酐",
  "BDO": "cj:price:BDO（长三角）",
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
  "汽油": "xyzq:price:中国92#汽油(镇海炼化)",
  "柴油": "xyzq:price:中国0#柴油(镇海炼化)",
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

// 读取当前 companies.json
const companies = JSON.parse(
  readFileSync(join(OUTPUT_PATH, "companies.json"), "utf-8")
);

// 修正产品映射
let fixedCount = 0;
let notFoundCount = 0;

for (const company of companies) {
  for (const products of [company.productsByRevenue, company.productsByProfit]) {
    for (const product of products) {
      const correctKey = correctMapping[product.productName];
      if (correctKey && correctKey !== product.commodityKey) {
        product.commodityKey = correctKey;
        product.commodityName = keyToName.get(correctKey) ?? product.commodityName;
        fixedCount++;
      } else if (!correctKey) {
        notFoundCount++;
        console.log(`未找到映射: ${company.name} - ${product.productName}`);
      }
    }
  }
}

// 保存修正后的数据
writeFileSync(
  join(OUTPUT_PATH, "companies.json"),
  JSON.stringify(companies, null, 2),
  "utf-8"
);

console.log(`\n=== 修复完成 ===`);
console.log(`修正了 ${fixedCount} 个产品映射`);
console.log(`未找到映射: ${notFoundCount} 个`);

// 验证匹配
const companyKeys = new Set();
for (const company of companies) {
  for (const product of company.productsByRevenue) {
    companyKeys.add(product.commodityKey);
  }
}

const catalogKeys = new Set(catalog.items.map((item) => item.key));
const matchedKeys = [...companyKeys].filter((key) => catalogKeys.has(key));

console.log(`\n=== 验证结果 ===`);
console.log(`公司需要的 key: ${companyKeys.size}`);
console.log(`catalog 中的 key: ${catalogKeys.size}`);
console.log(`成功匹配: ${matchedKeys.length}`);
console.log(`匹配率: ${((matchedKeys.length / companyKeys.size) * 100).toFixed(1)}%`);
