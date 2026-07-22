import { useState, useEffect } from "react";
import apiClient from "../services/apiClient";

const styles = {
  container: {
    background: "#fff",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "520px",
    margin: "0 auto",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1.5px solid #e2e8f0",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#0057a8",
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.92rem",
    marginBottom: "24px",
    lineHeight: 1.6,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 24px 0",
    maxHeight: "220px",
    overflowY: "auto",
  },
  listItem: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1.5px solid #e2e8f0",
    marginBottom: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.95rem",
    color: "#1e293b",
  },
  listItemHover: {
    borderColor: "#0057a8",
    background: "#f0f7ff",
  },
  divider: {
    border: "none",
    borderTop: "1.5px solid #e2e8f0",
    margin: "24px 0",
  },
  formTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0057a8",
    marginBottom: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
  label: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#1e293b",
  },
  input: {
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.95rem",
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.95rem",
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#1e293b",
    outline: "none",
    resize: "vertical",
    minHeight: "60px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    background: "#0057a8",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "30px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.25s ease",
    marginTop: "8px",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  loading: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.95rem",
    padding: "24px 0",
  },
  error: {
    background: "#fff5f5",
    border: "1.5px solid #feb2b2",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#c53030",
    fontSize: "0.9rem",
    textAlign: "center",
    marginBottom: "16px",
  },
  emptyList: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.9rem",
    padding: "16px 0",
    fontStyle: "italic",
  },
};

function PatientSelector({ onPatientSelected }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredId, setHoveredId] = useState(null);

  // Formulário de novo paciente
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/api/patients");
      setPatients(data);
    } catch {
      setError("Não foi possível carregar a lista de pacientes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (patient) => {
    onPatientSelected(patient);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim()) {
      setFormError("O nome completo é obrigatório.");
      return;
    }

    setCreating(true);
    try {
      const body = { fullName: fullName.trim() };
      if (birthDate) body.birthDate = birthDate;
      if (notes.trim()) body.notes = notes.trim();

      const { data } = await apiClient.post("/api/patients", body);
      setPatients((prev) => [...prev, data]);
      setFullName("");
      setBirthDate("");
      setNotes("");
      onPatientSelected(data);
    } catch {
      setFormError("Erro ao cadastrar paciente. Tente novamente.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Selecionar Paciente</h2>
      <p style={styles.subtitle}>
        Escolha um paciente existente ou cadastre um novo para prosseguir.
      </p>

      {error && (
        <div style={styles.error} role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>Carregando pacientes...</p>
      ) : patients.length === 0 ? (
        <p style={styles.emptyList}>Nenhum paciente cadastrado ainda.</p>
      ) : (
        <ul style={styles.list} aria-label="Lista de pacientes">
          {patients.map((patient) => (
            <li
              key={patient.id}
              style={{
                ...styles.listItem,
                ...(hoveredId === patient.id ? styles.listItemHover : {}),
              }}
              onClick={() => handleSelect(patient)}
              onMouseEnter={() => setHoveredId(patient.id)}
              onMouseLeave={() => setHoveredId(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(patient);
                }
              }}
              aria-label={`Selecionar paciente ${patient.fullName}`}
            >
              {patient.fullName}
            </li>
          ))}
        </ul>
      )}

      <hr style={styles.divider} />

      <h3 style={styles.formTitle}>Cadastrar novo paciente</h3>

      {formError && (
        <div style={styles.error} role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleCreate}>
        <div style={styles.field}>
          <label htmlFor="patient-fullName" style={styles.label}>
            Nome completo *
          </label>
          <input
            id="patient-fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nome do paciente"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="patient-birthDate" style={styles.label}>
            Data de nascimento
          </label>
          <input
            id="patient-birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="patient-notes" style={styles.label}>
            Observações
          </label>
          <textarea
            id="patient-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais (opcional)"
            style={styles.textarea}
          />
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(creating ? styles.buttonDisabled : {}),
          }}
          disabled={creating}
        >
          {creating ? "Cadastrando..." : "Cadastrar e Selecionar"}
        </button>
      </form>
    </div>
  );
}

export default PatientSelector;
