"use client";

import { createTask, updateTask, deleteTask, revalidateTasks } from "@/lib/client-tasks";
import type { TodoItem } from "./TodoMemo.types";

export const useTodoHandlers = (
  accountId: string | undefined,
  page: number,
  limit: number
) => {
  const handleCreate = async (title: string, description: string) => {
    if (!accountId) return;

    await createTask({ title, description, accountId });
    await revalidateTasks(accountId, page, limit);
  };

  const handleUpdate = async (id: string, title: string, description: string) => {
    if (!accountId) return;

    await updateTask(id, { title, description });
    await revalidateTasks(accountId, page, limit);
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    if (!accountId) return;

    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    await updateTask(id, { status: newStatus });
    await revalidateTasks(accountId, page, limit);
  };

  const handleDelete = async (id: string) => {
    if (!accountId) return;

    await deleteTask(id);
    await revalidateTasks(accountId, page, limit);
  };

  const handleDeleteCompletedTasks = async (todos: TodoItem[]) => {
    if (!accountId) return;

    const completedTodos = todos.filter((todo) => todo.status === "DONE");
    await Promise.all(completedTodos.map((todo) => deleteTask(todo.id)));
    await revalidateTasks(accountId, page, limit);

    return completedTodos.length;
  };

  return {
    handleCreate,
    handleUpdate,
    handleToggle,
    handleDelete,
    handleDeleteCompletedTasks,
  };
};
