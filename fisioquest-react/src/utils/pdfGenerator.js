import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { perguntas, invertidas } from "../data/perguntasCinesiofobia";

export const gerarPDF = async (nome, data, resultado, respostas, containerHtml) => {
  // Inicializa o PDF
  const doc = new jsPDF();
  const nomePaciente = nome || "Não informado";
  const dataAvaliacao = data || "Não informada";

  // ---------------------------------------------------------
  // CABEÇALHO (Página 1)
  // ---------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 87, 168); // Cor azul FisioQuest
  doc.text("FisioQuest - Relatório Clínico de Cinesiofobia", 15, 20);

  doc.setFontSize(12);
  doc.setTextColor(0); // Preto
  doc.text(`Paciente: ${nomePaciente}`, 15, 30);
  doc.text(`Data: ${dataAvaliacao}`, 15, 37);

  doc.setFont("helvetica", "bold");
  doc.text(`Pontuação TSK-17: ${resultado.score} de 68`, 15, 47);
  doc.setFont("helvetica", "normal");
  doc.text(`Resultado: ${resultado.nivel}`, 15, 54);
  
  // Linha divisória
  doc.line(15, 60, 195, 60);

  // ---------------------------------------------------------
  // CAPTURA DO MAPA CORPORAL
  // ---------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.text("1. Mapeamento de Áreas de Medo:", 15, 70);

  // O React nos passou a div inteira. Vamos procurar apenas a parte do mapa dentro dela
  const secaoMapa = containerHtml.querySelector('.mapa-container');

  if (secaoMapa) {
    // Tira um "screenshot" do componente BodyMap
    const canvasImg = await html2canvas(secaoMapa, { scale: 2 });
    const imgData = canvasImg.toDataURL("image/png");
    
    // Adiciona a imagem no PDF (ajuste a largura/altura conforme necessário)
    doc.addImage(imgData, "PNG", 15, 75, 110, 130);
  } else {
    doc.setFont("helvetica", "normal");
    doc.text("(Mapa corporal não renderizado na tela no momento)", 15, 85);
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Áreas de cinesiofobia relatadas visualmente.", 15, 215);
  doc.text("Página 1 de 2", 100, 285);

  // ---------------------------------------------------------
  // DETALHAMENTO DAS RESPOSTAS (Página 2)
  // ---------------------------------------------------------
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("2. Detalhamento das Respostas (Escala de Tampa):", 15, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  let y = 35; // Posição vertical inicial na página 2

  perguntas.forEach((texto, i) => {
    // Se a página estiver acabando, cria uma nova
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    const linhasPergunta = doc.splitTextToSize(texto, 170);
    doc.text(linhasPergunta, 15, y);
    y += linhasPergunta.length * 6;

    // Calcula se a questão é invertida para exibir no PDF
    const valorMarcado = respostas[i + 1] || 1;
    const invertida = invertidas.includes(i + 1);
    const valorCalculado = invertida ? 5 - valorMarcado : valorMarcado;
    
    const textoResposta = `Resposta: ${valorMarcado} (${invertida ? "invertida → " + valorCalculado : "pontuação direta"})`;

    doc.setFont("helvetica", "normal");
    doc.text(textoResposta, 20, y);
    y += 8; // Espaço para a próxima pergunta
  });

  // Rodapé da última página
  doc.setFontSize(10);
  doc.text("Documento gerado pelo sistema FisioQuest - UFPB.", 15, 285);
  doc.text("Página 2 de 2", 100, 285);

  // ---------------------------------------------------------
  // SALVAR O ARQUIVO
  // ---------------------------------------------------------
  const nomeArquivo = `FisioQuest_Cinesiofobia_${nomePaciente.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);
};