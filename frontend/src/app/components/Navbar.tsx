"use client";

import Image from "next/image";
import Link from "next/link";
import { User2Icon } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/authContext";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { context, signOut } = useAuth();
  const router = useRouter();

  const hasToken = useMemo(() => {
    if (typeof window === "undefined") return false;
    const localToken = localStorage.getItem("token");
    const cookieToken = document.cookie.includes("token=");
    return Boolean(localToken || cookieToken);
  }, []);

  const isAuthenticated = Boolean(context?.isAuthenticated || context?.User);
  const canAccess = isAuthenticated || hasToken;

  const handleUserClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleContinue = (role: "user" | "researcher") => {
    setIsModalOpen(false);
    if (role === "user") {
      router.push("/auth/user");
      return;
    }
    router.push("/auth/researcher");
  };

  const handleLogout = async () => {
    await signOut();
    setIsModalOpen(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeIn" }}
        className="fixed top-0 left-0 flex p-2 justify-between items-center z-40 min-w-screen bg-neutral-900/50 backdrop-blur-lg"
      >
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
          <button
            type="button"
            onClick={handleUserClick}
            className="p-2 rounded-full border border-blue-500 ring ring-blue-400 ring-offset-1"
          >
            <User2Icon className="text-blue-200 cursor-pointer" />
          </button>
          {!isMenuOpen && (
            <button
              type="button"
              onClick={handleMenuToggle}
              className="py-3 px-[5px] border rounded-lg border-blue-400 ring ring-blue-200 ring-offset-1 cursor-pointer"
            >
              <span className="block w-[30px] h-[4px] bg-blue-400 rounded-lg mb-[3px]"></span>
              <span className="block w-[30px] h-[4px] bg-blue-400 rounded-lg mt-[3px] mb-[3px]"></span>
              <span className="block w-[30px] h-[4px] bg-blue-400 rounded-lg mt-[3px] mb-[3px]"></span>
            </button>
          )}
        </div>
      </motion.div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-blue-400/40 bg-slate-950/90 p-6 text-blue-50 shadow-[0_30px_80px_-50px_rgba(56,189,248,0.8)]">
            {!canAccess ? (
              <>
                <h3 className="text-xl font-semibold tracking-wide">
                  Continue as
                </h3>
                <p className="mt-2 text-sm text-blue-200/70">
                  Choose your access path to proceed.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleContinue("user")}
                    className="w-full rounded-xl border border-blue-400/60 bg-blue-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500/30"
                  >
                    Normal User
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContinue("researcher")}
                    className="w-full rounded-xl border border-blue-400/60 bg-blue-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500/30"
                  >
                    Researcher
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold tracking-wide">
                  Logout
                </h3>
                <p className="mt-2 text-sm text-blue-200/70">
                  You are currently signed in. Do you want to logout?
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg border border-blue-200/40 px-4 py-2 text-sm text-blue-100/80 hover:border-blue-200/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-blue-400"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={handleMenuClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <aside className="absolute right-4 top-20 w-[280px] rounded-2xl border border-blue-400/40 bg-slate-950/95 px-6 py-6 text-blue-50 shadow-[0_30px_80px_-50px_rgba(56,189,248,0.8)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-[0.2em] text-blue-100">
                NAVIGATION
              </h3>
              <button
                type="button"
                onClick={handleMenuClose}
                className="rounded-full border border-blue-400/50 p-2 text-blue-100 hover:border-blue-300"
              >
                ✕
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-4 text-sm uppercase tracking-[0.2em]">
              <Link
                href="/"
                onClick={handleMenuClose}
                className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-blue-100 transition hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-500/20"
              >
                Home
              </Link>
              <Link
                href="/asteroids"
                onClick={handleMenuClose}
                className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-blue-100 transition hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-500/20"
              >
                Asteroids
              </Link>
              <Link
                href="/research"
                onClick={handleMenuClose}
                className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-blue-100 transition hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-500/20"
              >
                Research
              </Link>
              <Link
                href="/profile"
                onClick={handleMenuClose}
                className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-blue-100 transition hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-500/20"
              >
                Profile
              </Link>
              <Link
                href="/chat"
                onClick={handleMenuClose}
                className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-blue-100 transition hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-500/20"
              >
                Chat
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
