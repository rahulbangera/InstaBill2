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
  const [employeeDeleteId, setEmployeeDeleteId] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeAddData, setEmployeeAddData] = useState({
    name: "",
    email: "",
  });

  const { mutate: removeEmployeeById } =
    api.employees.removeEmployee.useMutation();

  const { mutate: addEmployeeToDb } = api.employees.addEmployee.useMutation();
  const { data: employeesData, refetch: fetchEmployees } =
    api.employees.getEmployees.useQuery({
      shopId: shopId,
    });

  const removeEmployee = () => {
    if (employeeDeleteId.trim() === "") return;
    removeEmployeeById(employeeDeleteId, {
      onSuccess: () => {
        setEmployees((prev) =>
          prev.filter((emp) => emp.id !== employeeDeleteId),
        );
        toast.success("Employee removed successfully");
      },
      onError: () => {
        toast.error("Failed to remove employee");
      },
    });
    setShowDeleteModal(false);
  };

  const handleRemoveEmployee = (id: string) => {
    setEmployeeDeleteId(id);
    setShowDeleteModal(true);
  };

  const addEmployee = () => {
    if (employeeAddData.name.trim() === "") {
      toast.error("Name is required");
      return;
    }
    if (employeeAddData.email.trim() === "") {
      toast.error("Email is required");
      return;
    }
    const employeeData = {
      name: employeeAddData.name,
      email: employeeAddData.email,
    };
    addEmployeeToDb(
      {
        ...employeeData,
        shopId: shopId,
      },
      {
        onSuccess: () => {
          toast.success("Employee added successfully");
          setEmployeeModalOpen(false);
          fetchEmployees();
        },
      },
    );
    setEmployeeAddData({
      name: "",
      email: "",
    });
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
          onClick={() => {
            toast.info("Coming Soon");
          }}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-800 p-3 text-gray-600"
        >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
        </select>
        <button
          onClick={() => setEmployeeModalOpen(true)}
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
                  onClick={() => handleRemoveEmployee(emp.id)}
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
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/4 rounded-lg bg-gray-700 p-5">
            <h2 className="mb-4 text-xl">Remove Employee</h2>
            <p>Are you sure you want to remove this Employee?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded bg-gray-400 px-3 py-1 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => removeEmployee()}
                className="rounded bg-red-500 px-3 py-1 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {employeeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded-lg bg-gray-700 p-5">
            <h2 className="mb-4 text-xl">Add Employee</h2>
            <input
              type="text"
              placeholder="Name"
              className="mb-2 w-full rounded border bg-gray-500 p-2"
              value={employeeAddData.name}
              onChange={(e) =>
                setEmployeeAddData({ ...employeeAddData, name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="mb-2 w-full rounded border bg-gray-500 p-2"
              value={employeeAddData.email}
              onChange={(e) =>
                setEmployeeAddData({
                  ...employeeAddData,
                  email: e.target.value,
                })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEmployeeModalOpen(false)}
                className="rounded bg-gray-400 px-3 py-1 text-white"
              >
                Cancel
              </button>
              <button
                onClick={addEmployee}
                className="rounded bg-blue-500 px-3 py-1 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
