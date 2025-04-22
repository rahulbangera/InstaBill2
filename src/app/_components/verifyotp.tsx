"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "~/app/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "~/trpc/react"
import { toast } from "react-hot-toast"

const VerifyEmail = () => {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const queryParams = useSearchParams()
  const email = queryParams.get("email")
  const { mutate: resendOtp } = api.user.resendEmailOtp.useMutation()

  const { data: checkEmail } = api.user.checkEmailOtpPresence.useQuery({ email: email || "" }, { enabled: !!email })

  useEffect(() => {
    if (!checkEmail) {
      router.push("/auth/signup")
    }
  }, [checkEmail, router])
  const { mutate: verifyOtp } = api.user.verifyEmailOtp.useMutation()

  const resendEmail = () => {
    if (!email) {
      setError("Email is required to resend OTP")
      return
    }

    setError("")
    setSuccess("")

    resendOtp(
      { email },
      {
        onSuccess: () => {
          setSuccess("OTP resent successfully!")
          toast.success("OTP resent successfully!")
        },
        onError: (err) => {
          setError(err.message)
          toast.error(err.message)
        },
      },
    )
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous messages
    setError("")
    setSuccess("")

    // Validate OTP format
    if (!otp.trim()) {
      setError("OTP is required")
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits")
      return
    }

    if (!email) {
      setError("Email is required to verify OTP")
      return
    }

    // All validations passed, proceed with verification
    verifyOtp(
      { email, otp },
      {
        onSuccess: () => {
          setSuccess("Email verified successfully!")
          setError("")
          toast.success("Email verified successfully!")
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        },
        onError: (err) => {
          setError(err.message)
          toast.error(err.message)
          setSuccess("")
        },
      },
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-gray-800 p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-200">Verify Email</h2>

        <form className="space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-600">
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
            <button type="button" onClick={resendEmail} className="text-sm text-indigo-500 hover:underline">
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
  )
}

export default VerifyEmail
