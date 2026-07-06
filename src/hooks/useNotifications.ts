import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService, GetNotificationsParams } from '@/services/notificationService';
import { toast } from 'sonner';

export const useNotificationsQuery = (filters?: GetNotificationsParams) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationService.getNotifications(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUnreadNotificationsCountQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark notification as read: ${error.message}`);
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark all as read: ${error.message}`);
    }
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete notification: ${error.message}`);
    }
  });

  const clearRead = useMutation({
    mutationFn: () => notificationService.clearReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Read notifications cleared');
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear read notifications: ${error.message}`);
    }
  });

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead
  };
};
