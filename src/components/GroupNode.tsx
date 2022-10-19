import { Todo, TodoGroup } from "@prisma/client";
import { GroupTreeNode } from "../../types/Todo";

interface GroupNodeProps {
  todos: Todo[];
  groupNode: GroupTreeNode;
  height: number;
  onGroupClick: (group: TodoGroup) => void;
}

const GroupNode: React.FC<GroupNodeProps> = (props) => {
  return (
    <div className="my-2 ml-4">
      {props.groupNode.parent && (
        <button
          onClick={() => props.onGroupClick(props.groupNode.item!)}
          className="rounded border border-neutral-400 bg-transparent py-1 px-6 font-semibold text-neutral-500 hover:border-transparent hover:bg-neutral-300 hover:text-neutral-600"
        >
          {props.groupNode.item?.name}
        </button>
      )}

      <div>
        {props.groupNode.children.map((child) => (
          <GroupNode
            todos={props.todos}
            groupNode={child}
            height={props.height + 1}
            onGroupClick={props.onGroupClick}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupNode;
