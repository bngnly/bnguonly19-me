import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/_components/Navbar";

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
          <Navbar />
          <div className="flex justify-center pt-[6vh]">{children}</div>
        </body>
      </html>
    </>
  );
}
