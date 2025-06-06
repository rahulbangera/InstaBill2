
    
  import React, { useEffect, useState } from "react";
  import { api } from "~/trpc/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { BillItem } from "@prisma/client";
import { Card, CardContent } from "~/components/ui/card";
import { format, parseISO, addDays } from "date-fns";
import { useMediaQuery } from "react-responsive";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock data fetching function - replace with real API calls
const ViewInventoryAnalytics = ({ shopId }: { shopId: string }) => {
      const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const {refetch:getInventoryItems, data: inventoryAnalytics, isLoading} = api.billing.getBillItemsForDate.useQuery({shopId: shopId, date: selectedDate});   

  type BillItem = {
    product: {
      shopId: string;
      name: string;
      id: string;
      image: string | null;
      createdAt: Date;
      price: number;
      shortcut: number;
      productCode: string | null;
    } | null;
    name: string;
    quantity: number;
    price: number;
    billId: string;
  };

  type Item = {
    name: string;
    quantity: number;
    price: number;
  }

  const [billItems, setBillItems] = useState<Item[]>([]);

  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
   void getInventoryItems();
   setSelectedItem(null);
  }, [selectedDate]);

  useEffect(() => {
     if (inventoryAnalytics && Array.isArray(inventoryAnalytics)) {
        const aggregated: Record<string, { name: string; quantity: number; price: number; }> = {};
        inventoryAnalytics.forEach((item: BillItem) => {
            console.log("Processing item:", item);
            if (!aggregated[item.name]) {
                aggregated[item.name] = { ...item };
            } else if (aggregated[item.name]) {
                aggregated[item.name]!.quantity += item.quantity;
            }
        });
        const sortedAggregated = Object.values(aggregated).sort((a, b) => b.quantity - a.quantity);
        sortedAggregated.forEach(item => {
            item.price = item.quantity * item.price;
        });
        setBillItems(sortedAggregated);
    }
    console.log("Bill Items:", billItems);
  }, [inventoryAnalytics]);

  const filteredItems = search.trim()
    ? billItems.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    : [];

return (
  <Card className="bg-gray-900/80 border border-gray-700 space-y-8 shadow-lg">
    <CardContent className="space-y-10 p-6 md:p-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        {/* Date Picker */}
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-48 px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">Search Bill Items</label>
          <input
            type="text"
            placeholder="Search for an item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Dropdown */}
          {filteredItems.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg">
              {filteredItems.map((item) => (
                <li
                  key={item.name}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-100"
                  onClick={() => {
                    setSelectedItem(item);
                    setSearch("");
                  }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 flex-col space-y-2 lg:space-y-0 lg:flex-row">
                    <h2 className="text-2xl font-semibold text-gray-200">Top 15 Most Sold Items</h2>

             <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700 px-4 py-2 rounded-md border border-gray-600">
    <button
      onClick={() =>
        setSelectedDate((prev) =>
          format(addDays(parseISO(prev), -1), "yyyy-MM-dd")
        )
      }
      className="hover:text-white"
    >
      <ChevronLeft size={18} />
    </button>
    <span className="mx-1 font-medium">
      {format(parseISO(selectedDate), "dd MMM yyyy")}
    </span>
    <button
      onClick={() =>
        setSelectedDate((prev) =>
          format(addDays(parseISO(prev), 1), "yyyy-MM-dd")
        )
      }
      className="hover:text-white"
    >
      <ChevronRight size={18} />
    </button>
  </div>
        </div>
        
        {billItems.length === 0 ? (
            <div className="w-full h-64 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-xl">
                <span className="text-gray-400">No billed items data for selected date.</span>
            </div>
        ) : (
          <div className="w-full h-80 p-4 pb-6 bg-gray-800 border border-gray-700 rounded-xl">
  <ResponsiveContainer width="100%" height="100%" className={"-translate-x-3 lg:-translate-x-0"}>
    <BarChart
      data={billItems.slice(0, 15).map((item, i) => ({ ...item, index: i + 1 }))}
      barCategoryGap={isMobile ? 12 : 4}
      barSize={isMobile ? 30 : 16}
        onClick={(data: {
          activeLabel?: string;
          activePayload?: Array<{ payload: Item }>;
        }) => {
        console.log("Clicked data:", data);
        if (data?.activeLabel && data.activePayload?.[0]) {
          const selectedItemFromChart: string = data.activePayload[0].payload.name;
          setSelectedItem(billItems.find(item => item.name === selectedItemFromChart) ?? null);
        }
      }}
    >
      {/* Just show numbers on X-axis */}
      <XAxis
        dataKey="index"
        stroke="#cbd5e1"
        tick={{ fontSize: 12 }}
        style={{paddingLeft: isMobile ? 0 : 20, paddingRight: isMobile ? 0 : 20 }}
        label={{
          value: "Top 15 Billed Items",
          position: "insideBottom",
          dy: 10,
          fill: "#cbd5e1",
        }}
      />
      <YAxis stroke="#cbd5e1" />
      
      {/* Custom Tooltip showing actual item info */}
      <Tooltip
        content={({ active, payload }) => {
          if (active) {
            if(payload === undefined || payload.length === 0) return null;
            const item = payload[0]?.payload as Item;
            return (
              <div className="p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-100">
                <div className="font-semibold">{item.name}</div>

                <div>Quantity: {item.quantity}</div>

                <div>Total Price: ₹{item.price}</div>
              </div>
            );
          }
          return null;
        }}
      />
      <Bar dataKey="quantity" fill="#F97316" name="Quantity" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>

        )}
      </div>

      {/* Selected Item Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Selected Item Details</h3>
        <Card className="bg-gray-800 border border-gray-700 rounded-xl">
          <CardContent className="p-5 text-sm text-gray-300 space-y-2">
            {selectedItem ? (
              <>
                <div>
                  Item: <span className="font-medium text-white">{selectedItem.name}</span>
                </div>
                <div>
                  Quantity Sold: <span className="font-medium text-white">{selectedItem.quantity}</span>
                </div>
                <div>
                  Total Price: <span className="font-medium text-white">₹{selectedItem.price}</span>
                </div>
              </>
            ) : (
              <span className="text-gray-500">Select an item to view details</span>
            )}
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
);
}
export default ViewInventoryAnalytics;