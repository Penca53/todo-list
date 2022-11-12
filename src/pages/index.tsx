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
  const [addTodoName, setAddTodoName] = useState<string | null>(null);
  const [addTodoDescription, setAddTodoDescription] = useState<string | null>(
    null
  );
  const [addTodoStatus, setAddTodoStatus] = useState<boolean>(false);

  const [selectedTodoGroup, setSelectedTodoGroup] = useState<TodoGroup | null>(
    null
  );
  const getTodos = trpc.todo.getTodos.useQuery();
  const getTodoGroups = trpc.todoGroup.getTodoGroups.useQuery();

  const createTodo = trpc.todo.createTodo.useMutation();
  const deleteTodo = trpc.todo.deleteTodo.useMutation();
  const updateTodoStatus = trpc.todo.updateTodoStatus.useMutation();
  const updateTodoFavourite = trpc.todo.updateTodoFavourite.useMutation();

  const createTodoGroup = trpc.todoGroup.createTodoGroups.useMutation();
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);

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

  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const handleAddTodoClick = () => {
    setIsAddingTodo(true);

    if (!addTodoName || !addTodoDescription) {
      setIsAddingTodo(false);
      return;
    }

    createTodo
      .mutateAsync({
        name: addTodoName,
        description: addTodoDescription,
        status: addTodoStatus,
        todoGroupId: selectedTodoGroup?.id,
      })
      .then(() => getTodos.refetch())
      .finally(() => {
        setIsAddingTodo(false);
        setIsAddTodoModalOpen(false);
      });
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
        <div className="w-96 overflow-y-scroll border-r border-gray-500 p-4 shadow shadow-gray-400">
          <ul className="mt-4">
            {getTodoGroups.isLoading ? (
              "Loading..."
            ) : getTodoGroups.isError ? (
              "Error!"
            ) : getTodoGroups.data ? (
              <GroupNode
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
            checked={isAddTodoModalOpen}
            onChange={(e) => {
              setIsAddTodoModalOpen(e.target.checked);
              setAddTodoName(null);
              setAddTodoDescription(null);
              setAddTodoStatus(false);
            }}
          />
          <label htmlFor="create-new-todo-modal" className="modal">
            <label className="modal-box relative" htmlFor="">
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
                      value={addTodoName || ""}
                      onChange={(e) => setAddTodoName(e.target.value)}
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
                      value={addTodoDescription || ""}
                      onChange={(e) => setAddTodoDescription(e.target.value)}
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
                      checked={addTodoStatus || false}
                      onChange={() =>
                        setAddTodoStatus((prevState) => !prevState)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      className={
                        "btn rounded " + (isAddingTodo ? "loading" : "")
                      }
                      type="button"
                      onClick={handleAddTodoClick}
                    >
                      Add Todo
                    </button>
                  </div>
                </form>
              </div>
            </label>
          </label>
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
      </div>
    </Layout>
  );
};

export default Home;
