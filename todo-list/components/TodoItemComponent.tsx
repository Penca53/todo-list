import { TodoModel } from "../types/Todo";

interface TodoItemComponentProps {
  todoItem: TodoModel;
  onTodoItemChange: (item: TodoModel) => void;
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

      <h3 className="p-2 break-all">{props.todoItem.description}</h3>
    </li>
  );
};

export default TodoItemComponent;
