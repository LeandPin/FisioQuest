import { useState } from "react";

import BodyMap from "../components/BodyMap";
import CinesiofobiaForm from "../components/CinesiofobiaForm";
import ResultadoCinesiofobia from "../components/ResultadoCinesiofobia";

import { perguntas, invertidas } from "../data/perguntasCinesiofobia";
import { gerarPDF } from "../utils/pdfGenerator";

function Cinesiofobia() {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);

  const calcularResultado = () => {
    let score = 0;

    perguntas.forEach((_, index) => {
      const valor = respostas[index + 1] || 1;
      const invertida = invertidas.includes(index + 1);
      const valorFinal = invertida ? 5 - valor : valor;
      score += valorFinal;
    });

    let nivel;
    if (score >= 50) nivel = "🔴 Alto Grau de Cinesiofobia";
    else if (score >= 35) nivel = "🟡 Grau Moderado";
    else nivel = "🟢 Baixo Grau";

    setResultado({ score, nivel });
  };

  const submit = (e) => {
    e.preventDefault();
    calcularResultado();
  };

  return (
    <section id="questionarios">
      <h2>Avaliação de Cinesiofobia</h2>
      <p>
        Escala de Tampa (TSK-17) — Para cada afirmação, escolha a opção que
        melhor representa sua opinião atual.
      </p>

      <BodyMap />

      <form onSubmit={submit}>
        <label htmlFor="nomePaciente">Nome do paciente</label>
        <input
          type="text"
          id="nomePaciente"
          required
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label htmlFor="dataAvaliacao">Data da avaliação</label>
        <input
          type="date"
          id="dataAvaliacao"
          required
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <CinesiofobiaForm respostas={respostas} setRespostas={setRespostas} />

        <button type="submit" className="cta-button" style={{ width: "100%", marginTop: "8px" }}>
          Finalizar e Gerar Relatório
        </button>
      </form>

      <ResultadoCinesiofobia resultado={resultado} />

      {resultado && (
        <button
          type="button"
          className="cta-button"
          style={{ width: "100%", marginTop: "10px" }}
          onClick={() => gerarPDF(nome, data, resultado)}
        >
          ⬇ Baixar Relatório (PDF)
        </button>
      )}
    </section>
  );
}

export default Cinesiofobia;