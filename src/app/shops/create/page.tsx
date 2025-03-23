"use client";

import React, { useEffect, useState } from "react";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

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

const Page = () => {
  const router = useRouter();
  const [storeImage, setStoreImage] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletionModal, setDeletionModal] = useState(false);

  const [employeeData, setEmployeeData] = useState<Employee>({
    name: "",
    email: "",
    phone: "",
  });

  const [shopData, setShopData] = useState<Shop>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const { mutate: deleteImage } = api.ut.deleteImage.useMutation();
  const { mutate: createStore } = api.shops.createStore.useMutation();

  const addEmployee = () => {
    if (employeeData.name && employeeData.email && employeeData.phone) {
      setEmployees([...employees, employeeData]);
      setEmployeeData({ name: "", email: "", phone: "" });
      setModalOpen(false);
    }
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

  const handleShopCreation = () => {
    createStore(
      {
        name: shopData.name,
        address: shopData.address,
        phone: shopData.phone,
        email: shopData.email,
        employees: employees,
        image: storeImage,
      },
      {
        onSuccess: () => {
          console.log("Store created successfully");
          router.push("/dashboard/owner");
        },
        onError: (error) => {
          console.error(error);
        },
      },
    );
  };

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
            onChange={(e) =>
              setShopData({ ...shopData, address: e.target.value })
            }
            className="mt-1 w-full rounded border border-gray-300 bg-gray-600 p-2"
          />
        </div>

        <div className="mb-3">
          <label className="block">Employees:</label>
          <div className="flex flex-wrap gap-2 rounded border bg-gray-600 p-2">
            {employees.map((emp, index) => (
              <span
                key={index}
                className="flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1 text-white"
              >
                {emp.name}
                <Cross1Icon
                  className="cursor-pointer"
                  onClick={() => handleEmployeeDeletion(emp)}
                />
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
              onChange={(e) =>
                setShopData({ ...shopData, email: e.target.value })
              }
              className="mt-1 w-full rounded border border-gray-300 bg-gray-600 p-2"
            />
          </div>
          <div className="col-span-1 row-span-2 flex items-center justify-around">
            <label className="block">Store Image:</label>
            <div className="relative mt-4 flex h-full w-full max-w-[300px] items-center justify-center rounded border border-gray-300 bg-gray-600 p-2">
              {storeImage !== "" ? (
                <div className="group relative h-full w-full">
                  <Image
                    src={storeImage}
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
                    console.log("Upload complete");
                    setStoreImage(res[0]?.ufsUrl ?? "");
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
              onChange={(e) =>
                setShopData({ ...shopData, phone: e.target.value })
              }
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
              <button
                onClick={() => setDeletionModal(false)}
                className="rounded bg-gray-400 px-3 py-1 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleImageDeletion()}
                className="rounded bg-red-500 px-3 py-1 text-white"
              >
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
              value={employeeData.name}
              onChange={(e) =>
                setEmployeeData({ ...employeeData, name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="mb-2 w-full rounded border bg-gray-500 p-2"
              value={employeeData.email}
              onChange={(e) =>
                setEmployeeData({ ...employeeData, email: e.target.value })
              }
            />
            <input
              type="tel"
              placeholder="Phone"
              className="mb-2 w-full rounded border bg-gray-500 p-2"
              value={employeeData.phone}
              onChange={(e) =>
                setEmployeeData({ ...employeeData, phone: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
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

export default Page;
