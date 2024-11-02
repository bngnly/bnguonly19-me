"use client";
import Link from "next/link";
import { Home, YouTube, Menu } from "@mui/icons-material";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="">
        <div className="flex justify-between hidden md:flex">
          <Link href="/">
            <Home />
          </Link>
          <Link href="https://www.youtube.com/@bngnly" target="_blank">
            <YouTube />
          </Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu />
          </button>
          {isOpen && (
            <div className="absolute flex flex-col z-100">
              <Link href="/">
                <Home />
              </Link>
              <Link href="https://www.youtube.com/@bngnly" target="_blank">
                <YouTube />
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
