"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/app/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

const VerifyEmail = () => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const queryParams = useSearchParams();
  const email = queryParams.get("email");
  const { mutate: resendOtp } = api.user.resendEmailOtp.useMutation();

  const { data: checkEmail } = email
    ? api.user.checkEmailOtpPresence.useQuery({ email }, { enabled: true })
    : { data: null };

  useEffect(() => {
    if (!checkEmail) {
      router.push("/auth/signup");
    }
  }, [checkEmail]);
  const { mutate: verifyOtp } = api.user.verifyEmailOtp.useMutation();

  const resendEmail = () => {
    if (!email) {
      setError("Email is required to resend OTP");
      return;
    }
    setError("");
    setSuccess("");

    resendOtp(
      { email },
      {
        onSuccess: () => {
          setSuccess("OTP resent successfully!");
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    );
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    if (!email) {
      setError("Email is required to verify OTP");
      return;
    }

    verifyOtp(
      { email, otp },
      {
        onSuccess: (res) => {
          setSuccess("Email verified successfully!");
          setError("");
          setTimeout(() => {
            router.push("/dashboard"); // or wherever you want to redirect
          }, 1500);
        },
        onError: (err) => {
          setError(err.message);
          setSuccess("");
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-gray-800 p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-200">
          Verify Email
        </h2>

        <form className="space-y-6" onSubmit={handleVerify}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-600"
            >
              Enter OTP sent to your email:
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              placeholder="6-digit OTP"
              maxLength={6}
              required
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full rounded border border-gray-500 bg-gray-700 px-3 py-2 text-white outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={resendEmail}
              className="text-sm text-indigo-500 hover:underline"
            >
              Resend OTP
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <Button
            type="submit"
            variant={"destructive"}
            className="text-md w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Verify OTP
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
