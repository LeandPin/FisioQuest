import { useState, useRef, useEffect } from "react";
import corpo from "../assets/images/corpo_numerado.png";

function BodyMap() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [pontosMarcados, setPontosMarcados] = useState([]);
  const [ultimoClique, setUltimoClique] = useState(null);
  const [intensidade, setIntensidade] = useState("1");

  // Função que converte o nível (1 a 4) para as cores do seu CSS
  const obterCor = (n) => {
    return {
      1: "rgba(34,197,94,0.8)",  // #22c55e
      2: "rgba(234,179,8,0.8)",  // #eab308
      3: "rgba(249,115,22,0.8)", // #f97316
      4: "rgba(239,68,68,0.8)",  // #ef4444
    }[n];
  };

  // Carrega a imagem uma única vez quando o componente é montado
  useEffect(() => {
    const img = new Image();
    // O React vai buscar na pasta public/images/
    img.src = corpo; 
    
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        desenharMapa();
      }
    };
  }, []);

  // Redesenha o mapa sempre que os pontos ou o último clique mudarem
  useEffect(() => {
    if (imageRef.current && canvasRef.current) {
      desenharMapa();
    }
  }, [pontosMarcados, ultimoClique]);

  const desenharMapa = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Limpa o canvas e desenha a imagem de fundo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    // Desenha todos os pontos já confirmados
    pontosMarcados.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = obterCor(p.nivel);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Se houver um clique pendente de confirmação, desenha um aro azul
    if (ultimoClique) {
      ctx.beginPath();
      ctx.arc(ultimoClique.x, ultimoClique.y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "#0057a8";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Captura o clique no Canvas
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calcula a posição exata do clique baseada no tamanho renderizado
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setUltimoClique({ x, y });
  };

  const confirmarMarcacao = () => {
    if (ultimoClique) {
      setPontosMarcados([
        ...pontosMarcados,
        { ...ultimoClique, nivel: parseInt(intensidade) }
      ]);
      setUltimoClique(null); // Esconde os controles
      setIntensidade("1");   // Reseta o select
    }
  };

  const limparMapa = () => {
    if (window.confirm("Deseja apagar todas as marcações?")) {
      setPontosMarcados([]);
      setUltimoClique(null);
    }
  };

  return (
    <div className="mapa-container-clinico" id="secao-mapa">
      <h3>1. Mapeamento do Medo de Movimento</h3>
      <p>Clique na imagem do corpo onde você sente receio de se movimentar e selecione a intensidade:</p>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          id="canvas-corpo"
          onMouseDown={handleCanvasClick}
        ></canvas>
      </div>

      <div className="legenda-mapa">
        <div className="legenda-item"><div className="cor-box" style={{ background: "#22c55e" }}></div> Nível 1 — Mínimo</div>
        <div className="legenda-item"><div className="cor-box" style={{ background: "#eab308" }}></div> Nível 2 — Moderado</div>
        <div className="legenda-item"><div className="cor-box" style={{ background: "#f97316" }}></div> Nível 3 — Intenso</div>
        <div className="legenda-item"><div className="cor-box" style={{ background: "#ef4444" }}></div> Nível 4 — Muito Intenso</div>
      </div>

      {/* Exibe os controles apenas se o usuário tiver clicado no mapa */}
      {ultimoClique && (
        <div id="controles-mapeamento" style={{ display: "block" }}>
          <strong>Intensidade para o ponto marcado:</strong><br />
          <select
            value={intensidade}
            onChange={(e) => setIntensidade(e.target.value)}
            style={{ marginTop: "10px", width: "auto", padding: "8px 14px" }}
          >
            <option value="1">Nível 1 — Mínimo</option>
            <option value="2">Nível 2 — Moderado</option>
            <option value="3">Nível 3 — Intenso</option>
            <option value="4">Nível 4 — Muito Intenso</option>
          </select>
          <button
            type="button"
            className="cta-button"
            onClick={confirmarMarcacao}
            style={{ padding: "10px 20px", fontSize: "0.9rem", marginLeft: "8px" }}
          >
            ✓ Confirmar
          </button>
        </div>
      )}

      <br />
      
      {/* Exibe o botão de limpar apenas se houver marcações */}
      {pontosMarcados.length > 0 && (
        <button type="button" className="btn-limpar" onClick={limparMapa}>
          ✕ Limpar Marcações
        </button>
      )}
    </div>
  );
}

export default BodyMap;