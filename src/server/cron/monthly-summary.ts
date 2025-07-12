import cron from "node-cron";
import { db } from "~/server/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const setupMonthlySummaryCron = () => {
  cron.schedule("0 2 1 * *", async () => {
    console.log("⏰ Running monthly summary job...");

    const lastMonth = subMonths(new Date(), 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;

    const shops = await db.shop.findMany({ select: { id: true } });

    for (const shop of shops) {
      const sales = await db.dailySales.findMany({
        where: {
          shopId: shop.id,
          date: {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth),
          },
        },
      });

      const expenses = await db.expense.findMany({
        where: {
          shopId: shop.id,
          createdAt: {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth),
          },
        },
      });

      const totalSales = sales.reduce((acc, day) => acc + day.totalSales, 0);
      const totalBills = sales.reduce((acc, day) => acc + day.totalBills, 0);
      const totalItems = sales.reduce((acc, day) => acc + day.totalItems, 0);
      const totalExpenses = expenses.reduce((acc, ex) => acc + ex.amount, 0);

      await db.monthlySales.create({
        data: {
          shopId: shop.id,
          year,
          month,
          totalSales,
          totalBills,
          totalItems,
        },
      });

      await db.monthlyExpenses.create({
        data: {
          shopId: shop.id,
          year,
          month,
          total: totalExpenses,
        },
      });

      console.log(`✅ Summary done for ${shop.id} - ${month}/${year}`);
    }

    console.log("🎉 Monthly cron job complete.");
  });
};
