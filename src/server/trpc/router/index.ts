// src/server/router/index.ts
import { router } from "../trpc";

import { todoRouter } from "./todo";
import { todoGroupRouter } from "./todoGroup";
import { labelRouter } from "./label";
import { labelsOnTodosRouter } from "./labelsOnTodos";
import { todoGroupShareRouter } from "./todoGroupShare";
import { categoryRouter } from "./category";
import { userRouter } from "./user";

export const appRouter = router({
  todo: todoRouter,
  todoGroup: todoGroupRouter,
  label: labelRouter,
  labelsOnTodos: labelsOnTodosRouter,
  todoGroupShare: todoGroupShareRouter,
  category: categoryRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
