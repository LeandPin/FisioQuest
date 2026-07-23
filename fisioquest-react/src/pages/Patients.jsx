import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/apiClient";
import Header from "../components/Header";
import "../styles/patients.css";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      setError("");
      const { data } = await apiClient.get("/api/patients");
      setPatients(data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else {
        setError("Erro ao carregar pacientes.");
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const term = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(term) ||
        (p.notes && p.notes.toLowerCase().includes(term)) ||
        (p.cpf && p.cpf.includes(term)) ||
        (p.phone && p.phone.includes(term))
    );
  }, [patients, search]);

  const handlePatientCreated = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setShowModal(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="patients-page">
          <div className="patients-loading">
            <p>Carregando pacientes...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="patients-page">
          <div className="patients-error" role="alert">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="patients-page">
        {/* Header */}
        <header className="patients-header">
          <h1>Pacientes</h1>
          <button
            className="patients-add-btn"
            onClick={() => setShowModal(true)}
          >
            + Novo Paciente
          </button>
        </header>

        {/* Search */}
        <div className="patients-search">
          <input
            type="text"
            className="patients-search-input"
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Patient List */}
        {filteredPatients.length === 0 ? (
          <div className="patients-empty">
            <p>
              {search.trim()
                ? "Nenhum paciente encontrado para esta busca."
                : "Você ainda não cadastrou nenhum paciente."}
            </p>
            {!search.trim() && (
              <button
                className="patients-add-btn"
                onClick={() => setShowModal(true)}
              >
                + Cadastrar Primeiro Paciente
              </button>
            )}
          </div>
        ) : (
          <div className="patients-list">
            {filteredPatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/patients/${patient.id}`}
                className="patient-card"
              >
                <h3 className="patient-card-name">{patient.fullName}</h3>
                <div className="patient-card-details">
                  <span className="patient-card-detail">
                    {patient.sex} {patient.birthDate && `• Nasc: ${formatDate(patient.birthDate)}`}
                  </span>
                  {patient.phone && (
                    <span className="patient-card-detail">📞 {patient.phone}</span>
                  )}
                  {patient.cpf && (
                    <span className="patient-card-detail">CPF: {patient.cpf}</span>
                  )}
                  <span className="patient-card-detail">
                    Cadastrado em: {formatDateTime(patient.createdAt)}
                  </span>
                </div>
                {patient.notes && (
                  <span className="patient-card-notes">{patient.notes}</span>
                )}
                <span className="patient-card-arrow">→</span>
              </Link>
            ))}
          </div>
        )}

        {/* Create Patient Modal */}
        {showModal && (
          <CreatePatientModal
            onClose={() => setShowModal(false)}
            onCreated={handlePatientCreated}
          />
        )}
      </div>
    </>
  );
}

// ============================================================
// Create Patient Modal
// ============================================================

function CreatePatientModal({ onClose, onCreated }) {
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [medicalDiagnosis, setMedicalDiagnosis] = useState("");
  const [mainComplaint, setMainComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim()) {
      setFormError("O nome completo é obrigatório.");
      return;
    }

    if (!sex) {
      setFormError("O sexo é obrigatório.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        fullName: fullName.trim(),
        sex,
        birthDate: birthDate || null,
        cpf: cpf.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        medicalDiagnosis: medicalDiagnosis.trim() || null,
        mainComplaint: mainComplaint.trim() || null,
        notes: notes.trim() || null,
      };
      const { data } = await apiClient.post("/api/patients", payload);
      onCreated(data);
    } catch (err) {
      if (err.response?.status === 400) {
        setFormError("Dados inválidos. Verifique os campos.");
      } else if (err.response?.status === 401) {
        setFormError("Sessão expirada. Faça login novamente.");
      } else {
        setFormError("Erro ao cadastrar paciente. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="patients-modal-overlay" onClick={handleOverlayClick}>
      <div className="patients-modal" role="dialog" aria-labelledby="modal-title">
        <h2 id="modal-title">Novo Paciente</h2>
        <form className="patients-form" onSubmit={handleSubmit}>
          <div className="patients-form-row">
            <div className="patients-form-group patients-form-group--flex">
              <label htmlFor="patient-name">Nome Completo *</label>
              <input
                id="patient-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome completo do paciente"
                autoFocus
              />
            </div>

            <div className="patients-form-group">
              <label htmlFor="patient-sex">Sexo *</label>
              <select
                id="patient-sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="patients-form-row">
            <div className="patients-form-group">
              <label htmlFor="patient-birth">Data de Nascimento</label>
              <input
                id="patient-birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="patients-form-group">
              <label htmlFor="patient-cpf">CPF (opcional)</label>
              <input
                id="patient-cpf"
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          </div>

          <div className="patients-form-row">
            <div className="patients-form-group">
              <label htmlFor="patient-phone">Telefone</label>
              <input
                id="patient-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div className="patients-form-group patients-form-group--flex">
              <label htmlFor="patient-address">Endereço (opcional)</label>
              <input
                id="patient-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Endereço do paciente"
              />
            </div>
          </div>

          <div className="patients-form-group">
            <label htmlFor="patient-diagnosis">Diagnóstico Médico (opcional)</label>
            <textarea
              id="patient-diagnosis"
              value={medicalDiagnosis}
              onChange={(e) => setMedicalDiagnosis(e.target.value)}
              placeholder="Diagnóstico médico do paciente"
            />
          </div>

          <div className="patients-form-group">
            <label htmlFor="patient-complaint">Queixa Principal (opcional)</label>
            <textarea
              id="patient-complaint"
              value={mainComplaint}
              onChange={(e) => setMainComplaint(e.target.value)}
              placeholder="Queixa principal do paciente"
            />
          </div>

          <div className="patients-form-group">
            <label htmlFor="patient-notes">Observações (opcional)</label>
            <textarea
              id="patient-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais"
            />
          </div>

          {formError && (
            <div className="patients-form-error" role="alert">
              {formError}
            </div>
          )}

          <div className="patients-form-actions">
            <button
              type="button"
              className="patients-form-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="patients-form-submit"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(isoStr) {
  if (!isoStr) return "";
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return isoStr;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default Patients;
