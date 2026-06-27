function ResultadoCinesiofobia({ resultado }) {
  if (!resultado) return null;

  const cor =
    resultado.score >= 50
      ? "#fee2e2"
      : resultado.score >= 35
      ? "#fef9c3"
      : "#dcfce7";

  const borderCor =
    resultado.score >= 50
      ? "#ef4444"
      : resultado.score >= 35
      ? "#eab308"
      : "#22c55e";

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "12px",
        background: cor,
        border: `2px solid ${borderCor}`,
        textAlign: "left",
        marginTop: "24px",
      }}
    >
      <div
        style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#1a2332",
          marginBottom: "6px",
        }}
      >
        Resultado da Avaliação
      </div>
      <div style={{ fontSize: "1rem", color: "#1a2332" }}>
        <strong>Pontuação TSK-17:</strong> {resultado.score} / 68
      </div>
      <div style={{ fontSize: "1rem", color: "#1a2332", marginTop: "4px" }}>
        <strong>Interpretação:</strong> {resultado.nivel}
      </div>
    </div>
  );
}

export default ResultadoCinesiofobia;