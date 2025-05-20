"use client"

import { useEffect, useState } from "react"
import { api } from "~/trpc/react"
import type { UserRole } from "@prisma/client"
import { toast } from "sonner"
interface EmployeeSchema {
  user: {
    id: string
    createdAt: Date
    name: string
    email: string
    password: string
    role: UserRole
    emailVerified: Date | null
    image: string | null
  }
  id: string
}

const ManageEmployees = ({ shopId }: { shopId: string }) => {
  const [employees, setEmployees] = useState<EmployeeSchema[]>([])
  const [name, setName] = useState("")
  const [role, setRole] = useState("Employee")
  const [employeeDeleteId, setEmployeeDeleteId] = useState<string>("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [employeeModalOpen, setEmployeeModalOpen] = useState(false)
  const [employeeAddData, setEmployeeAddData] = useState({
    name: "",
    email: "",
  })

  const { mutate: removeEmployeeById } = api.employees.removeEmployee.useMutation()

  const { mutate: addEmployeeToDb } = api.employees.addEmployee.useMutation()
  const { data: employeesData, refetch: fetchEmployees } = api.employees.getEmployees.useQuery({
    shopId: shopId,
  })

  const removeEmployee = () => {
    if (employeeDeleteId.trim() === "") return
    removeEmployeeById(employeeDeleteId, {
      onSuccess: () => {
        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeDeleteId))
        toast.success("Employee removed successfully")
      },
      onError: () => {
        toast.error("Failed to remove employee")
      },
    })
    setShowDeleteModal(false)
  }

  const handleRemoveEmployee = (id: string) => {
    setEmployeeDeleteId(id)
    setShowDeleteModal(true)
  }

  const addEmployee = () => {
    // Validate employee name
    if (!employeeAddData.name.trim()) {
      toast.error("Employee name is required")
      return
    }

    // Validate employee email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!employeeAddData.email.trim()) {
      toast.error("Employee email is required")
      return
    }

    if (!emailRegex.test(employeeAddData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    // All validations passed, add employee
    addEmployeeToDb(
      {
        ...employeeAddData,
        shopId: shopId,
      },
      {
        onSuccess: () => {
          toast.success("Employee added successfully")
          setEmployeeModalOpen(false)
          void fetchEmployees()
          setEmployeeAddData({
            name: "",
            email: "",
          })
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add employee")
        },
      },
    )
  }

  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData)
    }
  }, [employeesData])

  // const removeEmployee = (id) => {};

  // const updateRole = (id, newRole) => {
  //   setEmployees(
  //     employees.map((emp) => (emp.id === id ? { ...emp, role: newRole } : emp)),
  //   );
  // };
  return (
  <div className="mx-auto max-w-4xl px-4 py-6 text-white bg-gray-900 min-h-screen">
    <h1 className="text-2xl sm:text-3xl font-bold text-blue-400 text-center mb-6">Manage Employees</h1>

    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Employee Name"
        className="w-full sm:flex-1 rounded-lg border border-gray-600 bg-gray-800 p-3 text-white"
      />
      <select
        value={role}
        disabled
        onClick={() => toast.info("Coming Soon")}
        className="rounded-lg border border-gray-600 bg-gray-800 p-3 text-gray-600"
      >
        <option value="Employee">Employee</option>
        <option value="Manager">Manager</option>
      </select>
      <button
        onClick={() => setEmployeeModalOpen(true)}
        className="rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-500"
      >
        Add
      </button>
    </div>

    <div className="rounded-lg border border-gray-600 bg-gray-800 p-4 max-h-[50vh] overflow-y-auto">
      {employees.length > 0 ? (
        employees.map((emp) => (
          <div
            key={emp.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 rounded-lg bg-gray-700 p-3 gap-2"
          >
            <span className="font-semibold">{emp.user.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleRemoveEmployee(emp.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500"
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

    {/* Delete Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div className="w-full max-w-sm rounded-lg bg-gray-700 p-5">
          <h2 className="mb-4 text-xl font-semibold">Remove Employee</h2>
          <p>Are you sure you want to remove this Employee?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="rounded bg-gray-400 px-4 py-2 text-white"
            >
              Cancel
            </button>
            <button
              onClick={removeEmployee}
              className="rounded bg-red-500 px-4 py-2 text-white"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Add Modal */}
    {employeeModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div className="w-full max-w-sm rounded-lg bg-gray-700 p-5">
          <h2 className="mb-4 text-xl font-semibold">Add Employee</h2>
          <input
            type="text"
            placeholder="Name"
            className="mb-3 w-full rounded border bg-gray-600 p-2 text-white"
            value={employeeAddData.name}
            onChange={(e) =>
              setEmployeeAddData({ ...employeeAddData, name: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            className="mb-3 w-full rounded border bg-gray-600 p-2 text-white"
            value={employeeAddData.email}
            onChange={(e) =>
              setEmployeeAddData({ ...employeeAddData, email: e.target.value })
            }
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEmployeeModalOpen(false)}
              className="rounded bg-gray-400 px-4 py-2 text-white"
            >
              Cancel
            </button>
            <button
              onClick={addEmployee}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)

}

export default ManageEmployees