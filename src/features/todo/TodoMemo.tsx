"use client";

import { useState, useCallback } from "react";
import { Typography } from "antd";
import { useAccount } from "@/contexts/account-context";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CONTENT_CONFIG } from "@/constants/globals.constants";
import { useTodoMemo } from "./useTodoMemo";
import {
  AddForm,
  TodoList,
  ActionButtons,
  TodoPagination,
  TodoDetailModal,
  TodoEditModal,
} from "./components";

const { Title } = Typography;

export function TodoMemo() {
  const { selectedAccountId } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const {
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
    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    handleAddTodo,
    handleEditTodo,
    handleUpdateTodo,
    handleDeleteCompleted,
    completedCount,
  } = useTodoMemo({
    accountId: selectedAccountId,
    page: currentPage,
    limit: pageSize
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);



  // 初回ローディング + データが無い
  if (isLoading && !todos.length) {
    return (
      <div
        style={{
          padding: "24px",
          width: "100%",
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        <Title level={2}>{CONTENT_CONFIG.TASKS.name}</Title>
        <LoadingSpinner tip="TODOデータを読み込み中..." />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        width: "100%",
        margin: "0 auto",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <Title level={2}>{CONTENT_CONFIG.TASKS.name}</Title>

      <AddForm
        newTitle={newTitle}
        newDescription={newDescription}
        setNewTitle={setNewTitle}
        setNewDescription={setNewDescription}
        handleAddTodo={handleAddTodo}
      />

      <ActionButtons
        completedCount={completedCount}
        onDeleteCompleted={handleDeleteCompleted}
      />

      <TodoPagination
        current={currentPage}
        total={pagination?.total || 0}
        pageSize={pageSize}
        onChange={handlePageChange}
      />

      <TodoList
        todos={todos}
        isLoading={isLoading}
        onToggle={toggleTodo}
        onView={showTodoDetail}
        onEdit={handleEditTodo}
        onDelete={deleteTodo}
      />

      <TodoDetailModal
        visible={isDetailModalVisible}
        todo={selectedTodo}
        onClose={closeModals}
      />

      <TodoEditModal
        visible={isEditModalVisible}
        editTitle={editTitle}
        editDescription={editDescription}
        setEditTitle={setEditTitle}
        setEditDescription={setEditDescription}
        onClose={closeModals}
        onUpdate={handleUpdateTodo}
      />
    </div>
  );
}
