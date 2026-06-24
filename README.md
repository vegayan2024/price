# 价格背离信号终端

监控股票价格与商品价格的背离信号，发现投资机会。

## 功能

- **背离信号检测**：自动检测股票价格与商品价格的背离
- **相关性分析**：计算股票与商品的滑动窗口相关性
- **可视化图表**：双轴走势图、相关性热力图
- **预警系统**：按信号强度分级预警

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

## 数据文件

- `public/data/companies.json` - 公司与产品映射
- `public/data/divergence-signals.json` - 背离信号数据
- `public/data/correlations.json` - 相关性数据
- `public/data/stock-prices.json` - 股票价格数据
- `public/data/commodity-prices.json` - 商品价格数据

## 技术栈

- React 19
- TypeScript
- Vite
- ECharts 6
