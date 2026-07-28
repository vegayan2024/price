import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";

console.log("开始修正商品价格映射（基于 Excel 数据）...\n");

// Excel 中的价格序列 key（从输出中提取）
const excelKeys = [
  "xyzq:price:WTI期货(主连合约)",
  "xyzq:price:Brent期货(主连合约)",
  "xyzq:price:中国92#汽油(镇海炼化)",
  "xyzq:price:中国0#柴油(镇海炼化)",
  "xyzq:price:液化气(华东)",
  "xyzq:price:尿素(山东)",
  "xyzq:price:甲醇(华东)",
  "xyzq:price:乙二醇(华东)",
  "xyzq:price:纯碱(轻质,华东)",
  "xyzq:price:纯碱(重质,华东)",
  "xyzq:price:烧碱(32%离子膜,华北)",
  "xyzq:price:PVC(电石法,长三角)",
  "xyzq:price:PTA(华东)",
  "xyzq:price:涤纶长丝(POY)",
  "xyzq:price:涤纶短纤(1.4D,38毫米,华东)",
  "xyzq:price:聚酯切片(瓶级)",
  "xyzq:price:己内酰胺(华东)",
  "xyzq:price:己二酸(华东)",
  "xyzq:price:苯酚(华东)",
  "xyzq:price:丙酮(华东)",
  "xyzq:price:双酚A(华东)",
  "xyzq:price:苯乙烯(华东)",
  "xyzq:price:纯苯(华东)",
  "xyzq:price:甲苯(华东)",
  "xyzq:price:二甲苯(华东)",
  "xyzq:price:环氧丙烷(华东)",
  "xyzq:price:丙烯酸(华东)",
  "xyzq:price:丙烯酸丁酯(华东)",
  "xyzq:price:丙烯腈(长三角)",
  "xyzq:price:DMF(华东)",
  "xyzq:price:醋酸(华东)",
  "xyzq:price:醋酸乙烯(华东)",
  "xyzq:price:PVA(1799,四川维尼纶)",
  "xyzq:price:甲醛(河北)",
  "xyzq:price:丁酮(华东)",
  "xyzq:price:顺酐(华东)",
  "xyzq:price:丁二醇BDO(华东)",
  "xyzq:price:聚合MDI(华东)",
  "xyzq:price:纯MDI(华东)",
  "xyzq:price:TDI(T80,华东)",
  "xyzq:price:硬泡聚醚(华东)",
  "xyzq:price:软泡聚醚(华东)",
  "xyzq:price:MDI-50(华东)",
  "xyzq:price:液化MDI(华东)",
  "xyzq:price:天然橡胶(国产5号标胶)",
  "xyzq:price:丁苯橡胶(市场价)",
  "xyzq:price:顺丁橡胶(BR9000,高桥石化)",
  "xyzq:price:炭黑(N330,山东)",
  "xyzq:price:聚碳酸酯PC(科思创2805,华东)",
  "xyzq:price:MMA(华东)",
  "xyzq:price:PMMA(CM-207,镇江奇美)",
  "xyzq:price:环氧树脂(E51,华东)",
  "xyzq:price:草甘膦(华东)",
  "xyzq:price:草铵膦",
  "xyzq:price:多菌灵(98%,华东)",
  "xyzq:price:高效氯氟氰菊酯",
  "xyzq:price:敌草隆",
  "xyzq:price:毒死蜱(96%,华东)",
  "xyzq:price:吡虫啉(95%,华东)",
  "xyzq:price:维生素A(50万IU/g,国产)",
  "xyzq:price:维生素E(50万IU/g,国产)",
  "xyzq:price:固体蛋氨酸(山东)",
  "xyzq:price:赖氨酸(98.5%,国产)",
  "xyzq:price:味精(国内)",
  "xyzq:price:安赛蜜（华东）",
  "xyzq:price:三氯蔗糖",
  "xyzq:price:碳酸锂(电池级,江苏)",
  "xyzq:price:磷酸铁",
  "xyzq:price:六氟磷酸锂",
  "xyzq:price:三元正极材料（811）",
  "xyzq:price:磷酸铁锂正极材料",
  "xyzq:price:硝酸铵(山东)",
  "xyzq:price:磷矿石(30%,贵州)",
  "xyzq:price:磷酸(华东)",
  "xyzq:price:氯化钾(60%粉,青海挂牌)",
  "xyzq:price:硫酸(98%,长三角)",
  "xyzq:price:钛白粉(金红石型,华东)",
  "xyzq:price:钛白粉(锐钛型,华东)",
  "xyzq:price:钛精矿(攀枝花)",
  "xyzq:price:仲钨酸铵",
  "xyzq:price:氧化镨钕",
  "xyzq:price:金属钴（安泰科,国产）",
  "xyzq:price:铜",
  "xyzq:price:铝",
  "xyzq:price:锌",
  "xyzq:price:锡",
  "xyzq:price:镍",
  "xyzq:price:铅",
  "xyzq:price:黄金",
  "xyzq:price:白银",
  "xyzq:price:铂",
  "xyzq:price:钯",
  "xyzq:price:铑",
  "xyzq:price:钴",
  "xyzq:price:铌",
  "xyzq:price:钽",
  "xyzq:price:铁矿石",
  "xyzq:price:氧化铝",
  "xyzq:price:五氧化二钒",
  "xyzq:price:钼精矿",
  "xyzq:price:锑锭",
  "xyzq:price:金属镓",
  "xyzq:price:金属铍",
  "xyzq:price:金属铟",
  "xyzq:price:豆粕（现货平均价）",
  "xyzq:price:生猪价格",
  "xyzq:price:聚丙烯酰胺(浙江鑫甬)",
  "xyzq:price:分散黑(ECT300%,华东)",
  "xyzq:price:活性黑(WNN200%,华东)",
  "xyzq:price:间苯二胺",
  "xyzq:price:防老剂RD(华北)",
  "xyzq:price:PA66",
  "xyzq:price:氨纶(40D)",
  "xyzq:price:粘胶短纤(1.5D,38毫米)",
  "xyzq:price:粘胶长丝(120D无光)",
  "xyzq:price:锦纶6POY(86D/24F，江浙)",
  "xyzq:price:锦纶6DTY(70D/24F，江浙)",
  "xyzq:price:锦纶6FDY(70D/24F，江浙)",
  "xyzq:price:腈纶短纤(1.5D,38毫米)",
  "xyzq:price:聚丙烯(PP)",
  "xyzq:price:电石(西北)",
  "xyzq:price:原盐(山东)",
  "xyzq:price:液氯(山东)",
  "xyzq:price:盐酸(31%,长三角)",
  "xyzq:price:萤石粉(湿粉,华东)",
  "xyzq:price:氢氟酸(华东)",
  "xyzq:price:二氯甲烷(华东)",
  "xyzq:price:三氯甲烷(华东)",
  "xyzq:price:R22(浙江)",
  "xyzq:price:R32(浙江)",
  "xyzq:price:R125(浙江)",
  "xyzq:price:R134a(浙江)",
  "xyzq:price:PVDF（粉料，东岳集团）",
  "xyzq:price:聚四氟乙烯（浙江巨化）",
  "xyzq:price:葡萄糖(国内)",
  "xyzq:price:玉米淀粉(滨州,出厂价)",
  "xyzq:price:乙醇(普通,山东)",
  "xyzq:price:二甲基亚砜（湖北兴发）",
  "xyzq:price:碳酸二甲酯DMC(华东)",
  "xyzq:price:碳酸二甲酯(华东)",
];

// 读取 companies.json
const companies = JSON.parse(
  readFileSync(join(OUTPUT_PATH, "companies.json"), "utf-8")
);

// 创建产品名称到 Excel key 的映射
const productToExcelKey = {
  // 能源
  "汽油": "xyzq:price:中国92#汽油(镇海炼化)",
  "柴油": "xyzq:price:中国0#柴油(镇海炼化)",
  "液化气": "xyzq:price:液化气(华东)",
  "LNG": "xyzq:price:液化气(华东)",
  "天然气": "xyzq:price:WTI期货(主连合约)",
  "原油": "xyzq:price:WTI期货(主连合约)",
  "动力煤": "xyzq:price:动力煤",

  // 化工品
  "纯碱": "xyzq:price:纯碱(轻质,华东)",
  "烧碱": "xyzq:price:烧碱(32%离子膜,华北)",
  "PVC": "xyzq:price:PVC(电石法,长三角)",
  "甲醇": "xyzq:price:甲醇(华东)",
  "尿素": "xyzq:price:尿素(山东)",
  "醋酸": "xyzq:price:醋酸(华东)",
  "钛白粉": "xyzq:price:钛白粉(金红石型,华东)",
  "草甘膦": "xyzq:price:草甘膦(华东)",
  "聚丙烯": "xyzq:price:聚丙烯(PP)",
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
  "制冷剂": "xyzq:price:R32(浙江)",
  "R32": "xyzq:price:R32(浙江)",
  "粘胶短纤": "xyzq:price:粘胶短纤(1.5D,38毫米)",
  "PVA": "xyzq:price:PVA(1799,四川维尼纶)",
  "碳酸锂": "xyzq:price:碳酸锂(电池级,江苏)",
  "氯化钾": "xyzq:price:氯化钾(60%粉,青海挂牌)",
  "多菌灵": "xyzq:price:多菌灵(98%,华东)",
  "安赛蜜": "xyzq:price:安赛蜜（华东）",
  "三氯蔗糖": "xyzq:price:三氯蔗糖",
  "分散染料": "xyzq:price:分散黑(ECT300%,华东)",
  "活性染料": "xyzq:price:活性黑(WNN200%,华东)",
  "间苯二胺": "xyzq:price:间苯二胺",
  "环氧树脂": "xyzq:price:环氧树脂(E51,华东)",
  "PVDF": "xyzq:price:PVDF（粉料，东岳集团）",
  "PTFE": "xyzq:price:聚四氟乙烯（浙江巨化）",
  "草铵膦": "xyzq:price:草铵膦",
  "己二酸": "xyzq:price:己二酸(华东)",
  "乙二醇": "xyzq:price:乙二醇(华东)",
  "DMF": "xyzq:price:DMF(华东)",
  "双酚A": "xyzq:price:双酚A(华东)",
  "丙烯": "xyzq:price:丙烯(华东)",
  "苯酚": "xyzq:price:苯酚(华东)",
  "丙酮": "xyzq:price:丙酮(华东)",
  "顺酐": "xyzq:price:顺酐(华东)",
  "BDO": "xyzq:price:丁二醇BDO(华东)",
  "丁酮": "xyzq:price:丁酮(华东)",
  "甲乙酮": "xyzq:price:丁酮(华东)",
  "苯乙烯": "xyzq:price:苯乙烯(华东)",
  "纯苯": "xyzq:price:纯苯(华东)",
  "己内酰胺": "xyzq:price:己内酰胺(华东)",
  "丙烯腈": "xyzq:price:丙烯腈(长三角)",
  "氨纶": "xyzq:price:氨纶(40D)",
  "PA66": "xyzq:price:PA66",
  "涤纶长丝": "xyzq:price:涤纶长丝(POY)",
  "天然橡胶": "xyzq:price:天然橡胶(国产5号标胶)",
  "炭黑": "xyzq:price:炭黑(N330,山东)",
  "复合肥": "xyzq:price:复合肥",
  "磷酸铁": "xyzq:price:磷酸铁",
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
  "钒": "xyzq:price:五氧化二钒",
  "钼精矿": "xyzq:price:钼精矿",
  "钼": "xyzq:price:钼精矿",
  "锑锭": "xyzq:price:锑锭",
  "锑": "xyzq:price:锑锭",
  "金属镓": "xyzq:price:金属镓",
  "镓": "xyzq:price:金属镓",
  "金属铍": "xyzq:price:金属铍",
  "铍": "xyzq:price:金属铍",
  "金属铟": "xyzq:price:金属铟",
  "铟": "xyzq:price:金属铟",

  // 农产品
  "豆粕": "xyzq:price:豆粕（现货平均价）",
  "生猪": "xyzq:price:生猪价格",
};

// 修正产品映射
let fixedCount = 0;
let notFoundCount = 0;
const notFoundProducts = [];

for (const company of companies) {
  for (const products of [company.productsByRevenue, company.productsByProfit]) {
    for (const product of products) {
      const correctKey = productToExcelKey[product.productName];
      if (correctKey && correctKey !== product.commodityKey) {
        product.commodityKey = correctKey;
        fixedCount++;
      } else if (!correctKey) {
        notFoundCount++;
        notFoundProducts.push(`${company.name}: ${product.productName}`);
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

console.log("=== 修正完成 ===");
console.log(`修正了 ${fixedCount} 个产品映射`);
console.log(`未找到映射: ${notFoundCount} 个`);

if (notFoundProducts.length > 0) {
  console.log("\n未匹配的产品:");
  [...new Set(notFoundProducts)].forEach((p) => console.log(`  - ${p}`));
}

// 验证匹配
const commodityPrices = JSON.parse(
  readFileSync(join(OUTPUT_PATH, "commodity-prices.json"), "utf-8")
);

const excelKeySet = new Set(Object.keys(commodityPrices));
const companyKeys = new Set();
for (const company of companies) {
  for (const product of company.productsByRevenue) {
    companyKeys.add(product.commodityKey);
  }
}

const matchedKeys = [...companyKeys].filter((key) => excelKeySet.has(key));

console.log("\n=== 验证结果 ===");
console.log(`公司需要的 key: ${companyKeys.size}`);
console.log(`Excel 中的 key: ${excelKeySet.size}`);
console.log(`成功匹配: ${matchedKeys.length}`);
console.log(`匹配率: ${((matchedKeys.length / companyKeys.size) * 100).toFixed(1)}%`);
