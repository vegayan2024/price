# 化工产品价格更新指南

## 概述

本方案通过解析 Excel 价格表，自动提取最新价格并映射到公司产品。

## 快速开始

### 1. 上传新的 Excel 文件

将新的价格 Excel 文件放到以下目录：

```
terminal/docs/data/sources/
```

支持的文件格式：
- **CJ (长江化工)**: `cj-chemical-prices-YYYYMMDD.xlsx`
- **XYZQ (兴业证券)**: `xyzq-chemical-prices-YYYYMMDD.xlsx`

### 2. 运行更新脚本

```bash
cd C:\Users\vega_\Documents\GitHub\price
python scripts/update-prices-from-excel.py
```

### 3. 查看结果

更新完成后，以下文件会自动更新：
- `public/data/company-latest-prices.json` - 公司最新价格映射
- `public/data/price-table.json` - 价格速查表

## 详细说明

### Excel 文件结构

#### CJ 文件 (cj-chemical-prices-YYYYMMDD.xlsx)
- **Sheet 3 (价格统计表)**: 包含行业、产品、单位、最新价格
- **Sheet 2 (价格走势图)**: 时间序列数据，最后一行为最新价格

#### XYZQ 文件 (xyzq-chemical-prices-YYYYMMDD.xlsx)
- **Sheet 0 (汇总表)**: 包含产品、单位、最新日期、最新价格
- **Sheet 8+ (各品类详情)**: 各品类详细时间序列数据

### 产品名称映射

脚本内置了 `commodityKey` 到 Excel 产品名的映射表 (`KEY_TO_EXCEL`)。

匹配优先级：
1. 精确匹配映射表中的名称
2. 用 commodityKey 的产品名直接匹配
3. 模糊匹配（包含关系）
4. 去除括号后模糊匹配

### 当前匹配情况

- 公司总数: 69
- 产品总数: 206
- 匹配率: ~68%

未匹配的产品主要是：
1. **LME 金属** (铜、铝、锌等) - 不在化工 Excel 中，需要单独的金属价格数据源
2. **小众化工品** - 不在当前 Excel 数据中
3. **名称差异较大** - 需要补充映射

### 添加新产品映射

如需添加新产品映射，编辑 `update-prices-from-excel.py` 中的 `KEY_TO_EXCEL` 字典：

```python
KEY_TO_EXCEL = {
    "cj:price:产品名": ["Excel中的产品名1", "Excel中的产品名2"],
    ...
}
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `scripts/update-prices-from-excel.py` | 价格更新主脚本 |
| `scripts/extract-latest-prices.py` | 价格提取脚本（带详细统计） |
| `public/data/company-latest-prices.json` | 公司最新价格映射 |
| `public/data/price-table.json` | 价格速查表 |
| `public/data/companies.json` | 公司产品映射配置 |

## 定期更新流程

1. 每周获取最新的 Excel 价格文件
2. 放到 `terminal/docs/data/sources/` 目录
3. 运行 `python scripts/update-prices-from-excel.py`
4. 检查匹配率，如有新产品需补充映射

## 注意事项

- Excel 文件名必须包含日期 (YYYYMMDD)，脚本会自动选择最新的文件
- 如果同时有 CJ 和 XYZQ 文件，XYZQ 的数据优先级更高
- 价格单位取决于 Excel 源数据（通常是元/吨）
