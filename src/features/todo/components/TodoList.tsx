import { Row, Col } from "antd";
import { TodoItem } from "../TodoMemo.types";
import { TodoCard } from "./TodoCard";

interface TodoListProps {
  todos: TodoItem[];
  isLoading?: boolean;
  onToggle: (id: string) => void;
  onView: (todo: TodoItem) => void;
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
}

export function TodoList({
  todos,
  isLoading,
  onToggle,
  onView,
  onEdit,
  onDelete,
}: TodoListProps) {
  return (
    <Row
      gutter={[16, 16]}
      style={{
        minHeight: "400px",
        opacity: isLoading ? 0.5 : 1,
        transition: "opacity 0.3s ease"
      }}
      justify="center"
    >
      {todos.map((todo) => (
        <Col
          xs={24}
          sm={12}
          lg={8}
          xl={6}
          key={todo.id}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TodoCard
            todo={todo}
            onToggle={onToggle}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Col>
      ))}
    </Row>
  );
}
