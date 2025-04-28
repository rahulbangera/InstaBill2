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
import { Button } from "../components/ui/button";

const ViewSalesAnalytics = ({ shopId }: { shopId: string }) => {
  interface SalesData {
    date: string;
    sales: number;
  }

    const getInvoice = api.invoice.createInvoice.useMutation()

  const [billId, setBillId] = useState<string>("");

const {data: billData, refetch: fetchBillData} = api.billing.getBillById.useQuery(billId, {enabled: !!billId});

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
            fetchBillData();
        }
    }
    , [billId]);

    const handleViewBill = (billId: string) => {    
        setBillId(billId);
        setShowBillModal(true);
        console.log("View Bill ID:", billId);
        // You can navigate to a bill details page or show a modal with bill details
        }

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
    await getInvoice.mutateAsync(shopId + "-" + billId, {
      onSuccess: (response) => {
        window.location.href = response
      },
      onError: (error) => {
        console.error("PDF generation failed:", error)
      },
    })
  }

  return (
    <div className="space-y-8">
      <div className="mt-6 flex w-full justify-center">
        <Card className="w-3/4 max-w-[1200px] border border-gray-700 bg-gray-800/70 p-4">
          <CardContent>
            <h2 className="mb-2 text-xl font-semibold text-gray-200">
              Sales Overview - {selectedMonth}
            </h2>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mb-2 rounded border border-gray-600 bg-gray-800 p-2 text-gray-200"
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
                  if (data?.activeLabel) {
                    const selectedDay = data.activeLabel;
                    const newDate = `${selectedMonth}-${selectedDay}`;
                    setSelectedDate(newDate);
                  }
                }}
              >
                <XAxis dataKey="date" stroke="gray" />
                <YAxis stroke="gray" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    color: "#FACC15",
                  }}
                />
                <Bar dataKey="sales" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full justify-center">
        <div className="flex w-full max-w-[1800px] justify-center border-none bg-gray-700/20 p-8">
          <div>
            <h2 className="mb-2 text-center text-xl font-semibold">
              Day-wise Bills - {selectedDate}
            </h2>
            <div className="flex w-full justify-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mb-4 rounded border bg-gray-600 p-2 text-black"
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {bills.map((bill) => (
                <Card
                  key={bill.id}
                  className="min-w-[340px] border-gray-500 bg-slate-800 p-4 text-lg"
                >
                  <CardContent>
                    <h3 className="mb-1 text-lg font-semibold text-gray-200">
                      Billing Time:{" "}
                      <span className="text-gray-100">
                        {bill.createdAt.toLocaleTimeString()}
                      </span>
                    </h3>
                    <p className="mb-1 text-gray-300">
                      <span className="font-medium text-blue-400">
                        Payment Method:
                      </span>{" "}
                      {bill.paymentMethod}
                    </p>
                    <p className="mb-1 text-gray-300">
                      <span className="font-medium text-green-400">Total:</span>{" "}
                      ₹{bill.total}
                    </p>
                    <p className="mb-1 text-gray-300">
                      <span className="font-medium text-red-400">
                        Discount:
                      </span>{" "}
                      ₹{bill.discount}
                    </p>
                    <div className="flex justify-between items-center">
                    <p className="mb-1 text-gray-300">
                      <span className="font-medium text-gray-400">Date:</span>{" "}
                      {format(new Date(bill.createdAt), "yyyy-MM-dd")}
                    </p>
                    <Button
                      variant="secondary"
                      className="text-gray-200 bg-gray-900 hover:bg-gray-800"
                      onClick={()=>handleViewBill(bill.id)}
                    >
                      View Bill
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {showBillModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex h-fit w-1/4 flex-col items-end rounded-lg bg-gray-700 p-5">
            <div className="w-full text-left">
              {" "}
              <h2 className="mb-4 text-xl">Bill Details</h2>
             </div>
             {billData ? (
                <div className="mb-4">
                    <p className="mb-2">
                        <span className="font-medium text-gray-300">
                            Bill ID:
                            </span>{" "}
                            {billData.id}
                    </p>
                    <p className="mb-2">
                        <span className="font-medium text-gray-300">
                            Payment Method:
                            </span>{" "}
                            {billData.paymentMethod}
                    </p>
                    <p className="mb-2">
                        <span className="font-medium text-gray-300">
                            Total:
                            </span>{" "}
                            ₹{billData.total}
                    </p>
                    <p className="mb-2">
                        <span className="font-medium text-gray-300">
                            Discount:
                            </span>{" "}
                            ₹{billData.discount}
                    </p>
                    <p className="mb-2">
                        <span className="font-medium text-gray-300">
                            Date:
                            </span>{" "}
                            {format(new Date(billData.createdAt), "yyyy-MM-dd")}
                    </p>
                    <p className="mb-2">
                        <span className="font-medium text-gray-300">
                            Time:
                            </span>{" "}
                            {new Date(billData.createdAt).toLocaleTimeString()}
                    </p>
                    <div className="mb-2">
                        <span className="font-medium text-gray-300">
                            Items:
                            </span>{" "}
                            {billData.items.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>₹{item.price}</span>
                                </div>
                            ))}
                    </div>
                   
                    </div>
              ): (
                <div className="w-full text-center">
                                    <p className="text-gray-300">Loading...</p>

                </div>
              )}
            <div className="flex gap-3">
              <Button className="bg-blue-800" onClick={handlePrintBill}>
                Print Bill
              </Button>
              <Button className="bg-red-700" onClick={clearItems}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSalesAnalytics;
