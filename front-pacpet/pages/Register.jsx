import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../comedouro-automatico/src/services/auth";
import "../css/Login.css";

export default function Register() {
  const [name, setName] = useState("");
  const [petName, setPetName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      await register({
        name,
        petName,
        email,
        password,
      });

      alert("✅ Cadastro realizado com sucesso!");
      navigate("/login", { replace: true });

    } catch (err) {
      console.error("❌ ERRO NO CADASTRO:", err.message);
      setError(err.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🐾 Criar Conta</h1>
        <p>Cadastre você e seu pet</p>

        <input
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Nome do pet"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <span className="error">{error}</span>}

        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <p
          style={{ marginTop: 12, cursor: "pointer", color: "#6c63ff" }}
          onClick={() => navigate("/login")}
        >
          Já tem conta? Entrar
        </p>
      </div>
    </div>
  );
}
