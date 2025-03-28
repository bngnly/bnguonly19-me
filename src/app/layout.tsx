import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/_components/Navbar";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "bnguonly19-me",
  description: "What I've Been Up To",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        <body>
          <SessionProvider>
            <Navbar />
            <div className="flex justify-center pt-[6vh]">{children}</div>
          </SessionProvider>
        </body>
      </html>
    </>
  );
}
