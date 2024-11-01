import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="flex justify-center">{children}</body>
    </html>
  );
}
