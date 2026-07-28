# Excel 数据源目录

## 使用方法

将商品价格 Excel 文件放到此目录，然后运行更新脚本。

## 支持的文件格式

### 1. 长江化工 (CJ)
- **文件名**: `cj-chemical-prices-YYYYMMDD.xlsx`
- **示例**: `cj-chemical-prices-20260728.xlsx`

### 2. 兴业证券 (XYZQ)
- **文件名**: `xyzq-chemical-prices-YYYYMMDD.xlsx`
- **示例**: `xyzq-chemical-prices-20260728.xlsx`

## Excel 文件结构要求

### CJ 文件
- **Sheet 2**: 价格走势图（时间序列）
- **Sheet 3**: 价格统计表（产品名、单位、最新价格）

### XYZQ 文件
- **Sheet 0**: 汇总表（产品名、单位、最新价格）
- **Sheet 8+**: 各品类详情表

## 更新步骤

1. 将 Excel 文件放到此目录
2. 运行脚本：
   ```bash
   cd C:\个人文件夹\github\price
   python scripts/update-prices-from-excel.py
   ```
3. 检查输出的匹配率统计
4. 运行 `update-price.bat` 上传到 GitHub

## 注意事项

- 文件名必须包含日期（YYYYMMDD格式）
- 脚本会自动选择最新的文件
- 如果同时有 CJ 和 XYZQ，XYZQ 数据优先
- Excel 文件已被 .gitignore 忽略，不会提交到 GitHub
