import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { generatePersistedPdf } from "../utils/pdfGenerator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/patient-profile.css";

function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await apiClient.get(`/api/patients/${id}`);
        setPatient(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Paciente não encontrado.");
        } else if (err.response?.status === 403) {
          setError("Você não tem permissão para acessar este paciente.");
        } else {
          setError("Erro ao carregar dados do paciente.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  // Group responses by questionnaire type for charts
  const chartDataByType = useMemo(() => {
    if (!patient?.responses) return {};

    const grouped = {};
    patient.responses.forEach((qr) => {
      if (!grouped[qr.questionnaireType]) {
        grouped[qr.questionnaireType] = [];
      }
      grouped[qr.questionnaireType].push(qr);
    });

    // Only include types with >= 2 responses, sorted chronologically
    const charts = {};
    Object.entries(grouped).forEach(([type, responses]) => {
      if (responses.length >= 2) {
        charts[type] = responses
          .slice()
          .sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt))
          .map((qr) => ({
            date: formatShortDate(qr.appliedAt),
            score: Number(qr.score),
          }));
      }
    });

    return charts;
  }, [patient]);

  // Sort responses chronologically (most recent first) for the list
  const sortedResponses = useMemo(() => {
    if (!patient?.responses) return [];
    return patient.responses
      .slice()
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }, [patient]);

  const handleDownloadPdf = (qr) => {
    generatePersistedPdf(qr, {
      fullName: patient.fullName,
      birthDate: patient.birthDate,
    });
  };

  const handleStartQuestionnaire = () => {
    navigate("/questionarios");
  };

  if (loading) {
    return (
      <div className="patient-profile-page">
        <div className="patient-profile-loading">
          <p>Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-profile-page">
        <div className="patient-profile-error" role="alert">
          <p>{error}</p>
          <button
            className="patient-profile-back-btn"
            onClick={() => navigate("/patients")}
          >
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-profile-page">
      <div className="patient-profile-container">
        {/* Header */}
        <header className="patient-profile-header">
          <div className="patient-profile-info">
            <h1>{patient.fullName}</h1>
            {patient.birthDate && (
              <p className="patient-profile-birth">
                Data de nascimento: {formatDate(patient.birthDate)}
              </p>
            )}
            {patient.notes && (
              <p className="patient-profile-notes">{patient.notes}</p>
            )}
          </div>
          <button
            className="patient-profile-new-questionnaire-btn"
            onClick={handleStartQuestionnaire}
          >
            Novo Questionário
          </button>
        </header>

        {/* Charts Section */}
        {Object.keys(chartDataByType).length > 0 && (
          <section className="patient-profile-charts">
            <h2>Evolução Temporal</h2>
            {Object.entries(chartDataByType).map(([type, data]) => (
              <div key={type} className="patient-profile-chart-card">
                <h3>Evolução do Score — {type}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke="#0057a8"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </section>
        )}

        {/* Responses List */}
        <section className="patient-profile-responses">
          <h2>Histórico de Questionários</h2>
          {sortedResponses.length === 0 ? (
            <p className="patient-profile-empty">
              Nenhum questionário respondido ainda.
            </p>
          ) : (
            <ul className="patient-profile-response-list">
              {sortedResponses.map((qr) => (
                <li key={qr.id} className="patient-profile-response-item">
                  <div className="patient-profile-response-info">
                    <span className="patient-profile-response-type">
                      {qr.questionnaireType}
                    </span>
                    <span className="patient-profile-response-date">
                      {formatDateTime(qr.appliedAt)}
                    </span>
                    <span className="patient-profile-response-score">
                      Score: {Number(qr.score)}
                    </span>
                  </div>
                  <button
                    className="patient-profile-pdf-btn"
                    onClick={() => handleDownloadPdf(qr)}
                  >
                    Baixar PDF
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(isoStr) {
  if (!isoStr) return "";
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return isoStr;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default PatientProfile;
