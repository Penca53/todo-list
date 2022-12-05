import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const todoRouter = router({
  getTodos: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.todo.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { id: "asc" },
    });
  }),
  createTodo: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        status: z.boolean().default(false),
        todoGroupId: z.number().int().nullish(),
        categoryId: z.number().int().nullish(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.create({
        data: {
          name: input.name,
          description: input.description,
          status: input.status,
          isFavourite: false,
          userId: ctx.session.user.id,
          todoGroupId: input.todoGroupId,
          categoryId: input.categoryId,
        },
      });
    }),
  deleteTodo: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.delete({
        where: {
          id: input.id,
        },
      });
    }),
  updateTodoStatus: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
    }),

  updateTodoFavourite: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        isFavourite: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          isFavourite: input.isFavourite,
        },
      });
    }),
});
