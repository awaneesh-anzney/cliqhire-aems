import { api } from '@/lib/axios-config';

export interface ReferredUser {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  position?: string;
  createdAt: string;
  __v: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const getReferredList = async (): Promise<ReferredUser[]> => {
  try {
    const response = await api.get<ApiResponse<ReferredUser[]>>('/api/referred');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch referred list');
  } catch (error) {
    console.error('Error fetching referred list:', error);
    throw error;
  }
};

export const createReferredUser = async (userData: Omit<ReferredUser, '_id' | 'createdAt' | '__v'>): Promise<ReferredUser> => {
  try {
    const response = await api.post<ApiResponse<ReferredUser>>('/api/referred', userData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create referred user');
  } catch (error: any) {
    console.error('Error creating referred user:', error);3
    throw error.response?.data || error;
  }
};
