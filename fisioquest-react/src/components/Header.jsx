import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/fisioquestbranco.png";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="FisioQuest Logo" />
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? "✖" : "☰"}
      </button>

      <div className={`menu ${menuOpen ? "show" : ""}`}>
        {isHomePage && (
          <>
            <a href="#sobre-o-projeto" onClick={closeMenu}>Sobre o Projeto</a>
            <a href="#nossa-equipe" onClick={closeMenu}>Quem Somos?</a>
            <a href="#localizacao" onClick={closeMenu}>Localização</a>
          </>
        )}
        <Link to="/questionarios" onClick={closeMenu}>Questionários</Link>
        {!user && (
          <a
            href="https://wa.me/558391876157"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            Agende sua Avaliação
          </a>
        )}

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
            <Link to="/login" onClick={closeMenu} className="cta-button">Entre ou cadastre-se</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
