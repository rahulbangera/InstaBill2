import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const productsRouter = createTRPCRouter({
  getProducts: protectedProcedure
    .input(z.string())
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
          id: input,
        },
      });
      if (!shop) {
        throw new Error("Shop not found");
      }
      return ctx.db.product.findMany({
        where: {
          shopId: shop.id,
        },
      });
    }),
  createProduct: protectedProcedure
    .input(
      z.object({
        shopId: z.string(),
        name: z.string(),
        price: z.number(),
        image: z.string().optional(),
        shortcut: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
          id: input.shopId,
        },
      });
      if (!shop) {
        throw new Error("Shop not found");
      }
      return ctx.db.product.create({
        data: {
          name: input.name,
          price: input.price,
          image: input.image,
          shortcut: input.shortcut,
          shop: {
            connect: {
              id: shop.id,
            },
          },
        },
      });
    }),
});
