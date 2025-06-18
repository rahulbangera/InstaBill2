import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "~/components/ui/card";

const monthNames = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

const dummySummary = {
  totalSales: 250000,
  totalExpenses: 100000,
  netProfit: 150000,
  avgDailySales: 8333,
  highestDay: "2025-06-12",
  lowestDay: "2025-06-05",
};

const monthlyData = [
  { month: "2024-01", sales: 15000, expenses: 8000, profit: 7000 },
  { month: "2024-02", sales: 18000, expenses: 9000, profit: 9000 },
  { month: "2024-03", sales: 22000, expenses: 10000, profit: 12000 },
  { month: "2024-04", sales: 25000, expenses: 11000, profit: 14000 },
  { month: "2024-05", sales: 30000, expenses: 12000, profit: 18000 },
  { month: "2024-06", sales: 40000, expenses: 15000, profit: 25000 },
  { month: "2024-07", sales: 32000, expenses: 14000, profit: 18000 },
  { month: "2024-08", sales: 35000, expenses: 13000, profit: 22000 },
  { month: "2024-09", sales: 28000, expenses: 12000, profit: 16000 },
  { month: "2024-10", sales: 31000, expenses: 12500, profit: 18500 },
  { month: "2024-11", sales: 36000, expenses: 14000, profit: 22000 },
  { month: "2024-12", sales: 39000, expenses: 14500, profit: 24500 },
  { month: "2025-01", sales: 41000, expenses: 15000, profit: 26000 },
  { month: "2025-02", sales: 43000, expenses: 16000, profit: 27000 },
  { month: "2025-03", sales: 45000, expenses: 16500, profit: 28500 },
  { month: "2025-04", sales: 47000, expenses: 17000, profit: 30000 },
  { month: "2025-05", sales: 49000, expenses: 17500, profit: 31500 },
  { month: "2025-06", sales: 51000, expenses: 18000, profit: 33000 },
];

export default function ViewOverallAnalytics({ shopId }: { shopId: string }) {
  const [fromMonth, setFromMonth] = useState("01");
  const [fromYear, setFromYear] = useState("2024");
  const [toMonth, setToMonth] = useState("06");
  const [toYear, setToYear] = useState("2025");

  const fromValue = `${fromYear}-${fromMonth}`;
  const toValue = `${toYear}-${toMonth}`;

  const filteredData = monthlyData.filter((item) => {
    return item.month >= fromValue && item.month <= toValue;
  });

  return (
    <div className="relative">
      <div className="absolute inset-0 z-50 flex items-start justify-center rounded-lg bg-black bg-opacity-60 py-32 backdrop-blur-[6px]">
        <h2 className="animate-pulse text-center text-4xl font-extrabold text-yellow-400">
          🚧 Coming Soon 🚧
        </h2>
      </div>
      <div className="space-y-10 px-4 py-8">
        <h1 className="text-center text-3xl font-bold text-white">
          Overall Business Analytics
        </h1>

        <div className="flex flex-wrap justify-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <label>From:</label>
            <select
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              className="rounded-md border border-gray-600 bg-gray-800 p-2 text-white"
            >
              {monthNames.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
              className="rounded-md border border-gray-600 bg-gray-800 p-2 text-white"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label>To:</label>
            <select
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              className="rounded-md border border-gray-600 bg-gray-800 p-2 text-white"
            >
              {monthNames.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
              className="rounded-md border border-gray-600 bg-gray-800 p-2 text-white"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-gray-700 bg-gray-900 shadow-md">
            <CardContent className="p-6 text-gray-200">
              <h3 className="text-lg font-semibold">Total Sales</h3>
              <p className="text-2xl font-bold text-green-400">
                ₹{dummySummary.totalSales.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-700 bg-gray-900 shadow-md">
            <CardContent className="p-6 text-gray-200">
              <h3 className="text-lg font-semibold">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-400">
                ₹{dummySummary.totalExpenses.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-700 bg-gray-900 shadow-md">
            <CardContent className="p-6 text-gray-200">
              <h3 className="text-lg font-semibold">Net Profit</h3>
              <p className="text-2xl font-bold text-blue-400">
                ₹{dummySummary.netProfit.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-700 bg-gray-900 shadow-md">
            <CardContent className="p-6 text-gray-200">
              <h3 className="text-lg font-semibold">Average Daily Sales</h3>
              <p className="text-2xl font-bold text-yellow-400">
                ₹{dummySummary.avgDailySales.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-700 bg-gray-900 shadow-md">
            <CardContent className="p-6 text-gray-200">
              <h3 className="text-lg font-semibold">Highest Earning Day</h3>
              <p className="text-2xl font-bold text-green-300">
                {dummySummary.highestDay}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-700 bg-gray-900 shadow-md">
            <CardContent className="p-6 text-gray-200">
              <h3 className="text-lg font-semibold">Lowest Earning Day</h3>
              <p className="text-2xl font-bold text-red-300">
                {dummySummary.lowestDay}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="border border-gray-700 bg-gray-900 shadow-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-200">
                Monthly Sales vs Expenses vs Profit
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      color: "#E5E7EB",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#22C55E" />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" />
                  <Line type="monotone" dataKey="profit" stroke="#3B82F6" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-700 bg-gray-900 shadow-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-200">
                Monthly Profit Analysis
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      color: "#E5E7EB",
                    }}
                  />
                  <Bar
                    dataKey="profit"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <h2 className="mb-4 text-xl font-semibold text-gray-200">
            Month-wise Summary Table
          </h2>
          <table className="w-full table-auto border-collapse text-left text-gray-300">
            <thead className="bg-gray-800">
              <tr>
                <th className="border border-gray-700 px-4 py-2">Month</th>
                <th className="border border-gray-700 px-4 py-2">Sales</th>
                <th className="border border-gray-700 px-4 py-2">Expenses</th>
                <th className="border border-gray-700 px-4 py-2">Profit</th>
                <th className="border border-gray-700 px-4 py-2">Avg Daily</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-800">
                  <td className="border border-gray-700 px-4 py-2">
                    {row.month}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    ₹{row.sales}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    ₹{row.expenses}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    ₹{row.profit}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    ₹{Math.round(row.sales / 30)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
