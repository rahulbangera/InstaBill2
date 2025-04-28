import { useState, useEffect, useRef } from "react";
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
import ViewSalesAnalytics from "./viewSalesAnalytics";
import ViewInventoryAnalytics from "./viewInventoryAnalytics";

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
      setBills(
        [...fetchedDailySalesData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    }
  }, [fetchedDailySalesData]);

  useEffect(() => {
    void fetchDailySalesData();
  }, [selectedDate]);

  const [activeTab, setActiveTab] = useState<string>("Employees");
  const tabs = [
    { name: "Sales Analytics", key: "Sales" },
    { name: "Inventory Analytics", key: "Inventory" },
    { name: "Overall Anaylytics", key: "Overall" },
  ];

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  return (
    <div className="space-y-8">
      <div className="mt-6 flex w-full justify-center">
        <div className="flex space-x-4 flex-col">
        <nav className="flex justify-center p-2 text-white">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[tab.key] = el;
            }}
            onClick={() => setActiveTab(tab.key)}
            className={`relative mx-2 rounded-md px-6 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === tab.key ? "bg-gray-700 text-white" : "hover:bg-gray-700 hover:text-gray-100 bg-gray-800 text-gray-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      <div className="flex-grow">
        {activeTab === "Sales" && <ViewSalesAnalytics shopId={shopId} />}
        {activeTab === "Inventory" && (
          <ViewInventoryAnalytics
            shopId={shopId}
          />
        )}
        {activeTab === "Overall" && <ViewSalesAnalytics shopId={shopId} />}
      </div>
      </div>
      </div>
    </div>
  );
};

export default ViewAnalytics;
