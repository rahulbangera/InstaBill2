"use client"
import "~/styles/globals.css"

import { GeistSans } from "geist/font/sans"
import Navbar from "./_components/navbar"
import { TRPCReactProvider } from "~/trpc/react"
import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { SessionProvider } from "next-auth/react"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { Toaster } from "~/components/ui/sonner"

import { ourFileRouter } from "~/app/api/uploadthing/core"
import ErrorBoundary from "~/app/_components/error-boundary"

export default function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = React.useState<boolean>(true)
  const [progress, setProgress] = React.useState<number>(0)
  const [navbar, setNavbar] = React.useState<boolean>(false)

  useEffect(() => {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/invoice")) {
      setNavbar(false)
    } else {
      setNavbar(true)
    }
    if (isHomePage) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setLoading(false)
            }, 250)
            return 100
          }
          return prev + 10
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isHomePage, pathname])

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head>
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${dark ? "bg-gray-900 text-white" : "bg-amber-200 text-black"}`}>
        <TRPCReactProvider>
          <SessionProvider>
            <ErrorBoundary>
              <NextSSRPlugin
                /**
                 * The `extractRouterConfig` will extract **only** the route configs
                 * from the router to prevent additional information from being
                 * leaked to the clitaent. The data passed to the client is the same
                 * as if you were to fetch `/api/uploadthing` directly.
                 */
                routerConfig={extractRouterConfig(ourFileRouter)}
              />
              {navbar && <Navbar isDark={dark} setDark={setDark} />}
              {children}
              <Toaster position="top-center" className="bg-[#1e201e] text-white" />

              {loading && isHomePage && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white">
                  <Image src={"/logo1.png"} alt="logo" width={250} height={250} priority />
                  <progress className="mt-4 w-1/4 rounded-lg" value={progress} max={100} />{" "}
                </div>
              )}
            </ErrorBoundary>
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
