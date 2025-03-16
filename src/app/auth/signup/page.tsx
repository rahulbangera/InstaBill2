"use client";
import React, { useState } from "react";
import { Button } from "~/app/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";
import { UploadButton } from "~/utils/uploadthing";

const signin = () => {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { mutate: deleteImage } = api.ut.deleteImage.useMutation();
  const { mutate: signUp } = api.user.createUser.useMutation();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    signUp(
      { email, password, name },
      {
        onError: (error) => {
          setError(error.message);
          setSuccess("");
        },
        onSuccess: (success) => {
          setSuccess(success.success);
          setError("");
          setTimeout(() => {
            router.push("/signin");
          }, 1000);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex w-full max-w-4xl">
        <div className="w-1/2 space-y-6 rounded-l-xl bg-gray-700 p-8 shadow-md">
          <h2 className="text-center text-2xl font-bold text-gray-200">
            Sign Up
          </h2>
          <form className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                required
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded border border-gray-500 bg-gray-600 px-3 py-2 text-black outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                name="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded border border-gray-500 bg-gray-600 px-3 py-2 text-black outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                name="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded border border-gray-500 bg-gray-600 px-3 py-2 text-black outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <Button
              type="submit"
              onClick={handleSignUp}
              variant={"destructive"}
              className="text-md w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign Up
            </Button>
            <h2 className="text-gray-200">
              Already have an account?{" "}
              <Link
                href={"/auth/signin"}
                className="font-bold hover:text-gray-100 hover:underline"
              >
                Log In
              </Link>
            </h2>
          </form>
        </div>
        <div className="w-1/2 space-y-6 rounded-r-xl bg-gray-700 p-4 shadow-md">
          <div className="fit flex h-full w-full flex-col items-center justify-center gap-8 pt-4">
            <span className="text-lg">Profile Picture</span>

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
                  if (image !== "") {
                    deleteImage({ url: image });
                  }
                  setImage(res[0]?.ufsUrl ?? "");
                }}
              />
              {image && (
                <button
                  className="rounded bg-red-500 px-5 py-2 text-white"
                  onClick={() => {
                    deleteImage({ url: image });
                    setImage("");
                  }}
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default signin;
