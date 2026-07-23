import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { perguntas, invertidas } from "../data/perguntasCinesiofobia";

// ============================================================
// Helpers internos
// ============================================================

/**
 * Determina o nível de cinesiofobia a partir do score.
 */
function classifyScore(score) {
  if (score <= 36) return "Baixa cinesiofobia";
  if (score <= 52) return "Cinesiofobia moderada";
  return "Alta cinesiofobia";
}

/**
 * Formata uma data ISO 8601 ou objeto Date para o formato dd/mm/aaaa.
 */
function formatDate(dateValue) {
  if (!dateValue) return "Não informada";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return String(dateValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Renderiza cabeçalho padrão do relatório FisioQuest.
 */
function renderHeader(doc, nomePaciente, dataAvaliacao, score, nivel) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 87, 168);
  doc.text("FisioQuest - Relatório Clínico de Cinesiofobia", 15, 20);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Paciente: ${nomePaciente}`, 15, 30);
  doc.text(`Data: ${dataAvaliacao}`, 15, 37);

  doc.setFont("helvetica", "bold");
  doc.text(`Pontuação TSK-17: ${score} de 68`, 15, 47);
  doc.setFont("helvetica", "normal");
  doc.text(`Resultado: ${nivel}`, 15, 54);

  doc.line(15, 60, 195, 60);
}

/**
 * Renderiza a seção de detalhamento das respostas na Escala de Tampa.
 * @param {jsPDF} doc
 * @param {object} respostas - Map<questionIndex (1-based), value>
 */
function renderResponseDetails(doc, respostas) {
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("2. Detalhamento das Respostas (Escala de Tampa):", 15, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  let y = 35;

  perguntas.forEach((texto, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    const linhasPergunta = doc.splitTextToSize(texto, 170);
    doc.text(linhasPergunta, 15, y);
    y += linhasPergunta.length * 6;

    const valorMarcado = respostas[i + 1] || respostas[String(i + 1)] || 1;
    const invertida = invertidas.includes(i + 1);
    const valorCalculado = invertida ? 5 - valorMarcado : valorMarcado;

    const textoResposta = `Resposta: ${valorMarcado} (${invertida ? "invertida → " + valorCalculado : "pontuação direta"})`;

    doc.setFont("helvetica", "normal");
    doc.text(textoResposta, 20, y);
    y += 8;
  });

  doc.setFontSize(10);
  doc.text("Documento gerado pelo sistema FisioQuest - UFPB.", 15, 285);
  doc.text("Página 2 de 2", 100, 285);
}

// ============================================================
// Função legada (compatibilidade com páginas existentes)
// ============================================================

/**
 * @deprecated Use `generateAnonymousPdf` em vez desta função.
 */
export const gerarPDF = async (nome, data, resultado, respostas, containerHtml) => {
  const doc = new jsPDF();
  const nomePaciente = nome || "Não informado";
  const dataAvaliacao = data || "Não informada";

  // CABEÇALHO
  renderHeader(doc, nomePaciente, dataAvaliacao, resultado.score, resultado.nivel);

  // CAPTURA DO MAPA CORPORAL
  doc.setFont("helvetica", "bold");
  doc.text("1. Mapeamento de Áreas de Medo:", 15, 70);

  const secaoMapa = containerHtml.querySelector('.mapa-container-clinico');

  if (secaoMapa) {
    const canvasImg = await html2canvas(secaoMapa, { scale: 2 });
    const imgData = canvasImg.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 15, 75, 110, 130);
  } else {
    doc.setFont("helvetica", "normal");
    doc.text("(Mapa corporal não renderizado na tela no momento)", 15, 85);
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Áreas de cinesiofobia relatadas visualmente.", 15, 215);
  doc.text("Página 1 de 2", 100, 285);

  // DETALHAMENTO DAS RESPOSTAS
  renderResponseDetails(doc, respostas);

  const nomeArquivo = `FisioQuest_Cinesiofobia_${nomePaciente.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);
};

// ============================================================
// Modo anônimo — dados do estado local do formulário
// ============================================================

/**
 * Gera PDF a partir do estado local do formulário (modo anônimo, sem auth).
 *
 * @param {object} formData - { nome, data, respostas, containerHtml }
 *   - nome: string — nome do paciente (ou vazio)
 *   - data: string — data da avaliação (ou vazio)
 *   - respostas: object — { [questionNumber]: value } (1-indexed)
 *   - containerHtml: HTMLElement — elemento DOM para captura do body map
 * @param {object} result - { score, nivel }
 */
export const generateAnonymousPdf = async (formData, result) => {
  const { nome, data, respostas, containerHtml } = formData;
  const doc = new jsPDF();
  const nomePaciente = nome || "Não informado";
  const dataAvaliacao = data || "Não informada";

  // CABEÇALHO
  renderHeader(doc, nomePaciente, dataAvaliacao, result.score, result.nivel);

  // CAPTURA DO MAPA CORPORAL (Página 1)
  doc.setFont("helvetica", "bold");
  doc.text("1. Mapeamento de Áreas de Medo:", 15, 70);

  if (containerHtml) {
    const secaoMapa = containerHtml.querySelector('.mapa-container-clinico');
    if (secaoMapa) {
      const canvasImg = await html2canvas(secaoMapa, { scale: 2 });
      const imgData = canvasImg.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 15, 75, 110, 130);
    } else {
      doc.setFont("helvetica", "normal");
      doc.text("(Mapa corporal não renderizado na tela no momento)", 15, 85);
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.text("(Mapa corporal não disponível)", 15, 85);
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Áreas de cinesiofobia relatadas visualmente.", 15, 215);
  doc.text("Página 1 de 2", 100, 285);

  // DETALHAMENTO DAS RESPOSTAS (Página 2)
  renderResponseDetails(doc, respostas);

  const nomeArquivo = `FisioQuest_Cinesiofobia_${nomePaciente.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);
};

// ============================================================
// Modo autenticado — dados persistidos no backend (API)
// ============================================================

/**
 * Gera PDF a partir dos dados retornados pela API (modo autenticado).
 * Não faz nenhuma chamada ao backend — usa exclusivamente os objetos recebidos.
 *
 * @param {object} questionnaireResponse - Objeto da API:
 *   { id, patientId, questionnaireType, score, appliedAt, responses }
 *   - responses: Map<String, Object> (JSONB) — ex: { "1": 3, "2": 2, ... }
 * @param {object} patientData - { fullName, birthDate }
 */
export const generatePersistedPdf = async (questionnaireResponse, patientData) => {
  const { score, appliedAt, responses } = questionnaireResponse;
  const { fullName, birthDate } = patientData;

  const doc = new jsPDF();
  const nomePaciente = fullName || "Não informado";
  const dataAvaliacao = formatDate(appliedAt);
  const nivel = classifyScore(score);

  // CABEÇALHO
  renderHeader(doc, nomePaciente, dataAvaliacao, score, nivel);

  // INFORMAÇÕES ADICIONAIS DO PACIENTE (Página 1)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. Informações do Paciente:", 15, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nome completo: ${nomePaciente}`, 15, 80);
  doc.text(`Data de nascimento: ${formatDate(birthDate)}`, 15, 87);
  doc.text(`Data da aplicação: ${dataAvaliacao}`, 15, 94);
  doc.text(`Tipo do questionário: ${questionnaireResponse.questionnaireType || "TSK-17"}`, 15, 101);

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Dados obtidos do registro persistido no sistema.", 15, 215);
  doc.text("Página 1 de 2", 100, 285);

  // DETALHAMENTO DAS RESPOSTAS (Página 2)
  renderResponseDetails(doc, responses);

  const nomeArquivo = `FisioQuest_Cinesiofobia_${nomePaciente.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);
};
