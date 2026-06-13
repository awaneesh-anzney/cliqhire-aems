import axios from 'axios';
import { api } from '@/lib/axios-config';

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'to-do' | 'inprogress' | 'completed';
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  // Follow-up specific fields
  followUpType?: "cv-received" | "candidate-response" | "client-feedback" | "interview-scheduled" | "offer-sent" | "other";
  followUpStatus?: "pending" | "in-progress" | "completed";
  relatedCandidate?: string;
  relatedJob?: string;
  relatedClient?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  isReminder?: boolean;
  reminderDate?: string;
  // Specific fields for other internal task types if needed
  followUpType?: 'cv-received' | 'candidate-response' | 'client-feedback' | 'interview-scheduled' | 'offer-sent' | 'other';
  relatedCandidate?: string;
  relatedJob?: string;
  relatedClient?: string;
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  category?: 'follow-up' | 'admin' | 'research' | 'meeting' | 'other';
  followUpType?: 'cv-received' | 'candidate-response' | 'client-feedback' | 'interview-scheduled' | 'offer-sent' | 'other';
  followUpStatus?: 'pending' | 'in-progress' | 'completed';
  relatedCandidate?: string;
  relatedJob?: string;
  relatedClient?: string;
}

export interface TasksResponse {
  status: string;
  data: {
    tasks: Task[];
  };
  message: string;
}

export interface TaskResponse {
  status: string;
  data: {
    task: Task;
  };
  message: string;
}

// Assigned Job types based on API response
export interface AssignedJobApiResponse {
  content: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  _id?: string; // Made optional as per new response might not have it or it might be 'id'
  position: string;
  clientName: string;
  candidateCount: number;
  jobId: string;
  clientId: string;
}

export interface ReminderTask {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  clientName: string;
  interviewDateTime: string | null;
  interviewMeetingLinks: string[];
  status: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyTasksData {
  assignedJobs: AssignedJobApiResponse[];
  personalTasks: Task[];
  reminderTasks: ReminderTask[];
}

export interface MyTasksResponse {
  success: boolean;
  data: MyTasksData;
  counts: {
    assignedJobs: number;
    personalTasks: number;
    reminderTasks: number;
  };
  responseTime?: string;
}

export interface AssignedJobsApiResponse {
  success: boolean;
  data: AssignedJobApiResponse[];
  count: number;
}

class TaskService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  /**
   * Get personal tasks for the current user
   */
  async getPersonalTasks(params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    dueBefore?: string;
    dueAfter?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: Task[]; count: number; pagination: any }> {
    try {
      const response = await api.get('/api/tasks/personal', { params });
      return response.data;
    } catch (error) {
      console.error('TaskService: Error fetching personal tasks:', error);
      throw new Error('Failed to fetch personal tasks');
    }
  }

  /**
   * Create a personal task
   */
  async createPersonalTask(taskData: Partial<CreateTaskRequest> & { title: string }): Promise<Task> {
    try {
      const response = await api.post('/api/tasks/personal', taskData);
      return response.data.data;
    } catch (error) {
      console.error('TaskService: Error creating personal task:', error);
      throw new Error('Failed to create personal task');
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskData: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await api.put('/api/tasks/my-tasks', taskData);
      return response.data.data.task;
    } catch (error) {
      console.error('TaskService: Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Delete a personal task
   */
  async deletePersonalTask(taskId: string): Promise<void> {
    try {
      await api.delete(`/api/tasks/personal/${taskId}`);
    } catch (error) {
      console.error('TaskService: Error deleting personal task:', error);
      throw new Error('Failed to delete personal task');
    }
  }

  /**
   * Delete a task (legacy method)
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await api.delete(`/api/tasks/my-tasks?id=${taskId}`);
    } catch (error) {
      console.error('TaskService: Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Mark task as completed
   */
  async completeTask(taskId: string): Promise<Task> {
    try {
      const response = await api.put('/api/tasks/my-tasks', {
        id: taskId,
        status: 'completed'
      });
      return response.data.data.task;
    } catch (error) {
      console.error('TaskService: Error completing task:', error);
      throw new Error('Failed to complete task');
    }
  }

  /**
   * Update follow-up status
   */
  async updateFollowUpStatus(taskId: string, followUpStatus: 'pending' | 'in-progress' | 'completed'): Promise<Task> {
    try {
      const response = await api.put('/api/tasks/my-tasks', {
        id: taskId,
        followUpStatus,
        status: followUpStatus === 'completed' ? 'completed' : undefined
      });
      return response.data.data.task;
    } catch (error) {
      console.error('TaskService: Error updating follow-up status:', error);
      throw new Error('Failed to update follow-up status');
    }
  }

  /**
   * Get all tasks (assigned jobs, personal tasks, reminders) for the current user
   */
  async getMyTasks(params?: {
    type?: string;
    status?: string;
    search?: string;
    priority?: string;
    category?: string;
    dueBefore?: string;
    dueAfter?: string;
    page?: number;
    limit?: number;
  }): Promise<MyTasksResponse> {
    try {
      const response = await api.get('/api/tasks/my-tasks', { params });
      return response.data;
    } catch (error) {
      console.error('TaskService: Error fetching my tasks:', error);
      throw new Error('Failed to fetch my tasks');
    }
  }

  /**
   * Get assigned jobs for the current user (Legacy/Specific)
   */
  async getAssignedJobs(): Promise<AssignedJobApiResponse[]> {
    try {
      // This endpoint now returns the composite object, so we extract assignedJobs
      const response = await api.get('/api/tasks/my-tasks');
      if (response.data && response.data.data && Array.isArray(response.data.data.assignedJobs)) {
        return response.data.data.assignedJobs;
      }
      // Fallback for previous behavior if API hasn't fully switched or if handling differntly
      return response.data.data;
    } catch (error) {
      console.error('TaskService: Error fetching assigned jobs:', error);
      throw new Error('Failed to fetch assigned jobs');
    }
  }

  /**
   * Update assigned job status
   */
  async updateAssignedJobStatus(taskId: string, status: 'to-do' | 'inprogress' | 'completed'): Promise<void> {
    try {
      await api.patch(`/api/tasks/my-tasks/${taskId}`, {
        status
      });
    } catch (error) {
      console.error('TaskService: Error updating assigned job status:', error);
      throw new Error('Failed to update assigned job status');
    }
  }

  /**
   * Update personal task status
   */
  async updatePersonalTaskStatus(taskId: string, status: 'to-do' | 'inprogress' | 'completed'): Promise<Task> {
    try {
      const response = await api.put(`/api/tasks/personal/${taskId}`, {
        status
      });
      return response.data.data.task;
    } catch (error) {
      console.error('TaskService: Error updating personal task status:', error);
      throw new Error('Failed to update personal task status');
    }
  }

  /**
   * Update personal task with comprehensive data
   */
  async updatePersonalTask(taskId: string, taskData: {
    title?: string;
    description?: string;
    dueDate?: string;
    category?: string;
    status?: 'to-do' | 'inprogress' | 'completed';
    followUpType?: 'cv-received' | 'candidate-response' | 'client-feedback' | 'interview-scheduled' | 'offer-sent' | 'other';
    followUpStatus?: 'pending' | 'in-progress' | 'completed';
    relatedCandidate?: string;
    relatedJob?: string;
    relatedClient?: string;
  }): Promise<Task> {
    try {
      const response = await api.put(`/api/tasks/personal/${taskId}`, taskData);
      return response.data.data.task;
    } catch (error) {
      console.error('TaskService: Error updating personal task:', error);
      throw new Error('Failed to update personal task');
    }
  }
}

// Export a singleton instance
export const taskService = new TaskService();
