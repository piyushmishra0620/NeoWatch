"use client";

import {useRouter} from "next/navigation";

export default function User() {
  const router = useRouter();
  return (
    <>
      <div className="min-w-screen min-h-screen flex justify-center items-center">
        <div className="p-20 bg-white/10 backdrop-blur-xl rounded-lg border border-blue-500 ring ring-blue-300 ring-offset-1">
          <div className="flex flex-col items-center p-3 m-auto">
            <p className="mt-8 text-lg md:text-xl text-blue-100/80 leading-relaxed tracking-wide">
              WELCOME! Continue as an user.
            </p>
            <div className="flex flex-col space-y-8 mt-8">
              <button className="px-5 md:px-14 py-4 md:py-6 bg-blue-600 focus:bg-blue-500 hover:bg-blue-500 md:bg-[lab(44 76.83 71.8)] cursor-pointer text-gray-300 font-bold md:text-lg text-md border border-blue-500 outline-2 outline-amber-50 outline-offset-3 rounded-lg hover:-translate-y-1 ease-in duration-100">
                Signup
              </button>
              <button className="px-5 md:px-14 py-4 md:py-6 bg-blue-600 focus:bg-blue-500 hover:bg-blue-500 md:bg-[lab(44 76.83 71.8)] cursor-pointer text-gray-300 font-bold md:text-lg text-md border border-blue-500 outline-2 outline-amber-50 outline-offset-3 rounded-lg hover:-translate-y-1 ease-in duration-100">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
