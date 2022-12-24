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
    .mutation(async ({ ctx, input }) => {
      const next = await ctx.prisma.todo.findFirst({
        where: {
          prevTodoId: null,
          todoGroupId: input.todoGroupId,
        },
      });

      const todo = await ctx.prisma.todo.create({
        data: {
          name: input.name,
          description: input.description,
          status: input.status,
          isFavourite: false,
          userId: ctx.session.user.id,
          todoGroupId: input.todoGroupId,
          categoryId: input.categoryId,
          prevTodoId: null,
        },
      });

      if (next) {
        await ctx.prisma.todo.update({
          where: {
            id: next.id,
          },
          data: {
            prevTodoId: todo.id,
          },
        });
      }

      return todo;
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

  updateTodoPosition: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        afterId: z.number().int().nullable(),
        toCategoryId: z.number().int().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id === input.afterId) {
        return;
      }
      // Remove
      const todo = await ctx.prisma.todo.findFirstOrThrow({
        where: {
          id: input.id,
        },
      });

      const next = await ctx.prisma.todo.findFirst({
        where: {
          prevTodoId: todo.id,
        },
      });

      if (next) {
        await ctx.prisma.todo.update({
          where: {
            id: input.id,
          },
          data: {
            prevTodoId: null,
          },
        });

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
      const afterNext = await ctx.prisma.todo.findFirst({
        where: {
          prevTodoId: input.afterId,
          todoGroupId: todo.todoGroupId,
          categoryId: input.toCategoryId,
        },
      });

      // Update afterNext.prev with todo
      await ctx.prisma.todo
        .update({
          where: {
            id: afterNext?.id,
          },
          data: {
            prevTodoId: todo.id,
          },
        })
        // Moving element to beginning or end of list
        .catch(() => console.log("Begin or end of list"));

      // Update todo.prev
      return ctx.prisma.todo.update({
        where: {
          id: todo.id,
        },
        data: {
          prevTodoId: input.afterId,
          categoryId: input.toCategoryId,
        },
      });
    }),
});
