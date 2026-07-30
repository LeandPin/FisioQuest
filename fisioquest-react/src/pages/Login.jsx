import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Whether the error is specifically an unverified email (HTTP 403)
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendStatus, setResendStatus] = useState(""); // "", "sending", "sent", "error"

  const { user, loading, login, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setResendStatus("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.response?.status === 403) {
        // EmailNotVerifiedException — e-mail cadastrado mas não confirmado
        setEmailNotVerified(true);
        setError(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de ativação."
        );
      } else {
        setEmailNotVerified(false);
        setError("E-mail ou senha incorretos.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  async function handleResendConfirmation() {
    setResendStatus("sending");
    try {
      await resendConfirmation(email);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  }

  // Mostra nada enquanto verifica sessão existente
  if (loading) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Entrar</h1>
        <p className="auth-subtitle">
          Acesse sua conta para gerenciar pacientes e questionários.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          {emailNotVerified && (
            <div className="auth-unverified-actions">
              {resendStatus === "sent" && (
                <div className="auth-success-banner" role="status" aria-live="polite">
                  E-mail de confirmação reenviado com sucesso!
                </div>
              )}
              {resendStatus === "error" && (
                <div className="auth-server-error" role="alert" aria-live="polite">
                  Não foi possível reenviar o e-mail. Tente novamente em instantes.
                </div>
              )}
              <button
                type="button"
                className="auth-resend-btn"
                onClick={handleResendConfirmation}
                disabled={resendStatus === "sending" || resendStatus === "sent"}
              >
                {resendStatus === "sending"
                  ? "Reenviando..."
                  : resendStatus === "sent"
                  ? "E-mail reenviado ✓"
                  : "Reenviar e-mail de confirmação"}
              </button>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Reset error states when user types
                if (error) {
                  setError("");
                  setEmailNotVerified(false);
                  setResendStatus("");
                }
              }}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="cta-button"
            disabled={submitting}
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem uma conta?{" "}
            <Link to="/register">Criar conta</Link>
          </p>
          <Link to="/" className="auth-back-link">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
