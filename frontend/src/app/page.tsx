"use client";

import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/authContext";

gsap.registerPlugin(SplitText);

export default function Home() {
  const container = useRef(null);
  const paragraphRef = useRef(null);

  const { context } = useAuth();
  const router = useRouter();

  const hasToken = useMemo(() => {
    if (typeof window === "undefined") return false;
    const localToken = localStorage.getItem("token");
    const cookieToken = document.cookie.includes("token=");
    return Boolean(localToken || cookieToken);
  }, []);

  const isAuthenticated = Boolean(context?.isAuthenticated || context?.User);
  const canAccess = isAuthenticated || hasToken;

  const handlePrimaryAction = () => {
    if (canAccess) {
      router.push("/chat");
      return;
    }
    router.push("/auth/user");
  };

  const handleSecondaryAction = () => {
    if (canAccess) {
      router.push("/asteroid");
      return;
    }
    router.push("/auth/researcher");
  };

  const features = [
    "Real-time asteroid monitoring",
    "Intelligent risk aversion and analysis engine",
    "Personalised dashboard and watchlist system",
    "Research workspace and analytical tools",
    "Secure authentication and role-based access",
    "Real-time community chat",
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        when: "beforeChildren",
        delayChildren: 0.8,
        staggerChildren: 0.4,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useGSAP(
    () => {
      const tl = gsap.timeline();
      const splitParagraph = SplitText.create(paragraphRef.current, {
        type: "words,chars,lines",
      });
      tl.fromTo(
        container.current,
        { opacity: 0 },
        { opacity: 1, delay: 1.2 },
      ).fromTo(
        splitParagraph.lines,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, ease: "power4.out", duration: 0.15 },
      );
    },
    { scope: container },
  );

  return (
    <>
      <div ref={container} className="min-h-screen px-6">
        <section className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="text-center max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.35,
              duration: 0.35,
              ease: [0.2, 1.4, 0.5, 1],
            }}
            className="text-5xl md:text-7xl font-extrabold tracking-widest 
                     bg-gradient-to-r from-blue-400 via-sky-300 to-white 
                     bg-clip-text text-transparent drop-shadow-lg"
          >
            NEOWATCH
          </motion.h1>
          <p
            ref={paragraphRef}
            className="mt-8 text-lg md:text-xl text-blue-100/80 
                     leading-relaxed tracking-wide"
          >
            Track real-time near-Earth asteroids, analyze risks, and explore
            orbital insights through an intelligent research-focused space
            monitoring platform.
          </p>
        </div>
          <motion.div
            variants={containerVariants}
            className="mt-6 z-60 flex flex-wrap items-center justify-center gap-5"
          >
            <motion.button
              initial="hidden"
              animate="visible"
              variants={childVariants}
              onClick={handlePrimaryAction}
              className="px-4 md:px-5 py-3 md:py-4 bg-blue-600 focus:bg-blue-500 hover:bg-blue-500 md:bg-[lab(44 76.83 71.8)] cursor-pointer text-gray-300 font-bold md:text-lg text-md border border-blue-500 outline-2 outline-amber-50 outline-offset-3 rounded-lg hover:-translate-y-1 ease-in duration-100"
            >
              {canAccess ? "Chat in Community" : "Login as User"}
            </motion.button>
            <motion.button
              initial="hidden"
              animate="visible"
              variants={childVariants}
              onClick={handleSecondaryAction}
              className="px-4 md:px-5 py-3 md:py-4 bg-blue-600 focus:bg-blue-500 hover:bg-blue-500 md:bg-[lab(44 76.83 71.8)] cursor-pointer text-gray-300 font-bold md:text-lg text-md border border-blue-500 outline-2 outline-amber-50 outline-offset-3 rounded-lg hover:-translate-y-1 ease-in duration-100"
            >
              {canAccess ? "Analyze Asteroids" : "Login as Researcher"}
            </motion.button>
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="group rounded-2xl border border-blue-400/30 bg-blue-950/40 px-6 py-6 shadow-[0_20px_60px_-40px_rgba(56,189,248,0.6)] backdrop-blur transition hover:-translate-y-1 hover:border-blue-300/60"
              >
                <div className="text-sm uppercase tracking-[0.25em] text-blue-200/60">
                  Feature
                </div>
                <h3 className="mt-3 text-xl font-semibold text-blue-50">
                  {feature}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-blue-200/70">
                  Built for precision, speed, and collaborative asteroid
                  intelligence.
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-blue-400/20 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <div className="text-lg font-semibold tracking-[0.25em] text-blue-100">
                NEOWATCH
              </div>
              <p className="mt-2 text-sm text-blue-200/70">
                Classy, real-time space intelligence for the next generation of
                watchers.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-blue-200/70">
              <span>Mission Control</span>
              <span>Research Access</span>
              <span>Community</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
