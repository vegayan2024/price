# 价格背离信号终端

监控股票价格与商品价格的背离信号，发现投资机会。

## 功能特性

### 核心功能

- **背离信号检测**：自动检测股票价格与商品价格的背离，支持正向/负向背离
- **相关性分析**：计算股票与商品的 60/120/250 天滑动窗口相关性
- **可视化图表**：双轴走势图、相关性热力图（ECharts 6）
- **预警系统**：按信号强度（强/中/弱）分级预警

### 估值与财务筛选

- **估值判断**：PB/PE 百分位估值，判断股价是否处于历史低位
- **股价低位持续时间**：检测股价在 20% 低位超过 2 年的情况
- **财务验证**：扣非利润同比增长率、资产负债率筛选条件
- **权重选择**：支持按收入或按利润加权计算综合背离信号

### 数据管理

- **公司-产品映射**：69 只股票与 34 个商品的映射关系
- **价格更新脚本**：支持从 Excel（长江化工/兴业证券）自动提取最新价格
- **数据获取脚本**：基于 Tushare API 获取股票历史价格数据

## 运行

```bash
npm install
npm run dev -- --port 5173
```

## 构建

```bash
npm run build
npm run preview
```

## 数据更新

### 从 Excel 更新商品价格

```bash
# 将价格 Excel 放到 terminal/docs/data/sources/ 目录
python scripts/update-prices-from-excel.py
```

支持的 Excel 格式：

- **长江化工 (CJ)**：`cj-chemical-prices-YYYYMMDD.xlsx`
- **兴业证券 (XYZQ)**：`xyzq-chemical-prices-YYYYMMDD.xlsx`

### 从 Tushare 获取股票数据

```bash
npm run data:fetch
```

### 计算背离信号

```bash
npm run data:divergence
```

详细说明见 [scripts/PRICE-UPDATE-GUIDE.md](scripts/PRICE-UPDATE-GUIDE.md)

## 数据文件

| 文件 | 说明 |
| --- | --- |
| `public/data/companies.json` | 公司与产品映射配置 |
| `public/data/divergence-signals.json` | 背离信号数据 |
| `public/data/correlations.json` | 相关性数据 |
| `public/data/stock-prices.json` | 股票价格数据 |
| `public/data/commodity-prices.json` | 商品价格数据 |
| `public/data/valuation-data.json` | 估值数据（PB/PE） |
| `public/data/financial-data.json` | 财务数据（扣非利润、资产负债率） |
| `public/data/price-table.json` | 价格速查表 |
| `public/data/company-latest-prices.json` | 公司最新价格映射 |

## 技术栈

- React 19 + TypeScript
- Vite 6
- ECharts 6
- React Router 7
- Lucide React (图标)

## 更新日志

### v0.1.0 (2026-07-13)

**新增功能**

- 添加价格更新脚本，支持从 Excel 自动提取商品价格
- 添加财务验证条件：扣非利润增长和资产负债率筛选
- 添加第三条判断：股价在 20% 低位超过 2 年
- 添加估值数据（PB/PE 百分位）
- 导入 69 只股票和 34 个商品的历史价格数据

**优化改进**

- 优化信号显示：折叠合并相似信号，阈值调整为 10%
- 添加股价/PB 判断辅助信号筛选
- 添加利润权重和收入权重两种计算方式
- 使用年报收入数据加权计算综合背离信号
- 生成 69 家公司的真实产品映射数据

**数据脚本**

- 添加 Tushare 数据获取脚本
- 添加公司-产品映射生成脚本
- 添加价格导入和估值数据导入脚本
