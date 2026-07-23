import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiClient from "../services/apiClient";
import Header from "../components/Header";
import "../styles/dashboard.css";

function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const CHART_COLORS = ["#0057a8", "#00c9a7", "#ff7f50", "#8b5cf6", "#f59e0b", "#ec4899"];

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await apiClient.get("/api/dashboard");
        setData(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
        } else {
          setError("Erro ao carregar dados do dashboard.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="dashboard-page">
          <div className="dashboard-loading">
            <p>Carregando dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="dashboard-page">
          <div className="dashboard-error" role="alert">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  const {
    totalPatients,
    totalQuestionnairesApplied,
    lastQuestionnaireAppliedAt,
    tskScoreDistribution,
    patientScoreComparisons,
    temporalEvolution,
  } = data;

  // Group temporal data by patient for the LineChart
  const temporalByPatient = buildTemporalChartData(temporalEvolution);

  const hasScoreDistribution = tskScoreDistribution && tskScoreDistribution.length > 0;
  const hasComparisons = patientScoreComparisons && patientScoreComparisons.length >= 2;
  const hasTemporalEvolution = temporalEvolution && temporalEvolution.length >= 2;

  return (
    <>
      <Header />
      <div className="dashboard-page">
        <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Visão geral dos seus pacientes e questionários</p>
      </header>

      {/* Summary Cards */}
      <section className="dashboard-summary">
        <div className="summary-card">
          <span className="summary-label">Total de Pacientes</span>
          <span className="summary-value">{totalPatients}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Questionários Aplicados</span>
          <span className="summary-value">{totalQuestionnairesApplied}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Último Questionário</span>
          <span className="summary-value summary-date">
            {formatDate(lastQuestionnaireAppliedAt)}
          </span>
        </div>
      </section>

      {/* TSK Score Distribution */}
      {hasScoreDistribution && (
        <section className="dashboard-chart-section">
          <h2>Distribuição de Scores TSK</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tskScoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Pacientes" fill="#0057a8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Patient Score Comparison */}
      {hasComparisons && (
        <section className="dashboard-chart-section">
          <h2>Comparativo de Scores entre Pacientes</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patientScoreComparisons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="patientName" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value}`, "Score"]}
                />
                <Bar dataKey="latestScore" name="Score mais recente" fill="#00c9a7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Temporal Evolution */}
      {hasTemporalEvolution && (
        <section className="dashboard-chart-section">
          <h2>Evolução Temporal dos Scores</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={temporalByPatient.dataPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {temporalByPatient.patients.map((patient, index) => (
                  <Line
                    key={patient}
                    type="monotone"
                    dataKey={patient}
                    name={patient}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="dashboard-actions">
        <Link to="/patients" className="dashboard-action-link">
          Ver Pacientes
        </Link>
      </section>
    </div>
    </>
  );
}

/**
 * Transforms the flat temporalEvolution array into a structure suitable for Recharts LineChart.
 * Groups data points by date and creates a line per patient.
 */
function buildTemporalChartData(temporalEvolution) {
  if (!temporalEvolution || temporalEvolution.length === 0) {
    return { patients: [], dataPoints: [] };
  }

  const patients = [...new Set(temporalEvolution.map((item) => item.patientName))];

  // Group by date (formatted)
  const dateMap = new Map();

  temporalEvolution.forEach((item) => {
    const dateKey = formatDate(item.appliedAt);
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { date: dateKey });
    }
    const entry = dateMap.get(dateKey);
    entry[item.patientName] = item.score;
  });

  // Sort by original date
  const sortedEntries = [...dateMap.entries()].sort((a, b) => {
    // Find original date for comparison
    const dateA = temporalEvolution.find((e) => formatDate(e.appliedAt) === a[0])?.appliedAt || "";
    const dateB = temporalEvolution.find((e) => formatDate(e.appliedAt) === b[0])?.appliedAt || "";
    return new Date(dateA) - new Date(dateB);
  });

  const dataPoints = sortedEntries.map(([, value]) => value);

  return { patients, dataPoints };
}

export default Dashboard;
