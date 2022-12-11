import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const todoGroupShareRouter = router({
  getSharedTodoGroups: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.todoGroupShare.findMany({
      where: { sharedToId: ctx.session.user.id },
      include: { todoGroup: true },
    });
  }),
});
