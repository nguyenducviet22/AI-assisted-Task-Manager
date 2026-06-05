/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import api from '@/src/services/api';
import { CreateTaskRequest, TaskListResponse, TaskResponse, UpdateTaskRequest } from './types';

export const taskService = {
  /**
   * GET /api/tasks
   * Fetch all tasks for the logged-in user.
   */
  async getTasks(): Promise<TaskResponse[]> {
    const response = await api.get<TaskListResponse>('/api/tasks');
    return response.data.tasks || [];
  },

  /**
   * GET /api/tasks/{taskId}
   * Fetch a single task detail by ID.
   */
  async getTaskById(taskId: string): Promise<TaskResponse> {
    const response = await api.get<TaskResponse>(`/api/tasks/${taskId}`);
    return response.data;
  },

  /**
   * POST /api/tasks
   * Create a new task.
   */
  async createTask(request: CreateTaskRequest): Promise<TaskResponse> {
    const response = await api.post<TaskResponse>('/api/tasks', request);
    return response.data;
  },

  /**
   * PUT /api/tasks/{taskId}
   * Update task title, description, and status.
   */
  async updateTask(taskId: string, request: UpdateTaskRequest): Promise<TaskResponse> {
    const response = await api.put<TaskResponse>(`/api/tasks/${taskId}`, request);
    return response.data;
  },

  /**
   * DELETE /api/tasks/{taskId}
   * Delete task by ID.
   */
  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/api/tasks/${taskId}`);
  },
};
