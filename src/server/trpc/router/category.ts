import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { Category } from "@prisma/client";

export const categoryRouter = router({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    let ownCategories = await ctx.prisma.category.findMany({
      where: { todoGroup: { userId: ctx.session.user.id } },
      orderBy: { id: "asc" },
    });

    const sharedTodoGroups = await ctx.prisma.todoGroupShare.findMany({
      where: { sharedToId: ctx.session.user.id },
    });

    console.log(sharedTodoGroups);

    let sharedToMeCategories: Category[] = [];
    for (const group of sharedTodoGroups) {
      const cs = await ctx.prisma.category.findMany({
        where: { todoGroupId: group.todoGroupId },
        orderBy: { id: "asc" },
      });

      sharedToMeCategories = sharedToMeCategories.concat(cs);
    }

    ownCategories = ownCategories.concat(sharedToMeCategories);
    return ownCategories;
  }),
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        todoGroupId: z.number().int().nullish(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.category.create({
        data: {
          name: input.name,
          todoGroupId: input.todoGroupId,
        },
      });
    }),
  deleteCategory: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.category.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
