import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { api } from '../../lib/api';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true, // starts loading — we try silent refresh on mount
  });

  // Refs to keep the latest token accessible inside interceptors without
  // re-registering them on every render.
  const tokenRef = useRef<string | null>(null);
  const isRefreshingRef = useRef(false);
  const queueRef = useRef<QueueItem[]>([]);

  // Helper: update token in both state and ref
  const setToken = useCallback((token: string | null) => {
    tokenRef.current = token;
    setState((prev) => ({
      ...prev,
      accessToken: token,
      isAuthenticated: token !== null,
    }));
  }, []);

  // ---- refreshToken (internal) -------------------------------------------

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await api.post<{ accessToken: string; user: User }>(
        '/auth/refresh',
      );
      const newToken = res.data.accessToken;
      setToken(newToken);
      setState((prev) => ({ ...prev, user: res.data.user }));
      return newToken;
    } catch {
      setToken(null);
      setState((prev) => ({ ...prev, user: null }));
      return null;
    }
  }, [setToken]);

  // ---- login -------------------------------------------------------------

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ accessToken: string; user: User }>(
        '/auth/login',
        { email, password },
      );

      const { accessToken: newToken, user } = res.data;
      tokenRef.current = newToken;
      setState({
        user,
        accessToken: newToken,
        isAuthenticated: true,
        isLoading: false,
      });
    },
    [],
  );

  // ---- logout ------------------------------------------------------------

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // swallow — we clean up client-side regardless
    }
    tokenRef.current = null;
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // ---- Axios interceptors (register once) --------------------------------

  useEffect(() => {
    // Request interceptor — attach current token
    const reqId = api.interceptors.request.use((config) => {
      const token = tokenRef.current;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor — handle 401 with token refresh queue
    const resId = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as
          | (InternalAxiosRequestConfig & { _retry?: boolean })
          | undefined;

        if (
          error.response?.status !== 401 ||
          !originalRequest ||
          originalRequest._retry ||
          originalRequest.url?.includes('/auth/')
        ) {
          return Promise.reject(error);
        }

        // If we're already refreshing, queue this request
        if (isRefreshingRef.current) {
          return new Promise<string>((resolve, reject) => {
            queueRef.current.push({ resolve, reject });
          }).then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshingRef.current = true;

        try {
          const newToken = await refreshToken();
          if (!newToken) {
            // Refresh failed — reject everything in queue and logout
            queueRef.current.forEach((q) => q.reject(error));
            queueRef.current = [];
            // logout is handled inside refreshToken when it fails
            return Promise.reject(error);
          }

          // Resolve queued requests
          queueRef.current.forEach((q) => q.resolve(newToken));
          queueRef.current = [];

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } finally {
          isRefreshingRef.current = false;
        }
      },
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [refreshToken]);

  // ---- Silent refresh on mount -------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function tryRestore() {
      try {
        const res = await api.post<{ accessToken: string; user: User }>(
          '/auth/refresh',
        );
        if (cancelled) return;
        const newToken = res.data.accessToken;
        tokenRef.current = newToken;

        setState({
          user: res.data.user,
          accessToken: newToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    tryRestore();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Value -------------------------------------------------------------

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
