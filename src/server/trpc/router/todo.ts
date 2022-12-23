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

  updateTodoCategory: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        categoryId: z.number().int().nullish(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          categoryId: input.categoryId,
        },
      });
    }),

  updateTodoPosition: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        afterId: z.number().int().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Remove
      const todo = await ctx.prisma.todo.findFirstOrThrow({
        where: {
          id: input.id,
        },
      });

      const next = await ctx.prisma.todo.findFirstOrThrow({
        where: {
          prevTodoId: todo.id,
        },
      });

      if (next) {
        await ctx.prisma.todo.update({
          where: {
            id: next.id,
          },
          data: {
            prevTodoId: todo.prevTodoId,
          },
        });
      }

      // Insert

      // Update next.prev
      await ctx.prisma.todo.update({
        where: {
          prevTodoId: input.afterId || undefined,
        },
        data: {
          prevTodoId: todo.id,
        },
      });

      // Update self
      return ctx.prisma.todo.update({
        where: {
          id: todo.id,
        },
        data: {
          prevTodoId: input.afterId,
        },
      });
    }),
});
