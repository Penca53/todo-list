export enum TodoStatus {
  NOT_DONE,
  DONE,
}

export interface TodoAPI {
  id: number;
  title: string;
  status: TodoStatus;
}

export interface TodoModel {
  id: number;
  title: string;
  status: boolean;
}
