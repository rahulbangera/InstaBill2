"use client";

import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import OwnerDashboard from "./owner/page";
import EmployeeDashboard from "./employee/page";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    console.log(session);
    if (!session.data) {
      router.push("/signin");
    }
  }, [session]);

  if (session.data?.user.role === "OWNER") {
    return <OwnerDashboard />;
  } else if (session.data?.user.role === "EMPLOYEE") {
    return <EmployeeDashboard />;
  }

  return null;
};

export default Dashboard;
