"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import OwnerSidebar from "~/app/_components/ownerSidebar";
import MultiTableBillingSidebar from "~/app/_components/advancedSidebar";
import BillingDashboard from "~/app/_components/billingDashboard";
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

export default function OwnerDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const getInitialBillState = (): BillingState => ({
    inputItem: "",
    itemsData: [],
    paymentMethod: PaymentMethod.CASH,
    discount: 0,
  });

  const [allBills, setAllBills] = useState<Record<string, BillingState>>({
    default: getInitialBillState(),
  });

  const [currentTable, setCurrentTable] = useState<string>("default");

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}

        {/* Main Content */}
        <div
          className={`flex-1 overflow-auto bg-gray-900 ${collapsed ? "w-full" : "w-[calc(100%-300px)]"}`}
        >
          <BillingDashboard
            setCollapsed={setCollapsed}
            collapsed={collapsed}
            billState={allBills[currentTable] ?? getInitialBillState()}
            setBillState={(updated) =>
              setAllBills((prev) => ({
                ...prev,
                [currentTable]: {
                  ...prev[currentTable],
                  ...updated,
                } as BillingState,
              }))
            }
          />
        </div>

        <MultiTableBillingSidebar
          collapsed={collapsed}
          currentTable={currentTable}
          setCurrentTable={setCurrentTable}
          allBills={allBills}
          setAllBills={setAllBills}
        />
      </div>
    </>
  );
}
