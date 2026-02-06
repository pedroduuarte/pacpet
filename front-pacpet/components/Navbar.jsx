import React from "react";
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Título clicável que redireciona para o Dashboard */}
      <Link to="/dashboard" className="navbar-logo">
        <h1>PAC-PET</h1>
      </Link>

      <div className="navbar-links">
        {/* Link estilizado como botão */}
        <Link to="/feedings" className="btn-liberacoes">
          Liberações
        </Link>
      </div>
    </nav>
  );
}