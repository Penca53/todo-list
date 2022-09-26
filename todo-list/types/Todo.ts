export enum TodoStatus {
  NOT_DONE,
  DONE,
}

export interface TodoAPI {
  ID: number;
  Name: string;
  Description: string;
  Status: boolean;
}

export interface TodoModel {
  id: number;
  name: string;
  description: string;
  status: boolean;
}
