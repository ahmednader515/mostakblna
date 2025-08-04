import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { SearchInput } from "./_components/search-input";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Course, Purchase } from "@prisma/client";

type CourseWithDetails = Course & {
    chapters: { id: string }[];
    purchases: Purchase[];
    progress: number;
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return redirect("/");
    }

    const resolvedParams = await searchParams;
    const title = typeof resolvedParams.title === 'string' ? resolvedParams.title : '';

    const courses = await db.course.findMany({
        where: {
            isPublished: true,
            title: {
                contains: title,
            }
        },
        include: {
            chapters: {
                where: {
                    isPublished: true,
                },
                select: {
                    id: true,
                }
            },
            purchases: {
                where: {
                    userId: session.user.id,
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    const coursesWithProgress = await Promise.all(
        courses.map(async (course) => {
            const totalChapters = course.chapters.length;
            const completedChapters = await db.userProgress.count({
                where: {
                    userId: session.user.id,
                    chapterId: {
                        in: course.chapters.map(chapter => chapter.id)
                    },
                    isCompleted: true
                }
            });

            const progress = totalChapters > 0 
                ? (completedChapters / totalChapters) * 100 
                : 0;

            return {
                ...course,
                progress
            } as CourseWithDetails;
        })
    );

    return (
        <>
            <div className="px-6 pt-6 md:hidden md:mb-0 block">
                <SearchInput />
            </div>
            <div className="p-6 space-y-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">البحث عن الدورات</h1>
                    <p className="text-muted-foreground">
                        {title 
                            ? `نتائج البحث عن "${title}"`
                            : "اكتشف مجموعة متنوعة من الدورات التعليمية المميزة"
                        }
                    </p>
                </div>
                <div className="hidden md:block mb-6">
                    <SearchInput />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {coursesWithProgress.map((course) => (
                        <div
                            key={course.id}
                            className="group bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="relative w-full aspect-video">
                                <Image
                                    src={course.imageUrl || "/placeholder.png"}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-4 flex flex-col justify-between h-[calc(400px-56.25%)]">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 min-h-[3.5rem] line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{course.chapters.length} {course.chapters.length === 1 ? "فصل" : "فصول"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>آخر تحديث: {new Date(course.updatedAt).toLocaleDateString('ar', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>{course.purchases.length} طالب</span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    className="w-full bg-[#211FC3] hover:bg-[#211FC3]/90 text-white" 
                                    variant={course.purchases.length > 0 ? "secondary" : "default"}
                                    asChild
                                >
                                    <Link href={course.chapters.length > 0 ? `/courses/${course.id}/chapters/${course.chapters[0].id}` : `/courses/${course.id}`}>
                                        {course.purchases.length > 0 ? "متابعة التعلم" : "عرض الدورة"}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                {coursesWithProgress.length === 0 && (
                    <div className="text-center py-10">
                        <div className="text-muted-foreground mb-4">لم يتم العثور على دورات</div>
                        <Button asChild className="bg-[#211FC3] hover:bg-[#211FC3]/90 text-white">
                            <Link href="/dashboard/search">
                                عرض جميع الدورات
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}