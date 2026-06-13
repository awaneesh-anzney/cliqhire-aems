import { useQuery } from '@tanstack/react-query';
import { taskService, MyTasksResponse } from '@/services/taskService';

export const useMyTasks = (filters?: {
  type?: string;
  status?: string;
  search?: string;
  priority?: string;
  category?: string;
  dueBefore?: string;
  dueAfter?: string;
  page?: number;
  limit?: number;
}) => {
    return useQuery<MyTasksResponse, Error>({
        queryKey: ['my-tasks', filters],
        queryFn: () => taskService.getMyTasks(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};
