import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import cinesiofobiaImg from "../assets/images/image.png";
import catastrofizacaoImg from "../assets/images/catastrof.png";

function QuestionarioCards() {
  return (
    <Container className="py-5">

      <div className="text-center mb-5">
        <h2>Selecione um Questionário</h2>

        <p>
          Escolha abaixo qual avaliação deseja responder.
        </p>
      </div>

      <Row className="g-4">

        <Col md={6}>
          <Card className="h-100 shadow">

            <Card.Img
              variant="top"
              src={cinesiofobiaImg}
              alt="Cinesiofobia"
            />

            <Card.Body>
              <Card.Title>
                Cinesiofobia
              </Card.Title>

              <Card.Text>
                Avalia o medo relacionado ao movimento
                e à dor física através da Escala de Tampa.
              </Card.Text>

              <Button
                as={Link}
                to="/cinesiofobia"
              >
                Responder →
              </Button>
            </Card.Body>

          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 shadow">

            <Card.Img
              variant="top"
              src={catastrofizacaoImg}
              alt="Catastrofização"
            />

            <Card.Body>
              <Card.Title>
                Pensamento Catastrófico
              </Card.Title>

              <Card.Text>
                Avalia padrões negativos de pensamento
                relacionados à dor.
              </Card.Text>

              <Button
                as={Link}
                to="/catastrofizacao"
              >
                Responder →
              </Button>
            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>
  );
}

export default QuestionarioCards;