import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const todoGroupRouter = router({
  getTodoGroups: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.todoGroup.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { id: "asc" },
    });
  }),
  createTodoGroups: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        parentGroupId: z.number().int().nullish(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todoGroup.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          parentGroupId: input.parentGroupId,
        },
      });
    }),

  deleteTodoGroup: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todoGroup.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
