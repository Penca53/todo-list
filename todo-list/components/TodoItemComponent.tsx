import { TodoModel } from "../types/Todo";

interface TodoItemComponentProps {
  todoItem: TodoModel;
  onTodoItemChange: (item: TodoModel) => void;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = (props) => {
  return (
    <li className="p-2 border border-black flex justify-between gap-4">
      <h2>{props.todoItem.title}</h2>
      <input
        type={"checkbox"}
        // TODO: allow more than boolean values
        checked={props.todoItem.status}
        onChange={() => props.onTodoItemChange(props.todoItem)}
      />
    </li>
  );
};

export default TodoItemComponent;
