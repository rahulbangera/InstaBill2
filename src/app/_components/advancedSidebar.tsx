import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Card, CardContent } from "~/components/ui/card";
import { PaymentMethod } from "@prisma/client";

interface Item {
  name: string;
  quantity: number;
  price: number;
  productId?: string;
}

type BillingState = {
  inputItem: string;
  discount: number;
  itemsData: Item[];
  paymentMethod: PaymentMethod;
};

export default function MultiTableBillingSidebar({
  collapsed,
  currentTable,
  setCurrentTable,
  allBills,
  setAllBills,
}: {
  collapsed: boolean;
  currentTable: string | null;
  setCurrentTable: (tableName: string) => void;
  allBills: Record<string, BillingState>;
  setAllBills: React.Dispatch<
    React.SetStateAction<Record<string, BillingState>>
  >;
}) {
  useEffect(() => {
    setAllBills({
      "Table 1": {
        itemsData: [],
        inputItem: "",
        discount: 0,
        paymentMethod: PaymentMethod.CASH,
      },
    });
    setCurrentTable("Table 1");
  }, []);

  const addTable = () => {
    const tableNumbers = Object.keys(allBills)
      .map((name) => {
        const regex = /Table (\d+)/;
        const match = regex.exec(name);
        return match ? parseInt(match[1] ?? "0") : null;
      })
      .filter(Boolean) as number[];

    const nextNumber = Math.max(...tableNumbers, 1) + 1;
    const newName = `Table ${nextNumber}`;

    setAllBills((prev) => ({
      ...prev,
      [newName]: {
        itemsData: [],
        inputItem: "",
        discount: 0,
        paymentMethod: PaymentMethod.CASH,
      },
    }));
    setCurrentTable(newName);
  };

  const switchToTable = (tableName: string) => {
    setCurrentTable(tableName);
  };

  const finalizeBill = (tableName: string) => {
    if (tableName === "Table 1") return; 
    setAllBills((prev) => {
      const updated = { ...prev };
      delete updated[tableName];
      return updated;
    });
    if (currentTable === tableName) setCurrentTable("Table 1");
  };

  return (
    <div
      className={`z-[9999] h-screen border-l border-gray-700 bg-gray-800 shadow-lg transition-all duration-300 ${
        collapsed ? "w-[240px]" : "w-0"
      }`}
    >
      <div className="border-b border-gray-700 p-4">
        <h2 className="mb-2 text-xl font-bold text-white">Active Tables</h2>
        <Button
          onClick={addTable}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Add Table
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-160px)] p-4">
        {Object.keys(allBills).length === 0 && (
          <p className="text-sm text-gray-500">No active tables</p>
        )}
        {Object.entries(allBills).map(([tableName, bill]) => (
          <Card
            key={tableName}
            className={`mb-3 cursor-pointer border bg-gray-900 ${
              tableName === currentTable
                ? "border-green-500"
                : "border-gray-700"
            }`}
            onClick={() => switchToTable(tableName)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{tableName}</p>
                  <p className="text-sm text-gray-400">
                    ₹{" "}
                    {bill.itemsData.reduce(
                      (total, item) => total + item.quantity * item.price,
                      0,
                    )}
                  </p>
                </div>
                {tableName !== "Table 1" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      finalizeBill(tableName);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>

      <div className="border-t border-gray-700 p-4 text-sm text-gray-400">
        {currentTable ? `Viewing: ${currentTable}` : "No table selected"}
      </div>
    </div>
  );
}
