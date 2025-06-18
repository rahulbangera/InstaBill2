"use client";

import { useEffect, useState } from "react";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Employee {
  name: string;
  email: string;
  phone: string;
}

interface Shop {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface City {
  name: string;
  district: string;
  state: string;
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
    toast.error("Store name is required");
    return false;
  }

  // Validate store address
  if (!shopData.address.trim()) {
    toast.error("Store address is required");
    return false;
  }

  // Validate store email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!shopData.email.trim()) {
    toast.error("Store email is required");
    return false;
  }

  if (!emailRegex.test(shopData.email)) {
    toast.error("Please enter a valid store email");
    return false;
  }

  // Validate store phone
  if (!shopData.phone.trim()) {
    toast.error("Store phone is required");
    return false;
  }

  if (!/^\d{10}$/.test(shopData.phone.replace(/[^0-9]/g, ""))) {
    toast.error("Please enter a valid 10-digit phone number");
    return false;
  }

  // Validate product code
  if (productCode.customCode.trim().length < 4) {
    toast.error("Product code must be at least 4 characters long");
    return false;
  }

  // Validate pin code and city
  if (shopPinCode.length !== 6 || !/^\d{6}$/.test(shopPinCode)) {
    toast.error("Please enter a valid 6-digit pin code");
    return false;
  }

  if (!shopCity) {
    toast.error("Please select a city");
    return false;
  }

  return true;
};

const Page = () => {
  const router = useRouter();
  const [storeImage, setStoreImage] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchCitiesDone, setFetchCitiesDone] = useState(false);
  const [shopPinCode, setShopPinCode] = useState<string>("");
  const { refetch: getCities } = api.shops.getCitiesByPinCode.useQuery(
    shopPinCode,
    { enabled: false },
  );

  const [deletionModal, setDeletionModal] = useState(false);
  const [productCode, setProductCode] = useState({
    locationCode: "",
    customCode: "",
    yearCode: new Date().getFullYear().toString().slice(-2),
  });

  const [employeeAddData, setEmployeeAddData] = useState<Employee>({
    name: "",
    email: "",
    phone: "",
  });

  const [shopCity, setShopCity] = useState<string>("");

  useEffect(() => {
    if (shopCity.length > 0) {
      setProductCode((prev) => ({
        ...prev,
        locationCode: shopCity.toUpperCase().slice(0, 3),
      }));
    } else {
      if (fetchCitiesDone === true) {
        setCities([]);
        setFetchCitiesDone(false);
      }
      console.log("Shop City is empty");
      setProductCode((prev) => ({
        ...prev,
        locationCode: "",
      }));
    }
  }, [shopCity]);

  const [shopData, setShopData] = useState<Shop>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    setProductCode((prev) => ({
      ...prev,
      customCode: shopData.name.toUpperCase().slice(0, 4),
    }));
  }, [shopData.name]);

  // Replace the handlePinCodeConfirmation function with this improved version
  const handlePinCodeConfirmation = () => {
    if (shopPinCode.length !== 6 || !/^\d{6}$/.test(shopPinCode)) {
      toast.error("Please enter a valid 6-digit pin code");
      return;
    }

    getCities()
      .then((res) => {
        if (res) {
          setFetchCitiesDone(true);
          setCities(res.data ?? []);
          if (res.data && res.data.length > 0) {
            toast.success("Cities fetched successfully");
          } else {
            toast.error("No cities found for this pin code");
          }
        }
      })
      .catch((err) => {
        toast.error("Failed to fetch cities");
      });
  };

  const { mutate: deleteImage } = api.ut.deleteImage.useMutation();
  const { mutate: createStore } = api.shops.createStore.useMutation();

  // Replace the addEmployee function with this improved version
  const addEmployee = () => {
    // Validate employee name
    if (!employeeAddData.name.trim()) {
      toast.error("Employee name is required");
      return;
    }

    // Validate employee email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!employeeAddData.email.trim()) {
      toast.error("Employee email is required");
      return;
    }

    if (!emailRegex.test(employeeAddData.email)) {
      toast.error("Please enter a valid employee email");
      return;
    }

    // Validate employee phone
    if (!employeeAddData.phone.trim()) {
      toast.error("Employee phone is required");
      return;
    }

    if (!/^\d{10}$/.test(employeeAddData.phone.replace(/[^0-9]/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // All validations passed, add employee
    setEmployees([...employees, employeeAddData]);
    setEmployeeAddData({ name: "", email: "", phone: "" });
    setModalOpen(false);
    toast.success("Employee added to list");
  };

  const handleImageDeletion = async () => {
    deleteImage(
      { url: storeImage },
      {
        onSuccess: () => {
          setStoreImage("");
          setDeletionModal(false);
        },
        onError: () => {
          console.error("Failed to delete image");
        },
      },
    );
  };

  const handleEmployeeDeletion = (emp: Employee) => {
    setEmployees(employees.filter((employee) => employee !== emp));
  };

  // Replace the handleShopCreation function with this improved version
  const handleShopCreation = () => {
    if (!validateStoreForm(shopData, productCode, shopPinCode, shopCity)) {
      return;
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
          toast.success("Store created successfully");
          router.push("/dashboard/owner");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create store");
        },
      },
    );
  };

  useEffect(() => {
    if (shopPinCode.length !== 6) {
      setShopCity(""); // reset city selection
    }
  }, [shopPinCode]);

  useEffect(() => {
    if (!shopCity && cities.length > 0) {
      const firstDistrict = cities[0]?.district;
      if (firstDistrict) {
        setShopCity(firstDistrict);
      }
    }
  }, [cities, shopCity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Create Store</h1>
          <p className="mt-2 text-gray-400">
            Let’s set up your store in style 🚀
          </p>
        </div>

        <form className="space-y-6">
          {/* Card: Basic Info */}
          <section className="rounded-xl bg-gray-800 bg-opacity-60 p-6 shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center space-x-3">
              <svg
                className="h-6 w-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="text-xl font-semibold text-white">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-gray-300">Store Name</label>
                <input
                  type="text"
                  placeholder="Your Store Name"
                  onChange={(e) =>
                    setShopData({ ...shopData, name: e.target.value })
                  }
                  className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-gray-300">
                  Store Address
                </label>
                <textarea
                  placeholder="Your Store Address"
                  onChange={(e) =>
                    setShopData({ ...shopData, address: e.target.value })
                  }
                  className="h-24 w-full resize-none rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Card: Location & Codes */}
          <section className="rounded-xl bg-gray-800 bg-opacity-60 p-6 shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center space-x-3">
              <svg
                className="h-6 w-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 5-9 9-9 9s4-9 9-9z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-white">
                Location & Product Codes
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-6">
              {/* Pin Code */}
              <div className="relative flex flex-col">
                <label className="mb-1 block text-gray-300">Pin Code</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Store Pin Code"
                    onChange={(e) => setShopPinCode(e.target.value)}
                    className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={handlePinCodeConfirmation}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer rounded-3xl bg-green-500 px-2 py-1 text-white hover:bg-green-600"
                  >
                    ✔
                  </button>
                </div>
              </div>

              {/* City */}
              <div className="flex flex-col">
                <label className="mb-1 block text-gray-300">City</label>
                <select
                  onChange={(e) => setShopCity(e.target.value)}
                  value={shopCity || ""}
                  className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="" disabled>
                    Select City
                  </option>
                  {shopPinCode.length === 6 &&
                    Array.from(new Set(cities.map((c) => c.district))).map(
                      (d, i) => (
                        <option key={i} value={d}>
                          {d}
                        </option>
                      ),
                    )}
                </select>
              </div>

              {/* Product Code */}
              <div className="flex flex-col items-center">
                <label className="mb-1 block text-gray-300">Product Code</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="CITY"
                    value={productCode.locationCode}
                    disabled
                    className="w-20 min-w-0 rounded-lg bg-gray-700 p-2 text-center text-white"
                  />
                  <input
                    type="text"
                    placeholder="YEAR"
                    value={productCode.yearCode}
                    disabled
                    className="w-20 min-w-0 rounded-lg bg-gray-700 p-2 text-center text-white"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Store Code"
                      value={productCode.customCode}
                      onChange={(e) =>
                        setProductCode({
                          ...productCode,
                          customCode: e.target.value,
                        })
                      }
                      maxLength={6}
                      className="w-full rounded-lg bg-gray-700 p-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 transform text-sm text-gray-400">
                      XXXX
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Card: Team */}
          <section className="min-h-[120px] rounded-xl bg-gray-800 bg-opacity-60 p-6 shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between space-x-3">
              <div className="flex gap-2">
                <svg
                  className="h-6 w-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m0-4a4 4 0 11-8 0 4 4 0 018 0zm16 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-white">Employees</h2>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="ml-2 rounded-full bg-orange-900 px-3 py-1 text-white hover:bg-orange-800"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {employees.length > 0 ? (
                employees.map((emp: Employee, i: number) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-white"
                  >
                    {emp.name}
                    <Cross1Icon
                      className="cursor-pointer"
                      onClick={() => handleEmployeeDeletion(emp)}
                    />
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No employees added yet</span>
              )}
            </div>
          </section>

          {/* Card: Contact & Image */}
          <section className="rounded-xl bg-gray-800 bg-opacity-60 p-6 shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center space-x-3">
              <svg
                className="h-6 w-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 2a2 2 0 012 2v2a2 2 0 002 2h2v12H2V8h2a2 2 0 002-2V4a2 2 0 012-2h8z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-white">
                Contact & Image
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-gray-300">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  onChange={(e) =>
                    setShopData({ ...shopData, email: e.target.value })
                  }
                  className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-gray-300">Phone</label>
                <input
                  type="tel"
                  placeholder="+91 12345 67890"
                  onChange={(e) =>
                    setShopData({ ...shopData, phone: e.target.value })
                  }
                  className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-gray-300">Store Image</label>
                <div className="relative flex w-full items-center justify-center rounded-lg bg-gray-700 p-2">
                  {storeImage ? (
                    <div className="group relative w-full max-w-[700px]">
                      <Image
                        priority
                        src={storeImage}
                        alt="Store"
                        width={700}
                        height={500}
                        unoptimized
                        quality={100}
                        placeholder="blur"
                        blurDataURL={storeImage}
                        sizes="100vw"
                        style={{ width: "100%", height: "auto", maxHeight: "800px" }}
                        className="rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => setDeletionModal(true)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <UploadButton
                      className="rounded-lg bg-blue-500 px-5 py-2 text-white hover:bg-blue-600"
                      endpoint="storeImageUploader"
                      onClientUploadComplete={(res) => {
                        setStoreImage(res[0]?.ufsUrl ?? "");
                        toast.success("Image uploaded successfully");
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleShopCreation}
              className="rounded-full bg-orange-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-orange-700"
            >
              Create Store
            </button>
          </div>
        </form>
      </div>

      {/* Modals (unchanged) */}
      {deletionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="w-80 rounded-xl bg-gray-700 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Delete Image
            </h2>
            <p className="mb-6 text-gray-200">
              Are you sure you want to delete this image?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletionModal(false)}
                className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleImageDeletion}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="w-80 rounded-xl bg-gray-700 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Add Employee
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={employeeAddData.name}
                onChange={(e) =>
                  setEmployeeAddData({
                    ...employeeAddData,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={employeeAddData.email}
                onChange={(e) =>
                  setEmployeeAddData({
                    ...employeeAddData,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={employeeAddData.phone}
                onChange={(e) =>
                  setEmployeeAddData({
                    ...employeeAddData,
                    phone: e.target.value,
                  })
                }
                className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addEmployee}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Add Employee
            </h2>

            {/* Input Field Style */}
            <input
              type="text"
              placeholder="Name"
              className="mb-3 w-full rounded-lg border border-gray-600 bg-gray-900 p-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={employeeAddData.name}
              onChange={(e) =>
                setEmployeeAddData({ ...employeeAddData, name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              className="mb-3 w-full rounded-lg border border-gray-600 bg-gray-900 p-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={employeeAddData.email}
              onChange={(e) =>
                setEmployeeAddData({
                  ...employeeAddData,
                  email: e.target.value,
                })
              }
            />

            <input
              type="tel"
              placeholder="Phone"
              className="mb-5 w-full rounded-lg border border-gray-600 bg-gray-900 p-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={employeeAddData.phone}
              onChange={(e) =>
                setEmployeeAddData({
                  ...employeeAddData,
                  phone: e.target.value,
                })
              }
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-gray-200 transition-all duration-150 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addEmployee}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-all duration-150 hover:bg-blue-500"
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

export default Page;
