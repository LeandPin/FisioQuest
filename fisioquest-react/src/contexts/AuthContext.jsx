import { createContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

// Access_Token armazenado em variável de módulo (fora do React state)
// Inacessível via XSS, perdido ao fechar o browser
let accessTokenMemory = null;

/**
 * Retorna o Access_Token atual armazenado em memória.
 * Exportado para uso pelo apiClient.js sem dependência circular.
 */
export const getAccessToken = () => accessTokenMemory;

/**
 * Define o Access_Token em memória.
 * Exportado para uso pelo apiClient.js (ex.: após refresh via interceptor).
 */
export const setAccessToken = (token) => {
  accessTokenMemory = token;
};

/**
 * Limpa o Access_Token da memória.
 * Exportado para uso pelo apiClient.js (ex.: após falha no refresh).
 */
export const clearAccessToken = () => {
  accessTokenMemory = null;
};

/**
 * Decodifica o payload de um JWT (base64url) sem dependência externa.
 * Retorna o objeto JSON do payload.
 */
function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const payload = parts[1];
  // base64url → base64
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const jsonStr = atob(base64);
  return JSON.parse(jsonStr);
}

// Instância axios local para evitar dependência circular com apiClient
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref para armazenar o timeout do refresh proativo
  const refreshTimeoutRef = useRef(null);

  /**
   * Agenda um refresh proativo do Access_Token 2 minutos antes da expiração.
   * Usa setTimeout (não setInterval). Limpa qualquer timeout anterior.
   */
  const scheduleProactiveRefresh = useCallback((token) => {
    // Limpa timeout anterior se existir
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    try {
      const payload = decodeJwtPayload(token);
      const expMs = payload.exp * 1000;
      // Agenda refresh 2 minutos (120s) antes da expiração
      const refreshAt = expMs - 120 * 1000;
      const delay = refreshAt - Date.now();

      if (delay > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshToken();
        }, delay);
      }
    } catch {
      // Se não conseguir decodificar o token, não agenda refresh
    }
  }, []);

  /**
   * POST /api/auth/refresh — Renova a sessão via cookie HttpOnly.
   * Em caso de sucesso: armazena novo accessToken, atualiza user, agenda refresh.
   * Em caso de falha: limpa estado silenciosamente.
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await authApi.post("/api/auth/refresh");
      const { accessToken } = response.data;

      accessTokenMemory = accessToken;

      const payload = decodeJwtPayload(accessToken);
      setUser({
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
      });

      scheduleProactiveRefresh(accessToken);

      return accessToken;
    } catch {
      // Falha silenciosa — sessão não pode ser restaurada
      accessTokenMemory = null;
      setUser(null);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      return null;
    }
  }, [scheduleProactiveRefresh]);

  /**
   * POST /api/auth/login — Autentica o fisioterapeuta.
   * Armazena accessToken em memória, decodifica JWT para extrair user info,
   * agenda refresh proativo.
   */
  const login = useCallback(
    async (email, password) => {
      const response = await authApi.post("/api/auth/login", {
        email,
        password,
      });
      const { accessToken } = response.data;

      accessTokenMemory = accessToken;

      const payload = decodeJwtPayload(accessToken);
      setUser({
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
      });

      scheduleProactiveRefresh(accessToken);
    },
    [scheduleProactiveRefresh]
  );

  /**
   * POST /api/auth/register — Registra um novo fisioterapeuta.
   * Após sucesso, automaticamente chama login para estabelecer a sessão.
   */
  const register = useCallback(
    async (fullName, email, password) => {
      await authApi.post("/api/auth/register", {
        fullName,
        email,
        password,
      });
      // Após registro bem-sucedido, faz login automaticamente
      await login(email, password);
    },
    [login]
  );

  /**
   * POST /api/auth/logout — Encerra a sessão.
   * Envia Bearer token, limpa accessToken da memória, limpa user e cancela refresh.
   */
  const logout = useCallback(async () => {
    try {
      await authApi.post("/api/auth/logout", null, {
        headers: {
          Authorization: `Bearer ${accessTokenMemory}`,
        },
      });
    } catch {
      // Mesmo se o logout falhar no servidor, limpa estado local
    } finally {
      accessTokenMemory = null;
      setUser(null);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }
  }, []);

  // Tenta restaurar sessão via refresh ao montar (cookie ainda válido)
  useEffect(() => {
    refreshToken().finally(() => setLoading(false));
  }, [refreshToken]);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, getAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}
