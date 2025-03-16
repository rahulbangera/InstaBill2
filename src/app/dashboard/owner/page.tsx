"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Button } from "~/app/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { UploadButton } from "~/utils/uploadthing";
import { useSession } from "next-auth/react";

const Page = () => {
  const router = useRouter();
  const [profileModal, setProfileModal] = useState(false);
  const { data: userImage, refetch: getUserImage } =
    api.ut.getUserImage.useQuery();
  const [image, setImage] = useState<string>("");
  const { mutate: deleteImage } = api.ut.deleteImage.useMutation();
  const { mutate: updateImage } = api.ut.userImageUpdate.useMutation();
  const { data: storesData } = api.shops.getStores.useQuery();
  const { data: session } = useSession();

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
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="fixed left-0 h-full w-[240px] bg-gray-600">
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
            Home
          </Link>
          <Link
            className="flex w-full justify-center border-b-2 border-gray-700 p-4"
            href={"/"}
          >
            Manage Access
          </Link>
        </div>
      </div>

      <div className="ml-[240px] flex-1 overflow-y-auto">
        <div className="flex h-1/4 items-center border-b-2 border-gray-600 pl-12">
          <h1 className="text-5xl">Welcome {session && session?.user.name}!</h1>
        </div>
        <div className="p-4"></div>
        {storesData?.length === 0 ? (
          <div className="flex h-1/2 flex-col items-center justify-center rounded-l p-4">
            <h2 className="text-xl">No stores found</h2>
            <p>Click the button below to add a store</p>
            <Button
              className="mt-4"
              variant={"secondary"}
              onClick={() => router.push("/shops/create")}
            >
              Add Store
            </Button>
          </div>
        ) : (
          <div className="mx-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-6">
            {storesData?.map((store) => (
              <div
                key={store.id}
                className="flex h-96 max-w-[360px] flex-col rounded-lg bg-gray-700"
              >
                <div className="relative h-1/2 w-full overflow-hidden rounded-lg">
                  {store.shopImage ? (
                    <Image
                      src={store.shopImage}
                      alt="Shop"
                      fill
                      priority
                      className="aspect-video"
                    />
                  ) : (
                    <Image
                      src="/store.png"
                      alt="Shop"
                      fill
                      className="aspect-video"
                    />
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-xl">{store.name}</h2>
                  <p className="mt-3">Address: {store.address}</p>
                </div>
              </div>
            ))}
            <div
              className="flex h-96 max-w-[360px] cursor-pointer flex-col rounded-lg border-2 border-dashed border-gray-600 bg-gray-600/5 hover:bg-gray-600/15"
              onClick={() => router.push("/shops/create")}
            >
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-md text-white">Add Store</span>
              </div>
            </div>
          </div>
        )}
        {profileModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
        {/* <div className="flex h-96 flex-col rounded-lg bg-gray-700">
            <div className="relative w-full h-1/2 rounded-lg overflow-hidden">
              <Image
                src="/store.png"
                alt="Shop"
               fill
                className="aspect-video"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl">Card 1</h2>
              <p>Content for card 1</p>
            </div>
          </div> */}
        {/* <div className="flex flex-col items-center justify-center rounded-lg bg-gray-700 p-4">
                    <h2 className="text-xl">Card 2</h2>
                    <p>Content for card 2</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-gray-700 p-4">
                    <h2 className="text-xl">Card 3</h2>
                    <p>Content for card 3</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-gray-700 p-4">
                    <h2 className="text-xl">Card 4</h2>
                    <p>Content for card 4</p>
                </div> */}
      </div>
    </div>
  );
};

export default Page;
