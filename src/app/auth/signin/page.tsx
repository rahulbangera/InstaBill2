"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/app/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Signin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
      alert(response.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl border-[1px] border-black bg-gray-700 p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-300">
          Sign In
        </h2>
        <form className="space-y-6">
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
              name="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-500 bg-gray-600 px-3 py-2 text-white outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
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
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-500 bg-gray-600 px-3 py-2 text-white outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            variant={"destructive"}
            onClick={handleSignIn}
            className="text-md w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign In
          </Button>
          <h2 className="text-gray-200">
            Don&apos;t have an account?{" "}
            <Link
              href={"/auth/signup"}
              className="font-bold hover:text-gray-100 hover:underline"
            >
              Create Now
            </Link>
          </h2>
        </form>
      </div>
    </div>
  );
};

export default Signin;
