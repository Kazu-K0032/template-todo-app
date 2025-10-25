"use client";

import { useState, useCallback } from "react";
import { message } from "antd";
import { createTask, updateTask, deleteTask, useTasksWithPagination, revalidateTasks } from "@/lib/client-tasks";
import { TodoItem } from "./TodoMemo.types";

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


  /**
   * TODOの完了状態を切り替える
   * @param id TODOのID
   */
  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t: TodoItem) => t.id === id);
      if (!todo) return;

      const newStatus = todo.status === "DONE" ? "TODO" : "DONE";
      await updateTask(id, {
        status: newStatus,
      });
      if (accountId) {
        await revalidateTasks(accountId, page, limit);
      }

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
    if (!accountId) return;

    try {
      await createTask({
        title: newTitle,
        description: newDescription,
        accountId,
      });
      if (accountId) {
        await revalidateTasks(accountId, page, limit);
      }
      setNewTitle("");
      setNewDescription("");
      message.success("TODOを追加しました");
    } catch (err) {
      console.error("タスク作成エラー:", err);
      message.error("TODOの追加に失敗しました");
    }
  }, [newTitle, newDescription, accountId, page, limit]);

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
    if (editingTodo) {
      try {
        await updateTask(editingTodo.id, {
          title: editTitle,
          description: editDescription,
        });
        if (accountId) {
          await revalidateTasks(accountId, page, limit);
        }
        setIsEditModalVisible(false);
        setEditingTodo(null);
        message.success("TODOを更新しました");
      } catch (err) {
        console.error("タスク更新エラー:", err);
        message.error("TODOの更新に失敗しました");
      }
    }
  }, [editTitle, editDescription, editingTodo, accountId, page, limit]);

  const handleDeleteCompleted = useCallback(async () => {
    const completedCount = todos.filter(
      (todo: TodoItem) => todo.status === "DONE"
    ).length;
    if (completedCount === 0) {
      message.info("完了済みのTODOがありません");
      return;
    }

    try {
      const completedTodos = todos.filter((todo: TodoItem) => todo.status === "DONE");
      await Promise.all(
        completedTodos.map((todo: TodoItem) => deleteTask(todo.id))
      );
      if (accountId) {
        await revalidateTasks(accountId, page, limit);
      }
      message.success(`${completedCount}個の完了済みTODOを削除しました`);
    } catch (err) {
      console.error("完了済みタスク削除エラー:", err);
      message.error("完了済みTODOの削除に失敗しました");
    }
  }, [todos, accountId, page, limit]);

  // 完了済みTODO数の計算
  const completedCount = todos.filter((todo: TodoItem) => todo.status === "DONE").length;

  // deleteTodo関数を実装
  const deleteTodo = async (id: string) => {
    try {
      await deleteTask(id);
      if (accountId) {
        await revalidateTasks(accountId, page, limit);
      }
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
