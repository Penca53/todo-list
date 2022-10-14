import { Todo } from "@prisma/client";

interface TodoItemComponentProps {
  todoItem: Todo;
  onTodoItemChangeIsFavourite: (item: Todo) => void;
  onTodoItemChangeStatus: (item: Todo) => void;
  onTodoItemDelete: (item: Todo) => void;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = (props) => {
  return (
    <li className="mt-2 w-80 rounded border border-gray-500 bg-white shadow-md">
      <div className="flex justify-between gap-4 border-b border-gray-300 p-2">
        <h2 className="break-all">{props.todoItem.name}</h2>
        <input
          type={"checkbox"}
          // TODO: allow more than boolean values
          checked={props.todoItem.isFavourite}
          onChange={() => props.onTodoItemChangeIsFavourite(props.todoItem)}
        />
        <input
          type={"checkbox"}
          // TODO: allow more than boolean values
          checked={props.todoItem.status}
          onChange={() => props.onTodoItemChangeStatus(props.todoItem)}
        />
      </div>

      <div className="flex justify-between gap-4 p-2">
        <h3 className="break-all p-2">{props.todoItem.description}</h3>
        <button
          type="button"
          className="mr-2 mb-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
          onClick={() => props.onTodoItemDelete(props.todoItem)}
        >
          X
        </button>
      </div>
    </li>
  );
};

export default TodoItemComponent;
