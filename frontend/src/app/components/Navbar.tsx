"use client";

import Image from "next/image";
import Link from "next/link";
import { User2Icon } from "lucide-react";
import {motion} from "framer-motion";

export default function Navbar() {
  return (
    <>
      <motion.div initial={{y:-15,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.2,ease:"easeIn"}} className="fixed top-0 left-0 flex p-2 justify-between items-center z-40 min-w-screen bg-neutral-900/50 backdrop-blur-lg">
        <Link href="/">
          <Image
            src="/icon.png"
            alt="NeoEarth"
            width={60}
            height={60}
            className="rounded-full object-cover cursor-pointer"
          />
        </Link>
        <div className=" mr-[8px] flex justify-between gap-4">
          <div className="p-2 rounded-full border border-blue-500 ring ring-blue-400 ring-offset-1">
            <User2Icon className="text-blue-200 cursor-pointer" />
          </div>
          <div className="py-3 px-[5px] border rounded-lg border-blue-400 ring ring-blue-200 ring-offset-1 cursor-pointer">
            <span className="block w-[30px] h-[4px] bg-blue-400 rounded-lg mb-[3px]"></span>
            <span className="block w-[30px] h-[4px] bg-blue-400 rounded-lg mt-[3px] mb-[3px]"></span>
            <span className="block w-[30px] h-[4px] bg-blue-400 rounded-lg mt-[3px] mb-[3px]"></span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
