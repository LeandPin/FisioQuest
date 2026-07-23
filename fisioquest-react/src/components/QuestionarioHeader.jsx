import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/fisioquestbranco.png";

function QuestionarioHeader({ mostrarVoltar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="FisioQuest" height="55" />
      </Link>

      <div className="menu">
        {user ? (
          <>
            <Link to="/questionarios">Questionários</Link>
            {mostrarVoltar && (
              <Link to="/questionarios">← Voltar</Link>
            )}
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/patients">Pacientes</Link>
            <button className="cta-button" onClick={handleLogout} style={{ cursor: "pointer" }}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/">Início</Link>
            {mostrarVoltar && (
              <Link to="/questionarios">← Voltar</Link>
            )}
            <Link to="/login">Entrar</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default QuestionarioHeader;
