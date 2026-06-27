import { perguntas } from "../data/perguntasCinesiofobia";

function CinesiofobiaForm({ respostas, setRespostas }) {
  const alterarResposta = (indice, valor) => {
    setRespostas({ ...respostas, [indice]: Number(valor) });
  };

  return (
    <>
      {perguntas.map((pergunta, index) => (
        <div key={index} className="pergunta-card">
          <label>
            {index + 1}. {pergunta}
          </label>
          <select
            value={respostas[index + 1] || 1}
            onChange={(e) => alterarResposta(index + 1, e.target.value)}
            style={{ marginTop: "8px" }}
          >
            <option value="1">Discordo totalmente</option>
            <option value="2">Discordo parcialmente</option>
            <option value="3">Concordo parcialmente</option>
            <option value="4">Concordo totalmente</option>
          </select>
        </div>
      ))}
    </>
  );
}

export default CinesiofobiaForm;