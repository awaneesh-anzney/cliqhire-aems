"use client";

/**
 * AuthGuard.tsx — Production Grade
 *
 * FIX LIST:
 *  1. isLoading state → AuthLoading show karo (yahi sahi jagah hai, AuthProvider mein nahi)
 *  2. !isAuthenticated pe AuthLoading show karo jab tak redirect nahi hota (flash prevent)
 *  3. returnUrl sessionStorage mein save karo — login ke baad wapas aane ke liye
 *  4. Redirect router.replace use karo (history stack pollute nahi hoga)
 */

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AuthLoading } from "./auth-loading";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auth check complete hone ke baad hi redirect karo
    if (!isLoading && !isAuthenticated) {
      // Current path save karo — login ke baad wapas aane ke liye
      if (pathname && pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("redirectAfterLogin", pathname);
        }
      }
      // replace taaki browser back button login pe nahi jaaye
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Auth check chal raha hai — loading dikhao
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <AuthLoading />
      </div>
    );
  }

  // Authenticated nahi — redirect ho raha hai, blank screen nahi dikhni chahiye
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <AuthLoading />
      </div>
    );
  }

  // Authenticated — children render karo
  return <>{children}</>;
}
