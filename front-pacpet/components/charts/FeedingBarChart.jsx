import React from "react";

export default function FeedingsBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p>Sem dados para o gráfico.</p>;
  }

  // exemplo simples sem lib externa (CSS depois)
  const max = Math.max(...data.map(d => d.total));

  return (
    <div className="bar-chart">
      {data.map(item => (
        <div key={item.label} className="bar-item">
          <span>{item.label}</span>
          <div
            className="bar"
            style={{
              width: `${(item.total / max) * 100}%`
            }}
          >
            {item.total}
          </div>
        </div>
      ))}
    </div>
  );
}
