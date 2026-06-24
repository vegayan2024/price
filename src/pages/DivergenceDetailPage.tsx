import { useParams, useNavigate } from "react-router-dom";
import type { AppData } from "../types";
import DivergenceChart from "../components/DivergenceChart";

interface DivergenceDetailPageProps {
  data: AppData;
}

export default function DivergenceDetailPage({ data }: DivergenceDetailPageProps) {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const company = data.companies.find((c) => c.code === code);
  const stockPrices = data.stockPrices[code ?? ""] ?? [];

  if (!company) {
    return (
      <div className="page-error">
        <h2>未找到公司</h2>
        <p>公司代码: {code}</p>
        <button className="c-btn" onClick={() => navigate("/")}>
          返回仪表盘
        </button>
      </div>
    );
  }

  return (
    <div className="page-detail">
      <div className="page-header">
        <button className="c-btn c-btn--ghost" onClick={() => navigate("/")}>
          ← 返回
        </button>
        <h1>{company.name}</h1>
        <p className="text-muted">{company.code}</p>
      </div>

      <div className="detail-sections">
        <section className="detail-section">
          <h2>公司产品与商品价格对比</h2>
          {company.products.map((product) => {
            const commodityPrices = data.commodityPrices[product.commodityKey] ?? [];
            return (
              <div key={product.commodityKey} className="chart-card">
                <h3>{product.productName} vs {product.commodityName}</h3>
                <DivergenceChart
                  stockPrices={stockPrices}
                  commodityPrices={commodityPrices}
                  stockName={company.name}
                  commodityName={product.commodityName}
                />
              </div>
            );
          })}
          {company.products.length === 0 && (
            <p className="text-muted">暂无产品映射数据</p>
          )}
        </section>
      </div>
    </div>
  );
}
