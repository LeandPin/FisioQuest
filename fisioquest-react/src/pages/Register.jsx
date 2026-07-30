import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

function validateFullName(value) {
  if (!value.trim()) return "Nome completo é obrigatório.";
  if (value.trim().length < 2) return "Nome deve ter no mínimo 2 caracteres.";
  return "";
}

function validateEmail(value) {
  if (!value.trim()) return "E-mail é obrigatório.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return "Formato de e-mail inválido.";
  return "";
}

function validatePassword(value) {
  if (!value) return "Senha é obrigatória.";
  if (value.length < 8) return "Senha deve ter no mínimo 8 caracteres.";
  return "";
}

function validateConfirmPassword(value, password) {
  if (!value) return "Confirmação de senha é obrigatória.";
  if (value !== password) return "As senhas não coincidem.";
  return "";
}

function Register() {
  const navigate = useNavigate();
  const { user, loading, register, resendConfirmation } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Email used for registration — kept after success to allow resend
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState(""); // "", "sending", "sent", "error"

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear server error on any change
    if (serverError) setServerError("");

    // Re-validate if field was already touched
    if (touched[name]) {
      const error = getFieldError(name, value, name === "confirmPassword" ? formData.password : undefined);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    // If password changes, re-validate confirmPassword if it was touched
    if (name === "password" && touched.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = getFieldError(name, value, name === "confirmPassword" ? formData.password : undefined);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }

  function getFieldError(name, value, password) {
    switch (name) {
      case "fullName":
        return validateFullName(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(value, password);
      default:
        return "";
    }
  }

  function validateAll() {
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };
    setErrors(newErrors);
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    return !newErrors.fullName && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validateAll()) return;

    setSubmitting(true);
    try {
      await register(formData.fullName.trim(), formData.email.trim(), formData.password);
      // HTTP 201: show email verification message instead of redirecting
      setRegisteredEmail(formData.email.trim());
      setRegistrationSuccess(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setServerError("Este e-mail já está cadastrado.");
      } else if (err.response?.status === 422) {
        setServerError(
          err.response.data?.message ||
          "Este domínio de e-mail não é permitido. Use seu e-mail institucional da UFPB."
        );
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Ocorreu um erro ao registrar. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendConfirmation() {
    setResendStatus("sending");
    try {
      await resendConfirmation(registeredEmail);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  }

  // Show nothing while checking auth state
  if (loading) return null;

  // Success state: registration completed, waiting for email verification
  if (registrationSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Verifique seu e-mail</h1>
          <p className="auth-subtitle">
            Sua conta foi criada com sucesso! Enviamos um link de confirmação para{" "}
            <strong>{registeredEmail}</strong>.
          </p>

          <div className="auth-info-box" role="status">
            <p>
              Acesse sua caixa de entrada do e-mail institucional e clique no link
              de confirmação para ativar sua conta. O link é válido por 24 horas.
            </p>
            <p>
              Não se esqueça de verificar a pasta de spam caso o e-mail não apareça
              na caixa de entrada.
            </p>
          </div>

          {resendStatus === "sent" && (
            <div className="auth-success-banner" role="status" aria-live="polite">
              E-mail reenviado com sucesso!
            </div>
          )}
          {resendStatus === "error" && (
            <div className="auth-server-error" role="alert" aria-live="polite">
              Não foi possível reenviar o e-mail. Tente novamente em instantes.
            </div>
          )}

          <button
            type="button"
            className="auth-submit-btn auth-resend-btn"
            onClick={handleResendConfirmation}
            disabled={resendStatus === "sending" || resendStatus === "sent"}
          >
            {resendStatus === "sending"
              ? "Reenviando..."
              : resendStatus === "sent"
              ? "E-mail reenviado ✓"
              : "Reenviar e-mail de confirmação"}
          </button>

          <div className="auth-footer">
            <p>
              Já confirmou seu e-mail?{" "}
              <Link to="/login">Entrar</Link>
            </p>
            <Link to="/" className="auth-back-link">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Criar Conta</h1>
        <p className="auth-subtitle">Registre-se para acessar o FisioQuest</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="auth-server-error" role="alert" aria-live="polite">
              {serverError}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="register-fullName">Nome completo</label>
            <input
              id="register-fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.fullName && !!errors.fullName}
              autoComplete="name"
            />
            <span className="auth-field-error" aria-live="polite">
              {touched.fullName ? errors.fullName : ""}
            </span>
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">E-mail institucional</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.email && !!errors.email}
              autoComplete="email"
              placeholder="seu@academico.ufpb.br"
            />
            <span className="auth-field-error" aria-live="polite">
              {touched.email ? errors.email : ""}
            </span>
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.password && !!errors.password}
              autoComplete="new-password"
            />
            <span className="auth-field-error" aria-live="polite">
              {touched.password ? errors.password : ""}
            </span>
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirmPassword">Confirmar senha</label>
            <input
              id="register-confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
              autoComplete="new-password"
            />
            <span className="auth-field-error" aria-live="polite">
              {touched.confirmPassword ? errors.confirmPassword : ""}
            </span>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? "Registrando..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-footer">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
