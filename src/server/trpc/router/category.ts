import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const categoryRouter = router({
  getCategories: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({
      orderBy: { id: "asc" },
    });
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
