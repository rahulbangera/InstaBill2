"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { Shop } from "@prisma/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ManageEmployees from "~/app/_components/manageEmployees";
import ManageItems from "~/app/_components/manageItems";
import ViewAnalytics from "~/app/_components/viewAnalytics";
import { motion } from "framer-motion";

export default function ShopComp({ shopid }: { shopid: string }) {
  const { data, refetch, isFetching } =
    api.shops.getStoreDetails.useQuery(shopid);
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Employees");

  const tabs = [
    { name: "Manage Employees", key: "Employees" },
    { name: "Manage Items", key: "Items" },
    { name: "View Analytics", key: "Analytics" },
  ];

  useEffect(() => {
    if (data) {
      setShopData(data); // Only set shopData when data is available
    }
  }, [data]); // Ensure it updates when new data is fetched
  const router = useRouter();
  const [activePath, setActivePath] = useState("/dashboard/employees");

  const handleNavigation = (path: string) => {
    setActivePath(path);
    router.push(path);
  };

  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    if (tabRefs.current[activeTab]) {
      const { offsetLeft, offsetWidth } = tabRefs.current[activeTab]!;
      setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);
  return (
    <div className="flex h-screen w-full flex-col overflow-auto">
      <header className="flex items-center justify-between bg-gray-800 p-4 text-white shadow-md">
        <div className="flex items-center gap-4">
          <Image
            src="/shop-logo.png"
            alt="Shop Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
          <h1 className="text-xl font-semibold">{shopData?.name}</h1>
        </div>
      </header>

      <nav className="relative flex justify-center bg-gray-700 p-2 text-white">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[tab.key] = el;
            }}
            onClick={() => setActiveTab(tab.key)}
            className={`relative mx-2 rounded-md px-6 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === tab.key ? "bg-gray-900" : "hover:bg-gray-600"
            }`}
          >
            {tab.name}
          </button>
        ))}
        <motion.div
          className="absolute bottom-0 h-[3px] bg-red-500"
          animate={{ left: underlineStyle.left, width: underlineStyle.width }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </nav>

      <div className="flex-grow p-4">
        {activeTab === "Employees" && <ManageEmployees />}
        {activeTab === "Items" && <ManageItems />}
        {activeTab === "Analytics" && <ViewAnalytics />}
      </div>
    </div>
  );
}
