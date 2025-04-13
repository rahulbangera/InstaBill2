import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { todoInput } from "~/types";
import bcrypt from "bcryptjs";
import { env } from "~/env";
import nodemailer from "nodemailer";

export const usersRouter = createTRPCRouter({
  checkEmailOtpPresence: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      const { email } = input;
      const existingUser = await ctx.db.user.findUnique({
        where: {
          email,
          verified: false,
        },
      });
      if (existingUser) {
        return { exists: true };
      }
      return { exists: false };
    }),
  resendEmailOtp: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      const existingUser = await ctx.db.user.findUnique({
        where: {
          email,
          verified: false,
        },
      });
      if (!existingUser) {
        throw new Error("User not found");
      }

      const otp = Math.floor(100000 + Math.random() * 600000).toString();

      await ctx.db.user.update({
        where: {
          email,
        },
        data: {
          otp,
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

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: input.email,
          subject: "Your OTP for Account Verification",
          text: `Hello,\n\nYour OTP for account verification is: ${otp}\n\nPlease use this OTP to complete your registration.\n\nBest regards,\nThe Team`,
        });
      } catch (e) {
        console.error("Error sending mail", e);
      }

      return { success: "OTP resent successfully" };
    }),
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

  verifyEmailOtp: publicProcedure
    .input(
      z.object({
        email: z.string(),
        otp: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, otp } = input;
      const user = await ctx.db.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.otp !== otp) {
        throw new Error("Invalid OTP");
      }

      await ctx.db.user.update({
        where: {
          email,
        },
        data: {
          verified: true,
          otp: null,
        },
      });

      await ctx.db.owner.create({
        data: {
          userId: user.id,
        },
      });

      return { success: "OTP verified successfully" };
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
          otp: Math.floor(100000 + Math.random() * 600000).toString(),
        },
        select: {
          email: true,
          id: true,
          otp: true,
        },
      });

      if (!user) {
        throw new Error("User creation failed");
      }

      const otp = user.otp;

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
          subject: "Your OTP for Account Verification",
          text: `Hello ${name},\n\nThank you for signing up! Your OTP for account verification is: ${otp}\n\nPlease use this OTP to complete your registration.\n\nBest regards,\nThe Team`,
        });
      } catch (e) {
        console.error("Error sending mail", e);
      }

      return { success: "User created successfully", user };
    }),
});
