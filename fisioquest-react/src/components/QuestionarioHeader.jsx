import { Link } from "react-router-dom";
import logo from "../assets/images/fisioquestbranco.png";

function QuestionarioHeader() {
  return (
    <div className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="FisioQuest" height="55" />
      </Link>

      <div className="menu">
        <Link to="/">← Início</Link>
      </div>
    </div>
  );
}

export default QuestionarioHeader;