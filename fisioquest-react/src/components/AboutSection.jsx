import {
  Container,
  Row,
  Col
} from "react-bootstrap";

function AboutSection() {
  return (
    <section id="sobre-o-projeto">

      <Container>

        <Row>

          <Col lg={8} className="mx-auto">

            <h2>Sobre o Projeto</h2>

            <p>
              O FisioQuest é uma iniciativa inovadora...
            </p>

            <p>
              Acreditamos que a tecnologia...
            </p>

          </Col>

        </Row>

      </Container>

    </section>
  );
}

export default AboutSection;