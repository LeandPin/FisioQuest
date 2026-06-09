import Card from "react-bootstrap/Card";

function ResultadoCinesiofobia({ resultado }) {

  if (!resultado) return null;

  return (
    <Card className="mt-4">
      <Card.Body>

        <h4>Resultado da Avaliação</h4>

        <p>
          <strong>Pontuação:</strong>
          {" "}
          {resultado.score}
          /68
        </p>

        <p>
          <strong>Interpretação:</strong>
          {" "}
          {resultado.nivel}
        </p>

      </Card.Body>
    </Card>
  );
}

export default ResultadoCinesiofobia;