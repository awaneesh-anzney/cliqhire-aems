"use client";

import { ForgotPassword } from "@/components/forgot-password/ForgotPassword";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ForgotPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl md:flex-row md:h-[600px]">
        {/* Left Side: Purple Banner */}
        <div className="relative flex flex-col justify-center bg-brand p-10 text-brand-foreground md:w-1/2 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 grid grid-cols-4 gap-2 opacity-50">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/60"></div>
            ))}
          </div>
          <div className="absolute top-20 left-10 opacity-30">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 50 Q 25 25 50 50 T 100 50" stroke="white" strokeWidth="1" fill="none" />
              <path d="M0 60 Q 30 30 60 60 T 100 60" stroke="white" strokeWidth="1" fill="none" />
              <path d="M0 70 Q 35 35 70 70 T 100 70" stroke="white" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <div className="absolute bottom-10 right-10 opacity-30 rotate-180">
            <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 50 Q 50 10 100 50 T 200 50" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M0 70 Q 60 20 120 70 T 200 70" stroke="white" strokeWidth="1" fill="none" />
              <path d="M0 90 Q 70 30 140 90 T 200 90" stroke="white" strokeWidth="0.5" fill="none" />
            </svg>
          </div>
          <div className="absolute bottom-20 left-10 rounded-full border border-white/30 h-6 w-6"></div>
          <div className="absolute top-1/3 right-1/4 rounded-full border border-white/30 h-4 w-4"></div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Password Recovery</h1>
            <p className="text-lg text-white/90 max-w-[280px]">
              Don&apos;t worry, it happens to the best of us. Let&apos;s get you back into your account.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-12 lg:p-16">
          <div className="mx-auto w-full max-w-sm">
            <ForgotPassword />
          </div>
        </div>
      </div>
    </div>
  );
}
