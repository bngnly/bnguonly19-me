"use client";
import {
  Home,
  YouTube,
  Collections,
  Login,
  Logout,
  AddToPhotos,
} from "@mui/icons-material";
import { AppBar, IconButton, Slide, useScrollTrigger } from "@mui/material";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

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
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <HideOnScroll>
      <AppBar
        sx={{
          backgroundColor: "#9333ea",
          minHeight: "5vh",
          justifyContent: "center",
          paddingX: "1vh",
        }}
      >
        <div className="flex justify-between">
          <div className="space-x-[1vw]">
            <IconButton onClick={() => router.push("/")}>
              <Home />
            </IconButton>
            <IconButton onClick={() => router.push("/albums")}>
              <Collections />
            </IconButton>
          </div>
          <div className="space-x-[1vw]">
            <IconButton
              onClick={() =>
                window.open("https://www.youtube.com/@bngnly", "_blank")
              }
            >
              <YouTube />
            </IconButton>
            {session?.user && (
              <IconButton onClick={() => router.push("/upload")}>
                <AddToPhotos />
              </IconButton>
            )}
            {!session?.user ? (
              <IconButton
                onClick={() => {
                  signIn();
                }}
              >
                <Login />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => {
                  signOut();
                }}
              >
                <Logout />
              </IconButton>
            )}
          </div>
        </div>
      </AppBar>
    </HideOnScroll>
  );
}
