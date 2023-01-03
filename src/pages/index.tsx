import { trpc } from "../utils/trpc";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import CategoryComponent from "../components/CategoryComponent";
import { Todo, TodoGroup, Label, Category } from "@prisma/client";
import { GroupTreeNode, TodoListNode } from "../../types/Todo";
import GroupNode from "../components/GroupNode";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { DropResult } from "@hello-pangea/dnd";

const DragDropContext = dynamic(
  async () => {
    const mod = await import("@hello-pangea/dnd");
    return mod.DragDropContext;
  },
  { ssr: false }
);

const Home: NextPage = () => {
  const { data: session } = useSession();

  const getTodos = trpc.todo.getTodos.useQuery();
  const getTodoGroups = trpc.todoGroup.getTodoGroups.useQuery();
  const deleteTodoGroup = trpc.todoGroup.deleteTodoGroup.useMutation();
  const getSharedTodoGroups =
    trpc.todoGroupShare.getSharedTodoGroups.useQuery();

  const shareTodoGroup = trpc.todoGroupShare.shareTodoGroup.useMutation();
  const unshareTodoGroup = trpc.todoGroupShare.unshareTodoGroup.useMutation();

  const createTodo = trpc.todo.createTodo.useMutation();
  const deleteTodo = trpc.todo.deleteTodo.useMutation();
  const updateTodoStatus = trpc.todo.updateTodoStatus.useMutation();
  const updateTodoFavourite = trpc.todo.updateTodoFavourite.useMutation();
  const updateTodoPosition = trpc.todo.updateTodoPosition.useMutation();

  const getLabels = trpc.label.getLabels.useQuery();
  const createLabel = trpc.label.createLabel.useMutation();
  const deleteLabel = trpc.label.deleteLabel.useMutation();

  const getLabelsOnTodos = trpc.labelsOnTodos.getLabelsOnTodos.useQuery();
  const createLabelOnTodo = trpc.labelsOnTodos.createLabelOnTodo.useMutation();
  const deleteLabelOnTodo = trpc.labelsOnTodos.deleteLabelOnTodo.useMutation();

  const getCategories = trpc.category.getCategories.useQuery();
  const createCategory = trpc.category.createCategory.useMutation();
  const deleteCategory = trpc.category.deleteCategory.useMutation();

  const [addTodoName, setAddTodoName] = useState<string | null>(null);
  const [addTodoDescription, setAddTodoDescription] = useState<string | null>(
    null
  );
  const [addTodoStatus, setAddTodoStatus] = useState<boolean>(false);

  const [selectedTodoGroup, setSelectedTodoGroup] = useState<TodoGroup | null>(
    null
  );
  const [selectedTodoGroupOwner, setSelectedTodoGroupOwner] = useState<
    string | null
  >(null);

  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [isAddingTodoFromCategory, setIsAddingTodoFromCategory] =
    useState<Category | null>(null);

  const [isDeletingTodoGroup, setIsDeletingTodoGroup] = useState(false);

  const [addLabelName, setAddLabelName] = useState<string | null>(null);
  const [isAddLabelModalOpen, setIsAddLabelModalOpen] = useState(false);
  const [isAddingLabel, setIsAddingLabel] = useState(false);

  const [addCategoryName, setAddCategoryName] = useState<string | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [shareTodoGroupEmail, setShareTodoGroupEmail] = useState<string | null>(
    null
  );
  const [isShareTodoGroupModalOpen, setIsShareTodoGroupModalOpen] =
    useState(false);
  const [isSharingTodoGroup, setIsSharingTodoGroup] = useState(false);

  const getUserById = trpc.user.getUserById.useQuery({
    id: selectedTodoGroupOwner || session?.user.id,
  });

  interface Column {
    category: Category | null;
    todoItems: Todo[];
  }

  const [categoryColumns, setCategoryColumns] = useState<Map<number, Column>>(
    new Map<number, Column>()
  );

  useEffect(() => {
    if (getTodos.data && getCategories.data) {
      setCategoryColumns(
        buildColumns(
          getTodos.data,
          selectedTodoGroup?.id || -1,
          getCategories.data
        )
      );
    }
  }, [getTodos.data, selectedTodoGroup, getCategories.data]);

  useEffect(() => {
    setAddTodoName(null);
    setAddTodoDescription(null);
    setAddTodoStatus(false);
  }, [isAddTodoModalOpen]);

  const listToArray = (todoHead: TodoListNode) => {
    const res: Todo[] = [];

    let curr: TodoListNode | null = todoHead;
    while (curr && curr.item) {
      res.push(curr.item);
      curr = curr.next;
    }

    return res;
  };

  const buildColumns = (
    todos: Todo[],
    todoGroup: number,
    categories: Category[]
  ) => {
    const columnsAsMap = createTodoColumns(todos, todoGroup, categories);

    const res = new Map<number, Column>();
    columnsAsMap.forEach((head, category) => {
      res.set(category?.id || -1, { category, todoItems: listToArray(head) });
    });

    return res;
  };

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

  const handleShareTodoGroupClick = () => {
    setIsSharingTodoGroup(true);

    if (!shareTodoGroupEmail || !selectedTodoGroup) {
      setIsSharingTodoGroup(false);
      return;
    }

    shareTodoGroup
      .mutateAsync({
        shareToEmail: shareTodoGroupEmail,
        todoGroupId: selectedTodoGroup.id,
      })
      .then(() => getSharedTodoGroups.refetch())
      .finally(() => {
        setIsSharingTodoGroup(false);
        setIsShareTodoGroupModalOpen(false);
      });
  };

  const handleAddTodoClick = () => {
    setIsAddingTodo(true);

    if (!addTodoName || !addTodoDescription) {
      setIsAddingTodo(false);
      setIsAddingTodoFromCategory(null);
      return;
    }

    createTodo
      .mutateAsync({
        name: addTodoName,
        description: addTodoDescription,
        status: addTodoStatus,
        todoGroupId: selectedTodoGroup?.id || null,
        categoryId: isAddingTodoFromCategory?.id || null,
      })
      .then(() => getTodos.refetch())
      .finally(() => {
        setIsAddingTodo(false);
        setIsAddingTodoFromCategory(null);
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

  const handleLabelDelete = (item: Label): Promise<void> => {
    return deleteLabel.mutateAsync({ id: item.id }).then(() => {
      getLabels.refetch();
      getLabelsOnTodos.refetch();
    });
  };

  const hasLabelOnTodo = (label: Label, todo: Todo) => {
    if (
      getLabelsOnTodos.data?.filter(
        (labelOnTodo) =>
          labelOnTodo.labelId === label.id && labelOnTodo.todoId === todo.id
      )?.length != 0
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleLabelOnTodoChange = (label: Label, todo: Todo) => {
    if (hasLabelOnTodo(label, todo)) {
      return deleteLabelOnTodo
        .mutateAsync({
          todoId: todo.id,
          labelId: label.id,
        })
        .then(() => getLabelsOnTodos.refetch())
        .finally(() => {
          setIsAddingLabel(false);
        });
    } else {
      createLabelOnTodo
        .mutateAsync({
          todoId: todo.id,
          labelId: label.id,
        })
        .then(() => getLabelsOnTodos.refetch())
        .finally(() => {
          setIsAddingLabel(false);
        });
    }
  };

  const handleAddCategoryClick = () => {
    setIsAddingCategory(true);

    if (!addCategoryName) {
      setIsAddingLabel(false);
      return;
    }

    createCategory
      .mutateAsync({
        name: addCategoryName,
        todoGroupId: selectedTodoGroup?.id,
      })
      .then(() => getCategories.refetch())
      .finally(() => {
        setIsAddingCategory(false);
        setIsAddCategoryModalOpen(false);
      });
  };

  const handleCategoryCreateTodoClick = (item: Category) => {
    setIsAddingTodoFromCategory(item);
    setIsAddTodoModalOpen(true);
  };

  const handleDeleteCategoryClick = (item: Category) => {
    return deleteCategory.mutateAsync({ id: item.id }).then(() => {
      getCategories.refetch();
    });
  };

  const handleTodoGroupNodeClick = (group: TodoGroup | null, owner: string) => {
    setSelectedTodoGroupOwner(owner);
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
      let parent: GroupTreeNode | null = null;
      if (group.parentGroupId === null) {
        parent = root;
      } else {
        parent = nodesMap.get(group.parentGroupId) || null;
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

  const createSharedGroupTrees = (todoGroups: TodoGroup[]) => {
    const userToSharedTodos = new Map<string, TodoGroup[]>();
    for (const group of todoGroups) {
      if (!userToSharedTodos.has(group.userId)) {
        userToSharedTodos.set(group.userId, []);
      }
      userToSharedTodos.get(group.userId)?.push(group);
    }

    const roots = new Map<string, GroupTreeNode>();
    userToSharedTodos.forEach((value, key) => {
      roots.set(key, createSharedGroupTree(value));
    });

    return roots;
  };

  const createSharedGroupTree = (todoGroups: TodoGroup[]): GroupTreeNode => {
    const root: GroupTreeNode = { item: null, parent: null, children: [] };

    const sharedTodos = new Set<number>();
    for (const group of todoGroups) {
      sharedTodos.add(group.id);
    }

    const nodesMap = new Map<number, GroupTreeNode>();

    for (const group of todoGroups) {
      let parent: GroupTreeNode | null = null;
      if (
        group.parentGroupId !== null &&
        sharedTodos.has(group.parentGroupId)
      ) {
        parent = nodesMap.get(group.parentGroupId) || null;
        if (!parent) {
          parent = { item: null, parent: null, children: [] };
          nodesMap.set(group.parentGroupId, parent);
        }
      } else {
        parent = root;
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

  const createTodoColumns = (
    todos: Todo[],
    group: number,
    categories: Category[]
  ): Map<Category | null, TodoListNode> => {
    const heads = new Map<Category | null, TodoListNode>();

    heads.set(
      null,
      createTodoColumn(
        todos.filter(
          (todo) => todo.categoryId === null && todo.todoGroupId === group
        )
      )
    );

    for (const category of categories) {
      if (category.todoGroupId !== group) {
        continue;
      }
      heads.set(
        category,
        createTodoColumn(
          todos.filter(
            (todo) =>
              todo.categoryId === category.id && todo.todoGroupId === group
          )
        )
      );
    }

    return heads;
  };
  const createTodoColumn = (todos: Todo[]): TodoListNode => {
    let head: TodoListNode = { item: null, prev: null, next: null };
    const nodesMap = new Map<number, TodoListNode>();

    for (const todo of todos) {
      let node: TodoListNode | undefined = nodesMap.get(todo.id);
      if (!node) {
        node = {
          item: null,
          prev: null,
          next: null,
        };

        nodesMap.set(todo.id, node);
      }
      node.item = todo;

      if (todo.prevTodoId !== null) {
        let prev = nodesMap.get(todo.prevTodoId);
        if (!prev) {
          prev = { item: null, prev: null, next: null };
          nodesMap.set(todo.prevTodoId, prev);
        }
        prev.next = node;
        node.prev = prev;
      } else {
        head = node;
      }
    }

    return head;
  };

  const onDragEnd = (result: DropResult) => {
    if (!getTodos.data) {
      return;
    }

    if (!result.destination) {
      return;
    }
    const sourceId = parseInt(result.source.droppableId);
    const destinationId = parseInt(result.destination.droppableId);
    if (sourceId !== destinationId) {
      const sourceColumn = categoryColumns.get(sourceId);
      if (!sourceColumn) {
        return;
      }
      const destColumn = categoryColumns.get(destinationId);
      if (!destColumn) {
        return;
      }
      const sourceItems = [...sourceColumn.todoItems];
      const destItems = [...destColumn.todoItems];
      const [removed] = sourceItems.splice(result.source.index, 1);
      if (!removed) {
        return;
      }
      const after = destItems[result.destination.index - 1];
      destItems.splice(result.destination.index, 0, removed);

      const newCategoryColumns = new Map<number, Column>();
      categoryColumns.forEach((value, key) =>
        newCategoryColumns.set(key, { ...value })
      );

      newCategoryColumns.set(sourceId, {
        ...sourceColumn,
        todoItems: sourceItems,
      });

      newCategoryColumns.set(destinationId, {
        ...destColumn,
        todoItems: destItems,
      });

      setCategoryColumns(newCategoryColumns);

      updateTodoPosition
        .mutateAsync({
          id: parseInt(result.draggableId),
          afterId: after?.id || null,
          toCategoryId: destinationId !== -1 ? destinationId : null,
        })
        .then(() => getTodos.refetch());
    } else {
      const column = categoryColumns.get(sourceId);
      if (!column) {
        return;
      }
      const copiedItems = [...column.todoItems];
      const [removed] = copiedItems.splice(result.source.index, 1);
      if (!removed) {
        return;
      }
      const after = copiedItems[result.destination.index - 1];
      copiedItems.splice(result.destination.index, 0, removed);

      const newCategoryColumns = new Map<number, Column>();
      categoryColumns.forEach((value, key) =>
        newCategoryColumns.set(key, { ...value })
      );

      newCategoryColumns.set(sourceId, {
        ...column,
        todoItems: copiedItems,
      });

      setCategoryColumns(newCategoryColumns);

      updateTodoPosition
        .mutateAsync({
          id: parseInt(result.draggableId),
          afterId: after?.id || null,
          toCategoryId: destinationId !== -1 ? destinationId : null,
        })
        .then(() => getTodos.refetch());
    }
  };

  return (
    <Layout>
      <div className="flex h-full">
        <div className="w-96 overflow-y-scroll border-r border-gray-500 p-4">
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
                ownerId={session?.user.id}
              />
            ) : null}
          </ul>

          <ul className="mt-4">
            {getSharedTodoGroups.isLoading
              ? "Loading..."
              : getSharedTodoGroups.isError
              ? "Error!"
              : getSharedTodoGroups.data
              ? Array.from(
                  createSharedGroupTrees(
                    getSharedTodoGroups.data.map((item) => item.todoGroup)
                  )
                ).map(([ownerId, root]) => (
                  <GroupNode
                    key={ownerId}
                    ownerId={ownerId}
                    height={0}
                    groupNode={root}
                    onGroupClick={handleTodoGroupNodeClick}
                  />
                ))
              : null}
          </ul>
        </div>
        <div className="flex-1 overflow-y-hidden border-l border-gray-500 p-4">
          <div className="flex w-full items-center gap-4 border-b pt-2 pb-4">
            <h2 className="w-64 overflow-hidden text-ellipsis text-2xl">
              {selectedTodoGroup?.name || getUserById.data?.name}
            </h2>

            <div className="flex">
              <div className="btn-group">
                <label
                  htmlFor="create-new-todo-modal"
                  className="modal-button btn btn-outline cursor-pointer"
                >
                  Create Todo
                </label>

                <label
                  htmlFor="create-new-label-modal"
                  className="modal-button btn btn-outline cursor-pointer"
                >
                  Create Label
                </label>

                <label
                  htmlFor="create-new-category-modal"
                  className="modal-button btn btn-outline cursor-pointer"
                >
                  Create Category
                </label>
              </div>

              <div className="px-3">
                <label
                  htmlFor="share-todo-group-modal"
                  className="modal-button btn btn-outline cursor-pointer"
                >
                  Share Group
                </label>
              </div>
            </div>

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

          {/* TO DO: Fix and Make DragDrop works */}
          <DragDropContext onDragEnd={(res) => onDragEnd(res)}>
            <div className="flex max-h-[90%] min-h-[90%] w-full overflow-x-auto pb-4">
              <div className="flex gap-2">
                {Array.from(categoryColumns).map(([, column]) => (
                  <CategoryComponent
                    key={column.category?.id || -1}
                    category={column.category}
                    todoItems={column.todoItems}
                    labels={
                      getLabels.data?.filter(
                        (label) =>
                          (!label.todoGroupId && !selectedTodoGroup) ||
                          label.todoGroupId === selectedTodoGroup?.id
                      ) || []
                    }
                    labelsOnTodos={getLabelsOnTodos.data || []}
                    onCategoryCreateTodo={handleCategoryCreateTodoClick}
                    onCategoryDelete={handleDeleteCategoryClick}
                    onLabelDelete={handleLabelDelete}
                    onLabelOnTodoChange={handleLabelOnTodoChange}
                    onTodoItemChangeIsFavourite={
                      handleTodoItemChangeIsFavourite
                    }
                    onTodoItemChangeStatus={handleTodoItemChangeStatus}
                    onTodoItemDelete={handleTodoItemDelete}
                  />
                ))}
              </div>
            </div>
          </DragDropContext>

          <input
            type="checkbox"
            id="create-new-todo-modal"
            className="modal-toggle"
            checked={isAddTodoModalOpen}
            onChange={(e) => {
              setIsAddTodoModalOpen(e.target.checked);
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

          <input
            type="checkbox"
            id="create-new-category-modal"
            className="modal-toggle"
            checked={isAddCategoryModalOpen}
            onChange={(e) => {
              setIsAddCategoryModalOpen(e.target.checked);
              setAddCategoryName(null);
            }}
          />
          <label htmlFor="create-new-category-modal" className="modal">
            <label className="relative" htmlFor="">
              <label
                htmlFor="create-new-category-modal"
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
                      value={addCategoryName || ""}
                      onChange={(e) => setAddCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      className={
                        "btn rounded " + (isAddingCategory ? "loading" : "")
                      }
                      type="button"
                      onClick={handleAddCategoryClick}
                    >
                      Add Category
                    </button>
                  </div>
                </form>
              </div>
            </label>
          </label>

          <input
            type="checkbox"
            id="share-todo-group-modal"
            className="modal-toggle"
            checked={isShareTodoGroupModalOpen}
            onChange={(e) => {
              setIsShareTodoGroupModalOpen(e.target.checked);
              setShareTodoGroupEmail(null);
            }}
          />
          <label htmlFor="share-todo-group-modal" className="modal">
            <label className="relative" htmlFor="">
              <label
                htmlFor="share-todo-group-modal"
                className="btn btn-circle btn-sm absolute right-0 top-3"
              >
                ✕
              </label>
              <div>
                <form className="mb-4 rounded px-8 pt-6 pb-8">
                  <div className="mb-4 opacity-100">
                    <label
                      className="mb-2 block text-sm font-bold"
                      htmlFor="share-email"
                    >
                      Share to:
                    </label>
                    <input
                      className="input input-bordered w-full max-w-xs"
                      id="share-email"
                      type="text"
                      placeholder="Email..."
                      value={shareTodoGroupEmail || ""}
                      onChange={(e) => setShareTodoGroupEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      className={
                        "btn rounded " + (isSharingTodoGroup ? "loading" : "")
                      }
                      type="button"
                      onClick={handleShareTodoGroupClick}
                    >
                      Share
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

{
  /* 
  {getTodos.data?.filter(
    (todo) =>
      ((!todo.todoGroupId && !selectedTodoGroup) ||
        todo.todoGroupId === selectedTodoGroup?.id) &&
      todo.categoryId === null
  ).length != 0 && (
    <div className="mt-4 w-[28rem] flex-col overflow-hidden overflow-y-auto rounded-lg border border-gray-500 p-4">
      <div className="p-4">
        <div className="mb-4 flex border-b border-gray-500 pb-2">
          <h2 className="w-64 overflow-hidden text-ellipsis text-2xl">
            Not Assigned todos
          </h2>
        </div>
        <div>
          <ul className="mt-4">
            {getTodos.isLoading ? (
              "Loading..."
            ) : getTodos.isError ? (
              "Error!"
            ) : getTodos.data ? (
              <Droppable droppableId="todos-droppable">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {getTodos.data
                      .filter(
                        (todo) =>
                          ((!todo.todoGroupId &&
                            !selectedTodoGroup) ||
                            todo.todoGroupId ===
                              selectedTodoGroup?.id) &&
                          !todo.categoryId
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
                                  onTodoItemChangeCategory={
                                    handleTodoItemChangeCategory
                                  }
                                  onTodoItemDelete={
                                    handleTodoItemDelete
                                  }
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
                                        labelOnTodo.todoId ===
                                        todo.id
                                    ) || []
                                  }
                                  onLabelOnTodoChange={
                                    handleLabelOnTodoChange
                                  }
                                  onLabelDelete={
                                    handleLabelDelete
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
        </div>
      </div>
    </div>
  )}


  return (
                        <div
                          key={category.id}
                          className="mt-4 w-[28rem] flex-col overflow-hidden overflow-y-auto rounded-lg border  border-gray-500 p-4"
                        >
                          <div className="px-4">
                            <div className="mb-4 flex justify-between border-b border-gray-500 pb-2">
                              <h2 className="w-64 self-end overflow-hidden text-ellipsis text-2xl">
                                {category.name}
                              </h2>
                              <button
                                className={
                                  "btn btn-square btn-outline btn-error scale-90 " +
                                  (isDeletingCategory ? " loading" : null)
                                }
                                onClick={() =>
                                  handleDeleteCategoryClick(category)
                                }
                              >
                                {!isDeletingCategory && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    display="none"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <ul className="mt-4">
                              {getTodos.isLoading ? (
                                "Loading..."
                              ) : getTodos.isError ? (
                                "Error!"
                              ) : getTodos.data ? (
                                <Droppable droppableId="todos-droppable">
                                  {(provided) => (
                                    <div
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                    >
                                      {getTodos.data
                                        .filter(
                                          (todo) =>
                                            ((!todo.todoGroupId &&
                                              !selectedTodoGroup) ||
                                              todo.todoGroupId ===
                                                selectedTodoGroup?.id) &&
                                            todo.categoryId === category.id
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
                                                    onTodoItemDelete={
                                                      handleTodoItemDelete
                                                    }
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
                                                          labelOnTodo.todoId ===
                                                          todo.id
                                                      ) || []
                                                    }
                                                    onLabelOnTodoChange={
                                                      handleLabelOnTodoChange
                                                    }
                                                    onLabelDelete={
                                                      handleLabelDelete
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
                          </div>
                        </div>
                      );
*/
}

export default Home;
