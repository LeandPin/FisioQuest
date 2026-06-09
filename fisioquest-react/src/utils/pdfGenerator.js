import jsPDF from "jspdf";

export function gerarPDF(
  nome,
  data,
  resultado
) {

  const doc = new jsPDF();

  doc.text(
    "Relatório de Cinesiofobia",
    20,
    20
  );

  doc.text(
    `Paciente: ${nome}`,
    20,
    40
  );

  doc.text(
    `Data: ${data}`,
    20,
    50
  );

  doc.text(
    `Pontuação: ${resultado.score}`,
    20,
    60
  );

  doc.save("relatorio.pdf");
}