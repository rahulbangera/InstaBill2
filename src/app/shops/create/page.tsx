"use client"

import { useEffect, useState } from "react"
import { UploadButton } from "~/utils/uploadthing"
import Image from "next/image"
import { api } from "~/trpc/react"
import { Cross1Icon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Employee {
  name: string
  email: string
  phone: string
}

interface Shop {
  name: string
  address: string
  phone: string
  email: string
}

interface City {
  name: string
  district: string
  state: string
}

// Add these validation functions at the top of the component
const validateStoreForm = (
  shopData: Shop,
  productCode: { locationCode: string; customCode: string; yearCode: string },
  shopPinCode: string,
  shopCity: string,
) => {
  // Validate store name
  if (!shopData.name.trim()) {
    toast.error("Store name is required")
    return false
  }

  // Validate store address
  if (!shopData.address.trim()) {
    toast.error("Store address is required")
    return false
  }

  // Validate store email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!shopData.email.trim()) {
    toast.error("Store email is required")
    return false
  }

  if (!emailRegex.test(shopData.email)) {
    toast.error("Please enter a valid store email")
    return false
  }

  // Validate store phone
  if (!shopData.phone.trim()) {
    toast.error("Store phone is required")
    return false
  }

  if (!/^\d{10}$/.test(shopData.phone.replace(/[^0-9]/g, ""))) {
    toast.error("Please enter a valid 10-digit phone number")
    return false
  }

  // Validate product code
  if (productCode.customCode.trim().length < 4) {
    toast.error("Product code must be at least 4 characters long")
    return false
  }

  // Validate pin code and city
  if (shopPinCode.length !== 6 || !/^\d{6}$/.test(shopPinCode)) {
    toast.error("Please enter a valid 6-digit pin code")
    return false
  }

  if (!shopCity) {
    toast.error("Please select a city")
    return false
  }

  return true
}

const Page = () => {
  const router = useRouter()
  const [storeImage, setStoreImage] = useState<string>("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [fetchCitiesDone, setFetchCitiesDone] = useState(false)
  const [shopPinCode, setShopPinCode] = useState<string>("")
  const { refetch: getCities } = api.shops.getCitiesByPinCode.useQuery(shopPinCode, { enabled: false })

  const [deletionModal, setDeletionModal] = useState(false)
  const [productCode, setProductCode] = useState({
    locationCode: "",
    customCode: "",
    yearCode: new Date().getFullYear().toString().slice(-2),
  })

  const [employeeAddData, setEmployeeAddData] = useState<Employee>({
    name: "",
    email: "",
    phone: "",
  })

  const [shopCity, setShopCity] = useState<string>("")

  useEffect(() => {
    if (shopCity.length > 0) {
      setProductCode((prev) => ({
        ...prev,
        locationCode: shopCity.toUpperCase().slice(0, 3),
      }))
    } else {
      if (fetchCitiesDone === true) {
        setCities([])
        setFetchCitiesDone(false)
      }
      console.log("Shop City is empty")
      setProductCode((prev) => ({
        ...prev,
        locationCode: "",
      }))
    }
  }, [shopCity])

  const [shopData, setShopData] = useState<Shop>({
    name: "",
    address: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    setProductCode((prev) => ({
      ...prev,
      customCode: shopData.name.toUpperCase().slice(0, 4),
    }))
  }, [shopData.name])

  // Replace the handlePinCodeConfirmation function with this improved version
  const handlePinCodeConfirmation = () => {
    if (shopPinCode.length !== 6 || !/^\d{6}$/.test(shopPinCode)) {
      toast.error("Please enter a valid 6-digit pin code")
      return
    }

    getCities()
      .then((res) => {
        if (res) {
          setFetchCitiesDone(true)
          setCities(res.data ?? [])
          if (res.data && res.data.length > 0) {
            toast.success("Cities fetched successfully")
          } else {
            toast.error("No cities found for this pin code")
          }
        }
      })
      .catch((err) => {
        toast.error("Failed to fetch cities")
      })
  }

  const { mutate: deleteImage } = api.ut.deleteImage.useMutation()
  const { mutate: createStore } = api.shops.createStore.useMutation()

  // Replace the addEmployee function with this improved version
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
      toast.error("Please enter a valid employee email")
      return
    }

    // Validate employee phone
    if (!employeeAddData.phone.trim()) {
      toast.error("Employee phone is required")
      return
    }

    if (!/^\d{10}$/.test(employeeAddData.phone.replace(/[^0-9]/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    // All validations passed, add employee
    setEmployees([...employees, employeeAddData])
    setEmployeeAddData({ name: "", email: "", phone: "" })
    setModalOpen(false)
    toast.success("Employee added to list")
  }

  const handleImageDeletion = async () => {
    deleteImage(
      { url: storeImage },
      {
        onSuccess: () => {
          setStoreImage("")
          setDeletionModal(false)
        },
        onError: () => {
          console.error("Failed to delete image")
        },
      },
    )
  }

  const handleEmployeeDeletion = (emp: Employee) => {
    setEmployees(employees.filter((employee) => employee !== emp))
  }

  // Replace the handleShopCreation function with this improved version
  const handleShopCreation = () => {
    if (!validateStoreForm(shopData, productCode, shopPinCode, shopCity)) {
      return
    }

    createStore(
      {
        name: shopData.name,
        address: shopData.address,
        phone: shopData.phone,
        email: shopData.email,
        employees: employees,
        itemCodeFormat: `${productCode.locationCode}${productCode.yearCode}${productCode.customCode}`,
        image: storeImage,
      },
      {
        onSuccess: () => {
          toast.success("Store created successfully")
          router.push("/dashboard/owner")
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create store")
        },
      },
    )
  }

  useEffect(() => {
    if (shopPinCode.length !== 6) {
      setShopCity("") // reset city selection
    }
  }, [shopPinCode])

  useEffect(() => {
    if (!shopCity && cities.length > 0) {
      const firstDistrict = cities[0]?.district
      if (firstDistrict) {
        setShopCity(firstDistrict)
      }
    }
  }, [cities, shopCity])

  return (
    <div className="flex h-screen items-center justify-center bg-opacity-80">
      <form className="mx-64 h-fit w-screen max-w-[1200px] rounded-lg border border-gray-300 bg-opacity-90 p-5">
        <h2 className="mb-4 text-2xl">Create Store</h2>
        <div className="mb-3">
          <label className="block">Store Name:</label>
          <input
            type="text"
            onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 bg-gray-600 p-2"
          />
        </div>

        <div className="mb-3">
          <label className="block">Store Address</label>
          <textarea
            onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
            className="mt-1 w-full rounded border border-gray-300 bg-gray-600 p-2"
          />
          <div className="h-18 mb-2 mt-2 flex w-full items-center justify-evenly">
            {" "}
            <div className="relative">
              <label className="block">Store Pin Code:</label>
              <input
                type="text"
                placeholder="Pin Code"
                onChange={(e) => setShopPinCode(e.target.value)}
                className="w-full rounded border border-gray-300 bg-gray-600 p-2"
              />
              <button
                type="button"
                onClick={handlePinCodeConfirmation}
                className="absolute right-2 translate-y-[12%] transform rounded bg-blue-500 px-3 py-1 text-white"
              >
                Confirm
              </button>
            </div>
            <div className="h-full">
              <label className="block">Store City:</label>
              <select
                onChange={(e) => setShopCity(e.target.value)}
                value={shopCity || (cities.length > 0 ? cities[0]?.district : "")}
                className="w-full rounded border border-gray-300 bg-gray-600 p-[0.6rem]"
              >
                <option value="" disabled>
                  Select City
                </option>
                {shopPinCode.length === 6 &&
                  Array.from(new Set(cities.map((city) => city.district))).map((uniqueDistrict, index) => (
                    <option key={index} value={uniqueDistrict}>
                      {uniqueDistrict}
                    </option>
                  ))}
              </select>
            </div>
            <div className="">
              <label className="block">Product Code Format:</label>
              <div className="flex items-center gap-2">
                {/* Location Code (Auto) */}
                <input
                  type="text"
                  placeholder="CITY"
                  value={productCode.locationCode}
                  disabled
                  className="w-20 rounded border border-gray-300 bg-gray-600 p-2 text-center"
                />

                <input
                  type="text"
                  value={productCode.yearCode}
                  disabled
                  className="w-20 rounded border border-gray-300 bg-gray-600 p-2 text-center"
                />

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={productCode.customCode}
                    placeholder="Store Code"
                    onChange={(e) =>
                      setProductCode({
                        ...productCode,
                        customCode: e.target.value,
                      })
                    }
                    maxLength={6}
                    className="w-40 rounded border border-gray-300 bg-gray-600 p-2 pr-10 text-left"
                  />
                  <span className="absolute right-2 text-gray-400">XXXX</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="block">Employees:</label>
          <div className="flex flex-wrap gap-2 rounded border bg-gray-600 p-2">
            {employees.map((emp, index) => (
              <span key={index} className="flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1 text-white">
                {emp.name}
                <Cross1Icon className="cursor-pointer" onClick={() => handleEmployeeDeletion(emp)} />
              </span>
            ))}
            <div className="flex w-full justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="ml-2 rounded bg-orange-900 px-3 py-1 text-white"
              >
                + Add Employee
              </button>
            </div>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block">Store Email:</label>
            <input
              type="text"
              onChange={(e) => setShopData({ ...shopData, email: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 bg-gray-600 p-2"
            />
          </div>
          <div className="col-span-1 row-span-2 flex items-center justify-around">
            <label className="block">Store Image:</label>
            <div className="relative mt-4 flex h-full w-full max-w-[300px] items-center justify-center rounded border border-gray-300 bg-gray-600 p-2">
              {storeImage !== "" ? (
                <div className="group relative h-full w-full">
                  <Image
                    src={storeImage || "/placeholder.svg"}
                    alt="Store Image"
                    className="rounded object-cover"
                    fill
                  />
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => setDeletionModal(true)}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <UploadButton
                  className="w-1/2 rounded-md bg-blue-600 text-white"
                  endpoint={"storeImageUploader"}
                  onUploadBegin={() => console.log("Uploading----")}
                  onUploadProgress={(progress) => console.log(progress)}
                  onClientUploadComplete={(res) => {
                    console.log("Upload complete")
                    setStoreImage(res[0]?.ufsUrl ?? "")
                  }}
                  onUploadError={(error) => console.error(error)}
                />
              )}
            </div>
          </div>
          <div className="col-span-1">
            <label className="block">Store Phone:</label>
            <input
              type="text"
              onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 bg-gray-600 p-2"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleShopCreation}
            className="w-1/4 rounded bg-orange-900 px-3 py-2 text-lg text-white"
          >
            Create Store
          </button>
        </div>
      </form>
      {deletionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/4 rounded-lg bg-gray-700 p-5">
            <h2 className="mb-4 text-xl">Delete Image</h2>
            <p>Are you sure you want to delete this image?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeletionModal(false)} className="rounded bg-gray-400 px-3 py-1 text-white">
                Cancel
              </button>
              <button onClick={() => handleImageDeletion()} className="rounded bg-red-500 px-3 py-1 text-white">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded-lg bg-gray-700 p-5">
            <h2 className="mb-4 text-xl">Add Employee</h2>
            <input
              type="text"
              placeholder="Name"
              className="mb-2 w-full rounded border bg-gray-500 p-2"
              value={employeeAddData.name}
              onChange={(e) => setEmployeeAddData({ ...employeeAddData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="mb-2 w-full rounded border bg-gray-500 p-2"
              value={employeeAddData.email}
              onChange={(e) => setEmployeeAddData({ ...employeeAddData, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="mb-2 w-full rounded border bg-gray-500 p-2"
              value={employeeAddData.phone}
              onChange={(e) => setEmployeeAddData({ ...employeeAddData, phone: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded bg-gray-400 px-3 py-1 text-white">
                Cancel
              </button>
              <button onClick={addEmployee} className="rounded bg-blue-500 px-3 py-1 text-white">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
