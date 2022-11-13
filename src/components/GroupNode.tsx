import { trpc } from "../utils/trpc";
import { Todo, TodoGroup } from "@prisma/client";
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

  const [display, setDisplay] = useState("block");

  const handleAddGroupClick = () => {
    if (!addGroupName || addGroupName.length <= 0) {
      return;
    }
    createTodoGroup
      .mutateAsync({
        name: addGroupName,
        parentGroupId: props.groupNode.item?.id,
      })
      .then(() => getTodoGroups.refetch());
  };

  return (
    <div className="ml-6">
      <div className="flex justify-between">
        <button
          onClick={() => props.onGroupClick(props.groupNode.item)}
          className="btn btn-ghost"
        >
          {props.groupNode.item
            ? props.groupNode.item.name
            : session?.user.name}
        </button>

        <div>
          <label
            htmlFor={"create-new-group-modal" + props.groupNode.item?.id}
            className="modal-button btn btn-ghost"
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
          </label>

          <input
            type="checkbox"
            id={"create-new-group-modal" + props.groupNode.item?.id}
            className="modal-toggle"
          />

          <div className="modal">
            <div className="modal-box relative">
              <label
                htmlFor={"create-new-group-modal" + props.groupNode.item?.id}
                className="btn btn-circle btn-sm absolute right-2 top-2"
              >
                ✕
              </label>

              <div>
                <form className="mb-4 rounded px-8 pt-3">
                  <label
                    className="mb-2 block text-sm font-bold"
                    htmlFor="name"
                  >
                    New Group Name
                  </label>

                  <input
                    className="input input-bordered w-full max-w-xs"
                    id="name"
                    type="text"
                    placeholder="Name..."
                    value={addGroupName || ""}
                    onChange={(e) => setAddGroupName(e.target.value)}
                  ></input>

                  <div className="mt-6 flex justify-start">
                    <button
                      className="btn rounded"
                      type="button"
                      onClick={handleAddGroupClick}
                    >
                      Add Group
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              display === "block" ? setDisplay("hidden") : setDisplay("block");
            }}
            className="btn btn-ghost"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={
                "h-5 w-5 hover:scale-110" +
                (display === "hidden"
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

      <div className={display}>
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
