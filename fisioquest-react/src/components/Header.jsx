import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/fisioquestbranco.png";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/");
  };

  return (
    <div className="navbar">
      <a href="/" className="logo">
        <img src={logo} alt="FisioQuest Logo" />
      </a>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? "✖" : "☰"}
      </button>

      <div className={`menu ${menuOpen ? "show" : ""}`}>
        <a href="#sobre-o-projeto" onClick={closeMenu}>Sobre o Projeto</a>
        <a href="#nossa-equipe" onClick={closeMenu}>Quem Somos?</a>
        <Link to="/questionarios" onClick={closeMenu}>Questionários</Link>
        <a href="#localizacao" onClick={closeMenu}>Localização</a>
        <a
          href="https://wa.me/558391876157"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          onClick={closeMenu}
        >
          Agende sua Avaliação
        </a>

        {user ? (
          <>
            <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <Link to="/patients" onClick={closeMenu}>Pacientes</Link>
            <button className="cta-button" onClick={handleLogout} style={{ cursor: "pointer" }}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Entrar</Link>
            <Link to="/register" onClick={closeMenu} className="cta-button">Cadastrar</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
