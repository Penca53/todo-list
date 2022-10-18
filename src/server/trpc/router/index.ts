// src/server/router/index.ts
import { router } from "../trpc";

import { todoRouter } from "./todo";
import { todoGroupRouter } from "./todoGroup";

export const appRouter = router({
  todo: todoRouter,
  todoGroup: todoGroupRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
