import type { NextPage } from "next";
import { useEffect, useState } from "react";
import TodoItemComponent from "../components/TodoItemComponent";
import { mockTodos } from "../mock/Todos";
import { TodoAPI, TodoModel } from "../types/Todo";

const Home: NextPage = () => {
  const [todos, setTodos] = useState<TodoModel[]>([]);

  const getTodos = () => {
    /*
    fetch("http://localhost:8080/todos")
      .then((res) => res.json())
      .then((data: TodoAPI[]) => {
        setTodos(data);
      });
      */

    setTodos(mockTodos);
  };

  useEffect(() => {
    getTodos();
  });

  const handleTodoItemChange = (item: TodoModel) => {
    item.status = !item.status;
    setTodos([...todos]);
  };

  return (
    <div className="flex justify-center">
      <ul className="mt-8">
        {todos.map((todo) => (
          <TodoItemComponent
            key={todo.id}
            todoItem={todo}
            onTodoItemChange={handleTodoItemChange}
          />
        ))}
      </ul>
    </div>
  );
};

export default Home;
