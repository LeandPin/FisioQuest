import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock AuthContext exports
vi.mock('../contexts/AuthContext', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}));

import { getAccessToken, setAccessToken, clearAccessToken } from '../contexts/AuthContext';

describe('apiClient', () => {
  let apiClient;

  beforeEach(async () => {
    vi.resetModules();
    vi.resetAllMocks();

    // Re-mock after resetModules
    vi.mock('../contexts/AuthContext', () => ({
      getAccessToken: vi.fn(),
      setAccessToken: vi.fn(),
      clearAccessToken: vi.fn(),
    }));

    const mod = await import('./apiClient.js');
    apiClient = mod.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('instance configuration', () => {
    it('should have withCredentials set to true', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });
  });

  describe('request interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      const { getAccessToken } = await import('../contexts/AuthContext');
      getAccessToken.mockReturnValue('my-access-token');

      // Intercept the actual request to inspect headers
      const intercepted = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: {},
      });

      expect(intercepted.headers.Authorization).toBe('Bearer my-access-token');
    });

    it('should not add Authorization header when token is null', async () => {
      const { getAccessToken } = await import('../contexts/AuthContext');
      getAccessToken.mockReturnValue(null);

      const intercepted = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: {},
      });

      expect(intercepted.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('should pass through successful responses', async () => {
      const response = { status: 200, data: { ok: true } };
      const result = apiClient.interceptors.response.handlers[0].fulfilled(response);
      expect(result).toEqual(response);
    });

    it('should attempt refresh on 401 without _retry flag', async () => {
      const { setAccessToken } = await import('../contexts/AuthContext');

      // Mock the refresh call via axios.create — we spy on the refreshClient behavior
      const postSpy = vi.spyOn(axios, 'create');

      const originalRequest = {
        headers: {},
        _retry: undefined,
      };

      const error = {
        config: originalRequest,
        response: { status: 401 },
      };

      // We can't easily test the full flow without a network mock,
      // but we verify the _retry flag is set
      const rejectedHandler = apiClient.interceptors.response.handlers[0].rejected;

      // The refresh call will fail (no real server), which triggers clearAccessToken + redirect
      const originalHref = Object.getOwnPropertyDescriptor(window, 'location');
      delete window.location;
      window.location = { href: '' };

      const { clearAccessToken: clearFn } = await import('../contexts/AuthContext');

      try {
        await rejectedHandler(error);
      } catch {
        // Expected to reject
      }

      // The _retry flag should have been set
      expect(originalRequest._retry).toBe(true);

      // Restore location
      if (originalHref) {
        Object.defineProperty(window, 'location', originalHref);
      } else {
        window.location = { href: '' };
      }
    });

    it('should reject non-401 errors without retry', async () => {
      const error = {
        config: { headers: {} },
        response: { status: 500 },
      };

      const rejectedHandler = apiClient.interceptors.response.handlers[0].rejected;

      await expect(rejectedHandler(error)).rejects.toEqual(error);
    });

    it('should not retry if _retry flag is already set', async () => {
      const error = {
        config: { headers: {}, _retry: true },
        response: { status: 401 },
      };

      const rejectedHandler = apiClient.interceptors.response.handlers[0].rejected;

      await expect(rejectedHandler(error)).rejects.toEqual(error);
    });
  });
});
