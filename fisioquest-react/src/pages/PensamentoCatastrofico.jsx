import { useState, useRef, useEffect } from "react";
import QuestionarioHeader from "../components/QuestionarioHeader";
import PatientSelector from "./PatientSelector";
import { jsPDF } from "jspdf";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../services/apiClient";

const perguntasCatas = [
  "1. A preocupação durante todo o tempo com a duração da dor",
  "2. O sentimento de não poder prosseguir (continuar)",
  "3. O sentimento que a dor é terrível e que não vai melhorar",
  "4. O sentimento que a dor é horrível e que você não vai resistir",
  "5. O pensamento de não poder estar mais com alguém",
  "6. O medo que a dor pode se tornar ainda pior",
  "7. O pensamento sobre outros episódios de dor",
  "8. O desejo profundo que a dor desapareça",
  "9. O sentimento de não conseguir tirar a dor do pensamento",
  "10. O pensamento que ainda poderá doer mais",
  "11. O pensamento que a dor é grave porque ela não quer parar",
  "12. O pensamento de que não há nada para fazer para diminuir a dor",
  "13. A preocupação que alguma coisa ruim pode acontecer",
];

const subescalas = {
  ruminacao: [0, 1, 2, 7, 8, 9, 10],
  magnificacao: [5, 6, 12],
  desamparo: [3, 4, 11],
};

const opcoes = ["Mínima", "Leve", "Moderada", "Intensa", "Muito intensa"];

/**
 * Computes subdomain scores from a responses map (keys 0-12, numeric values).
 */
function computeSubdomains(respostasMap) {
  let scoreTotal = 0;
  const scoresDominios = { ruminacao: 0, magnificacao: 0, desamparo: 0 };
  const respostasRaw = [];

  perguntasCatas.forEach((_, i) => {
    const val = respostasMap[i] || respostasMap[String(i)] || 0;
    const numVal = typeof val === "number" ? val : parseInt(val, 10) || 0;
    scoreTotal += numVal;
    respostasRaw.push(numVal);

    if (subescalas.ruminacao.includes(i)) scoresDominios.ruminacao += numVal;
    if (subescalas.magnificacao.includes(i)) scoresDominios.magnificacao += numVal;
    if (subescalas.desamparo.includes(i)) scoresDominios.desamparo += numVal;
  });

  return {
    total: scoreTotal,
    dominios: scoresDominios,
    respostasRaw,
    clinico: scoreTotal >= 30,
  };
}

function PensamentoCatastrofico() {
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

  const canvasRef = useRef(null);

  // Draws radar chart whenever resultado changes
  useEffect(() => {
    if (resultado && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const dominios = resultado.dominios;
      const centro = 150;
      const raioMax = 100;

      ctx.clearRect(0, 0, 300, 300);

      ctx.strokeStyle = "#dce8f5";
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(centro, centro, (raioMax / 4) * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      const p1 = { x: centro, y: centro - (dominios.ruminacao / 28) * raioMax };
      const p2 = {
        x: centro + (dominios.magnificacao / 12) * raioMax * Math.cos((30 * Math.PI) / 180),
        y: centro + (dominios.magnificacao / 12) * raioMax * Math.sin((30 * Math.PI) / 180),
      };
      const p3 = {
        x: centro - (dominios.desamparo / 12) * raioMax * Math.cos((30 * Math.PI) / 180),
        y: centro + (dominios.desamparo / 12) * raioMax * Math.sin((30 * Math.PI) / 180),
      };

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 87, 168, 0.18)";
      ctx.fill();
      ctx.strokeStyle = "#0057a8";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#0057a8";
      ctx.font = "bold 12px 'DM Sans', sans-serif";
      ctx.fillText("Ruminação", centro - 32, centro - 112);
      ctx.fillText("Magnificação", centro + 60, centro + 72);
      ctx.fillText("Desamparo", centro - 118, centro + 72);

      setTimeout(() => {
        canvas.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [resultado]);

  // Authenticated mode submission
  const submitAuthenticated = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Convert numeric keys to string keys for the API
      const responsesPayload = {};
      perguntasCatas.forEach((_, i) => {
        responsesPayload[String(i)] = respostas[i] || 0;
      });

      const payload = {
        patientId: selectedPatient.id,
        questionnaireType: "PCS",
        responses: responsesPayload,
      };

      const { data: responseData } = await apiClient.post(
        "/api/questionnaire-responses",
        payload
      );

      setApiResponse(responseData);

      // Compute subdomain scores locally for the radar chart display
      const subdomainResult = computeSubdomains(respostas);
      // Use the score from the API response (backend is source of truth)
      setResultado({
        total: responseData.score != null ? responseData.score : subdomainResult.total,
        dominios: subdomainResult.dominios,
        respostasRaw: subdomainResult.respostasRaw,
        clinico: (responseData.score != null ? responseData.score : subdomainResult.total) >= 30,
      });
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

  // Anonymous mode submission (local calc, same as original)
  const submitAnonymous = (e) => {
    e.preventDefault();
    const result = computeSubdomains(respostas);
    setResultado(result);
  };

  const handleSubmit = isAuthenticated ? submitAuthenticated : submitAnonymous;

  // PDF generation for authenticated mode (PCS-specific)
  const generatePersistedPcsPdf = () => {
    if (!resultado || !apiResponse || !selectedPatient) return;

    const doc = new jsPDF();
    const nomePaciente = selectedPatient.fullName || "Não informado";
    const dataAvaliacao = apiResponse.appliedAt
      ? new Date(apiResponse.appliedAt).toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR");
    const { total, dominios, respostasRaw } = resultado;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 87, 168);
    doc.text("FisioQuest - Relatório de Catastrofização", 15, 20);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Paciente: ${nomePaciente}`, 15, 30);
    doc.text(`Data: ${dataAvaliacao}`, 15, 37);
    doc.text(`Pontuação Total: ${total} / 52`, 15, 47);
    doc.line(15, 52, 195, 52);
    doc.text("Distribuição por Domínios Psicológicos:", 15, 62);

    const canvasImg = canvasRef.current.toDataURL("image/png");
    doc.addImage(canvasImg, "PNG", 50, 70, 100, 100);

    doc.setFontSize(10);
    doc.text(`• Ruminação: ${dominios.ruminacao} pts (Foco repetitivo na dor)`, 15, 180);
    doc.text(`• Magnificação: ${dominios.magnificacao} pts (Superestimação da gravidade)`, 15, 187);
    doc.text(`• Desamparo: ${dominios.desamparo} pts (Sensação de incapacidade de controle)`, 15, 194);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Dados obtidos do registro persistido no sistema.", 15, 215);
    doc.text("Página 1 de 2", 100, 285);

    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Detalhamento das Respostas:", 15, 20);

    let y = 35;
    perguntasCatas.forEach((texto, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${texto}`, 15, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.text(`→ Resposta: ${respostasRaw[i]} (${opcoes[respostasRaw[i]]})`, 20, y);
      y += 10;
    });

    doc.text("Página 2 de 2", 100, 285);
    doc.save(`Catastrofizacao_${nomePaciente.replace(/\s+/g, "_")}.pdf`);
  };

  // PDF generation for anonymous mode (original logic)
  const baixarPDFAnonimo = () => {
    if (!resultado) return;

    const doc = new jsPDF();
    const nomePaciente = nome || "Não informado";
    const dataAvaliacao = data || "Não informada";
    const { total, dominios, respostasRaw } = resultado;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 87, 168);
    doc.text("FisioQuest - Relatório de Catastrofização", 15, 20);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Paciente: ${nomePaciente}`, 15, 30);
    doc.text(`Data: ${dataAvaliacao}`, 15, 37);
    doc.text(`Pontuação Total: ${total} / 52`, 15, 47);
    doc.line(15, 52, 195, 52);
    doc.text("Distribuição por Domínios Psicológicos:", 15, 62);

    const canvasImg = canvasRef.current.toDataURL("image/png");
    doc.addImage(canvasImg, "PNG", 50, 70, 100, 100);

    doc.setFontSize(10);
    doc.text(`• Ruminação: ${dominios.ruminacao} pts (Foco repetitivo na dor)`, 15, 180);
    doc.text(`• Magnificação: ${dominios.magnificacao} pts (Superestimação da gravidade)`, 15, 187);
    doc.text(`• Desamparo: ${dominios.desamparo} pts (Sensação de incapacidade de controle)`, 15, 194);
    doc.text("Página 1 de 2", 100, 285);

    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Detalhamento das Respostas:", 15, 20);

    let y = 35;
    perguntasCatas.forEach((texto, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${texto}`, 15, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.text(`→ Resposta: ${respostasRaw[i]} (${opcoes[respostasRaw[i]]})`, 20, y);
      y += 10;
    });

    doc.text("Página 2 de 2", 100, 285);
    doc.save(`Catastrofizacao_${nomePaciente.replace(/\s+/g, "_")}.pdf`);
  };

  // PDF handler dispatcher
  const handleDownloadPdf = () => {
    if (isAuthenticated) {
      generatePersistedPcsPdf();
    } else {
      baixarPDFAnonimo();
    }
  };

  // Authenticated mode: show patient selection step first
  if (isAuthenticated && !selectedPatient) {
    return (
      <>
        <QuestionarioHeader mostrarVoltar={true} />
        <section id="questionario-catastrófico">
          <h2>Pensamento Catastrófico</h2>
          <p>Selecione o paciente para iniciar a avaliação:</p>
          <PatientSelector onPatientSelected={setSelectedPatient} />
        </section>
      </>
    );
  }

  return (
    <>
      <QuestionarioHeader mostrarVoltar={true} />

      <section id="questionario-catastrófico">
        <h2>Pensamento Catastrófico</h2>
        <p>
          Indique o grau destes pensamentos quando está com dor:<br />
          <strong>0 = mínima &nbsp;|&nbsp; 1 = leve &nbsp;|&nbsp; 2 = moderada &nbsp;|&nbsp; 3 = intensa &nbsp;|&nbsp; 4 = muito intensa</strong>
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

          <div>
            {perguntasCatas.map((texto, index) => (
              <div className="form-group" key={index}>
                <label>{texto}</label>
                <select
                  style={{ marginTop: "8px" }}
                  value={respostas[index] || 0}
                  onChange={(e) =>
                    setRespostas({ ...respostas, [index]: parseInt(e.target.value) })
                  }
                >
                  {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} — {opcoes[num]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="cta-button"
            style={{ width: "100%", marginTop: "16px" }}
            disabled={submitting}
          >
            {submitting ? "Enviando..." : "Finalizar Avaliação"}
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

        {/* Result block */}
        {resultado && (
          <div className="resumo-clinico" style={{ marginTop: "30px" }}>
            <h3>Resumo da Avaliação</h3>

            <div
              style={{
                marginBottom: "16px",
                padding: "16px",
                borderRadius: "10px",
                background: resultado.clinico ? "#fee2e2" : "#dcfce7",
                border: `2px solid ${resultado.clinico ? "#ef4444" : "#22c55e"}`,
              }}
            >
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  marginBottom: "4px",
                  color: "#1a2332",
                }}
              >
                {resultado.clinico ? "⚠️ Clinicamente Significativo" : "✅ Nível Normal"}
              </div>
              <div style={{ color: "#1a2332" }}>
                <strong>Score Total:</strong> {resultado.total} / 52
              </div>
            </div>

            <div style={{ fontSize: "0.95rem", color: "#5e6e89", textAlign: "center" }}>
              <strong>Domínios:</strong> Ruminação ({resultado.dominios.ruminacao}) · Magnificação ({resultado.dominios.magnificacao}) · Desamparo ({resultado.dominios.desamparo})
            </div>

            <div className="canvas-container">
              <canvas ref={canvasRef} width="300" height="300"></canvas>
            </div>

            <button
              type="button"
              className="cta-button"
              style={{ width: "100%", marginTop: "10px" }}
              onClick={handleDownloadPdf}
            >
              ⬇ Baixar Relatório Detalhado (PDF)
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default PensamentoCatastrofico;
