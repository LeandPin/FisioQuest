import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <h1>
        Fisioterapia com <span>tecnologia</span>
        <br />e precisão
      </h1>

      <p>
        Questionários clínicos inteligentes para uma avaliação mais eficaz,
        personalizada e engajadora do seu paciente.
      </p>

      <Link to="/questionarios" className="cta-button">
        Acessar Questionários →
      </Link>
    </section>
  );
}

export default Hero;