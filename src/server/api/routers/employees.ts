import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env";
import { z } from "zod";

export const employeesRouter = createTRPCRouter({
  getEmployees: protectedProcedure
    .input(z.object({ shopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });
      if (!owner) {
        throw new Error("Owner not found");
      }
      const employees = await ctx.db.employee.findMany({
        where: {
          shopId: input.shopId,
        },
        select: {
          id: true,
          user: true,
        },
      });
      return employees;
    }),
});
