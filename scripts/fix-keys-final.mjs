import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";

// 读取数据
const companies = JSON.parse(readFileSync(join(OUTPUT_PATH, "companies.json"), "utf-8"));
const commodityData = JSON.parse(readFileSync(join(OUTPUT_PATH, "commodity-prices.json"), "utf-8"));
const excelKeys = new Set(Object.keys(commodityData));

// 产品名称到 Excel key 的映射
const productToKey = {
  // 能源
  "汽油": "xyzq:price:中国92#汽油(镇海炼化)",
  "柴油": "xyzq:price:中国0#柴油(镇海炼化)",
  "液化气": "xyzq:price:液化气(华东)",
  "原油": "xyzq:price:WTI期货(主连合约)",

  // 化工品
  "纯碱": "xyzq:price:纯碱(轻质,华东)",
  "烧碱": "xyzq:price:烧碱(32%离子膜,华北)",
  "PVC": "xyzq:price:PVC(电石法,长三角)",
  "甲醇": "xyzq:price:甲醇(华东)",
  "尿素": "xyzq:price:尿素(山东)",
  "醋酸": "xyzq:price:醋酸(华东)",
  "钛白粉": "xyzq:price:钛白粉(金红石型,华东)",
  "草甘膦": "xyzq:price:草甘膦(华东)",
  "PTA": "xyzq:price:PTA(华东)",
  "环氧丙烷": "xyzq:price:环氧丙烷(华东)",
  "丙烯酸": "xyzq:price:丙烯酸(华东)",
  "MDI": "xyzq:price:聚合MDI(华东)",
  "TDI": "xyzq:price:TDI(T80,华东)",
  "维生素E": "xyzq:price:维生素E(50万IU/g,国产)",
  "VE": "xyzq:price:维生素E(50万IU/g,国产)",
  "维生素A": "xyzq:price:维生素A(50万IU/g,国产)",
  "VA": "xyzq:price:维生素A(50万IU/g,国产)",
  "蛋氨酸": "xyzq:price:固体蛋氨酸(山东)",
  "粘胶短纤": "xyzq:price:粘胶短纤(1.5D,38毫米)",
  "碳酸锂": "xyzq:price:碳酸锂(电池级,江苏)",
  "氯化钾": "xyzq:price:氯化钾(60%粉,青海挂牌)",
  "多菌灵": "xyzq:price:多菌灵(98%,华东)",
  "安赛蜜": "xyzq:price:安赛蜜（华东）",
  "三氯蔗糖": "xyzq:price:三氯蔗糖",
  "分散染料": "xyzq:price:分散黑(ECT300%,华东)",
  "环氧树脂": "xyzq:price:环氧树脂(E51,华东)",
  "草铵膦": "xyzq:price:草铵膦",
  "己二酸": "xyzq:price:己二酸(华东)",
  "乙二醇": "xyzq:price:乙二醇(华东)",
  "DMF": "xyzq:price:DMF(华东)",
  "双酚A": "xyzq:price:双酚A(华东)",
  "苯酚": "xyzq:price:苯酚(华东)",
  "丙酮": "xyzq:price:丙酮(华东)",
  "顺酐": "xyzq:price:顺酐(华东)",
  "丁酮": "xyzq:price:丁酮(华东)",
  "苯乙烯": "xyzq:price:苯乙烯(华东)",
  "纯苯": "xyzq:price:纯苯(华东)",
  "己内酰胺": "xyzq:price:己内酰胺(华东)",
  "丙烯腈": "xyzq:price:丙烯腈(长三角)",
  "氨纶": "xyzq:price:氨纶(40D)",
  "天然橡胶": "xyzq:price:天然橡胶(国产5号标胶)",
  "炭黑": "xyzq:price:炭黑(N330,山东)",
  "硝酸铵": "xyzq:price:硝酸铵(山东)",

  // 金属
  "铜": "xyzq:price:铜",
  "铝": "xyzq:price:铝",
  "锌": "xyzq:price:锌",
  "锡": "xyzq:price:锡",
  "镍": "xyzq:price:镍",
  "铅": "xyzq:price:铅",
  "黄金": "xyzq:price:黄金",
  "白银": "xyzq:price:白银",
  "铂": "xyzq:price:铂",
  "钯": "xyzq:price:钯",
  "铑": "xyzq:price:铑",
  "钴": "xyzq:price:钴",
  "铌": "xyzq:price:铌",
  "钽": "xyzq:price:钽",
  "铁矿石": "xyzq:price:铁矿石",
  "氧化铝": "xyzq:price:氧化铝",
  "氧化镨钕": "xyzq:price:氧化镨钕",
  "稀土": "xyzq:price:氧化镨钕",
  "仲钨酸铵": "xyzq:price:仲钨酸铵",
  "钨": "xyzq:price:仲钨酸铵",
  "五氧化二钒": "xyzq:price:五氧化二钒",
  "钼精矿": "xyzq:price:钼精矿",
  "锑锭": "xyzq:price:锑锭",
  "金属镓": "xyzq:price:金属镓",
  "金属铍": "xyzq:price:金属铍",
  "金属铟": "xyzq:price:金属铟",

  // 农产品
  "豆粕": "xyzq:price:豆粕（现货平均价）",
  "生猪": "xyzq:price:生猪价格",
};

// 修正 companies.json
let fixed = 0;
let notFound = 0;

for (const company of companies) {
  for (const products of [company.productsByRevenue, company.productsByProfit]) {
    for (const product of products) {
      const key = productToKey[product.productName];
      if (key && excelKeys.has(key)) {
        product.commodityKey = key;
        fixed++;
      } else {
        notFound++;
      }
    }
  }
}

// 保存
writeFileSync(join(OUTPUT_PATH, "companies.json"), JSON.stringify(companies, null, 2), "utf-8");

console.log(`修正了 ${fixed} 个产品映射`);
console.log(`未找到映射: ${notFound} 个`);

// 验证
const allKeys = new Set();
for (const company of companies) {
  for (const product of company.productsByRevenue) {
    allKeys.add(product.commodityKey);
  }
}

const matched = [...allKeys].filter((k) => excelKeys.has(k));
console.log(`\n验证结果:`);
console.log(`公司需要的 key: ${allKeys.size}`);
console.log(`Excel 中的 key: ${excelKeys.size}`);
console.log(`成功匹配: ${matched.length}`);
console.log(`匹配率: ${((matched.length / allKeys.size) * 100).toFixed(1)}%`);
