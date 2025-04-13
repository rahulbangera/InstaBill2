import { shopSchema } from "~/lib/zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import nodemailer from "nodemailer";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { env } from "~/env";

interface PostOffice {
  Name: string;
  District: string;
  State: string;
}

interface PinCodeApiResponse {
  Status: string;
  PostOffice: PostOffice[];
}

type ApiResponse = PinCodeApiResponse[];

export const storesRouter = createTRPCRouter({
  getStores: protectedProcedure.query(async ({ ctx }) => {
    const owner = await ctx.db.owner.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });
    if (!owner) {
      throw new Error("Owner not found");
    }

    return ctx.db.shop.findMany({
      where: {
        ownerId: owner.id,
      },
    });
  }),
  createStore: protectedProcedure
    .input(shopSchema)
    .mutation(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!owner) {
        throw new Error("Owner not found");
      }

      const lastUsedId = await ctx.db.analysis.findUnique({
        where: {
          id: 1,
        },
      });

      const nextShopId = lastUsedId ? lastUsedId.lastShopId + 1 : 1;
      const formattedShopId = nextShopId.toString().padStart(4, "0");

      await ctx.db.analysis.update({
        where: {
          id: 1,
        },
        data: {
          lastShopId: nextShopId,
        },
      });

      console.log(input.itemCodeFormat);

      const existingProdCode = await ctx.db.shop.findFirst({
        where: {
          productCodeFormat: input.itemCodeFormat,
        },
      });

      if (existingProdCode) {
        throw new Error("Product code format already exists");
      }

      const shop = await ctx.db.shop.create({
        data: {
          name: input.name,
          shopId: `INST-${formattedShopId}`,
          productCodeFormat: input.itemCodeFormat,
          lastproductNo: 0,
          address: input.address,
          phone: input.phone,
          email: input.email,
          ownerId: owner.id,
          shopImage: input.image,
        },
      });

      try {
        const transporter = nodemailer.createTransport({
          service: env.SMTP_SERVICE,
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
          },
        });
        for (const employee of input.employees) {
          const password = randomBytes(8).toString("hex");
          const hashedPassword = await hash(password, 10);

          const empl = await ctx.db.user.create({
            data: {
              name: employee.name,
              email: employee.email,
              role: "EMPLOYEE",
              password: hashedPassword,
            },
          });

          await ctx.db.employee.create({
            data: {
              userId: empl.id,
              shopId: shop.id,
            },
          });

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: employee.email,
            subject: "Welcome to Our Shop",
            text: `Hello ${employee.name},\n\nYour account has been created. Your password is: ${password}\n\nPlease change your password after logging in for the first time.\n\nBest regards,\nOur Shop Team`,
          });
        }
      } catch (e) {
        throw new Error("Error creating employee");
      }
    }),

  getStoreDetails: protectedProcedure
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
        select: {
          shopImage: true,
          shopId: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          ownerId: true,
          products: true,
        },
      });

      if (!shop) {
        throw new Error("Shop not found");
      }

      if (owner.id !== shop.ownerId) {
        throw new Error("Access denied");
      }

      return shop;
    }),
  getCitiesByPinCode: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const res: Response = await fetch(
        `https://api.postalpincode.in/pincode/${input}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: ApiResponse = await res.json();
      if (data[0]?.Status === "Error") {
        throw new Error("Invalid Pincode");
      } else {
        return data[0]?.PostOffice.map((item) => ({
          name: item.Name,
          district: item.District,
          state: item.State,
        }));
      }
    }),
});
