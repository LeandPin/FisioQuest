import {
  Container,
  Row,
  Col,
  Card,
  Button
} from "react-bootstrap";

import diego from "../assets/images/FotoDiego.jpg";
import isaque from "../assets/images/FOTOIsaque.png";

function TeamSection() {
  return (
    <section id="nossa-equipe">

      <Container>

        <h2 className="equipe-titulo">
          Conheça Nossa Equipe
        </h2>

        <p className="equipe-subtitulo">
          Profissionais dedicados a transformar a
          fisioterapia através da inovação
        </p>

        <Row className="g-4 justify-content-center">

          <Col md={6} lg={5}>

            <Card className="equipe-card h-100">

              <Card.Img
                variant="top"
                src={diego}
                className="equipe-foto"
              />

              <Card.Body>

                <Card.Title>
                  Prof. Dr. Diêgo Sales
                </Card.Title>

                <Card.Text>
                  Coordenador do projeto, trazendo sua
                  vasta experiência para guiar a
                  FisioQuest com excelência e visão
                  acadêmica.
                </Card.Text>

                <Button
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=fisioquest.ufpb@gmail.com"
                  target="_blank"
                  className="equipe-button"
                >
                  ✉ Contate-me
                </Button>

              </Card.Body>

            </Card>

          </Col>

          <Col md={6} lg={5}>

            <Card className="equipe-card h-100">

              <Card.Img
                variant="top"
                src={isaque}
                className="equipe-foto"
              />

              <Card.Body>

                <Card.Title>
                  Isaque
                </Card.Title>

                <Card.Text>
                  Aluno pesquisador, aplicando novas
                  tecnologias e a energia da nova
                  geração da fisioterapia ao projeto.
                </Card.Text>

                <Button
                  href="https://wa.me/558391876157"
                  target="_blank"
                  className="equipe-button"
                >
                  💬 Contate-me
                </Button>

              </Card.Body>

            </Card>

          </Col>

        </Row>

      </Container>

    </section>
  );
}

export default TeamSection;