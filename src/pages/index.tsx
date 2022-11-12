import { trpc } from "../utils/trpc";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TodoItemComponent from "../components/TodoItemComponent";
import { Todo, TodoGroup } from "@prisma/client";
import { GroupTreeNode } from "../../types/Todo";
import GroupNode from "../components/GroupNode";

const Home: NextPage = () => {
  //const [todos, setTodos] = useState<TodoModel[]>([]);
  const [addTodo, setAddTodo] = useState<Todo>({} as Todo);
  const [selectedTodoGroup, setSelectedTodoGroup] = useState<TodoGroup | null>(
    null
  );
  const getTodos = trpc.todo.getTodos.useQuery();
  const getTodoGroups = trpc.todoGroup.getTodoGroups.useQuery();

  const createTodo = trpc.todo.createTodo.useMutation();
  const deleteTodo = trpc.todo.deleteTodo.useMutation();
  const updateTodoStatus = trpc.todo.updateTodoStatus.useMutation();
  const updateTodoFavourite = trpc.todo.updateTodoFavourite.useMutation();

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

  const handleTodoItemChangeStatus = (item: Todo, newStatus: boolean) => {
    // Prediction
    item.status = newStatus;

    updateTodoStatus.mutateAsync({
      id: item.id,
      status: item.status,
    });
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
  };

  const handleTodoGroupNodeClick = (group: TodoGroup | null) => {
    setSelectedTodoGroup(group);
  };

  const createGroupTree = (todoGroups: TodoGroup[]): GroupTreeNode => {
    const root: GroupTreeNode = { item: null, parent: null, children: [] };

    const nodesMap = new Map<number, GroupTreeNode>();

    for (const group of todoGroups) {
      let parent = null;
      if (group.parentGroupId === null) {
        parent = root;
      } else {
        parent = nodesMap.get(group.parentGroupId);
        if (!parent) {
          parent = { item: null, parent: null, children: [] };
          nodesMap.set(group.parentGroupId, parent);
        }
      }

      let node = nodesMap.get(group.id);
      if (!node) {
        node = {
          item: group,
          parent: parent,
          children: [],
        };
      }

      parent.children.push(node);
      nodesMap.set(group.id, node);
    }

    return root;
  };

  return (
    <Layout>
      <div className="flex h-full">
        {/*
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
          */}

        <div className="w-96 overflow-y-scroll border-r border-gray-500 p-4 shadow shadow-gray-400">
          <ul className="mt-4">
            {getTodoGroups.isLoading ? (
              "Loading..."
            ) : getTodoGroups.isError ? (
              "Error!"
            ) : getTodoGroups.data ? (
              <GroupNode
                todos={getTodos.data!}
                groupNode={createGroupTree(getTodoGroups.data)}
                height={0}
                onGroupClick={handleTodoGroupNodeClick}
              />
            ) : null}
          </ul>
        </div>
        <div className="flex-1 overflow-y-scroll  p-4">
          <ul className="mt-4">
            {getTodos.isLoading
              ? "Loading..."
              : getTodos.isError
              ? "Error!"
              : getTodos.data
              ? getTodos.data.map((todo) => {
                  if (
                    (!todo.todoGroupId && !selectedTodoGroup) ||
                    todo.todoGroupId === selectedTodoGroup?.id
                  ) {
                    return (
                      <TodoItemComponent
                        todoItem={todo}
                        key={todo.id}
                        onTodoItemChangeStatus={handleTodoItemChangeStatus}
                        onTodoItemChangeIsFavourite={
                          handleTodoItemChangeIsFavourite
                        }
                        onTodoItemDelete={handleTodoItemDelete}
                      />
                    );
                  } else {
                    return null;
                  }
                })
              : null}
          </ul>

          <label
            htmlFor="create-new-todo-modal"
            className="modal-button btn mt-6"
          >
            Create new Todo
          </label>

          <input
            type="checkbox"
            id="create-new-todo-modal"
            className="modal-toggle"
          />
          <div className="modal">
            <div className="modal-box relative">
              <label
                htmlFor="create-new-todo-modal"
                className="btn btn-circle btn-sm absolute right-2 top-2"
              >
                ✕
              </label>
              <div>
                <form className="mb-4 rounded px-8 pt-6 pb-8 shadow-md">
                  <div className="mb-4">
                    <label
                      className="mb-2 block text-sm font-bold"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      className="input input-bordered w-full max-w-xs"
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
                      className="mb-2 block text-sm font-bold"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full max-w-xs"
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
                      className="mb-2 block text-sm font-bold"
                      htmlFor="status"
                    >
                      Status
                    </label>
                    <input
                      className="checkbox checkbox-lg"
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
                      className="btn rounded"
                      type="button"
                      onClick={handleAddTodoClick}
                    >
                      Add Todo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="modal">
          <div className="modal-box relative">
            <label
              htmlFor="edit-todo-modal"
              className="btn btn-circle btn-sm absolute right-2 top-2"
            >
              ✕
            </label>
            <div>Hello</div>
          </div>
        </div>

        {/*
            <ul className="mt-4">
          {getTodoGroups.isLoading ? (
            "Loading..."
          ) : getTodoGroups.isError ? (
            "Error!"
          ) : getTodoGroups.data ? (
            <GroupNode
              todos={getTodos.data!}
              groupNode={createGroupTree(getTodoGroups.data)}
              height={0}
            />
          ) : null}
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
            */}
      </div>
    </Layout>
  );
};

export default Home;
