"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { Toaster } from "sonner";
import { RTLProvider } from "@/components/providers/rtl-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <RTLProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider />
          {children}
          <Toaster />
        </ThemeProvider>
      </RTLProvider>
    </SessionProvider>
  );
}; 