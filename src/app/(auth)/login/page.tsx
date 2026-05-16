"use client";

import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import { AuthLoading } from "@/components/auth-loading";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  if (!isLoading && isAuthenticated) {
    router.push('/dashboard');
    return <AuthLoading />;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoading />;
  }

  // Render login form when not authenticated
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[2.5rem] glass-card shadow-2xl md:flex-row md:min-h-[600px]">
      {/* Left Side: Brand Banner */}
      <div className="relative flex flex-col justify-center bg-brand/80 backdrop-blur-sm p-10 text-white md:w-1/2 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 grid grid-cols-4 gap-2 opacity-50 mix-blend-overlay">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/70"></div>
          ))}
        </div>
        <div className="absolute top-20 left-10 opacity-30 mix-blend-overlay">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50 Q 25 25 50 50 T 100 50" stroke="white" strokeWidth="2" fill="none" />
            <path d="M0 60 Q 30 30 60 60 T 100 60" stroke="white" strokeWidth="2" fill="none" />
            <path d="M0 70 Q 35 35 70 70 T 100 70" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-10 opacity-30 rotate-180 mix-blend-overlay">
          <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50 Q 50 10 100 50 T 200 50" stroke="white" strokeWidth="2" fill="none" />
            <path d="M0 70 Q 60 20 120 70 T 200 70" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M0 90 Q 70 30 140 90 T 200 90" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>
        <div className="absolute bottom-20 left-10 rounded-full border border-white/40 h-8 w-8 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 rounded-full border border-white/40 h-5 w-5 animate-bounce"></div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 drop-shadow-md">
            Welcome back!
          </h1>
          <p className="text-lg text-white/90 max-w-[320px] drop-shadow-sm font-medium">
            Sign in to access your dashboard and continue managing your workspace.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-12 lg:p-16 bg-background/50 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
