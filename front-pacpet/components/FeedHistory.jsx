import React, { useEffect, useState } from "react";

export default function FeedHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/feedings")
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar histórico");
        return res.json();
      })
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Carregando histórico...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (history.length === 0) {
    return <p>Nenhuma liberação registrada.</p>;
  }

  return (
    <ul className="history-list">
      {history.map(item => {
        const time = item.createdAt
          ? new Date(item.createdAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--";

        const typeLabel = item.type
          ? item.type.toUpperCase()
          : "DESCONHECIDO";

        const openTimeSeconds =
          typeof item.openTimeMs === "number"
            ? Math.round(item.openTimeMs / 1000)
            : "?";

        const amountGrams =
          typeof item.weightGrams === "number"
            ? `${item.weightGrams.toFixed(2)} g`
            : "? g";

        return (
          <li key={item._id}>
            <strong>{time}</strong> — {typeLabel} • {amountGrams} • ({openTimeSeconds}s)
          </li>
        );
      })}
    </ul>
  );
}