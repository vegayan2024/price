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

# 需要读取的行业工作表
industry_sheets = [
    "原油", "炼油", "天然气", "煤", "C1", "C2", "C3", "C4", "C5",
    "芳烃", "化纤", "磷化工", "氯碱", "化肥", "农药", "聚氨酯",
    "橡胶", "塑料", "氟化工", "其他材料", "新能源材料", "钛产业链",
    "食品与饲料添加剂", "农产品", "工业气体"
]

all_price_data = {}

for sheet_name in industry_sheets:
    if sheet_name not in xl.sheet_names:
        print(f"跳过不存在的工作表: {sheet_name}")
        continue

    print(f"\n读取工作表: {sheet_name}")
    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
        print(f"  行数: {len(df)}, 列数: {len(df.columns)}")

        # 第一列是图表/日期，第二列是日期，后面是价格列
        if len(df.columns) < 3:
            print(f"  列数不足，跳过")
            continue

        # 获取日期列（通常是第二列）
        date_col = df.columns[1]

        # 遍历所有价格列（从第三列开始）
        for col in df.columns[2:]:
            col_str = str(col).strip()

            # 跳过价差列和右轴列
            if any(skip in col_str for skip in ['价差', '右轴', '换算', '计增值税']):
                continue

            # 检查是否是数值列
            if df[col].dtype in ['float64', 'int64']:
                # 过滤有效数据
                valid_data = df[[date_col, col]].dropna()
                valid_data = valid_data[valid_data[date_col].notna()]

                if len(valid_data) > 50:  # 至少50个数据点
                    series_key = f"xyzq:price:{col_str}"
                    price_series = []
                    for _, row in valid_data.iterrows():
                        try:
                            date_val = str(row[date_col])[:10]
                            price_val = float(row[col])
                            if price_val > 0:  # 价格必须大于0
                                price_series.append({"date": date_val, "value": price_val})
                        except:
                            continue

                    if len(price_series) > 50:
                        all_price_data[series_key] = price_series
                        print(f"    + {col_str}: {len(price_series)} 个数据点")

    except Exception as e:
        print(f"    - 读取失败: {e}")

# 保存数据
print(f"\n保存数据到 {OUTPUT_PATH}...")
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(all_price_data, f, ensure_ascii=False, indent=2)

print(f"\n=== 完成 ===")
print(f"共保存 {len(all_price_data)} 个价格序列")

# 统计
total_points = sum(len(v) for v in all_price_data.values())
print(f"总数据点: {total_points}")
