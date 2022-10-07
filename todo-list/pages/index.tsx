import axios from "axios";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TodoItemComponent from "../components/TodoItemComponent";
import { mockTodos } from "../mock/Todos";
import { TodoAPI, TodoModel } from "../types/Todo";

const Home: NextPage = () => {
  const [todos, setTodos] = useState<TodoModel[]>([]);
  const [addTodo, setAddTodo] = useState<TodoModel>({} as TodoModel);

  const getTodos = () => {
    axios
      .get<TodoAPI[]>(
        "https://s23ety93ib.execute-api.eu-central-1.amazonaws.com/prod/todos"
      )
      .then((todosAPI) => {
        const todosModel: TodoModel[] = todosAPI.data.map((todoAPI) => {
          return {
            id: todoAPI.id,
            name: todoAPI.name,
            description: todoAPI.description,
            status: todoAPI.status,
          } as TodoModel;
        });

        setTodos([...todosModel]);
      });

    //setTodos(mockTodos);
  };

  useEffect(() => {
    getTodos();
  }, []);

  const handleTodoItemChange = (item: TodoModel) => {
    const prevStatus = item.status;

    // Prediction
    item.status = !item.status;
    setTodos([...todos]);

    // API acknowledge
    axios
      .patch(
        `https://s23ety93ib.execute-api.eu-central-1.amazonaws.com/prod/todos/${item.id}`,
        {
          status: item.status,
        }
      )
      .catch((err) => {
        item.status = prevStatus;
        setTodos([...todos]);
      });
  };

  const handleTodoItemDelete = (item: TodoModel) => {
    axios
      .delete(
        `https://s23ety93ib.execute-api.eu-central-1.amazonaws.com/prod/todos/${item.id}`
      )
      .then((res) => {
        getTodos();
      });
  };

  const handleAddTodoClick = () => {
    axios
      .post<TodoAPI>(
        "https://s23ety93ib.execute-api.eu-central-1.amazonaws.com/prod/todos",
        addTodo
      )
      .then((res) => getTodos());
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <ul className="mt-8">
          {todos.map((todo) => (
            <TodoItemComponent
              key={todo.id}
              todoItem={todo}
              onTodoItemChange={handleTodoItemChange}
              onTodoItemDelete={handleTodoItemDelete}
            />
          ))}
        </ul>

        <div className="mt-8">
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                placeholder="Name..."
                value={addTodo.name}
                onChange={(e) => {
                  setAddTodo((prevState) => ({
                    ...prevState,
                    name: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                placeholder="Description..."
                value={addTodo.description}
                onChange={(e) => {
                  setAddTodo((prevState) => ({
                    ...prevState,
                    description: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="status"
              >
                Status
              </label>
              <input
                className="shadow w-6 h-6 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                id="status"
                type="checkbox"
                checked={addTodo.status}
                onChange={() => {
                  setAddTodo((prevState) => ({
                    ...prevState,
                    status: !prevState.status,
                  }));
                }}
              />
            </div>
            <div className="flex justify-center">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={handleAddTodoClick}
              >
                Add Todo
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
