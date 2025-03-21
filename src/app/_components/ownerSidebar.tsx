"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { UploadButton } from "~/utils/uploadthing";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

const OwnerSidebar = () => {
  const pathname = usePathname();
  console.log(pathname);
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
    getUserImage();
  };

  useEffect(() => {
    if (userImage) {
      setImage(userImage);
    }
  }, [userImage]);

  // By deleting employee it wont get deleted from user model

  return (
    <div
      className={`relative overflow-hidden h-full ${collapsed ? "w-[80px]" : "w-[240px]"} flex-shrink-0 bg-gray-600 transition-all duration-300 ease-in-out`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-1/2 flex h-8 w-8 items-center justify-center bg-gray-700 shadow-lg"
      >
        {collapsed ? (
          <ChevronRightIcon className="h-6 w-6 text-white" />
        ) : (
          <ChevronLeftIcon className="h-6 w-6 text-white" />
        )}
      </button>{" "}
      <div className="flex h-1/4 items-center justify-center border-b-2 border-gray-700">
        <div
          onClick={() => setProfileModal(true)}
          className="group relative aspect-square w-1/2 overflow-hidden rounded-full"
        >
          {userImage ? (
            <Image
              src={userImage}
              fill
              priority
              className="cursor-pointer rounded-full object-cover group-hover:bg-black group-hover:opacity-50"
              alt="Profile"
            />
          ) : (
            <Image
              src={"/profile.png"}
              fill
              priority
              className="cursor-pointer rounded-full object-cover group-hover:bg-black group-hover:opacity-50"
              alt="Profile"
            />
          )}
          <Pencil1Icon className="absolute inset-0 m-auto h-6 w-6 cursor-pointer opacity-0 group-hover:opacity-100" />
        </div>
      </div>
      <div className="h-4/5">
        <Link
          className="flex w-full justify-center border-b-2 border-gray-700 p-4"
          href={"/"}
        >
          {!collapsed ? "Home" : "🏠"}
        </Link>
        <Link
          className={`flex w-full justify-center border-b-2 border-gray-700 p-4 ${pathname === "/dashboard/owner" ? "bg-gray-700" : ""}`}
          href={"/dashboard/owner"}
        >
          {!collapsed ? "Dashboard" : "📊"}
        </Link>
        <Link
          className="flex w-full justify-center border-b-2 border-gray-700 p-4"
          href={"/"}
        >
          {!collapsed ? "Manage Access" : "🔑"}
        </Link>
      </div>
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-1/3 rounded-lg bg-gray-700 p-5">
            <h2 className="mb-4 text-xl">Update Profile Picture</h2>

            <div className="fit flex w-full flex-col items-center justify-center gap-8 bg-gray-600 pt-4">
              <div className="relative aspect-square w-1/3 rounded-full">
                {image ? (
                  <Image
                    src={image}
                    fill
                    priority
                    className="rounded-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <Image
                    src={"/profile.png"}
                    fill
                    priority
                    className="rounded-full object-cover"
                    alt="Profile"
                  />
                )}
              </div>

              <div>
                <UploadButton
                  endpoint={"userImageUploader"}
                  onClientUploadComplete={(res) => {
                    console.log("Upload complete", res);
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
                className="rounded bg-gray-400 px-3 py-1 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleImageUpdate()}
                className="rounded bg-red-500 px-3 py-1 text-white"
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
