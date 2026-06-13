import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService, CreateTaskRequest, Task } from '@/services/taskService';
import { toast } from 'sonner';

export const usePersonalTasks = () => {
    const queryClient = useQueryClient();

    // Create Personal Task
    const createPersonalTask = useMutation({
        mutationFn: (taskData: Partial<CreateTaskRequest> & { title: string }) =>
            taskService.createPersonalTask(taskData),
        onSuccess: async (data) => {
            toast.success('Personal task created successfully');
            await queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
        },
        onError: (error: Error) => {
            toast.error(`Failed to create task: ${error.message}`);
        }
    });

    // Update Personal Task
    const updatePersonalTask = useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) =>
            taskService.updatePersonalTask(taskId, data),
        onSuccess: async () => {
            toast.success('Personal task updated successfully');
            await queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
        },
        onError: (error: Error) => {
            toast.error(`Failed to update task: ${error.message}`);
        }
    });

    // Update Personal Task Status (special case if needed, or just use updatePersonalTask)
    const updatePersonalTaskStatus = useMutation({
        mutationFn: ({ taskId, status }: { taskId: string; status: 'to-do' | 'inprogress' | 'completed' }) =>
            taskService.updatePersonalTaskStatus(taskId, status),
        onSuccess: async () => {
            toast.success('Task status updated');
            await queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
        },
        onError: (error: Error) => {
            toast.error(`Failed to update status: ${error.message}`);
        }
    });

    // Delete Personal Task
    const deletePersonalTask = useMutation({
        mutationFn: (taskId: string) => taskService.deletePersonalTask(taskId),
        onSuccess: async () => {
            toast.success('Personal task deleted successfully');
            await queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete task: ${error.message}`);
        }
    });

    return {
        createPersonalTask,
        updatePersonalTask,
        updatePersonalTaskStatus,
        deletePersonalTask
    };
};

export const usePersonalTasksQuery = (filters?: {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['personal-tasks', filters],
    queryFn: () => taskService.getPersonalTasks(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
