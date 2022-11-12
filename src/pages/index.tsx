import { trpc } from "../utils/trpc";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TodoItemComponent from "../components/TodoItemComponent";
import { Todo, TodoGroup } from "@prisma/client";
import { GroupTreeNode } from "../../types/Todo";
import GroupNode from "../components/GroupNode";
import Modal from "react-modal";

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

    createTodo
      .mutateAsync({
        name: addTodo.name,
        description: addTodo.description,
        status: addTodo.status,
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

  const openAddTodoModal = () => {
    setIsAddTodoModalOpen(true);
  };

  const closeAddTodoModal = () => {
    setIsAddTodoModalOpen(false);
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

          <button className="btn mt-6" onClick={openAddTodoModal}>
            Create new Todo
          </button>
          <Modal
            isOpen={isAddTodoModalOpen}
            onRequestClose={closeAddTodoModal}
            contentLabel="Add Todo Modal"
          >
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
                    className={"btn rounded " + (isAddingTodo ? "loading" : "")}
                    type="button"
                    onClick={handleAddTodoClick}
                  >
                    Add Todo
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
