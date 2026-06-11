import diego from "../assets/images/FotoDiego.jpg";
import isaque from "../assets/images/FOTOIsaque.png";

function TeamSection() {
  return (
    <section id="nossa-equipe">
      <div className="container">
        <h2 className="equipe-titulo">Conheça Nossa Equipe</h2>
        <p className="equipe-subtitulo">
          Profissionais dedicados a transformar a fisioterapia através da inovação
        </p>

        <div className="equipe-card-container">
          <div className="equipe-card">
            <img src={diego} alt="Prof. Dr. Diêgo Sales" className="equipe-foto" />
            <h3>Prof. Dr. Diêgo Sales</h3>
            <p>
              Coordenador do projeto, trazendo sua vasta experiência para guiar
              a FisioQuest com excelência e visão acadêmica.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=fisioquest.ufpb@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="equipe-button"
            >
              ✉ Contate-me
            </a>
          </div>

          <div className="equipe-card">
            <img src={isaque} alt="Isaque" className="equipe-foto" />
            <h3>Isaque</h3>
            <p>
              Aluno pesquisador, aplicando novas tecnologias e a energia da nova
              geração da fisioterapia ao projeto.
            </p>
            <a
              href="https://wa.me/558391876157"
              target="_blank"
              rel="noopener noreferrer"
              className="equipe-button"
            >
              💬 Contate-me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TeamSection;