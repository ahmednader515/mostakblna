"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { PlyrVideoPlayer } from "@/components/plyr-video-player";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  isFree: boolean;
  videoUrl: string | null;
  videoType: "UPLOAD" | "YOUTUBE" | null;
  youtubeVideoId: string | null;
  nextChapterId?: string;
  previousChapterId?: string;
  nextContentType?: 'chapter' | 'quiz' | null;
  previousContentType?: 'chapter' | 'quiz' | null;
  userProgress?: {
    isCompleted: boolean;
  }[];
}

const ChapterPage = () => {
  const router = useRouter();
  const routeParams = useParams() as { courseId: string; chapterId: string };
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chapterResponse, progressResponse, accessResponse] = await Promise.all([
          axios.get(`/api/courses/${routeParams.courseId}/chapters/${routeParams.chapterId}`),
          axios.get(`/api/courses/${routeParams.courseId}/progress`),
          axios.get(`/api/courses/${routeParams.courseId}/access`)
        ]);
        
        setChapter(chapterResponse.data);
        setIsCompleted(chapterResponse.data.userProgress?.[0]?.isCompleted || false);
        setCourseProgress(progressResponse.data.progress);
        setHasAccess(accessResponse.data.hasAccess);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Error fetching data:", axiosError);
        if (axiosError.response) {
          console.error("Error response:", axiosError.response.data);
          toast.error(`فشل تحميل الفصل: ${axiosError.response.data}`);
        } else if (axiosError.request) {
          console.error("Error request:", axiosError.request);
          toast.error("فشل الاتصال بالخادم");
        } else {
          console.error("Error message:", axiosError.message);
          toast.error("حدث خطأ غير معروف");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [routeParams.courseId, routeParams.chapterId]);

  const toggleCompletion = async () => {
    try {
      if (isCompleted) {
        await axios.delete(`/api/courses/${routeParams.courseId}/chapters/${routeParams.chapterId}/progress`);
      } else {
        await axios.put(`/api/courses/${routeParams.courseId}/chapters/${routeParams.chapterId}/progress`);
      }
      setIsCompleted(!isCompleted);
      router.refresh();
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast.error("فشل تحديث التقدم");
    }
  };

  const onEnd = async () => {
    try {
      if (!isCompleted) {
        await axios.put(`/api/courses/${routeParams.courseId}/chapters/${routeParams.chapterId}/progress`);
        setIsCompleted(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error("فشل تحديث التقدم");
    }
  };

  const onNext = () => {
    if (chapter?.nextChapterId) {
      if (chapter.nextContentType === 'quiz') {
        router.push(`/courses/${routeParams.courseId}/quizzes/${chapter.nextChapterId}`);
      } else {
        router.push(`/courses/${routeParams.courseId}/chapters/${chapter.nextChapterId}`);
      }
    }
  };

  const onPrevious = () => {
    if (chapter?.previousChapterId) {
      if (chapter.previousContentType === 'quiz') {
        router.push(`/courses/${routeParams.courseId}/quizzes/${chapter.previousChapterId}`);
      } else {
        router.push(`/courses/${routeParams.courseId}/chapters/${chapter.previousChapterId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">لم يتم العثور على الفصل</div>
      </div>
    );
  }

  if (!hasAccess && !chapter.isFree) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-semibold">هذا الفصل مغلق</h2>
          <p className="text-muted-foreground">شراء الدورة للوصول إلى جميع الفصول</p>
          <Button onClick={() => router.push(`/courses/${routeParams.courseId}/purchase`)}>
            شراء الدورة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col gap-8">
          {/* Course Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">التقدم</span>
              <span className="text-sm font-medium">{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} className="h-2" />
          </div>

          {/* Video Player Section */}
          <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
            {chapter.videoUrl ? (
              <PlyrVideoPlayer
                videoUrl={chapter.videoType === "UPLOAD" ? chapter.videoUrl : undefined}
                youtubeVideoId={chapter.videoType === "YOUTUBE" ? chapter.youtubeVideoId : undefined}
                videoType={chapter.videoType || "UPLOAD"}
                className="w-full h-full"
                onEnded={onEnd}
                onTimeUpdate={(currentTime) => {
                  console.log("Video time update:", currentTime);
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                لا يوجد فيديو متاح
              </div>
            )}
          </div>

          {/* Chapter Information */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{chapter.title}</h1>
              <Button
                variant="outline"
                onClick={toggleCompletion}
                className="flex items-center gap-2"
              >
                {isCompleted ? (
                  <>
                    <span>لم يتم الإكمال</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </>
                ) : (
                  <>
                    <span>تم الإكمال</span>
                    <Circle className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: chapter.description || "" }} />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!chapter.previousChapterId}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              الفصل السابق
            </Button>

            <Button
              onClick={onNext}
              disabled={!chapter.nextChapterId}
              className="flex items-center gap-2"
            >
              الفصل التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterPage; 