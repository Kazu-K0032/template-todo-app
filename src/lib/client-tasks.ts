import type {
  TaskType,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTaskResponse,
  UpdateTaskResponse,
} from "@/types/task.types";
import { useApi, fetcher, mutate } from "./fetcher";

// ページネーション対応のレスポンス型
interface PaginatedTasksResponse {
  success: boolean;
  tasks: TaskType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 直接API呼び出し用のヘルパー関数
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * キャッシュキーを生成する関数
 * @param accountId アカウントID
 * @param page ページ番号
 * @param limit ページあたりの件数
 * @returns キャッシュキー
 */
export const getTasksCacheKey = (accountId: string, page: number, limit: number) => {
  return `/api/tasks?accountId=${accountId}&page=${page}&limit=${limit}`;
};

/**
 * タスクキャッシュを再検証する関数
 * @param accountId アカウントID
 * @param page ページ番号
 * @param limit ページあたりの件数
 */
export const revalidateTasks = async (accountId: string, page: number, limit: number) => {
  await mutate(getTasksCacheKey(accountId, page, limit));
};

/**
 * タスクを作成する関数
 * @param input 作成するタスクの情報
 * @returns 作成されたタスク
 */
export const createTask = async (input: CreateTaskRequest): Promise<TaskType> => {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: CreateTaskResponse = await response.json();
  return data.task;
};

/**
 * タスクを更新する関数
 * @param id 更新するタスクのID
 * @param input 更新するタスクの情報
 * @returns 更新されたタスク
 */
export const updateTask = async (id: string, input: UpdateTaskRequest): Promise<TaskType> => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: UpdateTaskResponse = await response.json();
  return data.task;
};

/**
 * タスクを削除する関数
 * @param id 削除するタスクのID
 * @returns 削除されたタスク
 */
export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

/**
 * タスクを取得する関数
 * @param accountId タスクを取得するアカウントのID
 * @returns 取得されたタスク
 */
export const useTasks = (accountId?: string) => {
  const { data, error, isLoading } = useApi(
    accountId ? `/api/tasks?accountId=${accountId}` : null,
    fetcher,
    { enabled: !!accountId }
  );

  return {
    tasks: data?.tasks || [],
    isLoading,
    error,
  };
};

/**
 * タスクをページネーションで取得する関数
 * @param accountId タスクを取得するアカウントのID
 * @param page ページ番号
 * @param limit ページあたりの件数
 * @returns 取得されたタスク
 */
export const useTasksWithPagination = (
  accountId: string | undefined,
  page: number,
  limit: number
) => {
  const { data, error, isLoading } = useApi<PaginatedTasksResponse>(
    accountId ? `/api/tasks?accountId=${accountId}&page=${page}&limit=${limit}` : null,
    fetcher,
    { enabled: !!accountId }
  );

  return {
    tasks: data?.tasks || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
};
