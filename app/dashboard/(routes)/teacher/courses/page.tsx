import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CoursesTable } from "./_components/courses-table";
import { columns } from "./_components/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

const CoursesPage = async () => {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const courses = await db.course.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    }).then(courses => courses.map(course => ({
        ...course,
        price: course.price || 0
    })));

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">الدورات الخاصة بك</h1>
                <Link href="/dashboard/teacher/courses/create">
                    <Button className="bg-[#211FC3] hover:bg-[#211FC3]/90 text-white">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        إنشاء دورة جديدة
                    </Button>
                </Link>
            </div>
            <div className="mt-6">
                <CoursesTable columns={columns} data={courses} />
            </div>
        </div>
    );
};

export default CoursesPage;