"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { UploadButton } from "~/utils/uploadthing";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

const OwnerSidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const { data: userImage, refetch: getUserImage } =
    api.ut.getUserImage.useQuery();
  const [image, setImage] = useState<string>("");
  const { mutate: deleteImage } = api.ut.deleteImage.useMutation();
  const { mutate: updateImage } = api.ut.userImageUpdate.useMutation();

  const handleImageCancel = () => {
    setProfileModal(false);
    if (image !== "" && image !== userImage) {
      deleteImage({ url: image });
    }
    if (userImage) {
      setImage(userImage);
    }
  };

  const handleImageUpdate = async () => {
    if (userImage) {
      if (image !== "" && image !== userImage) {
        deleteImage({ url: userImage });
      }
    }
    updateImage({ url: image });
    setProfileModal(false);
    void getUserImage();
  };

  useEffect(() => {
    if (userImage) {
      setImage(userImage);
    }
  }, [userImage]);

  // By deleting employee it wont get deleted from user model

  return (
    <div
      className={`relative h-full overflow-hidden ${
        collapsed ? "w-[80px]" : "w-[240px]"
      } z-[9999] flex-shrink-0 bg-gray-800 transition-all duration-300 ease-in-out`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-1/2 flex h-8 w-8 items-center justify-center bg-gray-900 shadow-lg hover:bg-gray-800"
      >
        {collapsed ? (
          <ChevronRightIcon className="h-6 w-6 text-white" />
        ) : (
          <ChevronLeftIcon className="h-6 w-6 text-white" />
        )}
      </button>

      <div className="flex h-1/4 items-center justify-center border-b-2 border-gray-500">
        <div
          onClick={() => setProfileModal(true)}
          className="group relative aspect-square w-1/2 overflow-hidden rounded-full"
        >
          <Image
            src={userImage ?? "/profile.png"}
            fill
            priority
            className="cursor-pointer rounded-full object-cover group-hover:bg-black group-hover:opacity-50"
            alt="Profile"
          />
          <Pencil1Icon className="absolute inset-0 m-auto h-6 w-6 cursor-pointer opacity-0 group-hover:opacity-100" />
        </div>
      </div>

      <div className="h-4/5">
        <Link
          className="flex w-full justify-center border-b-2 border-gray-500 p-4 text-gray-300 hover:bg-gray-700"
          href={"/"}
        >
          {!collapsed ? "Home" : "🏠"}
        </Link>
        <Link
          className={`flex w-full justify-center border-b-2 border-gray-500 p-4 ${
            pathname === "/dashboard/owner"
              ? "bg-gray-900"
              : "hover:bg-gray-700"
          } text-gray-300`}
          href={"/dashboard/owner"}
        >
          {!collapsed ? "Dashboard" : "📊"}
        </Link>
        <Link
          className="flex w-full cursor-not-allowed justify-center border-b-2 border-gray-500 bg-gray-800 p-4 text-gray-600"
          href={"#"}
          onClick={(e) => {
            e.preventDefault();
            toast.error("This feature is not available yet.");
          }}
        >
          {!collapsed ? "Manage Access" : "🔑"}
        </Link>
      </div>

      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-1/3 rounded-lg bg-gray-800 p-5">
            <h2 className="mb-4 text-xl text-gray-200">
              Update Profile Picture
            </h2>

            <div className="fit flex w-full flex-col items-center justify-center gap-8 bg-gray-700 pt-4">
              <div className="relative aspect-square w-1/3 rounded-full">
                <Image
                  src={image || "/profile.png"}
                  fill
                  priority
                  className="rounded-full object-cover"
                  alt="Profile"
                />
              </div>

              <div>
                <UploadButton
                  endpoint={"userImageUploader"}
                  onClientUploadComplete={(res) => {
                    if (image !== "" && image !== userImage) {
                      deleteImage({ url: image });
                    }
                    setImage(res[0]?.ufsUrl ?? "");
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => handleImageCancel()}
                className="rounded bg-gray-600 px-3 py-1 text-gray-300 hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleImageUpdate()}
                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
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

export default OwnerSidebar;
