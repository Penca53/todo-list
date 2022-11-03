import { Todo, TodoGroup } from "@prisma/client";
import { useSession } from "next-auth/react";
import { GroupTreeNode } from "../../types/Todo";

interface GroupNodeProps {
  todos: Todo[];
  groupNode: GroupTreeNode;
  height: number;
  onGroupClick: (group: TodoGroup | null) => void;
}

const GroupNode: React.FC<GroupNodeProps> = (props) => {
  const { data: session, status } = useSession();

  return (
    <div className="ml-6">
      <button
        onClick={() => props.onGroupClick(props.groupNode.item)}
        className="btn btn-ghost"
      >
        {props.groupNode.item ? props.groupNode.item.name : session?.user.name}
      </button>

      <div>
        {props.groupNode.children.map((child) => (
          <GroupNode
            key={child.item?.id}
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
