import { Task, TaskStatus } from "@prisma/client";

// タスク関連の型定義
export type TaskType = Task;

// タスク作成リクエスト
export interface CreateTaskRequest {
  title: string;
  description: string;
  accountId: string;
}

// タスク更新リクエスト
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

// API通信の型定義
export interface BaseApiResponse {
  success: boolean;
  error?: string;
}


// タスク作成API
export interface CreateTaskResponse extends BaseApiResponse {
  task: TaskType;
}

// タスク更新API
export interface UpdateTaskResponse extends BaseApiResponse {
  task: TaskType;
}

