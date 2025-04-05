import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { todoInput } from "~/types";
import bcrypt from "bcryptjs";
import { env } from "~/env";
import nodemailer from "nodemailer";

export const usersRouter = createTRPCRouter({
  sendmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: input.email,
          subject: "Welcome to Our Shop",
          text: `Hello,\n\nYour account has been logged in`,
        });
      } catch (e) {
        console.error("Error sending mail", e);
      }
    }),
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;
      const existingUser = await ctx.db.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await ctx.db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          email: true,
          id: true,
        },
      });

      if (!user) {
        throw new Error("User creation failed");
      }

      await ctx.db.owner.create({
        data: {
          userId: user.id,
        },
      });

      return { success: "User created successfully", user };
    }),
});
