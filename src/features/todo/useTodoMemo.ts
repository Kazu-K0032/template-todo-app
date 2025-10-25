"use client";

import { useState, useCallback } from "react";
import { message } from "antd";
import { useTasksWithPagination } from "@/lib/client-tasks";
import { useTodoHandlers } from "./useTodoHandlers";
import type { TodoItem } from "./TodoMemo.types";

interface UseTodoMemoProps {
  accountId?: string;
  page?: number;
  limit?: number;
}

export const useTodoMemo = ({
  accountId,
  page = 1,
  limit = 8
}: UseTodoMemoProps = {}) => {
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  // フォーム状態管理
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // ページネーション対応のデータ取得
  const { tasks: todos, pagination, isLoading, error } = useTasksWithPagination(
    accountId,
    page,
    limit
  );

  const { handleCreate, handleUpdate, handleToggle, handleDelete, handleDeleteCompletedTasks } = useTodoHandlers(
    accountId,
    page,
    limit
  );


  /**
   * TODOの完了状態を切り替える
   * @param id TODOのID
   */
  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    try {
      await handleToggle(id, todo.status);
    } catch (err) {
      console.error("タスク更新エラー:", err);
      throw err;
    }
  };

  /**
   * TODOの詳細を表示する
   * @param todo TODOアイテム
   */
  const showTodoDetail = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setIsDetailModalVisible(true);
  };

  /**
   * TODOを編集する
   * @param todo TODOアイテム
   */
  const editTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsEditModalVisible(true);
  };


  /**
   * モーダルを閉じる
   */
  const closeModals = () => {
    setIsDetailModalVisible(false);
    setIsEditModalVisible(false);
    setSelectedTodo(null);
    setEditingTodo(null);
  };

  // TodoMemo専用のハンドラー関数
  const handleAddTodo = useCallback(async () => {
    if (!newTitle.trim()) {
      message.warning("タイトルを入力してください");
      return;
    }

    try {
      await handleCreate(newTitle, newDescription);
      setNewTitle("");
      setNewDescription("");
      message.success("TODOを追加しました");
    } catch (err) {
      console.error("タスク作成エラー:", err);
      message.error("TODOの追加に失敗しました");
    }
  }, [newTitle, newDescription, handleCreate]);

  const handleEditTodo = useCallback(
    (todo: TodoItem) => {
      setEditTitle(todo.title);
      setEditDescription(todo.description);
      editTodo(todo);
    },
    [editTodo]
  );

  const handleUpdateTodo = useCallback(async () => {
    if (!editTitle.trim()) {
      message.warning("タイトルを入力してください");
      return;
    }
    if (!editingTodo) return;

    try {
      await handleUpdate(editingTodo.id, editTitle, editDescription);
      setIsEditModalVisible(false);
      setEditingTodo(null);
      message.success("TODOを更新しました");
    } catch (err) {
      console.error("タスク更新エラー:", err);
      message.error("TODOの更新に失敗しました");
    }
  }, [editTitle, editDescription, editingTodo, handleUpdate]);

  const handleDeleteCompleted = useCallback(async () => {
    const completedTodos = todos.filter((todo: TodoItem) => todo.status === "DONE");
    if (completedTodos.length === 0) {
      message.info("完了済みのTODOがありません");
      return;
    }

    try {
      const deletedCount = await handleDeleteCompletedTasks(todos);
      message.success(`${deletedCount}個の完了済みTODOを削除しました`);
    } catch (err) {
      console.error("完了済みタスク削除エラー:", err);
      message.error("完了済みTODOの削除に失敗しました");
    }
  }, [todos, handleDeleteCompletedTasks]);

  // 完了済みTODO数の計算
  const completedCount = todos.filter((todo: TodoItem) => todo.status === "DONE").length;

  // deleteTodo関数を実装
  const deleteTodo = async (id: string) => {
    try {
      await handleDelete(id);
    } catch (err) {
      console.error("タスク削除エラー:", err);
      message.error("TODOの削除に失敗しました");
    }
  };

  return {
    todos,
    pagination,
    isLoading,
    selectedTodo,
    isDetailModalVisible,
    isEditModalVisible,
    toggleTodo,
    deleteTodo,
    showTodoDetail,
    closeModals,
    // フォーム状態
    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    // ハンドラー関数
    handleAddTodo,
    handleEditTodo,
    handleUpdateTodo,
    handleDeleteCompleted,
    completedCount,
  };
};
