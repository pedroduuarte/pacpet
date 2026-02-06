import React, { useState } from "react";

export default function ManualFeeding() {
  const [weight, setWeight] = useState(100);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const pollStatus = (commandId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/feedings/${commandId}`
        );

        if (!res.ok) {
          throw new Error("Erro ao consultar status");
        }

        const data = await res.json();

        if (data.status === "pending") {
          setMsg("🐾 Alimentando...");
          return;
        }

        if (data.status === "success") {
          setMsg("✅ Ração liberada com sucesso!");
          clearInterval(interval);
          setLoading(false);
        }

        if (data.status === "error") {
          setMsg("❌ Erro ao liberar ração");
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setMsg("❌ Erro ao verificar status da alimentação");
        clearInterval(interval);
        setLoading(false);
      }
    }, 2000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMsg("📡 Enviando comando ao comedouro...");

    try {
      const res = await fetch("http://localhost:3000/api/feedings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weightGrams: weight }),
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar comando");
      }

      const data = await res.json();
      const { commandId } = data;

      // começa o polling
      pollStatus(commandId);

    } catch (err) {
      console.error(err);
      setMsg("❌ Erro ao liberar ração");
      setLoading(false);
    }
  };

  return (
    <div className="manual-feeding">

      <div className="form-area">
        <div className="field">
          <h3>Peso da ração</h3>
          <h2></h2>
          <select
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            disabled={loading}
          >
            <option value={100}>100 gramas</option>
            <option value={150}>150 gramas</option>
            <option value={200}>200 gramas</option>
          </select>
        </div>
      </div>

      <div className="action-area">
        <h2></h2>
        <button
          className="feed-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Liberando..." : "🍖 Liberar ração"}
        </button>
      </div>

      {msg && <p className="message">{msg}</p>}
    </div>
  );
}