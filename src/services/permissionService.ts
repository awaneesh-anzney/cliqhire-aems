import { api } from "@/lib/axios-config";

export interface UserPermissions {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    teamRole: string;
    status: string;
    department: string;
  };
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsInfo {
  availablePermissions: string[];
  availableRoles: string[];
  roleDefaultPermissions: Record<string, string[]>;
  permissionsDescription: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UsersPermissionsResponse {
  users: UserPermissions[];
  availablePermissions: string[];
}

export interface UserPermissionsResponse {
  user: UserPermissions;
  availablePermissions: string[];
  defaultPermissionsForRole: string[];
}

export interface UpdatePermissionsRequest {
  permissions?: string[];
  role?: string;
}

export interface ResetPermissionsResponse {
  user: UserPermissions;
  defaultPermissions: string[];
}

class PermissionService {
  constructor() {}

  /**
   * Get all users with their permissions
   */
  async getAllUsers(): Promise<ApiResponse<UsersPermissionsResponse>> {
    try {
      const response = await api.get(`/api/users/permissions`);
      return response.data;
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user permissions by ID
   */
  async getUserPermissions(userId: string): Promise<ApiResponse<UserPermissionsResponse>> {
    try {
      const response = await api.get(`/api/users/permissions/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error in getUserPermissions:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user permissions and/or role
   */
  async updateUserPermissions(
    userId: string,
    data: UpdatePermissionsRequest,
  ): Promise<ApiResponse<{ user: UserPermissions }>> {
    try {
      const response = await api.put(`/api/users/permissions/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error in updateUserPermissions:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Reset user permissions to default for their role
   */
  async resetUserPermissions(userId: string): Promise<ApiResponse<ResetPermissionsResponse>> {
    try {
      const response = await api.post(`/api/users/permissions/${userId}/reset`);
      return response.data;
    } catch (error) {
      console.error("Error in resetUserPermissions:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get permissions information (available permissions, roles, etc.)
   */
  async getPermissionsInfo(): Promise<ApiResponse<PermissionsInfo>> {
    try {
      const response = await api.get(`/api/users/permissions-info`);
      return response.data;
    } catch (error) {
      console.error("Error in getPermissionsInfo:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors and provide meaningful error messages
   */
  private handleError(error: any): Error {
    console.error("Permission service error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return new Error(data.message || "Invalid request data");
        case 401:
          return new Error("Access denied. Please log in again.");
        case 403:
          return new Error(data.message || "You do not have permission to perform this action");
        case 404:
          return new Error(data.message || "User not found");
        case 500:
          return new Error(data.message || "Internal server error");
        default:
          return new Error(data.message || `HTTP error! status: ${status}`);
      }
    }

    if (error.request) {
      return new Error("Network error. Please check your connection.");
    }

    return new Error(error.message || "An unexpected error occurred");
  }
}

export const permissionService = new PermissionService();
export default permissionService;
