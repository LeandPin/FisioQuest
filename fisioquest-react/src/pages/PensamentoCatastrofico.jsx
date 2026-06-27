import { useState, useRef, useEffect } from "react";
import QuestionarioHeader from "../components/QuestionarioHeader";
import { jsPDF } from "jspdf";

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

function PensamentoCatastrofico() {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);

  const canvasRef = useRef(null);

  // Calcula os resultados ao submeter o formulário
  const calcularResultado = (e) => {
    e.preventDefault();

    let scoreTotal = 0;
    let scoresDominios = { ruminacao: 0, magnificacao: 0, desamparo: 0 };
    let respostasRaw = [];

    perguntasCatas.forEach((_, i) => {
      // Se não respondeu, assume 0 (Mínima)
      const val = respostas[i] || 0;
      scoreTotal += val;
      respostasRaw.push(val);

      if (subescalas.ruminacao.includes(i)) scoresDominios.ruminacao += val;
      if (subescalas.magnificacao.includes(i)) scoresDominios.magnificacao += val;
      if (subescalas.desamparo.includes(i)) scoresDominios.desamparo += val;
    });

    setResultado({
      total: scoreTotal,
      dominios: scoresDominios,
      respostasRaw: respostasRaw,
      clinico: scoreTotal >= 30,
    });
  };

  // Efeito para desenhar o gráfico no Canvas sempre que o resultado for atualizado
  useEffect(() => {
    if (resultado && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const dominios = resultado.dominios;
      const centro = 150;
      const raioMax = 100;

      // Limpa o canvas antes de desenhar
      ctx.clearRect(0, 0, 300, 300);

      // Desenha os círculos de fundo
      ctx.strokeStyle = "#dce8f5";
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(centro, centro, (raioMax / 4) * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Calcula os pontos do triângulo (Radar)
      const p1 = { x: centro, y: centro - (dominios.ruminacao / 28) * raioMax };
      const p2 = {
        x: centro + (dominios.magnificacao / 12) * raioMax * Math.cos((30 * Math.PI) / 180),
        y: centro + (dominios.magnificacao / 12) * raioMax * Math.sin((30 * Math.PI) / 180),
      };
      const p3 = {
        x: centro - (dominios.desamparo / 12) * raioMax * Math.cos((30 * Math.PI) / 180),
        y: centro + (dominios.desamparo / 12) * raioMax * Math.sin((30 * Math.PI) / 180),
      };

      // Desenha o triângulo preenchido
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

      // Textos das pontas
      ctx.fillStyle = "#0057a8";
      ctx.font = "bold 12px 'DM Sans', sans-serif";
      ctx.fillText("Ruminação", centro - 32, centro - 112);
      ctx.fillText("Magnificação", centro + 60, centro + 72);
      ctx.fillText("Desamparo", centro - 118, centro + 72);
      
      // Rola a tela suavemente para mostrar o resultado
      setTimeout(() => {
        canvas.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [resultado]);

  // Função para gerar o PDF
  const baixarPDF = () => {
    if (!resultado) return;

    const doc = new jsPDF();
    const nomePaciente = nome || "Não informado";
    const dataAvaliacao = data || "Não informada";
    const { total, dominios, respostasRaw } = resultado;

    // Cabeçalho PDF
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

    // Captura o gráfico direto do Canvas em base64
    const canvasImg = canvasRef.current.toDataURL("image/png");
    doc.addImage(canvasImg, "PNG", 50, 70, 100, 100);

    // Legenda dos domínios
    doc.setFontSize(10);
    doc.text(`• Ruminação: ${dominios.ruminacao} pts (Foco repetitivo na dor)`, 15, 180);
    doc.text(`• Magnificação: ${dominios.magnificacao} pts (Superestimação da gravidade)`, 15, 187);
    doc.text(`• Desamparo: ${dominios.desamparo} pts (Sensação de incapacidade de controle)`, 15, 194);
    doc.text("Página 1 de 2", 100, 285);

    // Página 2: Respostas detalhadas
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Detalhamento das Respostas:", 15, 20);
    
    let y = 35;
    perguntasCatas.forEach((texto, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      
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

  return (
    <>
      <QuestionarioHeader mostrarVoltar={true} />

      <section id="questionario-catastrófico">
        <h2>Pensamento Catastrófico</h2>
        <p>
          Indique o grau destes pensamentos quando está com dor:<br />
          <strong>0 = mínima &nbsp;|&nbsp; 1 = leve &nbsp;|&nbsp; 2 = moderada &nbsp;|&nbsp; 3 = intensa &nbsp;|&nbsp; 4 = muito intensa</strong>
        </p>

        <form onSubmit={calcularResultado}>
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

          <button type="submit" className="cta-button" style={{ width: "100%", marginTop: "16px" }}>
            Finalizar Avaliação
          </button>
        </form>

        {/* Bloco de Resultado */}
        {resultado && (
          <div className="resumo-clinico" style={{ marginTop: "30px" }}>
            <h3>Resumo da Avaliação</h3>
            
            <div style={{ marginBottom: "16px", padding: "16px", borderRadius: "10px", background: resultado.clinico ? "#fee2e2" : "#dcfce7", border: `2px solid ${resultado.clinico ? "#ef4444" : "#22c55e"}` }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1.05rem", marginBottom: "4px", color: "#1a2332" }}>
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
              onClick={baixarPDF}
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