import { trpc } from "../utils/trpc";
import { Todo, Label, LabelsOnTodos, Category } from "@prisma/client";
import LabelComponent from "./LabelComponent";
import { useState } from "react";
import useDebounce from "../hooks/useDebounce";

interface TodoItemComponentProps {
  todoItem: Todo;
  labels: Label[];
  labelsOnTodos: LabelsOnTodos[];
  onTodoItemChangeIsFavourite: (item: Todo) => void;
  onTodoItemChangeStatus: (item: Todo, status: boolean) => void;
  onTodoItemDelete: (item: Todo) => Promise<void>;
  onLabelOnTodoChange: (label: Label, item: Todo) => void;
  onLabelDelete: (label: Label) => Promise<void>;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = (props) => {
  const [status, setStatus] = useState(props.todoItem.status);

  const [isDeletingTodo, setIsDeletingTodo] = useState(false);

  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isDeletingLabel, setIsDeletingLabel] = useState(false);

  const labels = props.labels;
  const labelsOnTodo = props.labelsOnTodos;

  const handleAddLabelClick = () => {
    setIsAddingLabel((prev) => !prev);
  };

  useDebounce(
    status,
    (newStatus) => props.onTodoItemChangeStatus(props.todoItem, newStatus),
    500
  );

  return (
    <li className="relative mt-2 rounded">
      <div className="w-full rounded-xl bg-primary pb-2 shadow-xl">
        <div className="flex h-24 items-center justify-between">
          <div className="flex basis-3/4 items-center justify-between gap-6 break-words pl-6 pt-2 pb-3 pr-3">
            <input
              type={"checkbox"}
              // TODO: allow more than boolean values
              checked={status}
              className="checkbox checkbox-lg scale-125"
              onChange={(e) => setStatus(e.target.checked)}
            />

            <div className="min-w-0 max-w-[164px] flex-1 justify-start">
              <p className="overflow-clip text-ellipsis whitespace-nowrap text-xl font-semibold text-gray-900 dark:text-white">
                {props.todoItem.name}
              </p>
              <p className="text-md overflow-clip text-ellipsis whitespace-nowrap text-gray-500 dark:text-gray-400">
                {props.todoItem.description}
              </p>
            </div>
          </div>

          <div className="flex basis-1/4 items-center justify-between gap-3 pr-3 pt-2 pb-3">
            <button
              className={
                "btn btn-circle btn-ghost mt-1 justify-self-center " +
                (props.todoItem.isFavourite
                  ? "stroke-yellow-400"
                  : "stroke-gray-400")
              }
              onClick={() => props.onTodoItemChangeIsFavourite(props.todoItem)}
            >
              <svg
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule="evenodd"
              >
                <path d="M15.668 8.626l8.332 1.159-6.065 5.874 1.48 8.341-7.416-3.997-7.416 3.997 1.481-8.341-6.064-5.874 8.331-1.159 3.668-7.626 3.669 7.626zm-6.67.925l-6.818.948 4.963 4.807-1.212 6.825 6.068-3.271 6.069 3.271-1.212-6.826 4.964-4.806-6.819-.948-3.002-6.241-3.001 6.241z" />
              </svg>
            </button>

            <button
              className={
                "btn btn-square btn-outline btn-error " +
                (isDeletingTodo ? " loading" : null)
              }
              onClick={() => {
                setIsDeletingTodo(true);
                console.log(isDeletingTodo);

                props
                  .onTodoItemDelete(props.todoItem)
                  .then(() => setIsDeletingTodo(false));
                console.log(isDeletingTodo);
              }}
            >
              {!isDeletingTodo && (
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

        <hr></hr>
        <div className="border-top flex items-center justify-between px-3 pt-3 pb-1">
          <button
            className="modal-button btn btn-circle btn-ghost btn-sm m-0 p-1"
            onClick={() => {
              handleAddLabelClick();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 transition hover:scale-110"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <div className="-mb-3 flex gap-2 overflow-x-scroll pb-3">
            {labelsOnTodo.map((labelOnTodo) => (
              <div
                key={labelOnTodo.labelId}
                className="h-6 max-w-[128px] overflow-clip text-ellipsis whitespace-nowrap rounded border px-2"
              >
                {labels.find((label) => label.id === labelOnTodo.labelId)
                  ?.name || ""}
              </div>
            ))}
          </div>
        </div>
      </div>
      {isAddingLabel ? (
        <div className="absolute z-10 mt-2 flex max-h-32 w-96 flex-wrap justify-end gap-2 space-x-1.5 overflow-y-auto rounded-md bg-base-200 p-2.5 opacity-90 shadow-xl">
          {labels?.length === 0
            ? "There are not any labels available on this group."
            : labels.map((label) => (
                <LabelComponent
                  key={label.id}
                  todoItem={props.todoItem}
                  label={label}
                  onLabelOnTodoChange={props.onLabelOnTodoChange}
                  onLabelDelete={props.onLabelDelete}
                />
              ))}
        </div>
      ) : null}
    </li>
  );
};

/*
  <div className="flex">
    <button
      className={
        "btn btn-outline btn-error btn-sm " +
        (isDeletingLabel ? " loading" : null)
      }
      onClick={() => {
        setIsDeletingLabel(true);

        props
          .onLabelDelete(label)
          .then(() => setIsDeletingLabel(false));
      }}
    >
      {!isDeletingLabel && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
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
    <button
      key={label.id}
      className="btn btn-sm block max-w-xs overflow-hidden text-ellipsis border-stone-300"
      onClick={() =>
        props.onLabelOnTodoChange(label, props.todoItem)
      }
    >
      {label.name}
    </button>
  </div>
*/

export default TodoItemComponent;
