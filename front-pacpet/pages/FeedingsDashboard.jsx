import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import FeedHistory from "../components/FeedHistory";
import Status from "../components/Status";

export default function FeedingsDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/feedings")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading">Carregando dashboard...</p>;

  const totalFeedings = data.length;
  const totalGrams = data.reduce((sum, item) => sum + (item.weightGrams || 0), 0);

  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h2>Dashboard de Alimentações</h2>
          <p>Acompanhe o consumo de ração em tempo real</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Liberações: </span>
            <strong className="stat-value">{totalFeedings}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total de Ração Liberada: </span>
            <strong className="stat-value">{totalGrams.toFixed(0)}<span>g</span></strong>
          </div>
        </section>

        <div className="dashboard-grid">
          <Card title="Histórico">
            <FeedHistory data={data} />
          </Card>
          
          <Card title="Status do Dispositivo">
            <Status />
          </Card>
        </div>
      </main>
    </div>
  );
}