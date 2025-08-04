"use client";

import MuxPlayer from "@mux/mux-player-react";
import { cn } from "@/lib/utils";

interface MuxPlayerProps {
    playbackId: string;
    className?: string;
}

export const MuxVideoPlayer = ({
    playbackId,
    className
}: MuxPlayerProps) => {
    return (
        <MuxPlayer
            playbackId={playbackId}
            className={cn("aspect-video", className)}
            metadata={{
                video_id: playbackId,
                video_title: playbackId,
            }}
        />
    );
} 