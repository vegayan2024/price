import pandas as pd
import json
import sys
import io

# 设置标准输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

EXCEL_PATH = r"C:\工作文件夹\个人学习\资本市场\二级市场\行业及公司分析\资料\20260606-兴业证券-化工行业：化工品价格价差与库存开工数据库.xlsx"
OUTPUT_PATH = r"C:\个人文件夹\vscode\price\public\data\commodity-prices.json"

print("读取 Excel 文件...")
xl = pd.ExcelFile(EXCEL_PATH)

print(f"\n找到 {len(xl.sheet_names)} 个工作表:")
for i, name in enumerate(xl.sheet_names):
    print(f"  {i+1}. {name}")

# 读取所有工作表并提取价格数据
all_price_data = {}

for sheet_name in xl.sheet_names:
    print(f"\n读取工作表: {sheet_name}")
    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
        print(f"  行数: {len(df)}, 列数: {len(df.columns)}")
        print(f"  前5列: {list(df.columns[:5])}")

        # 查找价格数据列
        for col in df.columns:
            col_str = str(col)
            # 跳过非价格列
            if any(skip in col_str.lower() for skip in ['日期', 'date', '序号', 'index', 'unnamed']):
                continue

            # 检查是否是数值列
            if df[col].dtype in ['float64', 'int64']:
                # 获取第一列作为日期
                date_col = df.columns[0]
                valid_data = df[[date_col, col]].dropna()

                if len(valid_data) > 10:  # 至少10个数据点
                    series_key = f"xyzq:price:{col_str}"
                    all_price_data[series_key] = [
                        {"date": str(row[date_col])[:10], "value": float(row[col])}
                        for _, row in valid_data.iterrows()
                    ]
                    print(f"    + 添加: {col_str} ({len(valid_data)} 个数据点)")

    except Exception as e:
        print(f"    - 读取失败: {e}")

# 保存数据
print(f"\n保存数据到 {OUTPUT_PATH}...")
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(all_price_data, f, ensure_ascii=False, indent=2)

print(f"\n=== 完成 ===")
print(f"共保存 {len(all_price_data)} 个价格序列")

# 列出所有序列
print("\n价格序列列表:")
for key in sorted(all_price_data.keys())[:30]:
    print(f"  {key}: {len(all_price_data[key])} 个数据点")
