"use client";

import { SessionProvider } from "next-auth/react";
import Navbar from "@/app/_components/Navbar";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMapPage = pathname === "/map";

  return (
    <SessionProvider>
      <Navbar />
      <div
        className={`flex justify-center ${isMapPage ? "pt-[5vh]" : "pt-[6vh]"}`}
      >
        {children}
      </div>
    </SessionProvider>
  );
}