"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [plyrInitialized, setPlyrInitialized] = useState(false);

  console.log("🔍 PlyrVideoPlayer render:", {
    videoUrl,
    youtubeVideoId,
    videoType,
    isClient,
    isInitializing,
    videoReady,
    plyrInitialized,
    hasVideoRef: !!videoRef.current,
    hasPlayerRef: !!playerRef.current
  });

  useEffect(() => {
    console.log("🔍 Setting isClient to true");
    setIsClient(true);
  }, []);

  const destroyPlayer = useCallback(() => {
    console.log("🔍 destroyPlayer called, has player:", !!playerRef.current);
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        console.log("🔍 Player destroyed successfully");
      } catch (error) {
        console.error("🔍 Error destroying Plyr:", error);
      }
      playerRef.current = null;
      setPlyrInitialized(false);
    }
  }, []);

  // Memoize the Plyr options to prevent unnecessary re-renders
  const plyrOptions = useMemo(() => ({
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
    fullscreen: { enabled: true, fallback: true, iosNative: true }
  }), []);

  const uploadedVideoOptions = useMemo(() => ({
    ...plyrOptions,
    captions: { active: true, language: 'auto', update: true },
    quality: { default: 720, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] }
  }), [plyrOptions]);

  const initPlyr = useCallback(async () => {
    console.log("🔍 initPlyr called:", {
      isClient,
      isInitializing,
      videoUrl,
      videoType,
      videoReady,
      plyrInitialized
    });

    if (!isClient || isInitializing || plyrInitialized) {
      console.log("🔍 initPlyr early return:", { isClient, isInitializing, plyrInitialized });
      return;
    }

    console.log("🔍 Starting Plyr initialization");
    setIsInitializing(true);
    
    try {
      console.log("🔍 Importing Plyr...");
      const Plyr = (await import("plyr")).default;
      console.log("🔍 Plyr imported successfully");
      
      // Destroy existing player if it exists
      destroyPlayer();

      // For YouTube videos
      if (videoType === "YOUTUBE" && youtubeVideoId) {
        console.log("🔍 Setting up YouTube video player with Plyr");
        
        // Find the YouTube embed container
        const embedContainer = document.querySelector('.plyr__video-embed') as HTMLElement;
        if (embedContainer) {
          console.log("🔍 Found YouTube embed container, initializing Plyr");
          
          // Create Plyr instance for YouTube
          playerRef.current = new Plyr(embedContainer, plyrOptions);
          console.log("🔍 Plyr YouTube instance created successfully");

          // Add event listeners
          if (onEnded) {
            console.log("🔍 Adding ended event listener for YouTube");
            playerRef.current.on('ended', onEnded);
          }

          if (onTimeUpdate) {
            console.log("🔍 Adding timeupdate event listener for YouTube");
            playerRef.current.on('timeupdate', () => {
              onTimeUpdate(playerRef.current?.currentTime || 0);
            });
          }

          console.log("🔍 Plyr YouTube initialization successful");
          setPlyrInitialized(true);
        } else {
          console.log("🔍 YouTube embed container not found");
        }
        setIsInitializing(false);
        return;
      }

      // For uploaded videos
      if (videoRef.current && videoUrl && videoReady) {
        console.log("🔍 Setting up uploaded video player");
        const videoElement = videoRef.current;
        
        console.log("🔍 Video element readyState:", videoElement.readyState);
        
        console.log("🔍 Creating Plyr instance");
        // Create Plyr instance
        playerRef.current = new Plyr(videoElement, uploadedVideoOptions);
        console.log("🔍 Plyr instance created successfully");

        // Add event listeners
        if (onEnded) {
          console.log("🔍 Adding ended event listener");
          playerRef.current.on('ended', onEnded);
        }

        if (onTimeUpdate) {
          console.log("🔍 Adding timeupdate event listener");
          playerRef.current.on('timeupdate', () => {
            onTimeUpdate(playerRef.current?.currentTime || 0);
          });
        }

        console.log("🔍 Plyr initialization successful");
        setPlyrInitialized(true);
      } else {
        console.log("🔍 No video element or URL available");
      }
    } catch (error) {
      console.error("🔍 Error initializing Plyr:", error);
    } finally {
      console.log("🔍 Setting isInitializing to false");
      setIsInitializing(false);
    }
  }, [isClient, videoType, youtubeVideoId, videoUrl, videoReady, plyrInitialized, destroyPlayer, plyrOptions, uploadedVideoOptions, onEnded, onTimeUpdate]);

  useEffect(() => {
    console.log("🔍 useEffect triggered for initPlyr");
    if (isClient && !plyrInitialized) {
      const timer = setTimeout(() => {
        console.log("🔍 Timer fired, calling initPlyr");
        initPlyr();
      }, 200); // Increased delay to ensure video is fully ready

      return () => {
        console.log("🔍 Cleaning up timer");
        clearTimeout(timer);
      };
    }
  }, [initPlyr, isClient, plyrInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🔍 Component unmounting, destroying player");
      destroyPlayer();
    };
  }, [destroyPlayer]);

  // Handle YouTube videos
  if (videoType === "YOUTUBE" && youtubeVideoId) {
    console.log("🔍 Rendering YouTube video with ID:", youtubeVideoId);
    return (
      <div className={`aspect-video ${className || ''}`}>
        <div
          className="plyr__video-embed"
          data-plyr-provider="youtube"
          data-plyr-embed-id={youtubeVideoId}
          data-plyr-config='{"youtube": {"modestbranding": 1, "rel": 0, "showinfo": 0, "controls": 1, "iv_load_policy": 3, "fs": 1}}'
        />
      </div>
    );
  }

  // Handle uploaded videos
  if (videoUrl) {
    console.log("🔍 Rendering uploaded video:", {
      isInitializing,
      videoUrl,
      videoReady,
      plyrInitialized
    });
    
    // Track when video element is created/destroyed
    useEffect(() => {
      console.log("🔍 Video element mounted/updated:", {
        videoUrl,
        hasVideoRef: !!videoRef.current,
        readyState: videoRef.current?.readyState
      });
      
      if (videoRef.current) {
        const videoElement = videoRef.current;
        
        const handleLoadedMetadata = () => {
          console.log("🔍 Video loadedmetadata event fired");
          setVideoReady(true);
        };
        
        const handleCanPlay = () => {
          console.log("🔍 Video canplay event fired");
          setVideoReady(true);
        };
        
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('canplay', handleCanPlay);
        
        // If video is already loaded, set ready immediately
        if (videoElement.readyState >= 1) {
          console.log("🔍 Video already loaded, setting ready");
          setVideoReady(true);
        }
        
        return () => {
          console.log("🔍 Video element will unmount");
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoElement.removeEventListener('canplay', handleCanPlay);
          setVideoReady(false);
          setPlyrInitialized(false);
        };
      }
    }, [videoUrl]);
    
    return (
      <div className={`aspect-video ${className || ''}`}>
        {isInitializing ? (
          // Show loading state while initializing
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-white">جاري تحميل الفيديو...</div>
          </div>
        ) : (
          <video
            ref={videoRef}
            crossOrigin="anonymous"
            playsInline
            onEnded={onEnded}
            onTimeUpdate={(e) => {
              if (onTimeUpdate) {
                onTimeUpdate(e.currentTarget.currentTime);
              }
            }}
            className="w-full h-full"
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  }

  // No video available
  console.log("🔍 No video available");
  return (
    <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className || ''}`}>
      <div className="text-muted-foreground">لا يوجد فيديو</div>
    </div>
  );
}; 