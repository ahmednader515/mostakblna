"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NavigationLoading } from "@/components/navigation-loading";

interface NavigationLoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export const useNavigationLoading = () => {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error("useNavigationLoading must be used within NavigationLoadingProvider");
  }
  return context;
};

export const NavigationLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show loading when route changes
    setIsLoading(true);
    
    // Hide loading after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      <NavigationLoading />
    </NavigationLoadingContext.Provider>
  );
}; 