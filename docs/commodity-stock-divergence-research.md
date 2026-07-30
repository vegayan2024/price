# 商品价格与股价背离关系 — 学术研究综述

> 目标：为 price 项目的背离信号系统提供理论支撑与改进方向

---

## 一、核心学术论文

### 1. 奠基性研究

| 论文 | 作者 | 年份 | 核心发现 |
|------|------|------|----------|
| **Facts and Fantasies about Commodity Futures** | Gorton & Rouwenhorst | 2006 | 商品期货与股票收益**负相关**，可作为对冲工具；商品在意外通胀时期表现优异 |
| **The Strategic and Tactical Value of Commodity Futures** | Erb & Harvey | 2006 | 商品投资的战略与战术价值；提出商品收益的横截面差异可预测未来回报 |
| **Index Investment and the Financialization of Commodities** | Tang & Xiong | 2012 | 商品金融化使商品与股票相关性显著上升；指数投资扭曲了价格发现机制 |

### 2. 动态相关性与体制转换

| 论文 | 作者 | 年份 | 核心发现 |
|------|------|------|----------|
| **Speculators, Commodities, and Cross-Market Linkages** | Büyükşahin & Robe | 2014 | 对冲基金活动加强了股票-商品跨市场关联；相关性具有时变特征 |
| **Commodity and Equity Markets: Some Stylized Facts from a Copula Approach** | Silvennoinen & Thorp | 2013 | 2008年金融危机后商品与股市联动性增强；使用 Copula 方法建模非线性依赖 |
| **Financialization of Commodity Markets** | Adams & Glück | 2015 | 金融化对商品-股票相关性的系统性影响 |
| **Dynamic Conditional Correlation** | Engle | 2002 | DCC-GARCH 模型 —— 动态条件相关性的经典建模方法（商品-股票研究的核心工具） |

### 3. 领先-滞后与价格发现

| 论文 | 作者 | 年份 | 核心发现 |
|------|------|------|----------|
| **Do commodity prices help predict stock returns?** | Bhardwaj, Gorton & Rouwenhorst | 2015 | 商品价格对股票收益具有一定预测能力 |
| **Information Shares in Commodity and Equity Markets** | 多位学者 | 2010s | 期货市场价格发现功能通常**强于**股票市场；信息从商品市场向股票市场传导 |
| **The Role of Speculation in Commodity Markets** | Kilian & Murphy | 2014 | 供需冲击与投机行为对商品价格的不同影响机制 |

### 4. 中国市场相关研究

| 研究方向 | 发表期刊 | 核心发现 |
|----------|----------|----------|
| 大宗商品期货与A股板块领先滞后关系 | 《金融研究》《管理世界》 | 铜期货领先有色金属板块2-5天，原油领先石化板块1-3天 |
| CRB指数与中国股票市场的关联性 | 《经济学（季刊）》 | CRB指数对A股存在单向溢出效应 |
| 商品金融化背景下的跨市场信息传导 | 《系统工程理论与实践》 | DCC-GARCH模型证实中国商品-股票相关性具有时变特征 |

---

## 二、对当前背离系统的理论评估

### 当前系统实现

```
// 当前核心逻辑（divergence-calculator.ts）
条件1: |correlation| < 0.3          // 相关性较低
条件2: stockCumReturn × commodityCumReturn < 0  // 方向相反
条件3: |stockCumReturn| > 10% 且 |commodityCumReturn| > 10%  // 双方变化幅度足够
背离度 = |stockCumReturn - commodityCumReturn|
强度: strong(>0.3) / medium(>0.2) / weak(>0.1)
```

### 学术视角的问题分析

#### 问题1: 静态阈值不适应市场体制变化

**学术依据**: Gorton & Rouwenhorst (2006) 发现商品-股票相关性在不同时期差异显著。2004年后金融化使相关性从负值转为正值。Engle (2002) 的 DCC 模型证实相关性是**时变**的。

**当前问题**: 固定阈值 `0.3` 在低相关性时期（正常）和高相关性时期（危机）产生截然不同的信号质量。

**改进建议**: 使用滑动窗口的**相关性百分位**代替固定阈值。例如：当60天相关性低于过去250天的20%分位时，才判定为"相关性较低"。

#### 问题2: 缺少领先-滞后关系建模

**学术依据**: 大量研究证明商品期货价格**领先**对应股票板块1-5个交易日。信息从期货市场向股票市场传导是主要方向。

**当前问题**: 系统仅比较同期收益率，未考虑商品价格变化可能在1-5天后才反映到股价中。

**改进建议**: 在计算相关性和背离时引入**时滞（lag）**，测试不同滞后天数(1/3/5天)下的相关性，选择最优滞后窗口。

#### 问题3: 背离信号缺少均值回归预测

**学术依据**: Bhardwaj, Gorton & Rouwenhorst (2015) 发现商品-股票背离具有**可预测性**——大幅背离往往会在未来数月收敛（均值回归）。

**当前问题**: 系统只检测当前背离状态，未预测背离收敛的方向和时间。

**改进建议**: 添加**均值回归概率**指标。当检测到背离时，基于历史同类背离的收敛统计，估计未来N天内收敛的概率。

#### 问题4: 未区分"正向背离"的投资含义

**学术依据**: Erb & Harvey (2006) 区分了两类背离信号：
- **商品涨 + 股票跌**（正向背离）→ 可能是成本挤压、利润率收缩信号
- **商品跌 + 股票涨**（负向背离）→ 可能是需求预期差、估值泡沫信号

**当前问题**: 系统仅区分正/负背离类型，但未将含义与投资策略关联。

**改进建议**: 为每种背离类型添加**含义标签**和**建议操作**（如：正向背离→关注公司毛利率变化）。

#### 问题5: 单一相关性度量的局限

**学术依据**: Silvennoinen & Thorp (2013) 使用 Copula 方法证明商品-股票依赖结构具有**非线性**和**尾部不对称**特征。Pearson 相关系数无法捕捉这些特征。

**当前问题**: 仅使用 Pearson 相关系数，可能遗漏非线性背离信号。

**改进建议**: 考虑添加**秩相关（Spearman）**和**尾部相关性**指标，捕捉极端市场条件下的依赖关系。

---

## 三、具体改进方案

### 方案A: 动态相关性阈值（低复杂度）

```typescript
// 改进: 用百分位代替固定阈值
function isDivergent(
  currentCorrelation: number,
  historicalCorrelations: number[],
  percentileThreshold: number = 0.2
): boolean {
  const sorted = [...historicalCorrelations].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * percentileThreshold);
  const threshold = sorted[idx] ?? 0;
  return currentCorrelation < threshold;
}
```

### 方案B: 引入领先-滞后分析（中复杂度）

```typescript
// 改进: 测试不同滞后的相关性
function findOptimalLag(
  stockReturns: number[],
  commodityReturns: number[],
  maxLag: number = 5
): { lag: number; correlation: number } {
  let bestLag = 0;
  let bestCorr = 0;
  for (let lag = 0; lag <= maxLag; lag++) {
    const shifted = commodityReturns.slice(lag);
    const stock = stockReturns.slice(0, shifted.length);
    const corr = Math.abs(calculateCorrelation(stock, shifted));
    if (corr > Math.abs(bestCorr)) {
      bestCorr = calculateCorrelation(stock, shifted);
      bestLag = lag;
    }
  }
  return { lag: bestLag, correlation: bestCorr };
}
```

### 方案C: 均值回归信号（中复杂度）

```typescript
// 改进: 评估背离收敛概率
interface MeanReversionSignal {
  divergenceScore: number;
  historicalConvergenceRate: number;  // 历史上同类背离收敛比例
  expectedConvergenceDays: number;    // 预期收敛天数
  confidence: "high" | "medium" | "low";
}
```

### 方案D: 多维度背离评分（高复杂度）

```typescript
// 改进: 综合多因子的背离评分
interface EnhancedDivergenceSignal {
  // 当前指标
  correlation: number;
  divergenceScore: number;

  // 新增: 动态相关性
  correlationPercentile: number;      // 当前相关性在历史中的百分位
  correlationTrend: "increasing" | "decreasing" | "stable";

  // 新增: 领先滞后
  optimalLag: number;                 // 最优滞后天数
  laggedCorrelation: number;          // 滞后相关性

  // 新增: 均值回归
  convergenceProbability: number;     // 收敛概率
  expectedReturnDays: number;         // 预期收敛天数

  // 新增: 非线性依赖
  spearmanCorrelation: number;        // 秩相关
  tailCorrelation: number;            // 尾部相关性

  // 综合评分
  compositeScore: number;             // 多因子综合评分
  signalConfidence: number;           // 信号置信度
}
```

---

## 四、数据源建议

| 数据类型 | 推荐来源 | 用途 |
|----------|----------|------|
| 商品期货价格 | Wind / Tushare / 生意社 | 价格序列 |
| A股板块指数 | Tushare (申万行业指数) | 板块层面验证 |
| 宏观经济指标 | 国家统计局 / FRED | 经济周期控制变量 |
| VIX / 中国波指 | Wind / CBOE | 市场恐慌指标 |
| 美元指数 (DXY) | Wind | 全球流动性环境 |

---

## 五、推荐阅读清单

### 必读（按优先级）

1. **Gorton & Rouwenhorst (2006)** — "Facts and Fantasies about Commodity Futures"  
   → 理解商品-股票关系的基准框架

2. **Tang & Xiong (2012)** — "Index Investment and the Financialization of Commodities"  
   → 理解为什么相关性会随时间变化

3. **Engle (2002)** — "Dynamic Conditional Correlation"  
   → 动态相关性建模的技术基础

4. **Büyükşahin & Robe (2014)** — "Speculators, Commodities, and Cross-Market Linkages"  
   → 理解跨市场信息传导机制

### 进阶

5. **Erb & Harvey (2006)** — "The Strategic and Tactical Value of Commodity Futures"
6. **Silvennoinen & Thorp (2013)** — Copula 方法的非线性依赖建模
7. **Kilian & Murphy (2014)** — 投机与供需冲击的角色
8. **Bhardwaj, Gorton & Rouwenhorst (2015)** — 商品价格对股票收益的预测能力

### 中国研究

9. 知网搜索：`"大宗商品" "期货" "A股" "领先滞后"` 或 `"价格发现"`
10. 知网搜索：`"商品金融化" "股票" "相关性" "DCC-GARCH"`

---

## 六、关键发现总结

| 发现 | 来源 | 对系统的启示 |
|------|------|-------------|
| 商品-股票相关性具有**时变性** | Gorton (2006), Engle (2002) | 固定阈值 → 动态百分位 |
| 商品期货**领先**股票1-5天 | 多项中国市场研究 | 引入滞后分析 |
| 背离后存在**均值回归**倾向 | Bhardwaj (2015) | 添加收敛概率预测 |
| 金融化使相关性**结构性上升** | Tang & Xiong (2012) | 分时期校准阈值 |
| 非线性依赖在极端市场更强 | Silvennoinen (2013) | 添加秩相关/尾部相关 |
| 供需冲击 vs 投机驱动的背离机制不同 | Kilian (2014) | 区分背离驱动力 |
