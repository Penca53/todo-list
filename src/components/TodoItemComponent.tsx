import { Todo } from "@prisma/client";
import { useState } from "react";
import useDebounce from "../hooks/useDebounce";

interface TodoItemComponentProps {
  todoItem: Todo;
  onTodoItemChangeIsFavourite: (item: Todo) => void;
  onTodoItemChangeStatus: (item: Todo, status: boolean) => void;
  onTodoItemDelete: (item: Todo) => void;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = (props) => {
  const [status, setStatus] = useState(false);
  useDebounce(
    status,
    (newStatus) => props.onTodoItemChangeStatus(props.todoItem, newStatus),
    500
  );

  return (
    <li className="mt-2 w-3/4 rounded border border-gray-500">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex gap-4">
          <input
            type={"checkbox"}
            // TODO: allow more than boolean values
            checked={status}
            className="checkbox checkbox-lg"
            onChange={(e) => setStatus(e.target.checked)}
          />
          <h2 className="break-all text-lg">{props.todoItem.name}</h2>
        </div>

        <div className="flex gap-10">
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

          <button
            className="btn btn-outline btn-error btn-square"
            onClick={() => props.onTodoItemDelete(props.todoItem)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
};

export default TodoItemComponent;
