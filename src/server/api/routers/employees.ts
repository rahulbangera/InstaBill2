import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env";
import { z } from "zod";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { hash } from "bcryptjs";

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
  addEmployee: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        shopId: z.string(),
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
      if (shop.ownerId !== owner.id) {
        throw new Error("Access denied");
      }
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
        const password = randomBytes(8).toString("hex");
        const hashedPassword = await hash(password, 10);

        const empl = await ctx.db.user.create({
          data: {
            name: input.name,
            email: input.email,
            role: "EMPLOYEE",
            password: hashedPassword,
            temporaryPass: true,
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
          to: input.email,
          subject: "Welcome to Our Shop",
          text: `Hello ${input.name},\n\nYour account has been created. Your password is: ${password}\n\nPlease change your password after logging in for the first time.\n\nBest regards,\nOur Shop Team`,
        });

        return empl;
      } catch (e) {
        throw new Error("Error creating employee");
      }
    }),
  removeEmployee: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.db.employee.findUnique({
        where: {
          id: input,
        },
      });
      if (!employee) {
        throw new Error("Employee not found");
      }
      await ctx.db.employee.delete({
        where: {
          id: input,
        },
      });
      return true;
    }),
});
