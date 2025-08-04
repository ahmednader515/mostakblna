"use client";

import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !videoRef.current) return;

    // Dynamically import Plyr only on client side
    const initPlyr = async () => {
      const Plyr = (await import("plyr")).default;
      
      // Destroy existing player if it exists
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      const videoElement = videoRef.current;
      
      // Configure Plyr options
      const options = {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        captions: { active: true, language: 'auto', update: true },
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        quality: { default: 720, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] }
      };

      // Create Plyr instance
      if (videoElement) {
        playerRef.current = new Plyr(videoElement, options);
      }

      // Add event listeners
      if (onEnded) {
        playerRef.current.on('ended', onEnded);
      }

      if (onTimeUpdate) {
        playerRef.current.on('timeupdate', () => {
          onTimeUpdate(playerRef.current?.currentTime || 0);
        });
      }
    };

    initPlyr();

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isClient, videoUrl, youtubeVideoId, videoType, onEnded, onTimeUpdate]);

  // Handle YouTube videos
  if (videoType === "YOUTUBE" && youtubeVideoId) {
    return (
      <div className={`aspect-video ${className || ''}`}>
        <div
          className="plyr__video-embed"
          data-plyr-provider="youtube"
          data-plyr-embed-id={youtubeVideoId}
        />
      </div>
    );
  }

  // Handle uploaded videos
  if (videoUrl) {
    return (
      <div className={`aspect-video ${className || ''}`}>
        <video
          ref={videoRef}
          crossOrigin="anonymous"
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // No video available
  return (
    <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className || ''}`}>
      <div className="text-muted-foreground">لا يوجد فيديو</div>
    </div>
  );
}; 