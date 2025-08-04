"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
    ssr: false,
    loading: () => <div className="w-full aspect-video flex items-center justify-center bg-muted rounded-md">
        <Video className="h-8 w-8 text-muted-foreground" />
    </div>
});

interface VideoFormProps {
    initialData: {
        videoUrl: string | null;
        muxData: {
            playbackId: string | null;
        } | null;
    };
    courseId: string;
    chapterId: string;
}

export const VideoForm = ({
    initialData,
    courseId,
    chapterId
}: VideoFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onSubmit = async (url: string) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload video');
            }

            toast.success("تم رفع الفيديو بنجاح");
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("[CHAPTER_VIDEO]", error);
            toast.error("حدث خطأ ما");
        }
    }

    if (!isMounted) {
        return null;
    }

    return (
        <div className="mt-6 border bg-card rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                فيديو الفصل
                <Button onClick={() => setIsEditing(!isEditing)} variant="ghost">
                    {isEditing ? (
                        <>إلغاء</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            تعديل الفيديو
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <div className="relative aspect-video mt-2">
                    {initialData.videoUrl && initialData.muxData?.playbackId ? (
                        <MuxPlayer
                            playbackId={initialData.muxData.playbackId}
                            metadata={{
                                video_id: chapterId,
                                video_title: `Chapter video for ${chapterId}`,
                            }}
                            className="w-full aspect-video"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-muted rounded-md">
                            <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                </div>
            )}
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="chapterVideo"
                        onChange={(res) => {
                            if (res?.url) {
                                onSubmit(res.url);
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        رفع فيديو هذا الفصل
                    </div>
                </div>
            )}
        </div>
    )
} 