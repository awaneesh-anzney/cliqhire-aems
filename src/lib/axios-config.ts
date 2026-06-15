import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: This allows cookies to be sent
});

// Store access token in memory (not localStorage for security)
let accessToken: string | null = null;

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Refresh token function
export const refreshToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // Call refresh token endpoint - refresh token is automatically sent via HTTP-only cookie
    const response = await api.post('/api/auth/refresh', {});

    if (response.data && response.data.success) {
      const newToken = response.data.data.accessToken;
      
      // Store new access token in memory only
      accessToken = newToken;
      
      // Update axios default headers for both instances
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      processQueue(null, newToken);
      return newToken;
    } else {
      throw new Error(response.data?.message || 'Failed to refresh token');
    }
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    
    // Clear access token on refresh failure
    accessToken = null;
    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
    
    processQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Function to set access token (called after login)
export const setAccessToken = (token: string) => {
  accessToken = token;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Function to get current access token
export const getAccessToken = (): string | null => {
  return accessToken;
};

// Function to clear access token (called on logout)
export const clearAccessToken = () => {
  accessToken = null;
  delete axios.defaults.headers.common['Authorization'];
  delete api.defaults.headers.common['Authorization'];
  
  // Also clear from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// Function to manually trigger token refresh (for debugging)
export const forceTokenRefresh = async () => {
  try {
    const newToken = await refreshToken();
    return newToken;
  } catch (error) {
    console.error('Manual token refresh failed:', error);
    return null;
  }
};

// Initialize axios interceptors for global token refresh
export const initializeAxiosInterceptors = () => {
  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;

        try {
          await refreshToken();
          // Retry the original request with new token
          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Redirect to login on refresh failure
          if (typeof window !== 'undefined') {
            clearAccessToken();
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Also set up interceptors for the default axios instance
  axios.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;

        try {
          await refreshToken();
          // Retry the original request with new token
          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Redirect to login on refresh failure
          if (typeof window !== 'undefined') {
            clearAccessToken();
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Function to initialize authentication state (call this on app startup)
export const initializeAuth = async (): Promise<boolean> => {
  try {
    // Check if we have an access token in memory
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return true;
    }
    
    // If no token in memory, check localStorage (for development/testing)
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setAccessToken(storedToken);
        return true;
      }
    }
    
    // If no token found, try to refresh from server
    try {
      const newToken = await refreshToken();
      if (newToken) {
        return true;
      }
    } catch (refreshError) {
      console.log('No valid refresh token available');
    }
    
    return false;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return false;
  }
};

// Export the configured api instance
export { api };

// Initialize the interceptors immediately
initializeAxiosInterceptors();
