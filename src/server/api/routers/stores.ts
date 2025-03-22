import { shopSchema } from "~/lib/zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import nodemailer from "nodemailer";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { env } from "~/env";

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

      const shop = await ctx.db.shop.create({
        data: {
          name: input.name,
          address: input.address,
          phone: input.phone,
          email: input.email,
          ownerId: owner.id,
          shopImage: input.image,
        },
      });

      try {
        console.log(
          "-------------------------Creating employees---------------------------",
        );
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
          },
        });
        console.log(
          "-----------------------Transporter created--------------------------",
        );
        console.log(input.employees);
        for (const employee of input.employees) {
          console.log(
            "-----------------------Creating employee--------------------------",
            employee,
          );
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
});
