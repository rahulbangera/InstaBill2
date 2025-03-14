import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Switch } from "~/app/components/ui/switch";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Button } from "../components/ui/button";

interface NavbarProps {
  isDark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, setDark }) => {
  const { data: session2 } = useSession();
  const [session, setSession] = useState<object>();

  useEffect(() => {
    console.log("Navbar re-rendered | isDark:", isDark);
  }, [isDark]);
  return (
    <nav
      className={`flex w-full items-center justify-between bg-gray-800 px-2`}
    >
      <div className="w-1/3"></div>
      <div className="flex items-center justify-center">
        <Image src={"/logo.png"} alt="logo" width={80} height={80} />
      </div>
      <div className="flex w-1/3 items-center justify-end gap-2 px-8">
        <MoonIcon className="scale-125 text-black" />
        <Switch
          className="bg-white"
          onCheckedChange={() => setDark((prev) => !prev)}
        />
        <SunIcon className="scale-125 text-black" />
        {session2 ? (
          <Button variant={"default"} onClick={() => signOut()}>
            Log Out
          </Button>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
