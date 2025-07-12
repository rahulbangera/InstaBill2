/* eslint-disable */
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { date, z } from "zod";

export const billingRouter = createTRPCRouter({
	createBilling: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				paymentMethod: z.enum(["CASH", "CARD", "UPI"]),
				total: z.number(),
				discount: z.number().optional(),
				items: z.array(
					z.object({
						productId: z.string().optional(),
						name: z.string(),
						price: z.number(),
						quantity: z.number(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
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
					id: input.shopId,
				},
			});
			if (!shop) {
				throw new Error("Shop not found");
			}
			const billing = await ctx.db.bill.create({
				data: {
					employee: {
						connect: {
							id: employee.id,
						},
					},
					shop: {
						connect: {
							id: shop.id,
						},
					},
					paymentMethod: input.paymentMethod,
					total: input.total,
					grandTotal: input.total - (input.discount ?? 0),
					discount: input.discount,
					items: {
						create: input.items.map((item) => ({
							name: item.name,
							price: item.price,
							quantity: item.quantity,
							product: item.productId
								? {
										connect: {
											id: item.productId,
										},
									}
								: undefined,
						})),
					},
				},
			});

			const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

			const existingDailySales = await ctx.db.dailySales.findFirst({
				where: {
					shopId: shop.id,
					date: {
						gte: startOfDay,
					},
				},
			});

			if (existingDailySales) {
				await ctx.db.dailySales.update({
					where: {
						id: existingDailySales.id,
					},
					data: {
						totalSales: existingDailySales.totalSales + billing.total,
						totalBills: existingDailySales.totalBills + 1,
						totalItems: existingDailySales.totalItems + input.items.length,
						bills: {
							connect: {
								id: billing.id,
							},
						},
					},
				});
			} else {
				await ctx.db.dailySales.create({
					data: {
						shop: {
							connect: {
								id: shop.id,
							},
						},
						date: startOfDay,
						totalSales: billing.total,
						totalBills: 1,
						totalItems: input.items.length,
						bills: {
							connect: {
								id: billing.id,
							},
						},
					},
				});
			}
			return billing;
		}),
	getBillsForMonth: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				month: z
					.string()
					.regex(
						/^\d{4}-(0[1-9]|1[0-2])$/,
						"Invalid month format (expected YYYY-MM)",
					),
			}),
		)
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
					ownerId: owner.id,
					id: input.shopId,
				},
			});
			if (!shop) {
				throw new Error("Shop not found");
			}
			return ctx.db.bill.findMany({
				where: {
					shopId: shop.id,
					createdAt: {
						gte: new Date(`${input.month}-01T00:00:00.000Z`),
						lt: new Date(
							new Date(`${input.month}-01T00:00:00.000Z`).setMonth(
								new Date(`${input.month}-01T00:00:00.000Z`).getMonth() + 1,
							),
						),
					},
				},
			});
		}),
	getBillsForDate: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				date: z.string(),
			}),
		)
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
					ownerId: owner.id,
					id: input.shopId,
				},
			});
			if (!shop) {
				throw new Error("Shop not found");
			}
			return ctx.db.bill.findMany({
				where: {
					shopId: shop.id,
					createdAt: {
						gte: new Date(`${input.date}T00:00:00.000Z`),
						lt: new Date(`${input.date}T23:59:59.999Z`),
					},
				},
			});
		}),
	getBillById: publicProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			console.log("-----------------------------------");
			console.log(input);
			console.log("-----------------------------------");
			const bill = await ctx.db.bill.findUnique({
				where: {
					id: input,
				},
				select: {
					id: true,
					createdAt: true,
					paymentMethod: true,
					grandTotal: true,
					total: true,
					customerName: true,
					customerPhone: true,
					discount: true,
					employee: {
						select: {
							user: {
								select: {
									name: true,
								},
							},
						},
					},
					items: {
						select: {
							id: true,
							name: true,
							price: true,
							quantity: true,
							product: {
								select: {
									id: true,
									productCode: true,
								},
							},
						},
					},
					shop: {
						select: {
							shopId: true,
							name: true,
							address: true,
							email: true,
							phone: true,
							shopImage: true,
						},
					},
				},
			});

			return bill;
		}),

	createExpense: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				amount: z.number(),
				description: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const shop = await ctx.db.shop.findUnique({
				where: {
					id: input.shopId,
				},
			});
			if (!shop) {
				throw new Error("Shop not found");
			}
			return ctx.db.expense.create({
				data: {
					amount: input.amount,
					description: input.description,
					shop: {
						connect: {
							id: shop.id,
						},
					},
				},
			});
		}),
	deleteExpense: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const expense = await ctx.db.expense.findUnique({
				where: {
					id: input,
				},
			});
			if (!expense) {
				throw new Error("Expense not found");
			}
			return ctx.db.expense.delete({
				where: {
					id: input,
				},
			});
		}),
	getExpensesForMonth: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				month: z
					.string()
					.regex(
						/^\d{4}-(0[1-9]|1[0-2])$/,
						"Invalid month format (expected YYYY-MM)",
					),
			}),
		)
		.query(async ({ ctx, input }) => {
			const shop = await ctx.db.shop.findUnique({
				where: {
					id: input.shopId,
				},
			});
			if (!shop) {
				throw new Error("Shop not found");
			}
			return ctx.db.expense.findMany({
				where: {
					shopId: shop.id,
					createdAt: {
						gte: new Date(`${input.month}-01T00:00:00.000Z`),
						lt: new Date(
							new Date(`${input.month}-01T00:00:00.000Z`).setMonth(
								new Date(`${input.month}-01T00:00:00.000Z`).getMonth() + 1,
							),
						),
					},
				},
			});
		}),
	getExpensesForDate: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const shop = await ctx.db.shop.findUnique({
				where: {
					id: input.shopId,
				},
			});
			if (!shop) {
				throw new Error("Shop not found");
			}
			const currentDate = new Date();
			if (
				currentDate.getUTCHours() > 19 ||
				(currentDate.getUTCHours() === 18 && currentDate.getUTCMinutes() >= 30)
			) {
				currentDate.setUTCDate(currentDate.getUTCDate() + 1);
			}
			const formattedDate = currentDate.toISOString().split("T")[0] ?? "";
			const date = new Date(formattedDate);
			const start = new Date(date);
			start.setDate(start.getDate() - 1);
			start.setUTCHours(18, 30, 0, 0);
			const end = new Date(start);
			end.setUTCHours(
				end.getUTCHours() + 23,
				end.getUTCMinutes() + 59,
				59,
				999,
			);
			return ctx.db.expense.findMany({
				where: {
					shopId: shop.id,
					createdAt: {
						gte: start,
						lt: end,
					},
				},
			});
		}),

	getBillItemsForDate: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				date: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const shop = await ctx.db.shop.findUnique({
				where: {
					id: input.shopId,
				},
			});
			if (!shop) {
				throw new Error("Shop not found");
			}
			const currentDate = new Date(input.date);
			if (
				currentDate.getUTCHours() > 19 ||
				(currentDate.getUTCHours() === 18 && currentDate.getUTCMinutes() >= 30)
			) {
				currentDate.setUTCDate(currentDate.getUTCDate() + 1);
			}
			const formattedDate = currentDate.toISOString().split("T")[0] ?? "";
			const date = new Date(formattedDate);
			const start = new Date(date);
			start.setDate(start.getDate() - 1);
			start.setUTCHours(18, 30, 0, 0);
			const end = new Date(start);
			end.setUTCHours(
				end.getUTCHours() + 23,
				end.getUTCMinutes() + 59,
				59,
				999,
			);
			return ctx.db.billItem.findMany({
				where: {
					bill: {
						shopId: shop.id,
						createdAt: {
							gte: new Date(`${input.date}T00:00:00.000Z`),
							lt: new Date(`${input.date}T23:59:59.999Z`),
						},
					},
				},
				include: {
					product: true,
				},
			});
		}),
});
