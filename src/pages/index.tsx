import { trpc } from "../utils/trpc";
import type { NextPage } from "next";
import { useState } from "react";
import Layout from "../components/Layout";
import TodoItemComponent from "../components/TodoItemComponent";
import { Todo, TodoGroup, Label, LabelsOnTodos } from "@prisma/client";
import { GroupTreeNode } from "../../types/Todo";
import GroupNode from "../components/GroupNode";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const DragDropContext = dynamic(
  async () => {
    const mod = await import("@hello-pangea/dnd");
    return mod.DragDropContext;
  },
  { ssr: false }
);

const Droppable = dynamic(
  async () => {
    const mod = await import("@hello-pangea/dnd");
    return mod.Droppable;
  },
  { ssr: false }
);
const Draggable = dynamic(
  async () => {
    const mod = await import("@hello-pangea/dnd");
    return mod.Draggable;
  },
  { ssr: false }
);

const Home: NextPage = () => {
  const { data: session, status } = useSession();
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
  const deleteTodoGroup = trpc.todoGroup.deleteTodoGroup.useMutation();

  const createTodo = trpc.todo.createTodo.useMutation();
  const deleteTodo = trpc.todo.deleteTodo.useMutation();
  const updateTodoStatus = trpc.todo.updateTodoStatus.useMutation();
  const updateTodoFavourite = trpc.todo.updateTodoFavourite.useMutation();

  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const [isDeletingTodoGroup, setIsDeletingTodoGroup] = useState(false);

  const [addLabelName, setAddLabelName] = useState<string | null>(null);
  const [isAddLabelModalOpen, setIsAddLabelModalOpen] = useState(false);
  const [isAddingLabel, setIsAddingLabel] = useState(false);

  const getLabels = trpc.label.getLabels.useQuery();
  const createLabel = trpc.label.createLabel.useMutation();

  const getLabelsOnTodos = trpc.labelsOnTodos.getLabelsOnTodos.useQuery();
  const createLabelOnTodo = trpc.labelsOnTodos.createLabelOnTodo.useMutation();

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

  const handleTodoItemDelete = (item: Todo): Promise<void> => {
    return deleteTodo
      .mutateAsync({
        id: item.id,
      })
      .then(() => {
        getTodos.refetch();
      });
  };

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

  const handleAddLabelClick = () => {
    setIsAddingLabel(true);

    if (!addLabelName) {
      setIsAddingLabel(false);
      return;
    }

    createLabel
      .mutateAsync({
        name: addLabelName,
        todoGroupId: selectedTodoGroup?.id,
      })
      .then(() => getLabels.refetch())
      .finally(() => {
        setIsAddingLabel(false);
        setIsAddLabelModalOpen(false);
      });
  };

  const handleLabelOnTodoChange = (label: Label, todo: Todo) => {
    createLabelOnTodo
      .mutateAsync({
        todoId: todo.id,
        labelId: label.id,
      })
      .then(() => getLabelsOnTodos.refetch())
      .finally(() => {
        setIsAddingLabel(false);
      });
  };

  const handleTodoGroupNodeClick = (group: TodoGroup | null) => {
    setSelectedTodoGroup(group);
  };

  const handleTodoGroupDeleteClick = () => {
    if (!selectedTodoGroup) {
      return;
    }

    setIsDeletingTodoGroup(true);

    deleteTodoGroup
      .mutateAsync({
        id: selectedTodoGroup.id,
      })
      .then(() => getTodoGroups.refetch())
      .finally(() => {
        setSelectedTodoGroup(null);
        setIsDeletingTodoGroup(false);
      });
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

  interface DataElement {
    id: string;
    content: string;
  }
  const [items, setItems] = useState<DataElement[]>([
    { id: "0", content: "Hello0" },
    { id: "1", content: "Hello1" },
    { id: "2", content: "Hello2" },
    { id: "3", content: "Hello3" },
    { id: "4", content: "Hello4" },
  ]);
  const onDragEnd = (result: any) => {
    if (!getTodos.data) {
      return;
    }
    if (!result.destination) {
      return;
    }
    const newItems = [...getTodos.data];
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed!);
    //setItems(newItems);
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
          <div className="flex w-full items-center gap-4 border-b pt-2 pb-4">
            <h2 className="w-64 overflow-hidden text-ellipsis text-2xl">
              {selectedTodoGroup?.name || session?.user.name}
            </h2>

            <label
              htmlFor="create-new-todo-modal"
              className="modal-button btn btn-primary cursor-pointer"
            >
              Create Todo
            </label>

            <label
              htmlFor="create-new-label-modal"
              className="modal-button btn btn-outline cursor-pointer"
            >
              Create Label
            </label>

            {selectedTodoGroup && (
              <button
                onClick={() => handleTodoGroupDeleteClick()}
                className={
                  "btn btn-outline btn-error btn-sm ml-auto" +
                  (isDeletingTodoGroup ? " loading" : " ")
                }
              >
                Delete Group
              </button>
            )}
          </div>

          <DragDropContext onDragEnd={(res) => onDragEnd(res)}>
            <ul className="mt-4">
              {getTodos.isLoading ? (
                "Loading..."
              ) : getTodos.isError ? (
                "Error!"
              ) : getTodos.data ? (
                <Droppable droppableId="todos-droppable">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {getTodos.data
                        .filter(
                          (todo) =>
                            (!todo.todoGroupId && !selectedTodoGroup) ||
                            todo.todoGroupId === selectedTodoGroup?.id
                        )
                        .map((todo, index) => {
                          return (
                            <Draggable
                              key={todo.id}
                              draggableId={index.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TodoItemComponent
                                    todoItem={todo}
                                    key={todo.id}
                                    onTodoItemChangeStatus={
                                      handleTodoItemChangeStatus
                                    }
                                    onTodoItemChangeIsFavourite={
                                      handleTodoItemChangeIsFavourite
                                    }
                                    onTodoItemDelete={handleTodoItemDelete}
                                    labels={
                                      getLabels.data?.filter(
                                        (label) =>
                                          (!label.todoGroupId &&
                                            !selectedTodoGroup) ||
                                          label.todoGroupId ===
                                            selectedTodoGroup?.id
                                      ) || []
                                    }
                                    labelsOnTodos={
                                      getLabelsOnTodos.data?.filter(
                                        (labelOnTodo) =>
                                          labelOnTodo.todoId === todo.id
                                      ) || []
                                    }
                                    onLabelOnTodoChange={
                                      handleLabelOnTodoChange
                                    }
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ) : null}
            </ul>
          </DragDropContext>

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

          <input
            type="checkbox"
            id="create-new-label-modal"
            className="modal-toggle"
            checked={isAddLabelModalOpen}
            onChange={(e) => {
              setIsAddLabelModalOpen(e.target.checked);
              setAddLabelName(null);
            }}
          />
          <label htmlFor="create-new-label-modal" className="modal">
            <label className="relative" htmlFor="">
              <label
                htmlFor="create-new-label-modal"
                className="btn btn-circle btn-sm absolute right-0 top-3"
              >
                ✕
              </label>
              <div>
                <form className="mb-4 rounded px-8 pt-6 pb-8">
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
                      value={addLabelName || ""}
                      onChange={(e) => setAddLabelName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      className={
                        "btn rounded " + (isAddingLabel ? "loading" : "")
                      }
                      type="button"
                      onClick={handleAddLabelClick}
                    >
                      Add Label
                    </button>
                  </div>
                </form>
              </div>
            </label>
          </label>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
