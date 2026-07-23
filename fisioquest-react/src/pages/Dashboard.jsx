import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

const TSK_RANGE_LABELS = {
  "17-24": "Baixa cinesiofobia",
  "25-36": "Moderada",
  "37-52": "Alta",
  "53-68": "Muito alta",
};

const PCS_RANGE_LABELS = {
  "0-12": "Baixo catastrofismo",
  "13-25": "Moderado",
  "26-38": "Alto",
  "39-52": "Muito alto",
};

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
            <div className="dashboard-spinner"></div>
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
            <span className="dashboard-error-icon">⚠️</span>
            <p>{error}</p>
            <Link to="/login" className="dashboard-error-link">
              Ir para Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  const {
    totalPatients,
    totalQuestionnairesApplied,
    lastQuestionnaireAppliedAt,
    questionnairesThisMonth,
    patientsWithResponsesThisMonth,
    averageTskScore,
    averagePcsScore,
    tskScoreDistribution,
    pcsScoreDistribution,
    patientScoreComparisons,
  } = data;

  const hasTskDistribution =
    tskScoreDistribution && tskScoreDistribution.some((item) => item.count > 0);
  const hasPcsDistribution =
    pcsScoreDistribution && pcsScoreDistribution.some((item) => item.count > 0);
  const hasComparisons = patientScoreComparisons && patientScoreComparisons.length >= 2;
  const hasAnyChart = hasTskDistribution || hasPcsDistribution || hasComparisons;

  // Prepare TSK distribution with labels
  const tskDistributionData = tskScoreDistribution
    ? tskScoreDistribution.map((item) => ({
        ...item,
        label: TSK_RANGE_LABELS[item.range] || item.range,
      }))
    : [];

  // Prepare PCS distribution with labels
  const pcsDistributionData = pcsScoreDistribution
    ? pcsScoreDistribution.map((item) => ({
        ...item,
        label: PCS_RANGE_LABELS[item.range] || item.range,
      }))
    : [];

  // Current month name
  const currentMonth = new Date().toLocaleDateString("pt-BR", {
    month: "long",
  });

  return (
    <>
      <Header />
      <div className="dashboard-page">
        {/* Welcome Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-content">
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">
              Acompanhe o progresso dos seus pacientes e questionários aplicados
            </p>
          </div>
          <Link to="/patients" className="dashboard-header-action">
            Ver Pacientes →
          </Link>
        </header>

        {/* Summary Cards - Row 1: Main metrics */}
        <section className="dashboard-summary">
          <div className="summary-card summary-card--primary">
            <div className="summary-card-icon">👥</div>
            <div className="summary-card-content">
              <span className="summary-label">Total de Pacientes</span>
              <span className="summary-value">{totalPatients}</span>
            </div>
          </div>

          <div className="summary-card summary-card--accent">
            <div className="summary-card-icon">📋</div>
            <div className="summary-card-content">
              <span className="summary-label">Questionários Aplicados</span>
              <span className="summary-value">{totalQuestionnairesApplied}</span>
            </div>
          </div>

          <div className="summary-card summary-card--info">
            <div className="summary-card-icon">📅</div>
            <div className="summary-card-content">
              <span className="summary-label">Último Questionário</span>
              <span className="summary-value summary-date">
                {formatDate(lastQuestionnaireAppliedAt)}
              </span>
            </div>
          </div>
        </section>

        {/* Summary Cards - Row 2: Monthly metrics + averages */}
        <section className="dashboard-summary dashboard-summary--secondary">
          <div className="summary-card summary-card--monthly">
            <div className="summary-card-icon">📈</div>
            <div className="summary-card-content">
              <span className="summary-label">
                Questionários em {currentMonth}
              </span>
              <span className="summary-value">{questionnairesThisMonth}</span>
            </div>
          </div>

          <div className="summary-card summary-card--monthly">
            <div className="summary-card-icon">🩺</div>
            <div className="summary-card-content">
              <span className="summary-label">
                Pacientes atendidos em {currentMonth}
              </span>
              <span className="summary-value">{patientsWithResponsesThisMonth}</span>
            </div>
          </div>

          <div className="summary-card summary-card--monthly">
            <div className="summary-card-icon">📊</div>
            <div className="summary-card-content">
              <span className="summary-label">Score Médio TSK</span>
              <span className="summary-value">
                {averageTskScore != null ? Number(averageTskScore).toFixed(1) : "—"}
              </span>
              {averageTskScore != null && (
                <span className="summary-badge summary-badge--tsk">
                  {getTskClassification(Number(averageTskScore))}
                </span>
              )}
            </div>
          </div>

          <div className="summary-card summary-card--monthly">
            <div className="summary-card-icon">🧠</div>
            <div className="summary-card-content">
              <span className="summary-label">Score Médio PCS</span>
              <span className="summary-value">
                {averagePcsScore != null ? Number(averagePcsScore).toFixed(1) : "—"}
              </span>
              {averagePcsScore != null && (
                <span className="summary-badge summary-badge--pcs">
                  {getPcsClassification(Number(averagePcsScore))}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Charts Grid - TSK and PCS distributions */}
        <div className="dashboard-charts-grid">
          {/* TSK Score Distribution */}
          {hasTskDistribution && (
            <section className="dashboard-chart-section">
              <div className="chart-header">
                <h2>Distribuição TSK — Cinesiofobia</h2>
                <p className="chart-description">
                  Classificação por nível de medo do movimento
                </p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tskDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis allowDecimals={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="chart-tooltip">
                              <p className="chart-tooltip-label">{item.label}</p>
                              <p className="chart-tooltip-value">Faixa: {item.range}</p>
                              <p className="chart-tooltip-value">Pacientes: {item.count}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Pacientes"
                      fill="#0057a8"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* PCS Score Distribution */}
          {hasPcsDistribution && (
            <section className="dashboard-chart-section">
              <div className="chart-header">
                <h2>Distribuição PCS — Catastrofismo</h2>
                <p className="chart-description">
                  Classificação por nível de pensamento catastrófico
                </p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pcsDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis allowDecimals={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="chart-tooltip">
                              <p className="chart-tooltip-label">{item.label}</p>
                              <p className="chart-tooltip-value">Faixa: {item.range}</p>
                              <p className="chart-tooltip-value">Pacientes: {item.count}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Pacientes"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>

        {/* Patient Score Comparison - Full Width */}
        {hasComparisons && (
          <section className="dashboard-chart-section dashboard-chart-section--full">
            <div className="chart-header">
              <h2>Comparativo entre Pacientes</h2>
              <p className="chart-description">
                Score mais recente de cada paciente
              </p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patientScoreComparisons} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickLine={false} />
                  <YAxis
                    dataKey="patientName"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(1)}`, "Score"]}
                  />
                  <Bar
                    dataKey="lastScore"
                    name="Score"
                    fill="#00c9a7"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!hasAnyChart && (
          <section className="dashboard-empty-state">
            <div className="dashboard-empty-icon">📋</div>
            <h3>Nenhum questionário aplicado ainda</h3>
            <p>
              Comece aplicando questionários aos seus pacientes para visualizar
              os dados aqui.
            </p>
            <Link to="/questionarios" className="dashboard-empty-action">
              Aplicar Questionário
            </Link>
          </section>
        )}

        {/* Quick Actions */}
        <section className="dashboard-quick-actions">
          <Link to="/patients" className="dashboard-action-card">
            <span className="dashboard-action-icon">👥</span>
            <span className="dashboard-action-text">Ver Pacientes</span>
          </Link>
          <Link to="/questionarios" className="dashboard-action-card">
            <span className="dashboard-action-icon">📝</span>
            <span className="dashboard-action-text">Aplicar Questionário</span>
          </Link>
        </section>
      </div>
    </>
  );
}

/**
 * Returns a human-readable classification for a TSK score.
 */
function getTskClassification(score) {
  if (score >= 53) return "Muito alta";
  if (score >= 37) return "Alta";
  if (score >= 25) return "Moderada";
  return "Baixa";
}

/**
 * Returns a human-readable classification for a PCS score.
 */
function getPcsClassification(score) {
  if (score >= 39) return "Muito alto";
  if (score >= 26) return "Alto";
  if (score >= 13) return "Moderado";
  return "Baixo";
}

export default Dashboard;
