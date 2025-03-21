"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import OwnerSidebar from "~/app/_components/ownerSidebar";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <OwnerSidebar />

        {/* Main Content */}
        <div className="flex-1 bg-gray-900">{children}</div>
      </div>
    </>
  );
}
