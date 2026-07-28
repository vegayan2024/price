import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const EXCEL_PATH = "C:/工作文件夹/个人学习/资本市场/二级市场/行业及公司分析/资料/20260606-兴业证券-化工行业：化工品价格价差与库存开工数据库.xlsx";
const OUTPUT_PATH = "C:/个人文件夹/vscode/price/public/data";

console.log("开始从 Excel 文件导入价格数据...\n");

// 由于 Node.js 无法直接读取 Excel，我们需要使用 Python
// 让我先创建一个 Python 脚本

const pythonScript = `
import pandas as pd
import json
import sys

excel_path = r"${EXCEL_PATH}"
output_path = r"${OUTPUT_PATH}/commodity-prices.json"

print("读取 Excel 文件...")
xl = pd.ExcelFile(excel_path)

print(f"找到 {len(xl.sheet_names)} 个工作表:")
for i, name in enumerate(xl.sheet_names[:10]):
    print(f"  {i+1}. {name}")

# 读取价格相关的工作表
price_data = {}

for sheet_name in xl.sheet_names:
    if "价格" in sheet_name or "price" in sheet_name.lower():
        print(f"\\n读取工作表: {sheet_name}")
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        print(f"  行数: {len(df)}, 列数: {len(df.columns)}")
        print(f"  列名: {list(df.columns[:5])}")

        # 尝试提取价格数据
        # 假设第一列是日期，其他列是不同商品的价格
        if len(df.columns) >= 2:
            date_col = df.columns[0]
            for col in df.columns[1:]:
                if df[col].dtype in ['float64', 'int64']:
                    # 过滤有效数据
                    valid_data = df[[date_col, col]].dropna()
                    if len(valid_data) > 0:
                        series_key = f"xyzq:price:{col}"
                        price_data[series_key] = [
                            {"date": str(row[date_col])[:10], "value": float(row[col])}
                            for _, row in valid_data.iterrows()
                        ]
                        print(f"    添加序列: {col} ({len(valid_data)} 个数据点)")

# 保存数据
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(price_data, f, ensure_ascii=False, indent=2)

print(f"\\n=== 完成 ===")
print(f"保存了 {len(price_data)} 个价格序列")
`;

// 写入 Python 脚本
const fs = await import("fs");
fs.writeFileSync("scripts/parse-excel.py", pythonScript);

console.log("Python 脚本已创建");
console.log("请运行以下命令:");
console.log("python scripts/parse-excel.py");
