"use client";
import Link from "next/link";
import { Home, YouTube, Collections } from "@mui/icons-material";
import { AppBar, Slide, useScrollTrigger } from "@mui/material";
import { ReactNode } from "react";

interface HideOnScrollProps {
  children: ReactNode;
}

function HideOnScroll({ children }: HideOnScrollProps) {
  const trigger = useScrollTrigger({
    target: typeof window !== "undefined" ? window : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <div>{children}</div>
    </Slide>
  );
}

export default function Navbar() {
  return (
    <HideOnScroll>
      <AppBar className="bg-purple-600 min-h-[5vh] justify-center px-[1vw]">
        <div className="flex justify-between">
          <div className="space-x-[1vh]">
            <Link href="/">
              <Home />
            </Link>
            <Link href="/albums">
              <Collections />
            </Link>
          </div>
          <Link
            href="https://www.youtube.com/@bngnly"
            target="_blank"
          >
            <YouTube />
          </Link>
        </div>
      </AppBar>
    </HideOnScroll>
  );
}
