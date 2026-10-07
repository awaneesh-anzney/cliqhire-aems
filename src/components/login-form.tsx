"use client";

/**
 * login-form.tsx — Enterprise ATS Login Form
 *
 * Preserves all authentication logic, react-hook-form validation,
 * zod schema, and remember-me functionality while elevating the visual
 * presentation to an enterprise-grade standard.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoginLoading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedPassword = localStorage.getItem("rememberedPassword");
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      if (rememberedPassword) {
        form.setValue("password", rememberedPassword);
      }
      form.setValue("remember", true);
    }
  }, [form]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(values.email, values.password);

      if (success) {
        toast.success("Login successful!");

        if (typeof window !== "undefined") {
          if (values.remember) {
            localStorage.setItem("rememberedEmail", values.email);
            localStorage.setItem("rememberedPassword", values.password);
          } else {
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("rememberedPassword");
          }
        }

        form.reset();
        // Redirect is handled by LoginPage useEffect
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("[LoginForm] submit error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSocialAuth = (provider: string) => {
    toast.info(`${provider} Single Sign-On is managed by your workspace administrator.`);
  };

  return (
    <div className={cn("w-full font-sans", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Address Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs sm:text-sm font-semibold text-[#172033] dark:text-slate-200">
                  Email address
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#64748B] group-focus-within:text-[#2563EB] transition-colors pointer-events-none" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-11 h-[52px] rounded-[12px] bg-white dark:bg-[#131E3D] border border-[#DCE4EE] dark:border-slate-800 text-[14px] text-[#172033] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 shadow-[0_2px_6px_rgba(15,23,42,0.03)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.25)] focus-visible:ring-4 focus-visible:ring-[#2563EB]/[0.08] dark:focus-visible:ring-[#3B82F6]/[0.25] focus-visible:border-[#2563EB] dark:focus-visible:border-[#3B82F6] transition-all font-normal"
                      disabled={isLoginLoading}
                      autoComplete="email"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium text-rose-500 mt-1" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs sm:text-sm font-semibold text-[#172033] dark:text-slate-200">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#64748B] group-focus-within:text-[#2563EB] dark:group-focus-within:text-[#38BDF8] transition-colors pointer-events-none" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-11 pr-11 h-[52px] rounded-[12px] bg-white dark:bg-[#131E3D] border border-[#DCE4EE] dark:border-slate-800 text-[14px] text-[#172033] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 shadow-[0_2px_6px_rgba(15,23,42,0.03)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.25)] focus-visible:ring-4 focus-visible:ring-[#2563EB]/[0.08] dark:focus-visible:ring-[#3B82F6]/[0.25] focus-visible:border-[#2563EB] dark:focus-visible:border-[#3B82F6] transition-all font-normal"
                      disabled={isLoginLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#334155] dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium text-rose-500 mt-1" />
              </FormItem>
            )}
          />

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoginLoading}
                      className="h-4 w-4 rounded-[4px] border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-[#131E3D] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
                    />
                  </FormControl>
                  <label
                    htmlFor="remember"
                    className="text-[13px] font-medium text-[#475569] dark:text-slate-300 cursor-pointer select-none hover:text-[#172033] dark:hover:text-white transition-colors"
                  >
                    Remember me
                  </label>
                </FormItem>
              )}
            />
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-[#2563EB] dark:text-[#38BDF8] hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary Submit Button */}
          <Button
            type="submit"
            className="w-full h-[52px] rounded-[12px] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] active:translate-y-px text-white font-semibold text-[15px] shadow-[0_8px_20px_rgba(37,99,235,0.20)] dark:shadow-[0_8px_20px_rgba(37,99,235,0.35)] transition-all duration-150 mt-2"
            disabled={isLoginLoading}
          >
            {isLoginLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          {/* Subtle Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-[#E2E8F0] dark:border-slate-800" />
            <span className="absolute bg-[#F8FAFC] dark:bg-[#0B132B] px-3 text-xs font-medium text-[#94A3B8] dark:text-slate-400">
              or
            </span>
          </div>

          {/* Social SSO / Enterprise Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSocialAuth("Google")}
              className="h-[48px] px-3.5 rounded-[12px] bg-white dark:bg-[#131E3D] border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center gap-2.5 text-xs font-semibold text-[#334155] dark:text-slate-200 shadow-2xs hover:bg-[#F8FAFC] dark:hover:bg-[#1A274E] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialAuth("Microsoft")}
              className="h-[48px] px-3.5 rounded-[12px] bg-white dark:bg-[#131E3D] border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center gap-2.5 text-xs font-semibold text-[#334155] dark:text-slate-200 shadow-2xs hover:bg-[#F8FAFC] dark:hover:bg-[#1A274E] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150"
            >
              {/* Microsoft 4-square SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span>Continue with Microsoft</span>
            </button>
          </div>

          {/* Support Link */}
          <div className="pt-2 text-center">
            <p className="text-[13px] text-[#64748B] dark:text-slate-400">
              Need help signing in?{" "}
              <a
                href="mailto:support@cliqhire.com"
                className="font-semibold text-[#2563EB] dark:text-[#38BDF8] hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] transition-colors"
              >
                Contact Support
              </a>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
