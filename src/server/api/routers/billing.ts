import { createTRPCRouter, protectedProcedure } from "../trpc";
import { date, z } from "zod";

export const billingRouter = createTRPCRouter({
  createBilling: protectedProcedure
    .input(
      z.object({
        shopId: z.string(),
        paymentMethod: z.enum(["CASH", "CARD", "UPI"]),
        total: z.number(),
        discount: z.number().optional(),
        items: z.array(
          z.object({
            productId: z.string().optional(),
            name: z.string(),
            price: z.number(),
            quantity: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.db.employee.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });
      if (!employee) {
        throw new Error("Employee not found");
      }
      const shop = await ctx.db.shop.findUnique({
        where: {
          id: input.shopId,
        },
      });
      if (!shop) {
        throw new Error("Shop not found");
      }
      const billing = await ctx.db.bill.create({
        data: {
          employee: {
            connect: {
              id: employee.id,
            },
          },
          shop: {
            connect: {
              id: shop.id,
            },
          },
          paymentMethod: input.paymentMethod,
          total: input.total,
          discount: input.discount,
          items: {
            create: input.items.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              product: item.productId
                ? {
                    connect: {
                      id: item.productId,
                    },
                  }
                : undefined,
            })),
          },
        },
      });

      const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

      const existingDailySales = await ctx.db.dailySales.findFirst({
        where: {
          shopId: shop.id,
          date: {
            gte: startOfDay,
          },
        },
      });

      if (existingDailySales) {
        await ctx.db.dailySales.update({
          where: {
            id: existingDailySales.id,
          },
          data: {
            totalSales: existingDailySales.totalSales + billing.total,
            totalBills: existingDailySales.totalBills + 1,
            totalItems: existingDailySales.totalItems + input.items.length,
            bills: {
              connect: {
                id: billing.id,
              },
            },
          },
        });
      } else {
        await ctx.db.dailySales.create({
          data: {
            shop: {
              connect: {
                id: shop.id,
              },
            },
            date: startOfDay,
            totalSales: billing.total,
            totalBills: 1,
            totalItems: input.items.length,
            bills: {
              connect: {
                id: billing.id,
              },
            },
          },
        });
      }
      return billing;
    }),
  getBillsForMonth: protectedProcedure
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
      return ctx.db.bill.findMany({
        where: {
          shopId: shop.id,
          createdAt: {
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
  getBillsForDate: protectedProcedure
    .input(
      z.object({
        shopId: z.string(),
        date: z.string(),
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
      return ctx.db.bill.findMany({
        where: {
          shopId: shop.id,
          createdAt: {
            gte: new Date(`${input.date}T00:00:00.000Z`),
            lt: new Date(`${input.date}T23:59:59.999Z`),
          },
        },
      });
    }),
});
