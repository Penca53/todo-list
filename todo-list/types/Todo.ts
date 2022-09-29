export enum TodoStatus {
  NOT_DONE,
  DONE,
}

export interface TodoAPI {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

export interface TodoModel {
  id: number;
  name: string;
  description: string;
  status: boolean;
}
