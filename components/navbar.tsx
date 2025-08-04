"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { ScrollProgress } from "@/components/scroll-progress";

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="ml-2"
              unoptimized
            />
          </Link>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {!session ? (
              <>
                <Button className="bg-[#211FC3] hover:bg-[#211FC3]/90 text-white" asChild>
                  <Link href="/sign-up">انشاء الحساب</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-[#211FC3] text-[#211FC3] hover:bg-[#211FC3]/10"
                >
                  <Link href="/sign-in">تسجيل الدخول</Link>
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">لوحة التحكم</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <ScrollProgress />
    </div>
  );
}; 