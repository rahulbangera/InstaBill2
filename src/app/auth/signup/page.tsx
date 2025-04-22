"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "~/app/components/ui/button"
import { useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import Link from "next/link"
import { toast } from "sonner"

const SignUp = () => {
  const router = useRouter()
  const [name, setName] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const { mutate: deleteImage } = api.ut.deleteImage.useMutation()
  const { mutate: signUp } = api.user.createUser.useMutation()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setError("")

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      toast.error("Please enter a valid email address")
      return
    }

    // Validate password
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      toast.error("Password must be at least 6 characters")
      return
    }

    if (password.length > 20) {
      setError("Password must be less than 20 characters")
      toast.error("Password must be less than 20 characters")
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
      return
    }

    // Validate name
    if (!name.trim()) {
      setError("Name is required")
      toast.error("Name is required")
      return
    }

    if (name.length < 3) {
      setError("Name must be at least 3 characters")
      toast.error("Name must be at least 3 characters")
      return
    }

    if (name.length > 20) {
      setError("Name must be less than 20 characters")
      toast.error("Name must be less than 20 characters")
      return
    }

    // All validations passed, proceed with signup
    signUp(
      { email, password, name },
      {
        onError: (error) => {
          setError(error.message)
          toast.error(error.message)
          setSuccess("")
        },
        onSuccess: (success) => {
          setSuccess(success.success)
          setError("")
          toast.success("Account created successfully! Redirecting to verification...")
          setTimeout(() => {
            router.push("/auth/verifyotp?email=" + email)
          }, 1500)
        },
      },
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-gray-800 p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-200">Sign Up</h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              required
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-500 bg-gray-700 px-3 py-2 text-white outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              name="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-gray-500 bg-gray-700 px-3 py-2 text-white outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded border border-gray-500 bg-gray-700 px-3 py-2 text-white outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Confirm Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                placeholder="Confirm Password"
                name="confirm-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded border border-gray-500 bg-gray-700 px-3 py-2 text-white outline-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            onClick={handleSignUp}
            variant={"destructive"}
            className="text-md w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign Up
          </Button>
          <h2 className="text-gray-300">
            Already have an account?{" "}
            <Link href={"/auth/signin"} className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
              Log In
            </Link>
          </h2>
        </form>
      </div>
    </div>
  )
}

export default SignUp
