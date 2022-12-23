import { Todo, TodoGroup } from "@prisma/client";

export enum TodoStatus {
  NOT_DONE,
  DONE,
}

export interface GroupTreeNode {
  item: TodoGroup | null;
  parent: GroupTreeNode | null;
  children: GroupTreeNode[];
}

export interface TodoListNode {
  item: Todo | null;
  prev: TodoListNode | null;
  next: TodoListNode | null;
}
