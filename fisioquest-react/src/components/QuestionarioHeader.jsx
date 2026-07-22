import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/fisioquestbranco.png";

function QuestionarioHeader({ mostrarVoltar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="FisioQuest" height="55" />
      </Link>

      <div className="menu">
        <Link to="/">Início</Link>

        {mostrarVoltar && (
          <Link to="/questionarios">← Voltar</Link>
        )}

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button className="cta-button" onClick={handleLogout} style={{ cursor: "pointer" }}>
              Sair
            </button>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </div>
    </div>
  );
}

export default QuestionarioHeader;
