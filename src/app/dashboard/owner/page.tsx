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
import OwnerSidebar from "~/app/_components/ownerSidebar";

const OwnerDashboard = () => {
  const router = useRouter();
  const [profileModal, setProfileModal] = useState(false);
  const { data: userImage, refetch: getUserImage } =
    api.ut.getUserImage.useQuery();
  const [image, setImage] = useState<string>("");
  const { mutate: deleteImage } = api.ut.deleteImage.useMutation();
  const { mutate: updateImage } = api.ut.userImageUpdate.useMutation();
  const { data: storesData } = api.shops.getStores.useQuery();
  const { data: session } = useSession();

  // const handleImageCancel = () => {
  //   setProfileModal(false);
  //   if (image !== "" && image !== userImage) {
  //     deleteImage({ url: image });
  //   }
  //   if (userImage) {
  //     setImage(userImage);
  //   }
  // };

  // const handleImageUpdate = async () => {
  //   if (userImage) {
  //     if (image !== "" && image !== userImage) {
  //       deleteImage({ url: userImage });
  //     }
  //   }
  //   updateImage({ url: image });
  //   setProfileModal(false);
  //   void getUserImage();
  // };

  useEffect(() => {
    if (userImage) {
      setImage(userImage);
    }
  }, [userImage]);

  // By deleting employee it wont get deleted from user model

  return (
    <>
      <div className="flex h-1/4 items-center border-b-2 border-gray-600 pl-12">
        <h1 className="text-5xl">Welcome {session ? session?.user.name : null}!</h1>
      </div>
      <div className="p-4">
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
              <Link key={store.id} href={`/dashboard/owner/shop/${store.id}`}>
                <div className="flex h-96 max-w-[360px] cursor-pointer flex-col rounded-lg bg-gray-700">
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
              </Link>
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
      </div>
    </>
  );
};

export default OwnerDashboard;
