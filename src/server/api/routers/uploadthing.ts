import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { utapi } from "~/server/uploadthing";

type DeleteImageResponse =
  | { success: true; message: string }
  | { success: false; error: string };

export const utRouter = createTRPCRouter({
  getUserImage: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user.image;
  }),

  deleteImage: protectedProcedure
    .input(
      z.object({
        url: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<DeleteImageResponse> => {
      const { url } = input;
      const regex = /\/f\/([a-zA-Z0-9]+)$/;
      const match = regex.exec(url);
      if (!match?.[1]) {
        return { success: false, error: "Invalid URL" };
      }
      const fileKey = match[1];

      const shopImages = await ctx.db.shop.findMany({
        where: {
          shopImage: url,
        },
      });

      const userImages = await ctx.db.user.findMany({
        where: {
          image: url,
        },
      });

      try {
        const deleteFile = await utapi.deleteFiles(fileKey);
        if (!deleteFile.success) {
          return { success: false, error: "Failed to delete file" };
        }

        if (shopImages.length > 0) {
          await ctx.db.shop.updateMany({
            where: {
              shopImage: url,
            },
            data: {
              shopImage: "",
            },
          });
        }

        if (userImages.length > 0) {
          await ctx.db.user.updateMany({
            where: {
              image: url,
            },
            data: {
              image: "",
            },
          });
        }

        return { success: true, message: "File deleted successfully" };
      } catch (error) {
        return { success: false, error: "An unexpected error occurred" };
      }
    }),
  userImageUpdate: protectedProcedure
    .input(
      z.object({
        url: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userImages = await ctx.db.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            image: input.url,
          },
        });
        return { success: true, message: "Image updated successfully" };
      } catch (error) {
        return { success: false, error: "An unexpected error occurred" };
      }
    }),
});
