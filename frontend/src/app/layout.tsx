import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import SpaceBackground from "@/app/components/SpaceBackground";
import {AuthProvider} from "@/app/contexts/authContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeoWatch",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-w-screen min-h-screen bg-transparent`}
      >
        <SpaceBackground />
        <div className="relative z-10">
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
