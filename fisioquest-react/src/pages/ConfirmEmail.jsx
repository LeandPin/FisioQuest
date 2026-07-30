import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../services/apiClient";
import "../styles/auth.css";

/**
 * Página de confirmação de e-mail.
 * Lê o parâmetro `?token=` da URL e chama GET /api/auth/confirm-email?token=...
 * - 200: exibe mensagem de sucesso com link para /login
 * - 400 (ou qualquer erro): exibe mensagem de token inválido/expirado com opção de reenvio
 */
function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const { resendConfirmation } = useAuth();

  const token = searchParams.get("token");

  // "loading" | "success" | "error" | "no-token"
  const [status, setStatus] = useState("loading");

  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState(""); // "" | "sending" | "sent" | "error"
  const [resendEmailError, setResendEmailError] = useState("");

  // Evita que o useEffect seja executado duas vezes em modo estrito do React
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;

    if (!token) {
      setStatus("no-token");
      return;
    }

    confirmedRef.current = true;

    apiClient
      .get(`/api/auth/confirm-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [token]);

  async function handleResend(e) {
    e.preventDefault();
    setResendEmailError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resendEmail.trim() || !emailRegex.test(resendEmail.trim())) {
      setResendEmailError("Informe um e-mail válido.");
      return;
    }

    setResendStatus("sending");
    try {
      await resendConfirmation(resendEmail.trim());
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Confirmando e-mail…</h1>
          <p className="auth-subtitle">Aguarde enquanto validamos seu token.</p>
        </div>
      </div>
    );
  }

  // ── No token in URL ───────────────────────────────────────────────────────
  if (status === "no-token") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Link inválido</h1>
          <p className="auth-subtitle">
            Nenhum token de confirmação foi encontrado neste link.
          </p>
          <div className="auth-footer">
            <Link to="/login">Ir para o login</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>E-mail confirmado!</h1>
          <p className="auth-subtitle">
            Sua conta foi ativada com sucesso. Você já pode fazer login.
          </p>

          <div className="auth-info-box" role="status">
            <p>
              Seu e-mail institucional foi verificado. Acesse o FisioQuest com
              suas credenciais para começar a gerenciar seus pacientes.
            </p>
          </div>

          <Link to="/login" className="auth-submit-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: "8px" }}>
            Ir para o login
          </Link>

          <div className="auth-footer">
            <Link to="/" className="auth-back-link">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Error (token inválido ou expirado) ────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Link expirado ou inválido</h1>
        <p className="auth-subtitle">
          O link de confirmação é inválido ou já expirou. Solicite um novo
          e-mail de confirmação abaixo.
        </p>

        <div className="auth-server-error" role="alert">
          O token de confirmação não é válido ou seu prazo de 24 horas expirou.
        </div>

        <form
          className="auth-form"
          onSubmit={handleResend}
          noValidate
          style={{ marginTop: "24px" }}
        >
          {resendStatus === "sent" && (
            <div className="auth-success-banner" role="status" aria-live="polite">
              E-mail de confirmação reenviado! Verifique sua caixa de entrada.
            </div>
          )}
          {resendStatus === "error" && (
            <div className="auth-server-error" role="alert" aria-live="polite">
              Não foi possível reenviar o e-mail. Tente novamente em instantes.
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="resend-email">Seu e-mail institucional</label>
            <input
              id="resend-email"
              type="email"
              value={resendEmail}
              onChange={(e) => {
                setResendEmail(e.target.value);
                if (resendEmailError) setResendEmailError("");
              }}
              placeholder="seu@academico.ufpb.br"
              required
              autoComplete="email"
              aria-invalid={!!resendEmailError}
            />
            {resendEmailError && (
              <span className="auth-field-error" aria-live="polite">
                {resendEmailError}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="auth-resend-btn"
            disabled={resendStatus === "sending" || resendStatus === "sent"}
          >
            {resendStatus === "sending"
              ? "Reenviando…"
              : resendStatus === "sent"
              ? "E-mail reenviado ✓"
              : "Reenviar e-mail de confirmação"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Já confirmou?{" "}
            <Link to="/login">Fazer login</Link>
          </p>
          <Link to="/" className="auth-back-link">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEmail;
