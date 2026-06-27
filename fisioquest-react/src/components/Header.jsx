import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/fisioquestbranco.png";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
      </div>
    </div>
  );
}

export default Header;