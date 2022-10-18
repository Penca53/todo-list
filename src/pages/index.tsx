import { trpc } from "../utils/trpc";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TodoItemComponent from "../components/TodoItemComponent";
import { Todo } from "@prisma/client";

const Home: NextPage = () => {
  //const [todos, setTodos] = useState<TodoModel[]>([]);
  const [addTodo, setAddTodo] = useState<Todo>({} as Todo);
  const getTodos = trpc.todo.getTodos.useQuery();
  const createTodo = trpc.todo.createTodo.useMutation();
  const deleteTodo = trpc.todo.deleteTodo.useMutation();
  const updateTodoStatus = trpc.todo.updateTodoStatus.useMutation();
  const updateTodoFavourite = trpc.todo.updateTodoFavourite.useMutation();

  const getTodoGroups = trpc.todoGroup.getTodoGroups.useQuery();
  const createTodoGroup = trpc.todoGroup.createTodoGroups.useMutation();

  const handleTodoItemChangeIsFavourite = (item: Todo) => {
    // Prediction
    item.isFavourite = !item.isFavourite;

    updateTodoFavourite
      .mutateAsync({
        id: item.id,
        isFavourite: item.isFavourite,
      })
      .then(() => getTodos.refetch());
  };

  const handleTodoItemChangeStatus = (item: Todo) => {
    // Prediction
    item.status = !item.status;

    updateTodoStatus
      .mutateAsync({
        id: item.id,
        status: item.status,
      })
      .then(() => getTodos.refetch());
  };

  const handleTodoItemDelete = (item: Todo) => {
    deleteTodo
      .mutateAsync({
        id: item.id,
      })
      .then(() => getTodos.refetch());
  };

  const handleAddTodoClick = () => {
    createTodo
      .mutateAsync({
        name: addTodo.name,
        description: addTodo.description,
        status: addTodo.status,
      })
      .then(() => getTodos.refetch());

    createTodoGroup
      .mutateAsync({
        name: addTodo.name + " group",
        parentGroupId: 1,
      })
      .then(() => getTodoGroups.refetch());
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <ul className="mt-8">
          {getTodos.isLoading
            ? "Loading..."
            : getTodos.isError
            ? "Error!"
            : getTodos.data
            ? getTodos.data.map((todo) => (
                <TodoItemComponent
                  key={todo.id}
                  todoItem={todo}
                  onTodoItemChangeIsFavourite={handleTodoItemChangeIsFavourite}
                  onTodoItemChangeStatus={handleTodoItemChangeStatus}
                  onTodoItemDelete={handleTodoItemDelete}
                />
              ))
            : null}
        </ul>

        <div className="mt-8">
          <form className="mb-4 rounded bg-white px-8 pt-6 pb-8 shadow-md">
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
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
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
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
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="status"
              >
                Status
              </label>
              <input
                className="h-6 w-6 rounded border-gray-300 bg-gray-100 text-blue-600 shadow focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
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
                className="focus:shadow-outline rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
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
