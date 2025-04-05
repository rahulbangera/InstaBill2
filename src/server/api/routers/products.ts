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

      const productNumber = (shop.lastproductNo ?? 0) + 1;
      const formattedProductNumber = productNumber.toString().padStart(4, "0");
      const productCode = shop.productCodeFormat + formattedProductNumber;

      const product = ctx.db.product.create({
        data: {
          name: input.name,
          price: input.price,
          image: input.image,
          shortcut: input.shortcut,
          productCode: productCode,
          shop: {
            connect: {
              id: shop.id,
            },
          },
        },
      });

      await ctx.db.shop.update({
        where: {
          id: shop.id,
        },
        data: {
          lastproductNo: (shop.lastproductNo ?? 0) + 1,
        },
      });

      return product;
    }),
  deleteProduct: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });
      if (!owner) {
        throw new Error("Owner not found");
      }
      const product = await ctx.db.product.findUnique({
        where: {
          id: input,
        },
      });
      if (!product) {
        throw new Error("Product not found");
      }
      const shop = await ctx.db.shop.findUnique({
        where: {
          id: product.shopId,
        },
      });
      if (!shop) {
        throw new Error("Shop not found");
      }
      if (shop.ownerId !== owner.id) {
        throw new Error("You do not have permission to delete this product");
      }
      return ctx.db.product.delete({
        where: {
          id: input,
        },
      });
    }),
  getProductsForBilling: protectedProcedure.query(async ({ ctx }) => {
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
        id: employee.shopId,
      },
    });
    if (!shop) {
      throw new Error("Shop not found");
    }
    const products = await ctx.db.product.findMany({
      where: {
        shopId: shop.id,
      },
    });

    return [products, shop];
  }),
});
