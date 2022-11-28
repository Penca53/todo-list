import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const labelRouter = router({
  getLabels: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.label.findMany({
      orderBy: { id: "asc" },
    });
  }),

  createLabel: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        todoGroupId: z.number().int().nullish(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.label.create({
        data: {
          name: input.name,
          todoGroupId: input.todoGroupId,
        },
      });
    }),

  deleteLabel: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.label.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
