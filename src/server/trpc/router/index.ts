// src/server/router/index.ts
import { router } from "../trpc";

import { todoRouter } from "./todo";
import { todoGroupRouter } from "./todoGroup";
import { labelRouter } from "./label";
import { labelsOnTodosRouter } from "./labelsOnTodos";
<<<<<<< HEAD
import { todoGroupShareRouter } from "./todoGroupShare";
=======
import { categoryRouter } from "./category";
>>>>>>> 8915abb635758e555469c30dd6b4a177eab61464

export const appRouter = router({
  todo: todoRouter,
  todoGroup: todoGroupRouter,
  label: labelRouter,
  labelsOnTodos: labelsOnTodosRouter,
<<<<<<< HEAD
  todoGroupShare: todoGroupShareRouter,
=======
  category: categoryRouter,
>>>>>>> 8915abb635758e555469c30dd6b4a177eab61464
});

// export type definition of API
export type AppRouter = typeof appRouter;
