import { Todo } from "@prisma/client";

interface TodoItemComponentProps {
  todoItem: Todo;
  onTodoItemChange: (item: Todo) => void;
  onTodoItemDelete: (item: Todo) => void;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = (props) => {
  return (
    <li className="mt-2 bg-white shadow-md rounded border border-gray-500 w-80">
      <div className="flex p-2 justify-between gap-4 border-b border-gray-300">
        <h2 className="break-all">{props.todoItem.name}</h2>
        <input 
          type={"checkbox"}
          // TODO: allow more than boolean values
          checked={props.todoItem.status}
          onChange={() => props.onTodoItemChange(props.todoItem)}
        />
      </div>

      <div className="flex p-2 justify-between gap-4">
        <h3 className="p-2 break-all">{props.todoItem.description}</h3>
        <button
          type="button"
          className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
          onClick={() => props.onTodoItemDelete(props.todoItem)}
        >
          X
        </button>
      </div>
    </li>
  );
};

export default TodoItemComponent;
