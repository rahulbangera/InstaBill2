import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { api } from "~/trpc/react";
import type { UserRole } from "@prisma/client";
import { toast } from "sonner";
interface EmployeeSchema {
  user: {
    id: string;
    createdAt: Date;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    emailVerified: Date | null;
    image: string | null;
  };
  id: string;
}

const ManageEmployees = ({ shopId }: { shopId: string }) => {
  const [employees, setEmployees] = useState<EmployeeSchema[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Employee");

  const { data: employeesData } = api.employees.getEmployees.useQuery({
    shopId: shopId,
  });

  const addEmployee = () => {
    if (name.trim() === "") return;
    setName("");
  };

  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData);
    }
  }, [employeesData]);

  // const removeEmployee = (id) => {};

  // const updateRole = (id, newRole) => {
  //   setEmployees(
  //     employees.map((emp) => (emp.id === id ? { ...emp, role: newRole } : emp)),
  //   );
  // };
  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col bg-gray-900 p-6 text-white">
      <h1 className="mb-6 text-center text-3xl font-bold text-blue-400">
        Manage Employees
      </h1>
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Employee Name"
          className="flex-1 rounded-lg border border-gray-600 bg-gray-800 p-3 text-white"
        />
        <select
          value={role}
          disabled
          onClick={()=>{
            toast.info("Coming Soon")
          }}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-800 p-3 text-gray-600"
        >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
        </select>
        <button
          onClick={addEmployee}
          className="rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-500"
        >
          Add Employee
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto rounded-lg border border-gray-600 bg-gray-800 p-4">
        {employees.length > 0 ? (
          employees.map((emp) => (
        <div
          key={emp.id}
          className="mb-2 flex items-center justify-between rounded-lg bg-gray-700 p-3"
        >
          <span className="font-semibold text-white">{emp.user.name}</span>
          <div className="flex items-center gap-2">
            {/* <select
          value={emp.user.role}
          onChange={(e) => updateRole(emp.id, e.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-800 p-2 text-white"
            >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
            </select> */}
            <button
          // onClick={() => removeEmployee(emp.id)}
          className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-500"
            >
          Remove
            </button>
          </div>
        </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No employees added yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageEmployees;
