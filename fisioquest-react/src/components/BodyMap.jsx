import { useState } from "react";

const NIVEIS = {
  0: "#e0e0e0",
  1: "#28a745",
  2: "#ffc107",
  3: "#fd7e14",
  4: "#dc3545",
};

const PARTES = [
  { id: "cabeca",     nome: "Cabeça",          tipo: "circle", cx: 100, cy: 40,  r: 30 },
  { id: "tronco",     nome: "Tronco/Coluna",   tipo: "rect",   x: 70,  y: 80,  w: 60, h: 120, rx: 10 },
  { id: "braco_esq",  nome: "Braço Esquerdo",  tipo: "rect",   x: 30,  y: 85,  w: 30, h: 100, rx: 15 },
  { id: "braco_dir",  nome: "Braço Direito",   tipo: "rect",   x: 140, y: 85,  w: 30, h: 100, rx: 15 },
  { id: "perna_esq",  nome: "Perna Esquerda",  tipo: "rect",   x: 70,  y: 210, w: 25, h: 150, rx: 10 },
  { id: "perna_dir",  nome: "Perna Direita",   tipo: "rect",   x: 105, y: 210, w: 25, h: 150, rx: 10 },
];

function BodyMap() {
  const [niveis, setNiveis] = useState({});
  const [parteSelecionada, setParteSelecionada] = useState(null);
  const [nivelTemp, setNivelTemp] = useState("1");

  const selecionarParte = (parte) => {
    setParteSelecionada(parte);
  };

  const aplicarNivel = () => {
    setNiveis({ ...niveis, [parteSelecionada.id]: parseInt(nivelTemp) });
    setParteSelecionada(null);
  };

  return (
    <div className="mapa-container-clinico" id="secao-mapa">
      <h3>1. Mapeamento do Medo de Movimento</h3>
      <p>Clique na parte do corpo onde você sente medo de realizar movimentos.</p>

      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <svg width="200" height="400" viewBox="0 0 200 400">
          {PARTES.map((p) => {
            const cor = NIVEIS[niveis[p.id] || 0];
            const props = {
              key: p.id,
              style: { fill: cor, stroke: "#fff", strokeWidth: 2, cursor: "pointer", transition: "fill 0.3s" },
              onClick: () => selecionarParte(p),
            };

            if (p.tipo === "circle") {
              return <circle {...props} cx={p.cx} cy={p.cy} r={p.r} />;
            }
            return <rect {...props} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} />;
          })}
        </svg>
      </div>

      <div className="legenda-mapa">
        <div className="legenda-item"><div className="cor-box" style={{ background: "#28a745" }}></div> Nível 1 — Mínimo</div>
        <div className="legenda-item"><div className="cor-box" style={{ background: "#ffc107" }}></div> Nível 2 — Moderado</div>
        <div className="legenda-item"><div className="cor-box" style={{ background: "#fd7e14" }}></div> Nível 3 — Intenso</div>
        <div className="legenda-item"><div className="cor-box" style={{ background: "#dc3545" }}></div> Nível 4 — Muito Intenso</div>
      </div>

      {parteSelecionada && (
        <div id="painel-ajuste" style={{ textAlign: "center", marginTop: "20px", background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <h3>{parteSelecionada.nome}</h3>
          <label>Nível de Medo (1 a 4):</label>
          <select
            value={nivelTemp}
            onChange={(e) => setNivelTemp(e.target.value)}
            style={{ margin: "10px", padding: "8px 14px" }}
          >
            <option value="1">1 — Mínimo (Verde)</option>
            <option value="2">2 — Moderado (Amarelo)</option>
            <option value="3">3 — Intenso (Laranja)</option>
            <option value="4">4 — Muito Intenso (Vermelho)</option>
          </select>
          <button type="button" className="cta-button" onClick={aplicarNivel}>
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}

export default BodyMap;