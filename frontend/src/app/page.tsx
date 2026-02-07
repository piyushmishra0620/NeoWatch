"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText);

export default function Home() {
  const container = useRef(null);
  const paragraphRef = useRef(null);

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
      <div
        ref={container}
        className="min-h-screen flex flex-col items-center justify-center px-6"
      >
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
        <motion.div variants={containerVariants} className="mt-5 z-60 flex gap-5">
          <motion.button
            initial="hidden"
            animate="visible"
            variants={childVariants}
            className="px-4 md:px-5 py-3 md:py-4 bg-blue-600 focus:bg-blue-500 hover:bg-blue-500 mg:bg-[lab(44 76.83 71.8)] cursor-pointer text-gray-300 font-bold md:text-lg text-md border border-blue-500 outline-2 outline-amber-50 outline-offset-3 rounded-lg hover:-translate-y-1 ease-in duration-100"
          >
            Get Started
          </motion.button>
          <motion.button
            initial="hidden"
            animate="visible"
            variants={childVariants}
            className="px-4 md:px-5 py-3 md:py-4 bg-blue-600 focus:bg-blue-500 hover:bg-blue-500 mg:bg-[lab(44 76.83 71.8)] cursor-pointer text-gray-300 font-bold md:text-lg text-md border border-blue-500 outline-2 outline-amber-50 outline-offset-3 rounded-lg hover:-translate-y-1 ease-in duration-100"
          >
            View Asteroids
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
