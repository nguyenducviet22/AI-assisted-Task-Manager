/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TaskResponse {
  id: string; // UUID
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string; // ISO DateTime string
  updatedAt?: string; // ISO DateTime string
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
}

export interface TaskListResponse {
  tasks: TaskResponse[];
}

export interface UserProfile {
  id: string; // UUID for X-User-Id
  name: string;
  role: string;
  avatarUrl: string;
  statusText: string;
}
