"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react";
import Link from "next/link";
import { UserButton } from "./user-button";
import { useSession, signOut } from "next-auth/react";

export const NavbarRoutes = () => {
    const { data: session } = useSession();

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <div className="flex items-center gap-x-2 rtl:mr-auto ltr:ml-auto">
            {/* Logout button for all user types */}
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
    )
}