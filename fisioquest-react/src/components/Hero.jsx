import { Container } from "react-bootstrap";

function Hero() {
  return (
    <section className="hero">

      <Container>

        <h1>
          Fisioterapia com
          <span> tecnologia </span>
          <br />
          e precisão
        </h1>

        <p>
          Questionários clínicos inteligentes para uma
          avaliação mais eficaz, personalizada e
          engajadora do seu paciente.
        </p>

        <a
          href="#"
          className="cta-button"
        >
          Acessar Questionários →
        </a>

      </Container>

    </section>
  );
}

export default Hero;