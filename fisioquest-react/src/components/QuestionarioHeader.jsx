import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

import logo from "../assets/images/fisioquestbranco.png";

function QuestionarioHeader() {
  return (
    <div className="navbar">
      <Container className="d-flex justify-content-between align-items-center">

        <Link to="/" className="logo">
          <img
            src={logo}
            alt="FisioQuest"
            height="55"
          />
        </Link>

        <Link
          to="/"
          className="btn btn-outline-light"
        >
          ← Início
        </Link>

      </Container>
    </div>
  );
}

export default QuestionarioHeader;