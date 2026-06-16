/**
 * authService.ts — Production Grade
 *
 * FIX LIST:
 *  1. login() mein setAccessToken ke baad initializeAuth() call HATA diya
 *     (pehle duplicate token restore hoti thi → extra refresh calls)
 *  2. logout() mein clearAccessToken() AuthContext karega — yahan sirf localStorage clean
 *  3. Password localStorage mein mat rakho (security risk) — sirf email remember karo
 *  4. authApi ka baseURL correct kiya — /api prefix include hai backend mein
 *  5. tasks response ka type theek kiya
 */

import axios, { AxiosError } from "axios";
import { api, setAccessToken, clearAccessToken } from "@/lib/axios-config";
import type { Task } from "@/services/taskService";

// ─── Auth-specific axios instance (no interceptors — login/register ke liye) ──
// Yeh instance interceptors se alag hai taaki login fail pe infinite loop na ho
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 15000,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamRole?: string;
  phone?: string;
  countryCode?: string;
  location?: string;
  experience?: string;
  status?: string;
  department?: string;
  specialization?: string;
  skills?: string[];
  resume?: string;
  avatar?: string;
  gender?: string;
  registrationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
  defaultPermissions?: string[];
  profile?: UserProfile;
}

export interface ApiResponse<T> {
  status: string;
  success?: boolean;
  message?: string;
  data?: T;
  results?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
  tasks?: Task[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeLocalStorageGet = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: unknown): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceed ya private mode — silently ignore
  }
};

const safeLocalStorageRemove = (...keys: string[]): void => {
  if (typeof window === "undefined") return;
  keys.forEach((k) => localStorage.removeItem(k));
};

// ─── AuthService ──────────────────────────────────────────────────────────────

class AuthService {
  // ── register ────────────────────────────────────────────────────────────────
  async register(userData: RegisterUserData): Promise<RegisterResponse> {
    try {
      const response = await authApi.post("/api/auth/register", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      });

      const { accessToken, refreshToken, user } = response.data.data;

      setAccessToken(accessToken);
      safeLocalStorageSet("userData", user);
      if (refreshToken) safeLocalStorageSet("refreshToken", refreshToken);
      // authToken already setAccessToken ke andar set hota hai

      return { success: true, message: "Registration successful", user, token: accessToken };
    } catch (error) {
      console.error("[authService] register error:", error);
      const msg = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : "Registration failed";
      return { success: false, message: msg };
    }
  }

  // ── login ───────────────────────────────────────────────────────────────────
  async login(userData: LoginUserData): Promise<LoginResponse> {
    try {
      const response = await authApi.post("/api/auth/login", {
        email: userData.email,
        password: userData.password,
      });

      const { accessToken, refreshToken, user, tasks } = response.data.data as {
        accessToken: string;
        refreshToken?: string;
        user: User;
        tasks?: Task[];
      };

      // Token memory + localStorage mein set karo
      setAccessToken(accessToken);

      // User data localStorage mein — checkAuth fast path ke liye
      safeLocalStorageSet("userData", user);
      if (refreshToken) safeLocalStorageSet("refreshToken", refreshToken);

      if (tasks?.length) {
        safeLocalStorageSet("userTasks", tasks);
      }

      // NOTE: initializeAuth() yahan NAHI — setAccessToken pehle se sab kar chuka hai
      // Dobara call karne se unnecessary /api/auth/refresh call hoti thi

      return { success: true, message: "Login successful", user, token: accessToken, tasks };
    } catch (error) {
      console.error("[authService] login error:", error);
      const msg = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : "Login failed";
      return { success: false, message: msg };
    }
  }

  // ── logout ──────────────────────────────────────────────────────────────────
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      // Server logout fail — local cleanup zaroori hai
      console.error("[authService] logout API error (non-fatal):", error);
    } finally {
      // NOTE: clearAccessToken() AuthContext.logout() karega
      // Yahan sirf persistent storage clean karo
      safeLocalStorageRemove("userData", "authToken", "refreshToken", "userTasks");
    }
    return { success: true, message: "Logged out successfully" };
  }

  // ── getUserData ─────────────────────────────────────────────────────────────
  getUserData(): User | null {
    return safeLocalStorageGet<User>("userData");
  }

  // ── getUserTasks ────────────────────────────────────────────────────────────
  getUserTasks(): Task[] | null {
    return safeLocalStorageGet<Task[]>("userTasks");
  }

  // ── getProfile ──────────────────────────────────────────────────────────────
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await api.get("/api/auth/profile");
    return response.data;
  }

  // ── updateProfile ───────────────────────────────────────────────────────────
  async updateProfile(
    data: FormData | Record<string, unknown>,
  ): Promise<ApiResponse<{ user: User }>> {
    const response = await api.put("/api/auth/profile", data);
    // localStorage mein bhi update karo
    if (response.data?.data) {
      const current = this.getUserData();
      if (current) {
        safeLocalStorageSet("userData", { ...current, ...response.data.data });
      }
    }
    return response.data;
  }

  // ── changePassword ──────────────────────────────────────────────────────────
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await api.put("/api/auth/change-password", { currentPassword, newPassword });
      return { success: true, message: "Password changed successfully" };
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? error.message)
        : "Failed to change password";
      return { success: false, message: msg };
    }
  }

  // ── forgotPassword ──────────────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      return {
        success: true,
        message:
          response.data.message ??
          "If this email is registered, a password reset link has been sent.",
      };
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? error.message)
        : "Failed to process request";
      return { success: false, message: msg };
    }
  }

  // ── resetPassword ───────────────────────────────────────────────────────────
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post("/api/auth/reset-password", { token, newPassword });
      return {
        success: true,
        message: response.data.message ?? "Password reset successfully.",
      };
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? error.message)
        : "Failed to reset password";
      return { success: false, message: msg };
    }
  }
}

// Singleton export
export const authService = new AuthService();
