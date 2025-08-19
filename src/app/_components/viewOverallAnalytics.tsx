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
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";

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

export default function ViewOverallAnalytics({ shopId }: { shopId: string }) {
	const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
	const currentYearStr = new Date().getFullYear().toString();

	const [fromMonth, setFromMonth] = useState("05");
	const [fromYear, setFromYear] = useState("2025");
	const [toMonth, setToMonth] = useState(currentMonth);
	const [toYear, setToYear] = useState(currentYearStr);

	const [selectedExpenseMonth, setSelectedExpenseMonth] =
		useState(currentMonth);
	const [selectedExpenseYear, setSelectedExpenseYear] =
		useState(currentYearStr);

	const [appliedFromMonth, setAppliedFromMonth] = useState("05");
	const [appliedFromYear, setAppliedFromYear] = useState("2025");
	const [appliedToMonth, setAppliedToMonth] = useState(currentMonth);
	const [appliedToYear, setAppliedToYear] = useState(currentYearStr);

	const [activeSection, setActiveSection] = useState<
		"monthly" | "daily" | null
	>(null);
	const [selectedMonthData, setSelectedMonthData] = useState<string | null>(
		null,
	);
	const [showMonthlyConfirmModal, setShowMonthlyConfirmModal] = useState(false);
	const [pendingMonthData, setPendingMonthData] = useState<string | null>(null);
	const [selectedDayForExpenses, setSelectedDayForExpenses] = useState<
		string | null
	>(null);
	const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

	const fromValue = `${appliedFromYear}-${appliedFromMonth}`;
	const toValue = `${appliedToYear}-${appliedToMonth}`;

	const { data: analyticsData, isLoading } =
		api.analytics.getOverallAnalytics.useQuery({
			shopId,
			fromMonth: fromValue,
			toMonth: toValue,
		});

	const { data: dailyExpensesData, isLoading: isLoadingDailyExpenses } =
		api.analytics.getDailyExpenses.useQuery({
			shopId,
			year: parseInt(selectedExpenseYear),
			month: parseInt(selectedExpenseMonth),
		});

	const { data: monthlyDailySalesData, isLoading: isLoadingMonthlyDaily } =
		api.analytics.getDailySalesAndExpensesForMonth.useQuery(
			{
				shopId,
				year: parseInt(selectedMonthData?.split("-")[0] ?? "2025"),
				month: parseInt(selectedMonthData?.split("-")[1] ?? "05"),
			},
			{
				enabled: !!selectedMonthData && activeSection === "monthly",
			},
		);

	const {
		data: selectedDayExpensesData,
		isLoading: isLoadingSelectedDayExpenses,
	} = api.analytics.getExpensesForDay.useQuery(
		{
			shopId,
			date: selectedDayForExpenses ?? "",
		},
		{
			enabled: !!selectedDayForExpenses && activeSection === "daily",
		},
	);

	const handleApply = () => {
		setAppliedFromMonth(fromMonth);
		setAppliedFromYear(fromYear);
		setAppliedToMonth(toMonth);
		setAppliedToYear(toYear);
		toast.success("Filters applied successfully!");
	};

	const handleBarClick = (data: { day?: string; expenses?: number }) => {
		if (data?.day && data?.expenses && data.expenses > 0) {
			const dateStr = `${selectedExpenseYear}-${selectedExpenseMonth.padStart(2, "0")}-${data.day.padStart(2, "0")}`;
			setSelectedDayForExpenses(dateStr);
			setActiveSection("daily");
			setSelectedExpenseIds([]); // Reset selection on new day
		}
	};

	// Toggle expense card selection
	const handleExpenseCardClick = (expenseId: string) => {
		setSelectedExpenseIds((prev) =>
			prev.includes(expenseId)
				? prev.filter((id) => id !== expenseId)
				: [...prev, expenseId],
		);
	};
	const handleLineChartClick = (data: {
		activePayload?: Array<{ payload: { month?: string } }>;
	}) => {
		if (data?.activePayload?.[0]?.payload?.month) {
			setPendingMonthData(data.activePayload[0].payload.month);
			setShowMonthlyConfirmModal(true);
		}
	};

	const handleConfirmMonthlyView = () => {
		if (pendingMonthData) {
			setSelectedMonthData(pendingMonthData);
			setActiveSection("monthly");
			setShowMonthlyConfirmModal(false);
			setPendingMonthData(null);
		}
	};

	const handleCancelMonthlyView = () => {
		setShowMonthlyConfirmModal(false);
		setPendingMonthData(null);
	};

	const handleCloseSections = () => {
		setActiveSection(null);
		setSelectedMonthData(null);
		setSelectedDayForExpenses(null);
		setSelectedExpenseIds([]);
	};
	const summary = analyticsData?.summary ?? {
		totalSales: 0,
		totalExpenses: 0,
		netProfit: 0,
		avgDailySales: 0,
		highestDay: "N/A",
		lowestDay: "N/A",
	};

	const monthlyData = analyticsData?.monthlyData ?? [];

	return (
		<div className="space-y-10 px-4 py-8">
			{isLoading ? (
				<div className="flex items-center justify-center py-32">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
				</div>
			) : (
				<>
					<h1 className="text-center text-3xl font-bold text-white">
						Overall Business Analytics
					</h1>

					<div className="flex flex-wrap justify-center gap-4 text-white items-center">
						<div className="flex items-center gap-2">
							<label htmlFor="fromMonth">From:</label>
							<select
								id="fromMonth"
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
								id="fromYear"
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
							<label htmlFor="toMonth">To:</label>
							<select
								id="toMonth"
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
								id="toYear"
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

						<Button
							onClick={handleApply}
							className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg"
						>
							Apply Filters
						</Button>
					</div>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						<Card className="border border-gray-700 bg-gray-900 shadow-md">
							<CardContent className="p-6 text-gray-200">
								<h3 className="text-lg font-semibold">Total Sales</h3>
								<p className="text-2xl font-bold text-green-400">
									₹{summary.totalSales.toLocaleString()}
								</p>
							</CardContent>
						</Card>
						<Card className="border border-gray-700 bg-gray-900 shadow-md">
							<CardContent className="p-6 text-gray-200">
								<h3 className="text-lg font-semibold">Total Expenses</h3>
								<p className="text-2xl font-bold text-red-400">
									₹{summary.totalExpenses.toLocaleString()}
								</p>
							</CardContent>
						</Card>
						<Card className="border border-gray-700 bg-gray-900 shadow-md">
							<CardContent className="p-6 text-gray-200">
								<h3 className="text-lg font-semibold">Net Profit</h3>
								<p className="text-2xl font-bold text-blue-400">
									₹{summary.netProfit.toLocaleString()}
								</p>
							</CardContent>
						</Card>
						<Card className="border border-gray-700 bg-gray-900 shadow-md">
							<CardContent className="p-6 text-gray-200">
								<h3 className="text-lg font-semibold">Average Daily Sales</h3>
								<p className="text-2xl font-bold text-yellow-400">
									₹{summary.avgDailySales.toLocaleString()}
								</p>
							</CardContent>
						</Card>
						<Card className="border border-gray-700 bg-gray-900 shadow-md">
							<CardContent className="p-6 text-gray-200">
								<h3 className="text-lg font-semibold">Highest Earning Day</h3>
								<p className="text-2xl font-bold text-green-300">
									{summary.highestDay}
								</p>
							</CardContent>
						</Card>
						<Card className="border border-gray-700 bg-gray-900 shadow-md">
							<CardContent className="p-6 text-gray-200">
								<h3 className="text-lg font-semibold">Lowest Earning Day</h3>
								<p className="text-2xl font-bold text-red-300">
									{summary.lowestDay}
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						<Card className="border border-gray-700 bg-gray-900 shadow-md">
							<CardContent className="p-6">
								<h2 className="mb-4 text-xl font-semibold text-gray-200">
									Monthly Sales vs Expenses vs Profit
								</h2>
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={monthlyData} onClick={handleLineChartClick}>
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
										<Line
											type="monotone"
											dataKey="sales"
											stroke="#22C55E"
											strokeWidth={2}
											dot={{ cursor: "pointer", r: 4 }}
											activeDot={{ r: 6, cursor: "pointer" }}
										/>
										<Line
											type="monotone"
											dataKey="expenses"
											stroke="#EF4444"
											strokeWidth={2}
											dot={{ cursor: "pointer", r: 4 }}
											activeDot={{ r: 6, cursor: "pointer" }}
										/>
										<Line
											type="monotone"
											dataKey="profit"
											stroke="#3B82F6"
											strokeWidth={2}
											dot={{ cursor: "pointer", r: 4 }}
											activeDot={{ r: 6, cursor: "pointer" }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						<Card className="border border-gray-700 bg-gray-900 shadow-md">
							<CardContent className="p-6">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold text-gray-200">
										Daily Expenses
									</h2>
									<div className="flex gap-2">
										<select
											value={selectedExpenseMonth}
											onChange={(e) => setSelectedExpenseMonth(e.target.value)}
											className="rounded-md border border-gray-600 bg-gray-800 p-2 text-white text-sm"
										>
											{monthNames.map((month) => (
												<option key={month} value={month}>
													{month}
												</option>
											))}
										</select>
										<select
											value={selectedExpenseYear}
											onChange={(e) => setSelectedExpenseYear(e.target.value)}
											className="rounded-md border border-gray-600 bg-gray-800 p-2 text-white text-sm"
										>
											{yearOptions.map((year) => (
												<option key={year} value={year}>
													{year}
												</option>
											))}
										</select>
									</div>
								</div>
								{isLoadingDailyExpenses ? (
									<div className="flex items-center justify-center h-64">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
									</div>
								) : (
									<ResponsiveContainer width="100%" height={300}>
										<BarChart data={dailyExpensesData}>
											<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
											<XAxis dataKey="day" stroke="#9CA3AF" />
											<YAxis stroke="#9CA3AF" />
											<Tooltip
												contentStyle={{
													backgroundColor: "#1F2937",
													color: "#E5E7EB",
												}}
											/>
											<Bar
												dataKey="expenses"
												fill="#EF4444"
												radius={[4, 4, 0, 0]}
												barSize={20}
												onClick={handleBarClick}
												cursor="pointer"
											/>
										</BarChart>
									</ResponsiveContainer>
								)}
							</CardContent>
						</Card>
					</div>

					{showMonthlyConfirmModal && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
							<div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md">
								<h2 className="text-xl font-semibold text-white mb-4">
									View Daily Data
								</h2>
								<p className="text-gray-300 mb-6">
									Do you want to see day-by-day sales and expenses for{" "}
									{pendingMonthData}?
								</p>
								<div className="flex gap-4">
									<Button
										onClick={handleConfirmMonthlyView}
										className="bg-green-600 hover:bg-green-500 text-white px-6 py-2"
									>
										Yes, Show Data
									</Button>
									<Button
										onClick={handleCancelMonthlyView}
										className="bg-red-600 hover:bg-red-500 text-white px-6 py-2"
									>
										Cancel
									</Button>
								</div>
							</div>
						</div>
					)}

					{activeSection === "monthly" && selectedMonthData && (
						<div className="mb-8">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-2xl font-semibold text-white">
									Daily Data for {selectedMonthData}
								</h2>
								<Button
									onClick={handleCloseSections}
									className="bg-red-600 hover:bg-red-500 text-white px-4 py-2"
								>
									Close
								</Button>
							</div>
							{isLoadingMonthlyDaily ? (
								<div className="flex items-center justify-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
								</div>
							) : monthlyDailySalesData && monthlyDailySalesData.length > 0 ? (
								<div className="overflow-x-auto">
									<table className="w-full table-auto border-collapse text-left text-gray-300 bg-gray-900 border border-gray-700">
										<thead className="bg-gray-800">
											<tr>
												<th className="border border-gray-700 px-4 py-2">
													Day
												</th>
												<th className="border border-gray-700 px-4 py-2">
													Sales
												</th>
												<th className="border border-gray-700 px-4 py-2">
													Expenses
												</th>
												<th className="border border-gray-700 px-4 py-2">
													Profit
												</th>
												<th className="border border-gray-700 px-4 py-2">
													Bills Count
												</th>
											</tr>
										</thead>
										<tbody>
											{monthlyDailySalesData.map((row) => (
												<tr key={row.day} className="hover:bg-gray-800">
													<td className="border border-gray-700 px-4 py-2">
														{row.day}
													</td>
													<td className="border border-gray-700 px-4 py-2">
														₹{row.sales.toLocaleString()}
													</td>
													<td className="border border-gray-700 px-4 py-2">
														₹{row.expenses.toLocaleString()}
													</td>
													<td className="border border-gray-700 px-4 py-2">
														₹{row.profit.toLocaleString()}
													</td>
													<td className="border border-gray-700 px-4 py-2">
														{row.billCount}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<p className="text-gray-400 text-center py-8">
									No data available for this month.
								</p>
							)}
						</div>
					)}

					{activeSection === "daily" && selectedDayForExpenses && (
						<div className="mb-8">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-2xl font-semibold text-white flex items-center gap-4">
									Expenses for {selectedDayForExpenses}
									{selectedExpenseIds.length > 0 && selectedDayExpensesData && (
										<span className="text-base font-normal text-green-400 bg-gray-800 px-3 py-1 rounded-lg">
											Selected Total: ₹
											{selectedDayExpensesData
												.filter((e) => selectedExpenseIds.includes(e.id))
												.reduce((sum, e) => sum + e.amount, 0)
												.toLocaleString()}
										</span>
									)}
								</h2>
								<Button
									onClick={handleCloseSections}
									className="bg-red-600 hover:bg-red-500 text-white px-4 py-2"
								>
									Close
								</Button>
							</div>
							{isLoadingSelectedDayExpenses ? (
								<div className="flex items-center justify-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
								</div>
							) : selectedDayExpensesData &&
								selectedDayExpensesData.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{selectedDayExpensesData.map((expense) => {
										const isSelected = selectedExpenseIds.includes(expense.id);
										return (
											<Card
												key={expense.id}
												className={`border-2 ${isSelected ? "border-green-500 bg-green-950" : "border-gray-600 bg-gray-800"} cursor-pointer transition-all`}
												onClick={() => handleExpenseCardClick(expense.id)}
											>
												<CardContent className="p-4 text-gray-200">
													<div className="flex justify-between items-center">
														<div>
															<p className="font-semibold text-lg">
																₹{expense.amount.toLocaleString()}
															</p>
															{expense.description && (
																<p className="text-gray-400 text-sm mt-1">
																	{expense.description}
																</p>
															)}
															<p className="text-gray-500 text-xs mt-2">
																{new Date(
																	expense.createdAt,
																).toLocaleTimeString()}
															</p>
														</div>
														{isSelected && (
															<span className="ml-2 text-green-400 font-bold">
																✓
															</span>
														)}
													</div>
												</CardContent>
											</Card>
										);
									})}
								</div>
							) : (
								<p className="text-gray-400 text-center py-8">
									No expenses found for this date.
								</p>
							)}
						</div>
					)}

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
									<th className="border border-gray-700 px-4 py-2">
										Avg Daily
									</th>
								</tr>
							</thead>
							<tbody>
								{monthlyData.map((row) => (
									<tr key={row.month} className="hover:bg-gray-800">
										<td className="border border-gray-700 px-4 py-2">
											{row.month}
										</td>
										<td className="border border-gray-700 px-4 py-2">
											₹{row.sales.toLocaleString()}
										</td>
										<td className="border border-gray-700 px-4 py-2">
											₹{row.expenses.toLocaleString()}
										</td>
										<td className="border border-gray-700 px-4 py-2">
											₹{row.profit.toLocaleString()}
										</td>
										<td className="border border-gray-700 px-4 py-2">
											₹{row.avgDailySales}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
}
