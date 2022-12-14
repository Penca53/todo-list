import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const todoGroupShareRouter = router({
  getSharedTodoGroups: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.todoGroupShare.findMany({
      where: { sharedToId: ctx.session.user.id },
      include: { todoGroup: true },
      orderBy: { todoGroupId: "asc" },
    });
  }),
  shareTodoGroup: protectedProcedure
    .input(
      z.object({
        shareToEmail: z.string(),
        todoGroupId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirstOrThrow({
        where: { email: input.shareToEmail },
      });

      if (user.id === ctx.session.user.id) {
        /*
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can't share something the user already own",
        });
        */
      }

      const mutationQueue: Array<number> = [];
      mutationQueue.push(input.todoGroupId);
      const promises = [];

      while (mutationQueue.length > 0) {
        let currentTodoGroupId = mutationQueue.shift()!;
        const sharePromise = ctx.prisma.todoGroupShare.create({
          data: {
            sharedToId: user.id,
            todoGroupId: currentTodoGroupId,
          },
        });
        promises.push(sharePromise);

        const children = await ctx.prisma.todoGroup.findMany({
          where: {
            parentGroupId: currentTodoGroupId,
          },
        });

        for (const child of children) {
          mutationQueue.push(child.id);
        }
      }

      return Promise.all(promises);
    }),
  unshareTodoGroup: protectedProcedure
    .input(
      z.object({
        todoGroupId: z.number().int(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todoGroupShare.delete({
        where: {
          todoGroupId_sharedToId: {
            todoGroupId: input.todoGroupId,
            sharedToId: ctx.session.user.id,
          },
        },
      });
    }),
});
