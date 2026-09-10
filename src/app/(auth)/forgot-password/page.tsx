"use client";

import { ForgotPassword } from "@/components/forgot-password/ForgotPassword";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthLoading } from "@/components/auth-loading";
import { Layers } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
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
              Recover your <br/> account.
            </h1>
            <p className="text-base text-white/80 font-medium leading-relaxed">
              Don&apos;t worry, account recovery is simple and secure. Request a reset link and regain immediate access to your workspace.
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

        {/* Right Side: Forgot Password Form */}
        <div className="flex flex-1 flex-col justify-center items-center p-8 md:p-16 relative bg-background text-foreground">
          {/* Subtle background glow for the right half */}
          <div className="absolute top-[-10%] right-[-10%] h-[50vw] w-[50vw] max-w-[600px] max-h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[50vw] w-[50vw] max-w-[600px] max-h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {isLoading || isAuthenticated ? (
            <AuthLoading />
          ) : (
            <div className="w-full max-w-[420px] relative z-10 animate-in slide-in-from-right-8 duration-700 fade-in">
              <ForgotPassword />

              <div className="mt-12 text-center">
                <p className="text-xs text-muted-foreground font-medium">
                  Need help recovering access?{" "}
                  <a href="#" className="text-primary hover:underline font-bold transition-all">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
