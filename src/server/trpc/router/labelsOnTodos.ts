import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const labelsOnTodosRouter = router({
  getLabelsOnTodos: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.labelsOnTodos.findMany();
  }),

  getLabelsOnTodo: protectedProcedure.query(({ ctx }) => {}),

  createLabelOnTodo: protectedProcedure
    .input(
      z.object({
        todoId: z.number().int(),
        labelId: z.number().int(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.labelsOnTodos.create({
        data: {
          todoId: input.todoId,
          labelId: input.labelId,
        },
      });
    }),

  deleteLabelOnTodo: protectedProcedure
    .input(
      z.object({
        todoId: z.number().int(),
        labelId: z.number().int(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.labelsOnTodos.delete({
        where: {
          todoId_labelId: { todoId: input.todoId, labelId: input.labelId },
        },
      });
    }),
});
