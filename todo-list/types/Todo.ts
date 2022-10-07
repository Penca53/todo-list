export enum TodoStatus {
  NOT_DONE,
  DONE,
}

export interface TodoAPI {
  ID: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt?: Date;
  Name: string;
  Description: string;
  Status: boolean;
  UserID: number;
}

export interface TodoModel {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  name: string;
  description: string;
  status: boolean;
  userID: number;
}
