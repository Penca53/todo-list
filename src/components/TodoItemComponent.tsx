import { trpc } from "../utils/trpc";
import { Todo, Label, LabelsOnTodos } from "@prisma/client";
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
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = (props) => {
  const [status, setStatus] = useState(props.todoItem.status);

  const [isDeletingTodo, setIsDeletingTodo] = useState(false);

  const [isAddingLabel, setIsAddingLabel] = useState(false);

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
    <li className="mt-2 rounded ">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div>
          {/*<figure>
           <img src="https://placeimg.com/400/225/arch" alt="Shoes" />
          </figure>*/}
        </div>

        <div className="mb-3 grid grid-cols-3">
          <div className="col-span-2 gap-4 break-words p-6">
            <h2 className="card-title">{props.todoItem.name}</h2>
            <div>
              <p>{props.todoItem.description}</p>
            </div>

            <div className="mt-2 justify-start">
              <div className="flex gap-2">
                <input
                  type={"checkbox"}
                  // TODO: allow more than boolean values
                  checked={status}
                  className="checkbox checkbox-lg"
                  onChange={(e) => setStatus(e.target.checked)}
                />
                <h2 className="break-all text-lg text-green-500">
                  {status === true ? "Done" : ""}
                </h2>
              </div>
            </div>
          </div>

          <div className="grid flex-grow justify-end p-6">
            <button
              className={
                "btn btn-outline btn-error btn-square" +
                (isDeletingTodo ? " loading" : "")
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
                  className="h-6 w-6"
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
              className={
                "btn btn-circle btn-ghost " +
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
          </div>
        </div>

        <hr></hr>
        <div className="border-top card-actions m-3 mb-1.5 flex flex-row justify-between">
          <div className="flex-none">
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
          </div>
          <div className="space-x-1.5">
            {labelsOnTodo.map((labelOnTodo) => (
              <div key={labelOnTodo.labelId} className="badge badge-outline">
                {labels.find((label) => label.id === labelOnTodo.labelId)!.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      {isAddingLabel ? (
        <div
          onFocus={() => console.log("focus")}
          className="card absolute z-10 mt-2 flex w-96 flex-row justify-end space-x-1.5 overflow-auto rounded-md bg-base-200 p-2.5 shadow-xl"
        >
          {labels?.length === 0
            ? "There are not any labels available on this group."
            : labels.map((label) => (
                <button
                  key={label.id}
                  className="badge btn btn-ghost btn-sm m-0 border-stone-300 p-1"
                  onClick={() =>
                    props.onLabelOnTodoChange(label, props.todoItem)
                  }
                >
                  {label.name}
                </button>
              ))}
        </div>
      ) : null}
    </li>
  );
};

export default TodoItemComponent;
