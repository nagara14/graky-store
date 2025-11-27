"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import WelcomeOverlay from "@/app/components/WelcomeOverlay";

export default function SessionWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <WelcomeOverlay />
      {children}
    </SessionProvider>
  );
}
