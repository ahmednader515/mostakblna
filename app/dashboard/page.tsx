import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Course, Purchase } from "@prisma/client";

type CourseWithProgress = Course & {
  chapters: { id: string }[];
  quizzes: { id: string }[];
  purchases: Purchase[];
  progress: number;
}

const CoursesPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/");
  }

  const courses = await db.course.findMany({
    where: {
      purchases: {
        some: {
          userId: session.user.id,
          status: "ACTIVE"
        }
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
      quizzes: {
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
      const totalQuizzes = course.quizzes.length;
      const totalContent = totalChapters + totalQuizzes;

      const completedChapters = await db.userProgress.count({
        where: {
          userId: session.user.id,
          chapterId: {
            in: course.chapters.map(chapter => chapter.id)
          },
          isCompleted: true
        }
      });

      // Get unique completed quizzes by using findMany and counting the results
      const completedQuizResults = await db.quizResult.findMany({
        where: {
          studentId: session.user.id,
          quizId: {
            in: course.quizzes.map(quiz => quiz.id)
          }
        },
        select: {
          quizId: true
        }
      });

      // Count unique quizIds
      const uniqueQuizIds = new Set(completedQuizResults.map(result => result.quizId));
      const completedQuizzes = uniqueQuizIds.size;

      const completedContent = completedChapters + completedQuizzes;

      const progress = totalContent > 0 
        ? (completedContent / totalContent) * 100 
        : 0;

      return {
        ...course,
        progress
      } as CourseWithProgress;
    })
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">دوراتي</h1>
        <p className="text-muted-foreground">استمر من حيث وقفت</p>
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
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 h-[3.5rem]">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <BookOpen className="h-4 w-4" />
                <span>
                  {course.chapters.length} {course.chapters.length === 1 ? "فصل" : "فصول"}
                  {course.quizzes.length > 0 && (
                    <span className="mr-2">، {course.quizzes.length} {course.quizzes.length === 1 ? "اختبار" : "اختبارات"}</span>
                  )}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">التقدم</span>
                  <span className="font-medium">{Math.round(course.progress)}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
              <Button 
                className="w-full bg-[#211FC3] hover:bg-[#211FC3]/90 text-white" 
                variant="default"
                asChild
              >
                <Link href={course.chapters.length > 0 ? `/courses/${course.id}/chapters/${course.chapters[0].id}` : `/courses/${course.id}`}>
                  {course.progress === 100 ? "مراجعة الدورة" : "متابعة التعلم"}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      {coursesWithProgress.length === 0 && (
        <div className="text-center py-10">
          <div className="text-muted-foreground mb-4">لم تقم بشراء أي دورات بعد</div>
                        <Button asChild className="bg-[#211FC3] hover:bg-[#211FC3]/90 text-white">
            <Link href="/dashboard/search">
              استكشف الدورات المتاحة
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default CoursesPage; 