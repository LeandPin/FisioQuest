import { useState } from "react";

import {
  Container,
  Form,
  Button
} from "react-bootstrap";

import BodyMap from "../components/BodyMap";
import CinesiofobiaForm from "../components/CinesiofobiaForm";
import ResultadoCinesiofobia from "../components/ResultadoCinesiofobia";

import {
  perguntas,
  invertidas
} from "../data/perguntasCinesiofobia";

import { gerarPDF }
from "../utils/pdfGenerator";

function Cinesiofobia() {

  const [nome, setNome] =
    useState("");

  const [data, setData] =
    useState("");

  const [respostas,
         setRespostas] =
    useState({});

  const [resultado,
         setResultado] =
    useState(null);

  const calcularResultado =
    () => {

      let score = 0;

      perguntas.forEach(
        (_, index) => {

          const valor =
            respostas[index + 1] || 1;

          const invertida =
            invertidas.includes(
              index + 1
            );

          const valorFinal =
            invertida
              ? 5 - valor
              : valor;

          score += valorFinal;
        }
      );

      let nivel;

      if (score >= 50)
        nivel =
          "Alto Grau de Cinesiofobia";

      else if (score >= 35)
        nivel =
          "Grau Moderado";

      else
        nivel =
          "Baixo Grau";

      setResultado({
        score,
        nivel
      });
    };

  const submit = (e) => {

    e.preventDefault();

    calcularResultado();
  };

  return (
    <Container
      className="mt-5 mb-5"
    >

      <h2>
        Avaliação de Cinesiofobia
      </h2>

      <BodyMap />

      <Form
        onSubmit={submit}
      >

        <Form.Group
          className="mb-3"
        >

          <Form.Label>
            Nome do Paciente
          </Form.Label>

          <Form.Control
            value={nome}
            onChange={(e) =>
              setNome(
                e.target.value
              )
            }
          />

        </Form.Group>

        <Form.Group
          className="mb-3"
        >

          <Form.Label>
            Data
          </Form.Label>

          <Form.Control
            type="date"
            value={data}
            onChange={(e) =>
              setData(
                e.target.value
              )
            }
          />

        </Form.Group>

        <CinesiofobiaForm
          respostas={respostas}
          setRespostas={
            setRespostas
          }
        />

        <Button
          type="submit"
          className="w-100"
        >
          Finalizar Avaliação
        </Button>

      </Form>

      <ResultadoCinesiofobia
        resultado={resultado}
      />

      {resultado && (

        <Button
          className="mt-3"
          onClick={() =>
            gerarPDF(
              nome,
              data,
              resultado
            )
          }
        >
          Baixar PDF
        </Button>

      )}

    </Container>
  );
}

export default Cinesiofobia;