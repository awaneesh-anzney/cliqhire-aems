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
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* Abstract Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[50vw] w-[50vw] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[50vw] w-[50vw] rounded-full bg-blue-500/10 blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col md:flex-row bg-card/60 backdrop-blur-xl animate-in fade-in duration-700">
        {/* Left Side: Brand Banner */}
        <div className="relative hidden md:flex md:w-1/2 flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-primary/90 to-primary">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          
          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-lg">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-widest text-white uppercase">CliqHire</span>
          </div>

          {/* Welcome text */}
          <div className="relative z-10 space-y-6 max-w-md my-auto">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Empower your <br/> workspace.
            </h1>
            <p className="text-base text-white/80 font-medium leading-relaxed">
              Log in to your dashboard to monitor analytics, manage projects, and collaborate with your team in real-time.
            </p>
          </div>

          {/* Trusted Info & Copyright */}
          <div className="relative z-10 mt-auto space-y-6">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10 w-fit">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-primary/50 bg-white/20 backdrop-blur-md" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-white/90">Trusted by top professionals</p>
              </div>
            </div>
            <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">
              © {new Date().getFullYear()} CliqHire. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-1 flex-col justify-center p-8 md:p-16 bg-card/80 backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5 pointer-events-none" />
          <div className="mx-auto w-full max-w-[380px] relative z-10">
            <div className="mb-8 space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight text-foreground">Welcome back</h2>
              <p className="text-sm font-medium text-muted-foreground">
                Please enter your details to access your account.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
