"use client";

import { BarChart, Compass, Layout, List, Wallet, Shield, Users, Eye, TrendingUp, BookOpen, FileText, Award } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";

const guestRoutes = [
    {
        icon: Layout,
        label: "لوحة التحكم",
        href: "/dashboard",
    },
    {
        icon: Compass,
        label: "الكورسات",
        href: "/dashboard/search",
    },
    {
        icon: Wallet,
        label: "الرصيد",
        href: "/dashboard/balance",
    },
];

const teacherRoutes = [
    {
        icon: List,
        label: "الكورسات",
        href: "/dashboard/teacher/courses",
    },
    {
        icon: FileText,
        label: "الاختبارات",
        href: "/dashboard/teacher/quizzes",
    },
    {
        icon: Award,
        label: "الدرجات",
        href: "/dashboard/teacher/grades",
    },
    {
        icon: BarChart,
        label: "الاحصائيات",
        href: "/dashboard/teacher/analytics",
    },
];

const adminRoutes = [
    {
        icon: Users,
        label: "إدارة المستخدمين",
        href: "/dashboard/admin/users",
    },
    {
        icon: Eye,
        label: "كلمات المرور",
        href: "/dashboard/admin/passwords",
    },
    {
        icon: Wallet,
        label: "إدارة الأرصدة",
        href: "/dashboard/admin/balances",
    },
    {
        icon: TrendingUp,
        label: "تقدم الطلاب",
        href: "/dashboard/admin/progress",
    },
    {
        icon: BookOpen,
        label: "إضافة الكورسات",
        href: "/dashboard/admin/add-courses",
    },
];

export const SidebarRoutes = () => {
    const pathName = usePathname();

    const isTeacherPage = pathName?.includes("/dashboard/teacher");
    const isAdminPage = pathName?.includes("/dashboard/admin");
    const routes = isAdminPage ? adminRoutes : isTeacherPage ? teacherRoutes : guestRoutes;

    return (
        <div className="flex flex-col w-full pt-0">
            {routes.map((route) => (
                <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
            ))}
        </div>
    );
}