import axios, { AxiosError } from "axios";
import { api, setAccessToken, clearAccessToken } from "@/lib/axios-config";

// Create a separate axios instance for login/register without interceptors
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Types for authentication data
export interface RegisterUserData {
  firstName:string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
  defaultPermissions?: string[];
  profile?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    teamRole?: string;
  };
}

// API Response interfaces
export interface ApiResponse<T> {
  status: string;
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
  tasks?: any[]; // Add tasks to login response
}

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL ;
  
  constructor() {
    // AuthService initialization
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterUserData): Promise<RegisterResponse> {
    try {
      // Create payload with plain passwords
      const payload = {
        firstName: userData.firstName,
        lastName:userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      };
      
      // Make real API call to Express backend using the auth-specific instance
      const response = await authApi.post('/auth/register', payload);

      // Extract data from response - your API returns accessToken and user
      const { accessToken, user } = response.data.data;
      
      // Store token in memory and localStorage for persistence
      setAccessToken(accessToken);
      
      // Store token in localStorage for persistence (in development)
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('userData', JSON.stringify(user));
      }

      return {
        success: true,
        message: 'Registration successful',
        user: user,
        token: accessToken
      };
    } catch (error) {
      console.error('Error registering user:', error);
      
      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data as any;
        
        return {
          success: false,
          message: errorData?.message || axiosError.message || 'Registration failed'
        };
      }
      
      // Handle other errors
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Login user
   */
  async login(userData: LoginUserData): Promise<LoginResponse> {
    try {
      // Create payload with plain password
      const payload = {
        email: userData.email,
        password: userData.password,
      };
      
      // Make real API call to Express backend using the auth-specific instance
      const response = await authApi.post('/api/auth/login', payload);

      // Extract data from response - your API returns accessToken, user, and tasks
      const { accessToken, user, tasks } = response.data.data;

      console.log('User profile details after login:', user);
      
      // Store token in memory and localStorage for persistence
      setAccessToken(accessToken);
      
      // Store token in localStorage for persistence (in development)
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('userData', JSON.stringify(user));
        // Store tasks in localStorage for immediate access
        if (tasks) {
          localStorage.setItem('userTasks', JSON.stringify(tasks));
        }
      }

      return {
        success: true,
        message: 'Login successful',
        user: user,
        token: accessToken,
        tasks: tasks
      };
    } catch (error) {
      console.error('AuthService: Error logging in user:', error);
      
      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data as any;
        
        
        return {
          success: false,
          message: errorData?.message || axiosError.message || 'Login failed'
        };
      }
      
      // Handle other errors
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      // Make logout request to Express backend using the configured api instance
      // This will clear the refresh token cookie on the server
      await api.post('/api/auth/logout');
      
      // Clear access token from memory
      clearAccessToken();
      
      // Clear user data and token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userTasks');
      }
      
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Even if the API call fails, clear local data
      clearAccessToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userTasks');
      }
      
      return {
        success: false,
        message: 'Logout completed (local cleanup)'
      };
    }
  }

  /**
   * Get user tasks from localStorage
   */
  getUserTasks(): any[] | null {
    if (typeof window !== 'undefined') {
      const userTasks = localStorage.getItem('userTasks');
      if (userTasks) {
        try {
          return JSON.parse(userTasks);
        } catch (error) {
          console.error('Error parsing user tasks:', error);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Get user data from localStorage
   */
  getUserData(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Make API call to change password
      const response = await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data as any;
        
        return {
          success: false,
          message: errorData?.message || axiosError.message || 'Failed to change password'
        };
      }
      
      // Handle other errors
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to change password'
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getUserData() !== null;
  }
}

// Export a singleton instance
export const authService = new AuthService();
