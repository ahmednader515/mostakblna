"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut } from "lucide-react";
import { CourseMobileSidebar } from "./course-mobile-sidebar";
import { UserButton } from "@/components/user-button";
import { useSession, signOut } from "next-auth/react";

export const CourseNavbar = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="p-4 h-full flex items-center bg-card text-foreground border-b shadow-sm">
      <div className="flex items-center">
        <CourseMobileSidebar />
        <Button
          onClick={() => router.push("/dashboard")}
          variant="ghost"
          size="sm"
          className="flex items-center gap-x-2 hover:bg-slate-100 rtl:mr-2 ltr:ml-2"
        >
          <span className="rtl:text-right ltr:text-left">الرجوع إلى الكورسات</span>
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
      <div className="flex items-center gap-x-4 rtl:mr-auto ltr:ml-auto">
        {session?.user && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 ease-in-out"
          >
            <LogOut className="h-4 w-4 rtl:ml-2 ltr:mr-2"/>
            تسجيل الخروج
          </Button>
        )}
        <UserButton />
      </div>
    </div>
  );
}; 