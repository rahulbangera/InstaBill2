import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

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
import { format, set } from "date-fns";
import { api } from "~/trpc/react";
import { PaymentMethod } from "@prisma/client";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const ViewSalesAnalytics = ({ shopId }: { shopId: string }) => {
	const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

	interface SalesData {
		date: string;
		sales: number;
	}

	const getInvoice = api.invoice.createInvoice.useMutation();

	const [billId, setBillId] = useState<string>("");

	const [isBillLoading, setIsBillLoading] = useState(false);
	const { data: billData, refetch: fetchBillData } =
		api.billing.getBillById.useQuery(billId, { enabled: !!billId });

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

	const clearItems = () => {
		setShowBillModal(false);
		setBillId("");
	};

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

	const [showBillModal, setShowBillModal] = useState(false);

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
		if (billId !== "") {
			void fetchBillData();
		}
	}, [billId]);

	const handleViewBill = (billId: string) => {
		setBillId(billId);
		setShowBillModal(true);
	};

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

	const handlePrintBill = async () => {
		setIsBillLoading(true);
		toast.loading("Generating Bill...");
		await getInvoice.mutateAsync(shopId + "-" + billId, {
			onSuccess: (response) => {
				window.location.href = response;
				toast.dismiss();
				toast.success("Bill generated successfully!", { duration: 2000 });
				setIsBillLoading(false);
			},
			onError: (error) => {
				console.error("PDF generation failed:", error);
			},
		});
	};

	return (
		<div className="space-y-10">
			{/* --- Sales Overview Graph Section --- */}
			<div className="flex w-full justify-center">
				<Card className="w-full max-w-6xl border border-gray-700 bg-gray-900/80 shadow-lg">
					<CardContent className="p-6 md:p-8">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<h2 className="text-2xl font-bold text-gray-200">
								Sales Overview - {selectedMonth}
							</h2>
							<select
								value={selectedMonth}
								onChange={(e) => setSelectedMonth(e.target.value)}
								className="rounded-md border border-gray-600 bg-gray-800 p-2 text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
							>
								{Array.from({ length: 12 }).map((_, i) => {
									const monthDate = new Date(new Date().getFullYear(), i, 1);
									const month = format(monthDate, "yyyy-MM");
									return (
										<option key={month} value={month}>
											{format(monthDate, "MMMM yyyy")}
										</option>
									);
								})}
							</select>
						</div>

						<div className="mt-6 h-[300px] w-full">
							<ResponsiveContainer
								width="100%"
								height="100%"
								className={"-translate-x-3 lg:-translate-x-0"}
							>
								<BarChart
									data={salesData}
									barCategoryGap={isMobile ? 12 : 4} // wider gaps on mobile
									barSize={isMobile ? 30 : 16} // thicker bars on mobile
									onClick={(data) => {
										if (data?.activeLabel) {
											const selectedDay = data.activeLabel;
											const newDate = `${selectedMonth}-${selectedDay}`;
											setSelectedDate(newDate);
										}
									}}
								>
									<XAxis dataKey="date" stroke="#ccc" />
									<YAxis stroke="#ccc" />
									<Tooltip
										contentStyle={{
											backgroundColor: "#1E293B",
											color: "#FACC15",
										}}
									/>
									<Bar
										dataKey="sales"
										fill="#3B82F6"
										radius={[6, 6, 0, 0]}
										cursor="pointer"
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex w-full justify-center">
				<div className="w-full max-w-7xl space-y-6 rounded-lg bg-gray-800/50 p-6 shadow-inner">
					<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
						<h2 className="text-2xl font-semibold text-gray-100 text-center">
							Day-wise Bills - {selectedDate}
						</h2>
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="rounded-md border bg-gray-700 p-2 text-white focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{bills.map((bill) => (
							<Card
								key={bill.id}
								className="border border-gray-600 bg-gray-900 p-4 shadow-md hover:shadow-lg transition-all"
							>
								<CardContent>
									<div className="space-y-2 text-gray-300">
										<div className="text-lg font-semibold text-gray-100">
											Billing Time:{" "}
											<span className="text-blue-400">
												{bill.createdAt.toLocaleTimeString()}
											</span>
										</div>
										<p>
											<span className="font-medium text-blue-400">
												Payment Method:
											</span>{" "}
											{bill.paymentMethod}
										</p>
										<p>
											<span className="font-medium text-green-400">Total:</span>{" "}
											₹{bill.total}
										</p>
										<p>
											<span className="font-medium text-red-400">
												Discount:
											</span>{" "}
											₹{bill.discount}
										</p>
										<div className="flex items-center justify-between">
											<p>
												<span className="text-gray-400">Date:</span>{" "}
												{format(new Date(bill.createdAt), "yyyy-MM-dd")}
											</p>
											<Button
												variant="secondary"
												className="bg-gray-700 hover:bg-gray-600 text-gray-100"
												onClick={() => handleViewBill(bill.id)}
											>
												View Bill
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Bill Modal */}
					{showBillModal && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
							<div className="w-full max-w-lg rounded-lg bg-gray-800 p-6 shadow-xl">
								<div className="mb-4 border-b pb-2 text-xl font-semibold text-gray-100">
									Bill Details
								</div>
								{billData ? (
									<div className="space-y-2 text-gray-300">
										<p>
											<span className="font-medium text-gray-400">
												Bill ID:
											</span>{" "}
											{billData.id}
										</p>
										<p>
											<span className="font-medium text-gray-400">
												Payment Method:
											</span>{" "}
											{billData.paymentMethod}
										</p>
										<p>
											<span className="font-medium text-gray-400">
												Grand Total:
											</span>{" "}
											₹{billData.grandTotal}
										</p>
										<p>
											<span className="font-medium text-gray-400">
												Discount:
											</span>{" "}
											₹{billData.discount}
										</p>
										<p>
											<span className="font-medium text-gray-400">Date:</span>{" "}
											{format(new Date(billData.createdAt), "yyyy-MM-dd")}
										</p>
										<p>
											<span className="font-medium text-gray-400">Time:</span>{" "}
											{new Date(billData.createdAt).toLocaleTimeString()}
										</p>
										<div>
											<span className="font-medium text-gray-400">Items:</span>
											<div className="mt-2 space-y-1 pl-2">
												{billData.items.map((item) => (
													<div
														key={item.id}
														className="flex justify-between text-sm"
													>
														<span>
															{item.name} x {item.quantity}
														</span>
														<span>₹{item.price}</span>
													</div>
												))}
											</div>
										</div>
									</div>
								) : (
									<div className="text-center text-gray-300">Loading...</div>
								)}
								<div className="mt-6 flex justify-end gap-3">
									<Button
										className={`${isBillLoading ? "cursor-not-allowed bg-blue-500" : "cursor-pointer bg-blue-600  hover:bg-blue-500"}`}
										onClick={handlePrintBill}
										disabled={isBillLoading}
									>
										{isBillLoading ? "Generating..." : "Generate Bill"}
									</Button>
									<Button
										className="bg-red-600 hover:bg-red-500"
										onClick={clearItems}
									>
										Close
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ViewSalesAnalytics;
