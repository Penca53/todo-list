// src/server/router/index.ts
import { router } from "../trpc";

import { todoRouter } from "./todo";
import { todoGroupRouter } from "./todoGroup";
import { labelRouter } from "./label";
import { labelsOnTodosRouter } from "./labelsOnTodos";
import { categoryRouter } from "./category";

export const appRouter = router({
  todo: todoRouter,
  todoGroup: todoGroupRouter,
  label: labelRouter,
  labelsOnTodos: labelsOnTodosRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
