import { TodoGroup } from "@prisma/client";

export enum TodoStatus {
  NOT_DONE,
  DONE,
}

export interface GroupTreeNode {
  item: TodoGroup | null;
  parent: GroupTreeNode | null;
  children: GroupTreeNode[];
}
