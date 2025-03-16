import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { todoRouter } from "./routers/todo";
import { usersRouter } from "./routers/users";
import { storesRouter } from "./routers/stores";
import { utRouter } from "./routers/uploadthing";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  todo: todoRouter,
  user: usersRouter,
  shops: storesRouter,
  ut: utRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
