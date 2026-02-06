import React from "react";
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        <h1>PAC-PET</h1>
      </Link>

      <div className="navbar-links">
        <Link to="/feedings" className="btn-liberacoes">
          Liberações
        </Link>
      </div>
    </nav>
  );
}