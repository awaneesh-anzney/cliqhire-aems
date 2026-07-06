/**
 * notificationService.ts
 *
 * Handles API requests related to notifications:
 * - Fetch paginated notifications
 * - Fetch unread notifications count
 * - Mark individual/all notifications as read
 * - Clear read notifications
 * - Delete individual notifications
 */

import { api } from "@/lib/axios-config";

export interface NotificationUserRef {
  _id: string;
  name: string;
  email: string;
}

export interface NotificationJobRef {
  _id: string;
  title: string;
}

export interface NotificationCandidateRef {
  _id: string;
  name: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  relatedAssignment: string | null;
  relatedJob: NotificationJobRef | null;
  relatedCandidate: NotificationCandidateRef | null;
  triggeredBy: NotificationUserRef | null;
  metadata: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  actionUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

class NotificationService {
  /**
   * Get all notifications for logged-in user
   */
  async getNotifications(params?: GetNotificationsParams): Promise<NotificationsResponse> {
    try {
      const response = await api.get<NotificationsResponse>('/api/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const response = await api.get<UnreadCountResponse>('/api/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error fetching unread count:', error);
      throw new Error('Failed to fetch unread count');
    }
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<{ success: boolean; data: Notification }> {
    try {
      const response = await api.patch<{ success: boolean; data: Notification }>(`/api/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`NotificationService: Error marking notification ${id} as read:`, error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.patch<{ success: boolean; message?: string }>('/api/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error marking all as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete<{ success: boolean; message?: string }>(`/api/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`NotificationService: Error deleting notification ${id}:`, error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete<{ success: boolean; message?: string }>('/api/notifications/clear-read');
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error clearing read notifications:', error);
      throw new Error('Failed to clear read notifications');
    }
  }
}

export const notificationService = new NotificationService();
