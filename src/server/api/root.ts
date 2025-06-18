import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { usersRouter } from "./routers/users";
import { storesRouter } from "./routers/stores";
import { utRouter } from "./routers/uploadthing";
import { productsRouter } from "./routers/products";
import { billingRouter } from "./routers/billing";
import { dailySalesRouter } from "./routers/dailysales";
import { employeesRouter } from "./routers/employees";
import { invoiceRouter } from "./routers/invoice";
// import { setupMonthlySummaryCron } from "../cron/monthly-summary";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

// setupMonthlySummaryCron();
export const appRouter = createTRPCRouter({
  user: usersRouter,
  shops: storesRouter,
  ut: utRouter,
  products: productsRouter,
  billing: billingRouter,
  invoice: invoiceRouter,
  dailySales: dailySalesRouter,
  employees: employeesRouter,
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
