import { trpc } from "../utils/trpc";
import { Todo, TodoGroup, Label } from "@prisma/client";
import { useSession } from "next-auth/react";
import { GroupTreeNode } from "../../types/Todo";
import { useState } from "react";

interface GroupNodeProps {
  groupNode: GroupTreeNode;
  height: number;
  onGroupClick: (group: TodoGroup | null) => void;
}

const GroupNode: React.FC<GroupNodeProps> = (props) => {
  const { data: session, status } = useSession();
  const [addGroupName, setAddGroupName] = useState<string | null>();

  const getTodoGroups = trpc.todoGroup.getTodoGroups.useQuery();
  const createTodoGroup = trpc.todoGroup.createTodoGroups.useMutation();

  const [collapsed, setCollapsed] = useState("block");
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const handleAddGroupClick = () => {
    if (!addGroupName || addGroupName.length <= 0) {
      return;
    }
    createTodoGroup
      .mutateAsync({
        name: addGroupName,
        parentGroupId: props.groupNode.item?.id,
      })
      .then(() => getTodoGroups.refetch())
      .finally(() => setIsAddingGroup(false));
  };

  const handleDeleteGroup = () => {
    /*
    deleteTodoGroup
      .mutateAsync({ id: props.groupNode.item?.id})
      .then(() => getTodoGroups.refetch());
  */
  };

  const onAddGroupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddGroupClick();
    }
  };

  return (
    <div className="ml-6">
      <div className="group btn-ghost btn-sm flex h-12 items-center justify-between rounded-lg pl-2 pr-0 ">
        <button
          onClick={() => props.onGroupClick(props.groupNode.item)}
          className="btn btn-sm h-12 grow justify-start border-none bg-transparent pl-0 hover:bg-transparent"
        >
          <p className="max-w-[128px] overflow-hidden text-ellipsis">
            {props.groupNode.item
              ? props.groupNode.item.name
              : session?.user.name}
          </p>
        </button>

        <div className="flex items-center">
          <div className="dropdown dropdown-right hidden group-hover:block">
            <button
              className="modal-button btn btn-ghost btn-sm h-12"
              onClick={() => {
                setIsAddingGroup(true);
                setAddGroupName(null);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 transition hover:scale-110"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={() => {
              collapsed === "block"
                ? setCollapsed("hidden")
                : setCollapsed("block");
            }}
            className="btn btn-ghost btn-sm hidden h-12 group-hover:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={
                "h-6 w-6 hover:scale-110" +
                (collapsed === "block"
                  ? " -rotate-90 transition-transform"
                  : " rotate-0 transition-transform")
              }
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {isAddingGroup && (
        <div className="mb-1 mt-2 flex items-center justify-between pl-1">
          <input
            onBlur={() => {
              setIsAddingGroup(false);
              setAddGroupName(null);
            }}
            autoFocus
            className="input input-xs w-full"
            onChange={(e) => setAddGroupName(e.target.value)}
            onKeyDown={(e) => onAddGroupKeyDown(e)}
            value={addGroupName || ""}
          />
        </div>
      )}

      <div className={collapsed + " border-l border-solid border-slate-500"}>
        {props.groupNode.children.map((child) => (
          <GroupNode
            key={child.item?.id}
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
