import { trpc } from "../utils/trpc";
import { Todo, Category, Label, LabelsOnTodos } from "@prisma/client";
import TodoItemComponent from "../components/TodoItemComponent";
import { useState } from "react";
import dynamic from "next/dynamic";
import { TodoListNode } from "../../types/Todo";

interface CategoryComponentProps {
  category: Category | null;
  onCategoryDelete: (item: Category) => Promise<void>;

  todoItems: Todo[];
  onTodoItemChangeIsFavourite: (item: Todo) => void;
  onTodoItemChangeStatus: (item: Todo, status: boolean) => void;
  onTodoItemDelete: (item: Todo) => Promise<void>;

  labels: Label[];
  onLabelDelete: (label: Label) => Promise<void>;

  labelsOnTodos: LabelsOnTodos[];
  onLabelOnTodoChange: (label: Label, item: Todo) => void;
}

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

const CategoryComponent: React.FC<CategoryComponentProps> = (props) => {
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  return (
    <div className="mt-4 w-[28rem] flex-col justify-items-start overflow-hidden overflow-y-auto rounded-lg  border border-gray-500 p-4">
      <div className="px-4">
        <div className="mb-4 flex h-14 justify-between border-b border-gray-500 pb-2">
          <h2 className="w-64 self-end overflow-hidden text-ellipsis text-2xl">
            {props.category === null
              ? "Not assigned todos"
              : props.category.name}
          </h2>
          {props.category && (
            <button
              className={
                "btn btn-outline btn-error btn-square scale-90 " +
                (isDeletingCategory ? " loading" : null)
              }
              onClick={() => {
                setIsDeletingCategory(true);
                props
                  .onCategoryDelete(props.category!)
                  .then(() => setIsDeletingCategory(false));
              }}
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
          )}
        </div>
      </div>
      <div className="px-4">
        <Droppable
          droppableId={props.category ? props.category.id.toString() : "-1"}
        >
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="h-full"
            >
              <ul className="mt-4">
                <div>
                  {props.todoItems.map((todo, index) => {
                    return (
                      <Draggable
                        key={todo.id}
                        draggableId={todo.id.toString()}
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
                                props.onTodoItemChangeStatus
                              }
                              onTodoItemChangeIsFavourite={
                                props.onTodoItemChangeIsFavourite
                              }
                              onTodoItemDelete={props.onTodoItemDelete}
                              labels={props.labels}
                              labelsOnTodos={
                                props.labelsOnTodos?.filter(
                                  (labelOnTodo) =>
                                    labelOnTodo.todoId === todo.id
                                ) || []
                              }
                              onLabelOnTodoChange={props.onLabelOnTodoChange}
                              onLabelDelete={props.onLabelDelete}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              </ul>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default CategoryComponent;
