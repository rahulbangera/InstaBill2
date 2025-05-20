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
  const { data: session } = useSession();
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
    <div className="mx-auto flex w-full flex-col-reverse items-center justify-between p-4 md:flex-row md:gap-0 md:p-8 2xl:w-[80%]">
      <div className="w-full text-center md:w-1/2 md:text-left ml-8">
        <h1
          ref={textRef}
          className="whitespace-pre text-4xl font-bold sm:text-5xl md:text-7xl 2xl:text-[7vw] "
        >
          InstaBiller
        </h1>
        <h2
          ref={subtextRef}
          className="mt-4 min-h-[3rem] whitespace-pre text-xl text-gray-700 sm:text-2xl md:text-3xl 2xl:text-[3vw]"
        >
          Tracking Businesses made Easy
        </h2>

        {session ? (
          <div
            className="relative mt-6 inline-block"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <Button
              className="mt-4 w-full rounded-md bg-gray-100 text-black md:w-auto"
              variant={"outline"}
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        ) : (
          <div
            className="relative mt-6 inline-block"
            onClick={() => router.push("/signin")}
          >
            <Button
              className="mt-4 w-full rounded-md bg-gray-100 text-black md:w-auto"
              variant={"outline"}
            >
              Login to your Account
              <CaretRightIcon className="ml-2" />
            </Button>
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2">
        <Image
          src="/shop2.webp"
          alt="shop"
          width={1600}
          height={1600}
          className="w-full h-auto object-contain rounded-xl brightness-75"
        />
      </div>
    </div>
  );
};

export default Page;
