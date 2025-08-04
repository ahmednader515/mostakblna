"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { CourseMobileSidebar } from "./course-mobile-sidebar";
import { UserButton } from "@/components/user-button";

export const CourseNavbar = () => {
  const router = useRouter();

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
          <span className="rtl:text-right ltr:text-left">الرجوع إلى الدورات</span>
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
      <div className="flex items-center gap-x-4 rtl:mr-auto ltr:ml-auto">
        <UserButton />
      </div>
    </div>
  );
}; 