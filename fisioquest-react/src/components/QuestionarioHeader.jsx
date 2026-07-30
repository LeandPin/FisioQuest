import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/fisioquestbranco.png";

function QuestionarioHeader({ mostrarVoltar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="FisioQuest" height="55" />
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? "✖" : "☰"}
      </button>

      <div className={`menu ${menuOpen ? "show" : ""}`}>
        {user ? (
          <>
            <Link to="/questionarios" onClick={closeMenu}>Questionários</Link>
            {mostrarVoltar && (
              <Link to="/questionarios" onClick={closeMenu}>← Voltar</Link>
            )}
            <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <Link to="/patients" onClick={closeMenu}>Pacientes</Link>
            <button className="cta-button" onClick={handleLogout} style={{ cursor: "pointer" }}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/" onClick={closeMenu}>Início</Link>
            {mostrarVoltar && (
              <Link to="/questionarios" onClick={closeMenu}>← Voltar</Link>
            )}
            <Link to="/login" onClick={closeMenu}>Entrar</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default QuestionarioHeader;
