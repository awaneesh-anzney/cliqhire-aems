"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authService, User } from '@/services/authService';
import { taskService, Task } from '@/services/taskService';
import { roleService } from '@/services/roleService';
import { initializeAuth } from '@/lib/axios-config';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  completeTask: (taskId: string) => Promise<Task>;
  updateFollowUpStatus: (taskId: string, status: 'pending' | 'in-progress' | 'completed') => Promise<Task>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading state
  const [isLoginLoading, setIsLoginLoading] = useState(false); // Separate state for login loading
  const [tasks, setTasks] = useState<Task[]>([]);
  const isFetchingTasksRef = useRef(false);
  const router = useRouter();

  // console.log('AuthContext: Current user state:', user);


  const checkAuth = async () => {
    try {
      setIsLoading(true); // Set loading to true when starting auth check
      
      // Check if we have user data in localStorage (this indicates previous login)
      const userData = authService.getUserData();
      
      if (userData) {
        // Set user immediately for faster UI response
        setUser(userData);
        setIsAuthenticated(true);
        
        // Also initialize axios authentication
        await initializeAuth();
        
        // Get tasks from localStorage only (no API call)
        const storedTasks = authService.getUserTasks();
        if (storedTasks) {
          setTasks(storedTasks);
        } else {
          setTasks([]);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setTasks([]);
      }
    } catch (error) {
      console.error('AuthContext: Error checking authentication:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); // Set loading to false when auth check completes
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoginLoading(true); // Show login loading during login attempt
      const response = await authService.login({ email, password });
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Initialize axios authentication after successful login
        await initializeAuth();
        
        // Immediately trigger myPermission API as requested
        try {
          await roleService.getMyPermissions();
        } catch (error) {
          console.error('AuthContext: Error fetching myPermissions on login:', error);
        }
        
        // Do not fetch or set tasks during login
        setTasks([]);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    } finally {
      setIsLoginLoading(false); // Hide login loading after login attempt
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true); // Show loading during logout
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setTasks([]);
      setIsLoading(false); // Hide loading after logout
    }
  };

  const refreshAuth = async () => {
    try {
      setIsLoading(true); // Show loading during refresh
      
      // Check if we have user data in localStorage
      const userData = authService.getUserData();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        
        // Also initialize axios authentication
        await initializeAuth();
        
        // Get tasks from localStorage only (no API call)
        const storedTasks = authService.getUserTasks();
        if (storedTasks) {
          setTasks(storedTasks);
        } else {
          setTasks([]);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error refreshing authentication:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); // Hide loading after refresh
    }
  };

  // Task management functions (subset retained in context)

  const completeTask = async (taskId: string): Promise<Task> => {
    try {
      const completedTask = await taskService.completeTask(taskId);
      setTasks(prev => prev.map(task => task.id === completedTask.id ? completedTask : task));
      return completedTask;
    } catch (error) {
      console.error('AuthContext: Error completing task:', error);
      throw error;
    }
  };

  const updateFollowUpStatus = async (taskId: string, status: 'pending' | 'in-progress' | 'completed'): Promise<Task> => {
    try {
      const updatedTask = await taskService.updateFollowUpStatus(taskId, status);
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
      return updatedTask;
    } catch (error) {
      console.error('AuthContext: Error updating follow-up status:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check authentication on component mount
    checkAuth();
  }, []);

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

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center gap-2 flex-col">
          <Loader className="size-6 animate-spin" />
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
