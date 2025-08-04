import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { MuxVideo } from "@/lib/mux";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        const { userId } = await auth();
        const resolvedParams = await params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: resolvedParams.courseId,
                userId,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { url } = await req.json();

        if (!url) {
            return new NextResponse("Missing URL", { status: 400 });
        }

        // Create a new asset in Mux
        const asset = await MuxVideo.assets.create({
            inputs: [{ url }],
            playback_policy: ["public"],
            mp4_support: "none"
        });

        // Create MuxData record
        const muxData = await db.muxData.create({
            data: {
                assetId: asset.id,
                playbackId: asset.playback_ids?.[0]?.id,
                chapterId: resolvedParams.chapterId,
            }
        });

        // Update chapter with video URL
        await db.chapter.update({
            where: {
                id: resolvedParams.chapterId,
                courseId: resolvedParams.courseId,
            },
            data: {
                videoUrl: url,
                muxData: {
                    connect: {
                        id: muxData.id
                    }
                }
            }
        });

        return NextResponse.json({ 
            uploadId: asset.id, 
            url: url,
            playbackId: asset.playback_ids?.[0]?.id 
        });
    } catch (error) {
        console.log("[CHAPTER_UPLOAD]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 