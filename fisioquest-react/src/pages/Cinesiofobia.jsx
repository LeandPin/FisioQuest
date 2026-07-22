import { useState, useRef } from "react";
import QuestionarioHeader from "../components/QuestionarioHeader";
import BodyMap from "../components/BodyMap";
import CinesiofobiaForm from "../components/CinesiofobiaForm";
import ResultadoCinesiofobia from "../components/ResultadoCinesiofobia";
import PatientSelector from "./PatientSelector";

import { perguntas, invertidas } from "../data/perguntasCinesiofobia";
import { generateAnonymousPdf, generatePersistedPdf } from "../utils/pdfGenerator";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../services/apiClient";

function Cinesiofobia() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Shared state
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Authenticated mode state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  // Anonymous mode state
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");

  const relatorioRef = useRef(null);

  // Local score calculation (anonymous mode)
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

  // Authenticated mode submission
  const submitAuthenticated = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        patientId: selectedPatient.id,
        questionnaireType: "TSK",
        responses: respostas,
      };

      const { data: responseData } = await apiClient.post(
        "/api/questionnaire-responses",
        payload
      );

      setApiResponse(responseData);

      // Derive nivel from API score for display
      let nivel;
      if (responseData.score >= 50) nivel = "🔴 Alto Grau de Cinesiofobia";
      else if (responseData.score >= 35) nivel = "🟡 Grau Moderado";
      else nivel = "🟢 Baixo Grau";

      setResultado({ score: responseData.score, nivel });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao salvar respostas. Tente novamente.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Anonymous mode submission
  const submitAnonymous = (e) => {
    e.preventDefault();
    calcularResultado();
  };

  const handleSubmit = isAuthenticated ? submitAuthenticated : submitAnonymous;

  // PDF handlers
  const handleDownloadPdf = () => {
    if (isAuthenticated && apiResponse && selectedPatient) {
      // Merge local respostas into apiResponse since the DTO doesn't include them
      const responseWithData = { ...apiResponse, responses: respostas };
      generatePersistedPdf(responseWithData, selectedPatient);
    } else if (!isAuthenticated && resultado) {
      generateAnonymousPdf(
        { nome, data, respostas, containerHtml: relatorioRef.current },
        resultado
      );
    }
  };

  // Authenticated mode: patient selection step
  if (isAuthenticated && !selectedPatient) {
    return (
      <>
        <QuestionarioHeader mostrarVoltar={true} />
        <section id="questionarios">
          <h2>Avaliação de Cinesiofobia</h2>
          <p>Selecione o paciente para iniciar a avaliação:</p>
          <PatientSelector onPatientSelected={setSelectedPatient} />
        </section>
      </>
    );
  }

  return (
    <>
      <QuestionarioHeader mostrarVoltar={true} />

      <section id="questionarios">
        <div ref={relatorioRef}>
          <h2>Avaliação de Cinesiofobia</h2>
          <p>
            Escala de Tampa (TSK-17) — Para cada afirmação, escolha a opção que
            melhor representa sua opinião atual.
          </p>

          {/* Anonymous mode warning */}
          {!isAuthenticated && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                marginBottom: "20px",
                fontSize: "0.9rem",
                color: "#92400e",
              }}
            >
              ⚠️ Você está no modo anônimo. As respostas não serão salvas. Faça
              login para persistir dados.
            </div>
          )}

          {/* Authenticated mode: show selected patient info */}
          {isAuthenticated && selectedPatient && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#ecfdf5",
                border: "1px solid #10b981",
                marginBottom: "20px",
                fontSize: "0.9rem",
                color: "#065f46",
              }}
            >
              <strong>Paciente:</strong> {selectedPatient.fullName}
            </div>
          )}

          <BodyMap />

          <h3
            style={{
              fontFamily: "'Sora', sans-serif",
              color: "var(--primary)",
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: "8px",
              marginTop: "32px",
              textAlign: "center",
            }}
          >
            2. Escala de Tampa (TSK-17)
          </h3>
          <p
            style={{
              fontSize: "0.9rem",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Escolha uma das quatro opções para cada afirmação:
          </p>

          <form onSubmit={handleSubmit}>
            {/* Nome and Data fields only in anonymous mode */}
            {!isAuthenticated && (
              <>
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
              </>
            )}

            <CinesiofobiaForm
              respostas={respostas}
              setRespostas={setRespostas}
            />

            <button
              type="submit"
              className="cta-button"
              style={{ width: "100%", marginTop: "8px" }}
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Finalizar e Gerar Relatório"}
            </button>
          </form>

          {/* Error display */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fee2e2",
                border: "1px solid #ef4444",
                marginTop: "16px",
                fontSize: "0.9rem",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          <ResultadoCinesiofobia resultado={resultado} />
        </div>

        {resultado && (
          <button
            type="button"
            className="cta-button"
            style={{ width: "100%", marginTop: "10px" }}
            onClick={handleDownloadPdf}
          >
            ⬇ Baixar Relatório (PDF)
          </button>
        )}
      </section>
    </>
  );
}

export default Cinesiofobia;
