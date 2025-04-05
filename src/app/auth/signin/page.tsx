"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/app/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Dialog } from "~/components/ui/dialog";
import Image from "next/image";
import { api } from "~/trpc/react";

const Signin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { mutate: sendemail } = api.user.sendmail.useMutation();
  const [modal, setModal] = useState<boolean>(false);

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "http://localhost:3000",
    });
    if (response) {
      if (response.error) {
        if (response.error.includes("Credentials")) {
          setError("Invalid Login");
        } else {
          setError(response.error);
        }
        setModal(true);
      }
      if (response.ok) {
        setModal(true);
        setError("");
        // void sendemail({ email: email });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-100">
          Sign In
        </h2>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <Button
            type="submit"
            variant={"destructive"}
            onClick={handleSignIn}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Sign In
          </Button>
          <h2 className="text-gray-300">
            Don&apos;t have an account?{" "}
            <Link
              href={"/auth/signup"}
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Create Now
            </Link>
          </h2>
        </form>
      </div>
      {modal && error === "" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex h-1/4 w-1/4 flex-col items-center justify-center rounded-lg bg-gray-700 p-5">
            <Image
              src={"/greencheckmark.png"}
              width={100}
              height={100}
              priority
              alt="success"
            />
            <h2 className="text-lg">Signed in Sucessfully</h2>
            <p className="m-2 text-gray-400">Redirecting to Dashboard...</p>
          </div>
        </div>
      )}
      {modal && error !== "" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex h-1/4 w-1/4 flex-col items-center justify-center rounded-lg bg-gray-700 p-5">
            <Image
              src={"/redcrossmark.png"}
              width={100}
              height={100}
              priority
              alt="success"
            />
            <h2 className="text-lg">Invalid Credentials</h2>
            <Button
              className="m-2 bg-blue-800"
              onClick={() => {
                setModal(false);
                setError("");
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signin;
