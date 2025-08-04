"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import { Button } from "@/components/ui/button";

interface ActionsProps {
    disabled: boolean;
    courseId: string;
    isPublished: boolean;
}

export const Actions = ({
    disabled,
    courseId,
    isPublished,
}: ActionsProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            if (isPublished) {
                await axios.patch(`/api/courses/${courseId}/unpublish`);
                toast.success("تم إلغاء النشر");
            } else {
                await axios.patch(`/api/courses/${courseId}/publish`);
                toast.success("تم نشر الدورة");
            }

            router.refresh();
        } catch {
            toast.error("حدث خطأ");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-x-2">
            <Button
                onClick={onClick}
                disabled={disabled || isLoading}
                variant="outline"
                size="sm"
            >
                {isPublished ? (
                    <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        إلغاء النشر
                    </>
                ) : (
                    <>
                        <Eye className="h-4 w-4 mr-2" />
                        نشر الدورة
                    </>
                )}
            </Button>
        </div>
    )
} 