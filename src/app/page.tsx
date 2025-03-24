"use client";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import Image from "next/image";
import { Button } from "~/app/components/ui/button";
import { CaretRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

gsap.registerPlugin(TextPlugin);

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const textRef = useRef(null);
  const subtextRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
    )
      .to(textRef.current, {
        text: "InstaBiller",
        duration: 1.5,
        ease: "power2.inOut",
      })
      .fromTo(
        subtextRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        "-=1",
      )
      .to(subtextRef.current, {
        text: "Tracking Businesses made Easy",
        duration: 1.2,
        ease: "power2.inOut",
      });
  }, []);

  return (
    <div className="mx-auto my-0 flex w-full justify-between p-4 2xl:w-[80%]">
      <div className="ml-12 mt-40 w-full">
        <h1
          ref={textRef}
          className="opacity-1 min-h-[8rem] whitespace-pre text-4xl font-bold sm:text-4xl md:text-9xl 2xl:text-[7vw]"
        >
          InstaBiller
        </h1>
        <h2
          ref={subtextRef}
          className="opacity-1 mt-6 min-h-[4rem] w-1/2 whitespace-pre text-gray-700 sm:text-3xl md:text-5xl 2xl:w-1/2 2xl:text-[3vw]"
        >
          Tracking Businesses made Easy
        </h2>
        {session ? (
          <div
            className="relative mt-8 inline-block"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <Button
              className="relative rounded-none border-none bg-gray-100 text-black"
              variant={"outline"}
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        ) : (
          <div
            className="relative mt-8 inline-block"
            onClick={() => router.push("/signin")}
          >
            <Button
              className="relative rounded-none border-none bg-gray-100 text-black"
              variant={"outline"}
            >
              Login to your Account
              <CaretRightIcon className="ml-2" />
            </Button>

            {/* {showDropdown && (
              <div className="absolute left-0 flex w-full flex-col bg-white shadow-lg transition-opacity duration-300">
                <Button
                  className="rounded-none border-none bg-gray-300 text-black hover:bg-gray-400"
                  variant={"outline"}
                >
                  As an Owner
                </Button>
                <Button
                  className="rounded-none border-none bg-gray-300 text-black hover:bg-gray-400"
                  variant={"outline"}
                  onClick={() => alert("Logging in as Employee")}
                >
                  As an Employee
                </Button>
              </div>
            )} */}
          </div>
        )}
      </div>

      <div className="flex items-center brightness-75 filter">
        <Image src={"/shop2.webp"} alt={"shop"} width={1600} height={1600} />
      </div>
    </div>
  );
};

export default Page;
