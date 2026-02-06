import React, { useEffect, useState } from "react";

export default function Status() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/feedings")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar status");
        return res.json();
      })
      .then((data) => {
        const totalGrams = data.reduce((sum, item) => {
          return typeof item.weightGrams === "number" ? sum + item.weightGrams : sum;
        }, 0);

        setStats({
          total: data.length,
          totalKg: (totalGrams / 1000).toFixed(2),
        });

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Carregando status...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!stats) return <p>Status indisponível.</p>;

  return (
    <ul className="status-list">
      <li>
        <strong>Total de liberações:</strong> {stats.total}
      </li>
      <li>
        <strong>Total de ração liberada:</strong> {stats.totalKg} kg
      </li>
    </ul>
  );
}