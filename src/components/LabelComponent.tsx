import { Todo, Label } from "@prisma/client";
import { useState } from "react";
import useDebounce from "../hooks/useDebounce";

interface LabelComponentProps {
  todoItem: Todo;
  label: Label;
  onLabelOnTodoChange: (label: Label, item: Todo) => void;
  onLabelDelete: (label: Label) => Promise<void>;
}

const LabelComponent: React.FC<LabelComponentProps> = (props) => {
  const [isDeletingLabel, setIsDeletingLabel] = useState(false);

  const [status, setStatus] = useState(false);

  useDebounce(
    status,
    () => props.onLabelOnTodoChange(props.label, props.todoItem),
    500
  );

  return (
    <div className="btn-group flex">
      <button
        className={
          "btn btn-outline btn-error btn-sm " +
          (isDeletingLabel ? " loading" : null)
        }
        onClick={() => {
          setIsDeletingLabel(true);

          props
            .onLabelDelete(props.label)
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
        className="btn btn-outline btn-sm block max-w-xs overflow-hidden text-ellipsis "
        onClick={() => setStatus((prevState) => !prevState)}
      >
        {props.label.name}
      </button>
    </div>
  );
};

export default LabelComponent;
