import { Link } from "react-router-dom";

import cinesiofobiaImg from "../assets/images/image.png";
import catastrofizacaoImg from "../assets/images/catastrof.png";

function QuestionarioCards() {
  return (
    <>
      <section
        id="questionarios"
        style={{
          textAlign: "center",
          marginBottom: 0,
          background: "transparent",
          boxShadow: "none",
          border: "none",
          maxWidth: "100%",
          padding: "60px 20px 0",
        }}
      >
        <h2 style={{ fontSize: "2.2rem" }}>Selecione um Questionário</h2>
        <p style={{ fontSize: "1.05rem", maxWidth: "540px", margin: "0 auto" }}>
          Escolha abaixo qual avaliação deseja responder. Cada questionário foi
          desenvolvido para uma análise clínica específica.
        </p>
      </section>

      <div className="card-container">
        <div className="card">
          <img src={cinesiofobiaImg} alt="Cinesiofobia" />
          <h3>Cinesiofobia</h3>
          <p>
            Avalia o medo relacionado ao movimento e dor física — Escala de
            Tampa (TSK-17).
          </p>
          <Link to="/cinesiofobia">Responder →</Link>
        </div>

        <div className="card">
          <img src={catastrofizacaoImg} alt="Pensamento Catastrófico" />
          <h3>Pensamento Catastrófico</h3>
          <p>
            Identifica padrões negativos de pensamento durante episódios de dor
            — PCS.
          </p>
          <Link to="/pensamento-catastrofico">Responder →</Link>
        </div>
      </div>
    </>
  );
}

export default QuestionarioCards;