import React, { useState } from "react";

export default function FeedButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFeed = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/feedings/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          openTimeMs: 3000 // 3 segundos (exemplo)
        })
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar comando");
      }

      alert("Comando enviado ao comedouro 🐾");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleFeed} disabled={loading}>
        {loading ? "Liberando..." : "Liberar ração"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
}
