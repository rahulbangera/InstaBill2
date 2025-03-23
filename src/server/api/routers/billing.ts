import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

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
      return billing;
    }),
});
