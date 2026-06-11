function LocationSection() {
  return (
    <section id="localizacao" className="card">
      <div className="localizacao-content">
        <div className="localizacao-info">
          <h2>Nossa Localização</h2>

          <p className="subtitle">
            Estamos no coração da inovação em saúde. Venha nos visitar!
          </p>

          <ul className="contato-lista">
            <li>
              <strong>📍 Endereço:</strong>
              <p>
                Universidade Federal da Paraíba — Campus I, Cidade
                Universitária, João Pessoa - PB, 58051-900
              </p>
            </li>
            <li>
              <strong>📞 Telefone:</strong>
              <p>+55 (83) 98187-6157</p>
            </li>
            <li>
              <strong>✉️ E-mail:</strong>
              <p>fisioquest.ufpb@gmail.com</p>
            </li>
          </ul>

          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Centro+de+Ciencias+da+Saude+-+CCS/UFPB"
            target="_blank"
            rel="noopener noreferrer"
            className="rota-button"
          >
            🗺 Traçar Rota
          </a>
        </div>

        <div className="mapa-container">
          <iframe
            title="Mapa UFPB"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.915606696653!2d-34.84423432409091!3d-7.135757669992652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7acc2b826a47b49%3A0xa250151a76ae7831!2sCentro%20de%20Ci%C3%AAncias%20da%20Sa%C3%BAde%20-%20CCS%20%2F%20UFPB!5e0!3m2!1spt-PT!2sbr!4v1738719096237!5m2!1spt-PT!2sbr"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

export default LocationSection;