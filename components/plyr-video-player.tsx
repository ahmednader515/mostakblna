"use client";

import { useEffect, useRef } from "react";
import "video.js/dist/video-js.css";

interface PlyrVideoPlayerProps {
  videoUrl?: string;
  youtubeVideoId?: string;
  videoType?: "UPLOAD" | "YOUTUBE";
  className?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export const PlyrVideoPlayer = ({
  videoUrl,
  youtubeVideoId,
  videoType = "UPLOAD",
  className,
  onEnded,
  onTimeUpdate
}: PlyrVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  // Initialize Video.js on mount/update and dispose on unmount
  useEffect(() => {
    let isCancelled = false;

    async function setupPlayer() {
      if (!videoRef.current) return;

      // Dynamically import to be SSR-safe
      const videojsModule: any = await import("video.js");
      const videojs: any = videojsModule.default ?? videojsModule;

      // Load YouTube tech if needed
      if (videoType === "YOUTUBE") {
        try {
          await import("videojs-youtube");
        } catch {
          // ignore; plugin may already be registered
        }
      }

      if (isCancelled) return;

      const options: any = {
        controls: true,
        preload: "auto",
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        userActions: { hotkeys: true },
        html5: {
          vhs: { overrideNative: true },
          nativeAudioTracks: false,
          nativeVideoTracks: false
        }
      };

      if (videoType === "YOUTUBE" && youtubeVideoId) {
        options.techOrder = ["youtube", "html5"];
        options.sources = [
          { src: `https://www.youtube.com/watch?v=${youtubeVideoId}`, type: "video/youtube" }
        ];
        options.youtube = { rel: 0, modestbranding: 1, iv_load_policy: 3 };
      } else if (videoUrl) {
        options.sources = [{ src: videoUrl, type: "video/mp4" }];
      }

      // Dispose any previous instance
      if (playerRef.current && typeof playerRef.current.dispose === "function") {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      const player = videojs(videoRef.current, options);
      playerRef.current = player;

      if (onEnded) player.on("ended", onEnded);
      if (onTimeUpdate)
        player.on("timeupdate", () => onTimeUpdate(player.currentTime?.() || 0));
    }

    setupPlayer();

    return () => {
      isCancelled = true;
      if (playerRef.current && typeof playerRef.current.dispose === "function") {
        playerRef.current.dispose();
      }
      playerRef.current = null;
    };
  }, [videoUrl, youtubeVideoId, videoType, onEnded, onTimeUpdate]);

  const hasVideo = (videoType === "YOUTUBE" && !!youtubeVideoId) || !!videoUrl;

  if (!hasVideo) {
    return (
      <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className || ""}`}>
        <div className="text-muted-foreground">لا يوجد فيديو</div>
      </div>
    );
  }

  return (
    <div className={`aspect-video ${className || ""}`}>
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered w-full h-full"
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  );
};