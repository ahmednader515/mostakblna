"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseNavigationLoadingReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  navigateWithLoading: (href: string, options?: { replace?: boolean }) => Promise<void>;
}

export const useNavigationLoading = (): UseNavigationLoadingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const navigateWithLoading = useCallback(async (
    href: string, 
    options: { replace?: boolean } = {}
  ) => {
    try {
      startLoading();
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (options.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      // Stop loading after navigation
      setTimeout(() => {
        stopLoading();
      }, 500);
    }
  }, [router, startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    navigateWithLoading
  };
}; 