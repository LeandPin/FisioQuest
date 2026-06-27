import { useState, useRef } from "react";
import QuestionarioHeader from "../components/QuestionarioHeader"; 
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

  const relatorioRef = useRef(null);

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
    <>
      <QuestionarioHeader mostrarVoltar={true}/>      
      
      <section id="questionarios">
        <div ref={relatorioRef}>
          <h2>Avaliação de Cinesiofobia</h2>
          <p>
            Escala de Tampa (TSK-17) — Para cada afirmação, escolha a opção que
            melhor representa sua opinião atual.
          </p>

          <BodyMap />

          {/* 👇 TÍTULO EM AZUL ADICIONADO AQUI 👇 */}
          <h3 style={{ fontFamily: "'Sora', sans-serif", color: "var(--primary)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", marginTop: "32px", textAlign: "center" }}>
            2. Escala de Tampa (TSK-17)
          </h3>
          <p style={{ fontSize: "0.9rem", marginBottom: "20px", textAlign: "center" }}>
            Escolha uma das quatro opções para cada afirmação:
          </p>
          {/* 👆 FIM DO TÍTULO 👆 */}

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
        </div>

        {resultado && (
          <button
            type="button"
            className="cta-button"
            style={{ width: "100%", marginTop: "10px" }}
            onClick={() => gerarPDF(nome, data, resultado, respostas, relatorioRef.current)}
          >
            ⬇ Baixar Relatório (PDF)
          </button>
        )}
      </section>
    </>
  );
}

export default Cinesiofobia;