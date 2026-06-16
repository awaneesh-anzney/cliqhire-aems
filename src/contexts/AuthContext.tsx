"use client";

/**
 * AuthContext.tsx — Production Grade
 *
 * FIX LIST:
 *  1. AuthProvider ab khud <AuthLoading> render NAHI karega — sirf state manage karega
 *     (pehle isLoading=true pe pura app unmount ho jaata tha → UI stuck)
 *  2. checkAuth() mein initializeAuth() sirf ek baar call hoga
 *  3. login() ke baad dobara initializeAuth() call NAHI (setAccessToken already ho gaya)
 *  4. isLoginLoading aur isLoading alag — login spinner aur app-level loading alag
 *  5. logout() pe isLoading true nahi karega — UI flicker band
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { authService, User } from "@/services/authService";
import { taskService, Task } from "@/services/taskService";
import { roleService } from "@/services/roleService";
import { initializeAuth, clearAccessToken } from "@/lib/axios-config";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // app startup auth check
  isLoginLoading: boolean; // login button spinner
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  completeTask: (taskId: string) => Promise<Task>;
  updateFollowUpStatus: (
    taskId: string,
    status: "pending" | "in-progress" | "completed",
  ) => Promise<Task>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Guard: checkAuth sirf ek baar mount pe chale
  const hasCheckedAuth = useRef(false);

  // ── checkAuth ──────────────────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. localStorage se user data check karo (fast path)
      const userData = authService.getUserData();

      if (userData) {
        // Token memory mein restore karo (localStorage ya cookie se)
        const tokenRestored = await initializeAuth();

        if (tokenRestored) {
          // User data milgaya aur token valid hai — state set karo
          setUser(userData);
          setIsAuthenticated(true);

          // Tasks localStorage se load karo (no API call on startup)
          const storedTasks = authService.getUserTasks();
          setTasks(storedTasks ?? []);
        } else {
          // Token restore fail hua, matlab stale data hai — clear karo
          if (typeof window !== "undefined") {
            localStorage.removeItem("userData");
            localStorage.removeItem("userTasks");
            localStorage.removeItem("authToken");
          }
          setUser(null);
          setIsAuthenticated(false);
          setTasks([]);
        }
      } else {
        // localStorage mein kuch nahi — cookie se refresh try karo
        const tokenRestored = await initializeAuth();

        if (!tokenRestored) {
          // Kuch bhi nahi mila — logged out state
          setUser(null);
          setIsAuthenticated(false);
          setTasks([]);
        } else {
          // Token mila cookie se, but userData nahi — /profile se fetch karo
          try {
            const profileRes = await authService.getProfile();
            const fetchedUser = profileRes?.data?.user ?? null;
            if (fetchedUser) {
              setUser(fetchedUser);
              setIsAuthenticated(true);
              // localStorage mein save karo future refreshes ke liye
              if (typeof window !== "undefined") {
                localStorage.setItem("userData", JSON.stringify(fetchedUser));
              }
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
    } catch (error) {
      console.error("[AuthContext] checkAuth error:", error);
      setUser(null);
      setIsAuthenticated(false);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoginLoading(true);
      const response = await authService.login({ email, password });

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        // NOTE: setAccessToken pehle se authService.login() ke andar call ho chuka hai
        // initializeAuth() dobara mat chalao — woh unnecessary refresh karega

        // Permissions background mein fetch karo (non-blocking)
        roleService.getMyPermissions().catch((err) => {
          console.error("[AuthContext] permissions fetch error on login:", err);
        });

        setTasks([]);
        return true;
      }

      return false;
    } catch (error) {
      console.error("[AuthContext] login error:", error);
      return false;
    } finally {
      setIsLoginLoading(false);
    }
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // API call try karo — fail ho toh bhi local cleanup hoga
      await authService.logout();
    } catch (error) {
      console.error("[AuthContext] logout error:", error);
    } finally {
      // isLoading TRUE mat karo logout pe — UI flicker hota hai
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
      setTasks([]);
    }
  }, []);

  // ── refreshAuth ────────────────────────────────────────────────────────────
  // Yeh checkAuth ka alias hai — components use kar sakte hain
  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  // ── Task management ────────────────────────────────────────────────────────

  const completeTask = useCallback(async (taskId: string): Promise<Task> => {
    const completedTask = await taskService.completeTask(taskId);
    setTasks((prev) => prev.map((t) => (t.id === completedTask.id ? completedTask : t)));
    return completedTask;
  }, []);

  const updateFollowUpStatus = useCallback(
    async (taskId: string, status: "pending" | "in-progress" | "completed"): Promise<Task> => {
      const updatedTask = await taskService.updateFollowUpStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      return updatedTask;
    },
    [],
  );

  // ── Mount: ek baar checkAuth ───────────────────────────────────────────────
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    checkAuth();
  }, [checkAuth]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isLoginLoading,
    login,
    logout,
    checkAuth,
    refreshAuth,
    completeTask,
    updateFollowUpStatus,
  };

  /**
   * CRITICAL FIX:
   * AuthProvider ab children ko HAMESHA render karega — isLoading pe NAHI rokega.
   * Loading state AuthGuard handle karega (sirf protected routes pe).
   * Isse pura app unmount nahi hoga aur UI stuck nahi hoga.
   */
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
