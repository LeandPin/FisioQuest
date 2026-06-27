import { Link } from "react-router-dom";
import logo from "../assets/images/fisioquestbranco.png";

// 1. Adicionamos a prop { mostrarVoltar } entre as chaves
function QuestionarioHeader({ mostrarVoltar }) {
  return (
    <div className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="FisioQuest" height="55" />
      </Link>

      <div className="menu">
        <Link to="/">Início</Link>
        
        {/* 2. O botão só vai aparecer se mostrarVoltar for passado como true */}
        {mostrarVoltar && (
          <Link to="/questionarios">← Voltar</Link>
        )}
      </div>
    </div>
  );
}

export default QuestionarioHeader;