import { Form, Card } from "react-bootstrap";
import { perguntas } from "../data/perguntasCinesiofobia";

function CinesiofobiaForm({
  respostas,
  setRespostas
}) {

  const alterarResposta = (
    indice,
    valor
  ) => {

    setRespostas({
      ...respostas,
      [indice]: Number(valor)
    });
  };

  return (
    <>
      {perguntas.map(
        (pergunta, index) => (

          <Card
            key={index}
            className="mb-3"
          >
            <Card.Body>

              <Form.Label>
                {index + 1}. {pergunta}
              </Form.Label>

              <Form.Select
                value={
                  respostas[index + 1] || 1
                }
                onChange={(e) =>
                  alterarResposta(
                    index + 1,
                    e.target.value
                  )
                }
              >
                <option value="1">
                  Discordo totalmente
                </option>

                <option value="2">
                  Discordo parcialmente
                </option>

                <option value="3">
                  Concordo parcialmente
                </option>

                <option value="4">
                  Concordo totalmente
                </option>

              </Form.Select>

            </Card.Body>
          </Card>
        )
      )}
    </>
  );
}

export default CinesiofobiaForm;