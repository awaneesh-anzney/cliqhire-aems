"use client";

/**
 * app/(auth)/login/page.tsx — Login Page (Production Grade)
 *
 * FIX LIST:
 *  1. router.push ke baad return <AuthLoading /> → useEffect se redirect (Next.js best practice)
 *  2. redirectAfterLogin sessionStorage se pick karo — login ke baad sahi page pe jaao
 *  3. router.replace use karo taaki login page history mein na rahe
 */

import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthLoading } from "@/components/auth-loading";
import { Layers } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Login ke baad stored redirect path check karo
      const returnUrl =
        typeof window !== "undefined" ? sessionStorage.getItem("redirectAfterLogin") : null;

      if (returnUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.replace(returnUrl);
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Auth check chal raha hai
  if (isLoading) {
    return <AuthLoading />;
  }

  // Already authenticated — redirect ho raha hai, blank nahi dikhna chahiye
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <AuthLoading />
      </div>
    );
  }

  // Not authenticated — login form dikhao
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background animate-in fade-in duration-500">
      {/* Left Side: Brand Banner */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between bg-primary p-12 text-white overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/10 shadow-sm">
            <Layers className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-black tracking-wider uppercase">CliqHire</span>
        </div>

        {/* Welcome text */}
        <div className="relative z-10 space-y-4 max-w-md my-auto animate-in slide-in-from-left-6 duration-700">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Welcome back!
          </h1>
          <p className="text-sm text-white/90 leading-relaxed font-bold">
            Sign in to access your dashboard, monitor analytics, and continue managing your
            workspace seamlessly.
          </p>
        </div>

        {/* Copyright */}
        <div className="relative z-10 text-[10px] font-black text-white/60 uppercase tracking-widest">
          © {new Date().getFullYear()} CliqHire. All rights reserved.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 md:px-16 lg:px-24 bg-card animate-in slide-in-from-right-6 duration-700">
        <div className="mx-auto w-full max-w-[360px]">
          <div className="mb-7 space-y-1.5">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Sign In</h1>
            <p className="text-xs text-muted-foreground font-bold leading-normal">
              Please enter your details to access your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
