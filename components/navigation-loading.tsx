"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";

interface NavigationLoadingProps {
  className?: string;
  showProgress?: boolean;
  progressColor?: string;
}

const NavigationLoadingContent = ({ 
  className,
  showProgress = true,
  progressColor = "#211FC3"
}: NavigationLoadingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start loading animation
    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 50);

    // Complete loading after a short delay
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 300);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className={cn("fixed top-0 left-0 w-full z-50", className)}>
      {/* Progress bar */}
      {showProgress && (
        <div 
          className="h-1 bg-primary/20 transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: progressColor
          }}
        />
      )}
      
      {/* Loading overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">
            جاري التحميل...
          </p>
        </div>
      </div>
    </div>
  );
};

export const NavigationLoading = (props: NavigationLoadingProps) => {
  return (
    <Suspense fallback={null}>
      <NavigationLoadingContent {...props} />
    </Suspense>
  );
}; 