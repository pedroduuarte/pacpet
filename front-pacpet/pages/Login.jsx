import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom"; 
import { login } from "../comedouro-automatico/src/services/auth";
import "../css/Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await login(email, senha);

      console.log("✅ LOGIN OK NO FRONT:", data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin?.(data.user); 

      navigate("/dashboard") 

    } catch (err) {
      console.error("❌ ERRO NO LOGIN:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🥠 Comedouro Automático</h1>
        <p>Cuide do seu pet de forma inteligente</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {error && <span className="error">{error}</span>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p
          style={{ marginTop: 12, cursor: "pointer", color: "#6c63ff" }}
          onClick={() => navigate("/register")}
        >
          Não tem conta? Cadastre-se
        </p>

      </div>
    </div>
  );
}
