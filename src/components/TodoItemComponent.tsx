import { Todo } from "@prisma/client";
import { useState } from "react";
import useDebounce from "../hooks/useDebounce";

interface TodoItemComponentProps {
  todoItem: Todo;
  onTodoItemChangeIsFavourite: (item: Todo) => void;
  onTodoItemChangeStatus: (item: Todo, status: boolean) => void;
  onTodoItemDelete: (item: Todo) => Promise<void>;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = (props) => {
  const [status, setStatus] = useState(props.todoItem.status);

  const [isDeletingTodo, setIsDeletingTodo] = useState(false);

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
                "btn btn-square btn-outline btn-error" +
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
                "btn btn-ghost btn-circle " +
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
        <div className="border-top card-actions mt-3 mb-3 mr-3 justify-end">
          <div className="justify-begin">
            <svg
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              x="24px"
              y="24px"
              viewBox="0 0 490.2 490.2"
            >
              <path
                d="M418.5,418.5c95.6-95.6,95.6-251.2,0-346.8s-251.2-95.6-346.8,0s-95.6,251.2,0,346.8S322.9,514.1,418.5,418.5z M89,89
			c86.1-86.1,226.1-86.1,312.2,0s86.1,226.1,0,312.2s-226.1,86.1-312.2,0S3,175.1,89,89z"
              />
              <path
                d="M245.1,336.9c3.4,0,6.4-1.4,8.7-3.6c2.2-2.2,3.6-5.3,3.6-8.7v-67.3h67.3c3.4,0,6.4-1.4,8.7-3.6c2.2-2.2,3.6-5.3,3.6-8.7
			c0-6.8-5.5-12.3-12.2-12.2h-67.3v-67.3c0-6.8-5.5-12.3-12.2-12.2c-6.8,0-12.3,5.5-12.2,12.2v67.3h-67.3c-6.8,0-12.3,5.5-12.2,12.2
			c0,6.8,5.5,12.3,12.2,12.2h67.3v67.3C232.8,331.4,238.3,336.9,245.1,336.9z"
              />
            </svg>
          </div>
          <div className="badge badge-outline">Fashion</div>
          <div className="badge badge-outline">Products</div>
        </div>
      </div>
    </li>
  );
};

export default TodoItemComponent;
