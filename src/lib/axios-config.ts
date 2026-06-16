/**
 * axios-config.ts  — Production Grade
 *
 * FIX LIST:
 *  1. accessToken sirf memory mein — browser reopen pe localStorage se restore
 *  2. initializeAxiosInterceptors() ek baar hi lagega (singleton guard)
 *  3. initializeAuth() file load hote hi auto-call HATA diya — sirf AuthContext call karega
 *  4. Refresh failure pe clean logout + redirect
 *  5. isRefreshing flag ke saath proper queue — no parallel /refresh calls
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Axios instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // HTTP-only cookie (refreshToken) bhejna zaroori hai
});

// ─── In-memory access token (tab/window lifecycle) ────────────────────────────
let accessToken: string | null = null;

// ─── Refresh queue — ek baar refresh, baaki wait karein ──────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token as string);
  });
  failedQueue = [];
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export const setAccessToken = (token: string): void => {
  accessToken = token;
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  // localStorage mein bhi rakhein — browser reopen ke baad restore hoga
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

export const getAccessToken = (): string | null => accessToken;

export const clearAccessToken = (): void => {
  accessToken = null;
  delete api.defaults.headers.common["Authorization"];
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
};

// ─── Refresh token API call ───────────────────────────────────────────────────

export const refreshToken = async (): Promise<string | null> => {
  // Agar pehle se refresh chal rahi hai, queue mein daal do
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // withCredentials: true already set hai — HTTP-only cookie automatically jayegi
    const response = await api.post<{
      success: boolean;
      data: { accessToken: string };
      message?: string;
    }>("/api/auth/refresh", {});

    if (response.data?.success && response.data?.data?.accessToken) {
      const newToken = response.data.data.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);
      return newToken;
    }

    throw new Error(response.data?.message ?? "Token refresh failed");
  } catch (err) {
    processQueue(err, null);
    clearAccessToken();
    throw err;
  } finally {
    isRefreshing = false;
  }
};

// ─── Initialize auth state (call ONLY from AuthContext on mount) ──────────────
/**
 * Sequence:
 *  1. Memory mein token hai → use karo (same tab, in-session)
 *  2. localStorage mein token hai → restore karo (browser reopen)
 *  3. Kuch nahi → HTTP-only cookie se refresh try karo
 *  4. Sab fail → false return, AuthContext logout karega
 */
export const initializeAuth = async (): Promise<boolean> => {
  // Step 1: already in memory
  if (accessToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    return true;
  }

  // Step 2: localStorage check
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("authToken");
    if (stored) {
      // Token milte hi memory mein set karo — header bhi lagao
      accessToken = stored;
      api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
      return true;
    }
  }

  // Step 3: HTTP-only cookie se refresh try karo
  try {
    const newToken = await refreshToken();
    return !!newToken;
  } catch {
    // Refresh bhi fail — user logged out
    return false;
  }
};

// ─── Interceptors — SINGLETON (ek baar hi lagein) ────────────────────────────
let interceptorsInitialized = false;

export const initializeAxiosInterceptors = (): void => {
  if (interceptorsInitialized) return; // Guard — duplicate interceptors nahi lagenge
  interceptorsInitialized = true;

  // Request: memory token har request pe lagao
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (accessToken && !config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response: 401 pe auto-refresh + retry
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const is401 = error.response?.status === 401;
      const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh");
      const alreadyRetried = originalRequest?._retry;

      if (is401 && !isRefreshEndpoint && !alreadyRetried && originalRequest) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch {
          // Refresh fail — login pe redirect
          clearAccessToken();
          if (typeof window !== "undefined") {
            // Thoda delay taaki pending state clean ho sake
            setTimeout(() => {
              window.location.href = "/login";
            }, 100);
          }
        }
      }

      return Promise.reject(error);
    },
  );
};

// Interceptors immediately lagao — but initializeAuth() mat chalao
// initializeAuth() sirf AuthContext/checkAuth() chalayega
initializeAxiosInterceptors();

export { api };
