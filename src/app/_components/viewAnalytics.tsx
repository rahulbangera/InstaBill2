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
    void fetchMonthlySalesData();
  }, [selectedMonth]);

  useEffect(() => {
    if (fetchedMonthlyData) {
      console.log("Fetched Monthly Data:", fetchedMonthlyData);
      const updatedSalesData = Array.from({ length: 31 }, (_, i) => {
        const day = (i + 1).toString().padStart(2, "0");
        const dailyData = fetchedMonthlyData.find(
          (daily) => format(new Date(daily.createdAt), "dd") === day,
        );
        return {
          date: day,
          sales: dailyData ? dailyData.totalSales : 0,
        };
      });
      setSalesData(updatedSalesData);
    }
    console.log("---------", salesData);
  }, [fetchedMonthlyData]);

  useEffect(() => {
    if (fetchedDailySalesData) {
      setBills(fetchedDailySalesData);
    }
  }, [fetchedDailySalesData]);

  useEffect(() => {
    void fetchDailySalesData();
  }, [selectedDate]);

  return (
    <div className="space-y-8">
      <div className="mt-6 flex w-full justify-center">
        <Card className="w-3/4 max-w-[1200px] bg-gray-700/60 p-4">
          <CardContent>
            <h2 className="mb-2 text-xl font-semibold">
              Sales Overview - {selectedMonth}
            </h2>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mb-2 rounded border p-2"
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const month = format(new Date().setMonth(i), "yyyy-MM");
                return (
                  <option key={month} value={month}>
                    {month}
                  </option>
                );
              })}
            </select>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={salesData}
                onClick={(data) => {
                  if (data && data.activeLabel) {
                    const selectedDay = data.activeLabel;
                    const newDate = `${selectedMonth}-${selectedDay}`;
                    setSelectedDate(newDate);
                  }
                }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="flex w-full justify-center">
        <div className="flex w-full max-w-[1800px] justify-center border-none bg-gray-700/45 p-8">
          <div>
            <h2 className="mb-2 text-center text-xl font-semibold">
              Day-wise Bills - {selectedDate}
            </h2>
            <div className="flex w-full justify-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mb-4 rounded border p-2 text-black bg-gray-500"
              />
            </div>
            {/* <ul className="">
            {bills.map((bill) => (
              <li key={bill.id} className="flex justify-between border-b py-2">
                <span>{bill.paymentMethod}</span>
                <span className="font-semibold">₹{bill.total}</span>
              </li>
            ))}
          </ul> */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bills.map((bill) => (
                <Card key={bill.id} className="bg-gray-700 p-4 border-gray-600 min-w-[380px] ">
                  <CardContent>
                    {/* <h3 className="mb-2 text-lg font-semibold">
                      Bill ID: {bill.id}
                    </h3> */}
                    <p className="mb-1">
                      <span className="font-medium">Payment Method:</span>{" "}
                      {bill.paymentMethod}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Total:</span> ₹{bill.total}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Discount:</span> ₹
                      {bill.discount}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Date:</span>{" "}
                      {format(new Date(bill.createdAt), "yyyy-MM-dd")}
                    </p>
                    <div className="mt-4 flex justify-between">
                      <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                        View Bill
                      </button>
                      <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                        Print Invoice
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAnalytics;
