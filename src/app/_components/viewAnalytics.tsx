import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent } from "~/components/ui/card";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import { PaymentMethod } from "@prisma/client";

const ViewAnalytics = ({ shopId }: { shopId: string }) => {
  interface SalesData {
    date: string;
    sales: number;
  }

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  interface Bill {
    shopId: string;
    id: string;
    createdAt: Date;
    paymentMethod: PaymentMethod;
    total: number;
    discount: number;
    employeeId: string;
    dailySalesId: string | null;
  }

  const dummySalesData = [
    { date: "01", sales: 500 },
    { date: "02", sales: 750 },
    { date: "03", sales: 300 },
    { date: "04", sales: 900 },
    { date: "05", sales: 1200 },
    { date: "06", sales: 800 },
    { date: "07", sales: 600 },
  ];

  const [salesData1] = useState(dummySalesData);

  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM"),
  );
  const { data: fetchedMonthlyData, refetch: fetchMonthlySalesData } =
    api.dailySales.getMonthlySales.useQuery({
      shopId: shopId,
      month: selectedMonth,
    });

  const { data: fetchedDailySalesData, refetch: fetchDailySalesData } =
    api.billing.getBillsForDate.useQuery({
      shopId: shopId,
      date: selectedDate,
    });

  useEffect(() => {
    fetchMonthlySalesData();
  }, [selectedMonth]);

  useEffect(() => {
    if (fetchedMonthlyData) {
      console.log("Fetched Monthly Data:", fetchedMonthlyData);
      setSalesData(
        fetchedMonthlyData.map((daily) => ({
          date: format(new Date(daily.createdAt), "dd"),
          sales: daily.totalSales,
        })),
      );
    }
    console.log("---------", salesData);
  }, [fetchedMonthlyData]);

  useEffect(() => {
    if (fetchedDailySalesData) {
      setBills(fetchedDailySalesData);
    }
  }, [fetchedDailySalesData]);

  useEffect(() => {
    fetchDailySalesData();
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <Card className="bg-gray-700">
        <CardContent>
          <h2 className="mb-2 text-xl font-semibold">
            Sales Overview - {selectedMonth}
          </h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mb-2 rounded border p-2"
          >
            {[...Array(12)].map((_, i) => {
              const month = format(new Date().setMonth(i), "yyyy-MM");
              return (
                <option key={month} value={month}>
                  {month}
                </option>
              );
            })}
          </select>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData1}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-2 text-xl font-semibold">
            Day-wise Bills - {selectedDate}
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mb-2 rounded border p-2"
          />
          <ul className="max-h-64 overflow-auto">
            {bills.map((bill) => (
              <li key={bill.id} className="flex justify-between border-b py-2">
                <span>{bill.paymentMethod}</span>
                <span className="font-semibold">₹{bill.total}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAnalytics;
