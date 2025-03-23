import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { env } from "~/env";

export const dailySalesRouter = createTRPCRouter({
  getMonthlySales: protectedProcedure
    .input(
      z.object({
        shopId: z.string(),
        month: z
          .string()
          .regex(
            /^\d{4}-(0[1-9]|1[0-2])$/,
            "Invalid month format (expected YYYY-MM)",
          ),
      }),
    )
    .query(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });
      if (!owner) {
        throw new Error("Owner not found");
      }
      const shop = await ctx.db.shop.findUnique({
        where: {
          ownerId: owner.id,
          id: input.shopId,
        },
      });
      if (!shop) {
        throw new Error("Shop not found");
      }
      return ctx.db.dailySales.findMany({
        where: {
          shopId: shop.id,
          date: {
            gte: new Date(`${input.month}-01T00:00:00.000Z`),
            lt: new Date(
              new Date(`${input.month}-01T00:00:00.000Z`).setMonth(
                new Date(`${input.month}-01T00:00:00.000Z`).getMonth() + 1,
              ),
            ),
          },
        },
      });
    }),
  getDailySales: protectedProcedure
    .input(
      z.object({
        shopId: z.string(),
        date: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sales = await ctx.db.bill.findMany({
        where: {
          shopId: input.shopId,
          createdAt: {
            gte: new Date(`${input.date}T00:00:00.000Z`),
            lt: new Date(`${input.date}T23:59:59.999Z`),
          },
        },
      });
      return sales;
    }),
});
