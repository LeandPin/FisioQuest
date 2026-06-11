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
              O <strong>FisioQuest</strong> é uma iniciativa inovadora que combina tecnologia e fisioterapia para oferecer uma nova abordagem na avaliação e acompanhamento de pacientes. Nosso objetivo é utilizar questionários dinâmicos e inteligentes para coletar dados precisos que auxiliem os profissionais a criarem planos de tratamento mais eficazes e personalizados.
            </p>

            <p>
            Acreditamos que a tecnologia pode ser uma grande aliada na reabilitação, otimizando o tempo do fisioterapeuta e proporcionando ao paciente uma jornada de recuperação mais clara e engajadora.
            </p>

          </Col>

        </Row>

      </Container>

    </section>
  );
}

export default AboutSection;