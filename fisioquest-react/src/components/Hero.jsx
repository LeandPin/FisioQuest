import { Container } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

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

        <Button
          as={Link}
          to="/questionarios"
          className="cta-button"
        >
          Acessar Questionários →
        </Button>

      </Container>

    </section>
  );
}

export default Hero;