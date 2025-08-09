import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const analyticsRouter = createTRPCRouter({
	populateMonthlySummary: protectedProcedure
		.input(z.object({ shopId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const shop = await ctx.db.shop.findUnique({
				where: { id: input.shopId },
			});
			if (!shop) {
				throw new Error("Shop not found");
			}

			const bills = await ctx.db.bill.findMany({
				where: { shopId: input.shopId },
				orderBy: { createdAt: "asc" },
			});

			const expenses = await ctx.db.expense.findMany({
				where: { shopId: input.shopId },
				orderBy: { createdAt: "asc" },
			});

			const salesByMonth = new Map<
				string,
				{
					year: number;
					month: number;
					totalSales: number;
					totalBills: number;
					totalItems: number;
				}
			>();

			bills.forEach((bill) => {
				const date = new Date(bill.createdAt);
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const key = `${year}-${month}`;

				const existing = salesByMonth.get(key) ?? {
					year,
					month,
					totalSales: 0,
					totalBills: 0,
					totalItems: 0,
				};

				const billTotal =
					bill.grandTotal && bill.grandTotal > 0 ? bill.grandTotal : bill.total;
				existing.totalSales += billTotal;
				existing.totalBills += 1;
				// We'll need to get bill items count separately if needed

				salesByMonth.set(key, existing);
			});

			// Group expenses by year and month
			const expensesByMonth = new Map<
				string,
				{
					year: number;
					month: number;
					total: number;
				}
			>();

			expenses.forEach((expense) => {
				const date = new Date(expense.createdAt);
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const key = `${year}-${month}`;

				const existing = expensesByMonth.get(key) ?? {
					year,
					month,
					total: 0,
				};

				existing.total += expense.amount;
				expensesByMonth.set(key, existing);
			});

			for (const [, data] of salesByMonth) {
				const existing = await ctx.db.monthlySales.findFirst({
					where: {
						shopId: input.shopId,
						year: data.year,
						month: data.month,
					},
				});

				if (existing) {
					await ctx.db.monthlySales.update({
						where: { id: existing.id },
						data: {
							totalSales: data.totalSales,
							totalBills: data.totalBills,
							totalItems: data.totalItems,
						},
					});
				} else {
					await ctx.db.monthlySales.create({
						data: {
							shopId: input.shopId,
							year: data.year,
							month: data.month,
							totalSales: data.totalSales,
							totalBills: data.totalBills,
							totalItems: data.totalItems,
						},
					});
				}
			}

			for (const [, data] of expensesByMonth) {
				const existing = await ctx.db.monthlyExpenses.findFirst({
					where: {
						shopId: input.shopId,
						year: data.year,
						month: data.month,
					},
				});

				if (existing) {
					await ctx.db.monthlyExpenses.update({
						where: { id: existing.id },
						data: {
							total: data.total,
						},
					});
				} else {
					await ctx.db.monthlyExpenses.create({
						data: {
							shopId: input.shopId,
							year: data.year,
							month: data.month,
							total: data.total,
						},
					});
				}
			}

			return { success: true };
		}),

	getOverallAnalytics: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				fromMonth: z.string().regex(/^\d{4}-\d{2}$/),
				toMonth: z.string().regex(/^\d{4}-\d{2}$/),
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

			const recentMonthlySales = await ctx.db.monthlySales.findFirst({
				where: { shopId: input.shopId },
				orderBy: { createdAt: "desc" },
			});

			const shouldPopulate =
				!recentMonthlySales ||
				Date.now() - new Date(recentMonthlySales.createdAt).getTime() >
					24 * 60 * 60 * 1000;

			if (shouldPopulate) {
				const bills = await ctx.db.bill.findMany({
					where: { shopId: input.shopId },
					orderBy: { createdAt: "asc" },
				});

				const expenses = await ctx.db.expense.findMany({
					where: { shopId: input.shopId },
					orderBy: { createdAt: "asc" },
				});

				const salesByMonth = new Map<
					string,
					{
						year: number;
						month: number;
						totalSales: number;
						totalBills: number;
						totalItems: number;
					}
				>();

				bills.forEach((bill) => {
					const date = new Date(bill.createdAt);
					const year = date.getFullYear();
					const month = date.getMonth() + 1;
					const key = `${year}-${month}`;

					const existing = salesByMonth.get(key) ?? {
						year,
						month,
						totalSales: 0,
						totalBills: 0,
						totalItems: 0,
					};

					const billTotal =
						bill.grandTotal && bill.grandTotal > 0
							? bill.grandTotal
							: bill.total;
					existing.totalSales += billTotal;
					existing.totalBills += 1;

					salesByMonth.set(key, existing);
				});

				const expensesByMonth = new Map<
					string,
					{
						year: number;
						month: number;
						total: number;
					}
				>();

				expenses.forEach((expense) => {
					const date = new Date(expense.createdAt);
					const year = date.getFullYear();
					const month = date.getMonth() + 1;
					const key = `${year}-${month}`;

					const existing = expensesByMonth.get(key) ?? {
						year,
						month,
						total: 0,
					};

					existing.total += expense.amount;
					expensesByMonth.set(key, existing);
				});

				for (const [, data] of salesByMonth) {
					const existing = await ctx.db.monthlySales.findFirst({
						where: {
							shopId: input.shopId,
							year: data.year,
							month: data.month,
						},
					});

					if (existing) {
						await ctx.db.monthlySales.update({
							where: { id: existing.id },
							data: {
								totalSales: data.totalSales,
								totalBills: data.totalBills,
								totalItems: data.totalItems,
							},
						});
					} else {
						await ctx.db.monthlySales.create({
							data: {
								shopId: input.shopId,
								year: data.year,
								month: data.month,
								totalSales: data.totalSales,
								totalBills: data.totalBills,
								totalItems: data.totalItems,
							},
						});
					}
				}

				for (const [, data] of expensesByMonth) {
					const existing = await ctx.db.monthlyExpenses.findFirst({
						where: {
							shopId: input.shopId,
							year: data.year,
							month: data.month,
						},
					});

					if (existing) {
						await ctx.db.monthlyExpenses.update({
							where: { id: existing.id },
							data: {
								total: data.total,
							},
						});
					} else {
						await ctx.db.monthlyExpenses.create({
							data: {
								shopId: input.shopId,
								year: data.year,
								month: data.month,
								total: data.total,
							},
						});
					}
				}
			}

			const fromYearSales = parseInt(input.fromMonth.split("-")[0] ?? "2024");
			const toYearSales = parseInt(input.toMonth.split("-")[0] ?? "2024");
			const monthlySalesData = await ctx.db.monthlySales.findMany({
				where: {
					shopId: input.shopId,
					OR: [
						{
							year: {
								gte: fromYearSales,
								lte: toYearSales,
							},
						},
					],
				},
				orderBy: [{ year: "asc" }, { month: "asc" }],
			});

			const monthlyExpensesData = await ctx.db.monthlyExpenses.findMany({
				where: {
					shopId: input.shopId,
					OR: [
						{
							year: {
								gte: fromYearSales,
								lte: toYearSales,
							},
						},
					],
				},
				orderBy: [{ year: "asc" }, { month: "asc" }],
			});

			const dailySalesData = await ctx.db.dailySales.findMany({
				where: {
					shopId: input.shopId,
					date: {
						gte: new Date(`${input.fromMonth}-01`),
						lte: new Date(
							new Date(`${input.toMonth}-01`).getFullYear(),
							new Date(`${input.toMonth}-01`).getMonth() + 1,
							0,
						),
					},
				},
				orderBy: { totalSales: "desc" },
			});

			const monthlyData = [];
			const fromYear = parseInt(input.fromMonth.split("-")[0] ?? "2024");
			const fromMonthNum = parseInt(input.fromMonth.split("-")[1] ?? "1");
			const toYear = parseInt(input.toMonth.split("-")[0] ?? "2024");
			const toMonthNum = parseInt(input.toMonth.split("-")[1] ?? "12");

			for (let year = fromYear; year <= toYear; year++) {
				const startMonth = year === fromYear ? fromMonthNum : 1;
				const endMonth = year === toYear ? toMonthNum : 12;

				for (let month = startMonth; month <= endMonth; month++) {
					const salesData = monthlySalesData.find(
						(s) => s.year === year && s.month === month,
					);
					const expensesData = monthlyExpensesData.find(
						(e) => e.year === year && e.month === month,
					);
					// for (const s in dailySalesData) {
					// 	console.log(dailySalesData);
					// }
					const dailySalesForMonth = dailySalesData.filter(
						(d) =>
							new Date(d.date).getFullYear() === year &&
							new Date(d.date).getMonth() + 1 === month,
					);
					const totalSalesForMonth = dailySalesForMonth.reduce(
						(sum, day) => sum + day.totalSales,
						0,
					);
					const avgDailySales =
						dailySalesForMonth.length > 0
							? Math.round(totalSalesForMonth / dailySalesForMonth.length)
							: 0;
					const sales = salesData?.totalSales ?? 0;
					const expenses = expensesData?.total ?? 0;
					const profit = sales - expenses;

					monthlyData.push({
						month: `${year}-${month.toString().padStart(2, "0")}`,
						avgDailySales,
						sales,
						expenses,
						profit,
					});
				}
			}

			const totalSales = monthlyData.reduce((sum, item) => sum + item.sales, 0);
			const totalExpenses = monthlyData.reduce(
				(sum, item) => sum + item.expenses,
				0,
			);
			const netProfit = totalSales - totalExpenses;

			const daysWithSales = dailySalesData.filter(
				(day) => day.totalSales > 0,
			).length;

			const avgDailySales =
				daysWithSales > 0 ? Math.round(totalSales / daysWithSales) : 0;

			const highestDay = dailySalesData[0];
			const lowestDay = dailySalesData[dailySalesData.length - 1];

			const summary = {
				totalSales,
				totalExpenses,
				netProfit,
				avgDailySales,
				highestDay: highestDay
					? highestDay.date.toISOString().split("T")[0]
					: "N/A",
				lowestDay: lowestDay
					? lowestDay.date.toISOString().split("T")[0]
					: "N/A",
			};

			return {
				summary,
				monthlyData,
			};
		}),

	getDailyExpenses: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				year: z.number(),
				month: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const startDate = new Date(input.year, input.month - 1, 1);
			const endDate = new Date(input.year, input.month, 0, 23, 59, 59, 999);

			const expenses = await ctx.db.expense.findMany({
				where: {
					shopId: input.shopId,
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
				},
				orderBy: { createdAt: "asc" },
			});

			const dailyExpensesMap = new Map<string, number>();
			const daysInMonth = new Date(input.year, input.month, 0).getDate();

			for (let day = 1; day <= daysInMonth; day++) {
				const dayString = day.toString().padStart(2, "0");
				dailyExpensesMap.set(dayString, 0);
			}

			expenses.forEach((expense) => {
				const day = new Date(expense.createdAt)
					.getDate()
					.toString()
					.padStart(2, "0");
				const currentAmount = dailyExpensesMap.get(day) ?? 0;
				dailyExpensesMap.set(day, currentAmount + expense.amount);
			});

			const dailyExpensesData = Array.from(dailyExpensesMap.entries()).map(
				([day, amount]) => ({
					day,
					expenses: amount,
				}),
			);

			return dailyExpensesData;
		}),

	getExpensesForDay: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
			}),
		)
		.query(async ({ ctx, input }) => {
			const startDate = new Date(`${input.date}T00:00:00.000Z`);
			const endDate = new Date(`${input.date}T23:59:59.999Z`);

			const expenses = await ctx.db.expense.findMany({
				where: {
					shopId: input.shopId,
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
				},
				orderBy: { createdAt: "desc" },
			});

			return expenses;
		}),

	getDailySalesAndExpensesForMonth: protectedProcedure
		.input(
			z.object({
				shopId: z.string(),
				year: z.number(),
				month: z.number(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const startDate = new Date(input.year, input.month - 1, 1);
			const endDate = new Date(input.year, input.month, 0);

			const bills = await ctx.db.bill.findMany({
				where: {
					shopId: input.shopId,
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
				},
				orderBy: { createdAt: "asc" },
			});

			const expenses = await ctx.db.expense.findMany({
				where: {
					shopId: input.shopId,
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
				},
				orderBy: { createdAt: "asc" },
			});

			const daysInMonth = new Date(input.year, input.month, 0).getDate();
			const dailyData = [];

			for (let day = 1; day <= daysInMonth; day++) {
				const dayStart = new Date(input.year, input.month - 1, day);
				const dayEnd = new Date(input.year, input.month - 1, day + 1);

				const dayBills = bills.filter(
					(bill) => bill.createdAt >= dayStart && bill.createdAt < dayEnd,
				);
				const totalSales = dayBills.reduce((sum, bill) => sum + bill.total, 0);

				const dayExpenses = expenses.filter(
					(expense) =>
						expense.createdAt >= dayStart && expense.createdAt < dayEnd,
				);
				const totalExpenses = dayExpenses.reduce(
					(sum, expense) => sum + expense.amount,
					0,
				);

				dailyData.push({
					day: day.toString().padStart(2, "0"),
					date: `${input.year}-${input.month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
					sales: totalSales,
					expenses: totalExpenses,
					profit: totalSales - totalExpenses,
					billCount: dayBills.length,
					expenseCount: dayExpenses.length,
				});
			}

			return dailyData;
		}),
});
