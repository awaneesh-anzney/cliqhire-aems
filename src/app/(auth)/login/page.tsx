"use client";

/**
 * app/(auth)/login/page.tsx — CliqHire Enterprise ATS Login Page
 *
 * Full-screen split-layout redesign with vibrant blue branding panel,
 * authentic local CliqHire asset, 3D interactive dashboard preview,
 * trust credentials, and modern enterprise login form.
 */

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/login-form";
import { AuthLoading } from "@/components/auth-loading";
import {
  Users,
  Briefcase,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Home,
  Sun,
  Moon,
  Globe,
  ChevronDown,
} from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnUrl =
        typeof window !== "undefined"
          ? sessionStorage.getItem("redirectAfterLogin")
          : null;

      if (returnUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.replace(returnUrl);
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const isDark = (resolvedTheme ?? theme) === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const languages = ["English", "Spanish", "French", "German"];

  return (
    <div className="relative w-full h-screen min-h-screen max-h-screen overflow-hidden flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-[#0B132B] font-sans select-none">
      {/* ════════════════════════════════════════════════════════════════════════
          LEFT PANEL: BRANDING & PRODUCT EXPERIENCE (52–54% width on desktop)
          ════════════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[54%] h-full flex-col justify-between p-8 xl:p-11 relative overflow-hidden text-white shrink-0 z-20 shadow-[8px_0_30px_rgba(15,23,42,0.06)]"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.18), transparent 28%), radial-gradient(circle at 10% 85%, rgba(59, 130, 246, 0.16), transparent 30%), linear-gradient(135deg, #2563EB 0%, #2458D9 45%, #1D4ED8 100%)",
        }}
      >
        {/* Subtle Decorative Geometric Lines, Curves & Ambient Depth */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="diagonal-lines"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
          <circle cx="90%" cy="15%" r="220" fill="none" stroke="white" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="85%" cy="15%" r="340" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="15%" cy="85%" r="180" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 6" />
        </svg>

        {/* Very soft blurred radial circles for depth */}
        <div className="absolute top-1/4 -right-12 w-72 h-72 rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-12 w-72 h-72 rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />

        {/* ─── 1. TOP BRAND HEADER ─── */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Logo Mark: 46px x 46px from /public/cliqhire-f.png */}
          <div className="relative flex shrink-0 items-center justify-center">
            <Image
              src="/cliqhire-f.png"
              alt="CliqHire"
              width={46}
              height={46}
              priority
              className="w-[46px] h-[46px] object-contain rounded-[12px] shadow-sm shadow-blue-950/30 ring-1 ring-white/20"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[20px] font-extrabold tracking-tight text-white leading-tight">
              CliqHire
            </span>
            <span className="text-[11.5px] font-medium text-white/80 tracking-normal mt-0.5">
              Talent Acquisition Management System
            </span>
          </div>
        </div>

        {/* ─── 2. MAIN HEADLINE & FEATURES GRID ─── */}
        <div className="relative z-10 my-auto py-3 space-y-5 max-w-[620px]">
          {/* Main Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl xl:text-[46px] font-extrabold tracking-tight text-white leading-[1.08]">
              Empower Your{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#22D3EE] to-[#38BDF8]">
                Recruitment Journey
              </span>
            </h1>
            <p className="text-[14.5px] sm:text-[15.5px] text-white/80 font-normal leading-relaxed max-w-[500px]">
              Streamline hiring, manage talent, and build high-performing teams
              with a powerful and intuitive ATS.
            </p>
          </div>

          {/* 4 Feature Benefit Blocks (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Feature 1 */}
            <div className="flex items-start gap-3 p-2.5 rounded-[12px] bg-white/[0.08] border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-colors">
              <div className="w-9 h-9 rounded-[10px] bg-white/[0.10] flex items-center justify-center text-white shrink-0">
                <Users className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-[13px] font-semibold text-white block">
                  Manage Candidates
                </span>
                <span className="text-[11.5px] text-white/70 block mt-0.5 leading-snug">
                  Track and engage top talent effortlessly.
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3 p-2.5 rounded-[12px] bg-white/[0.08] border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-colors">
              <div className="w-9 h-9 rounded-[10px] bg-white/[0.10] flex items-center justify-center text-white shrink-0">
                <Briefcase className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-[13px] font-semibold text-white block">
                  Streamline Hiring
                </span>
                <span className="text-[11.5px] text-white/70 block mt-0.5 leading-snug">
                  From requisition to offer, all in one place.
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3 p-2.5 rounded-[12px] bg-white/[0.08] border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-colors">
              <div className="w-9 h-9 rounded-[10px] bg-white/[0.10] flex items-center justify-center text-white shrink-0">
                <BarChart3 className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-[13px] font-semibold text-white block">
                  Real-time Insights
                </span>
                <span className="text-[11.5px] text-white/70 block mt-0.5 leading-snug">
                  Make data-driven hiring decisions.
                </span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3 p-2.5 rounded-[12px] bg-white/[0.08] border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-colors">
              <div className="w-9 h-9 rounded-[10px] bg-white/[0.10] flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-[13px] font-semibold text-white block">
                  Collaborate Securely
                </span>
                <span className="text-[11.5px] text-white/70 block mt-0.5 leading-snug">
                  Work with your team in real-time.
                </span>
              </div>
            </div>
          </div>

          {/* ─── FLOATING 3D PERSPECTIVE DASHBOARD PREVIEW MOCKUP ─── */}
          <div className="relative pt-1 w-full select-none pointer-events-none hidden xl:block">
            {/* Orbital Dashed Arc Line */}
            <svg
              className="absolute -top-10 right-4 w-[340px] h-[280px] pointer-events-none z-0 opacity-25"
              viewBox="0 0 340 280"
            >
              <path
                d="M 10 240 A 180 180 0 0 1 310 20"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
            </svg>

            {/* Floating Orbs along the orbit */}
            <div
              className="absolute -top-7 right-32 z-20 w-8 h-8 rounded-full bg-white/[0.92] dark:bg-slate-900/92 border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#2563EB] animate-bounce"
              style={{ animationDuration: "4s" }}
            >
              <Users className="w-4 h-4 text-[#2563EB]" />
            </div>

            <div
              className="absolute -top-2 right-6 z-20 w-8 h-8 rounded-full bg-white/[0.92] dark:bg-slate-900/92 border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#2563EB] animate-bounce"
              style={{ animationDuration: "5s" }}
            >
              <Briefcase className="w-4 h-4 text-[#2563EB]" />
            </div>

            <div
              className="absolute top-24 -right-2 z-20 w-8 h-8 rounded-full bg-white/[0.92] dark:bg-slate-900/92 border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#06B6D4] animate-bounce"
              style={{ animationDuration: "4.5s" }}
            >
              <BarChart3 className="w-4 h-4 text-[#06B6D4]" />
            </div>

            {/* Main Mockup Card Container */}
            <div
              className="relative z-10 rounded-[18px] bg-white/[0.95] dark:bg-slate-900/95 border border-white/[0.22] shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-[8px] p-3 text-[#172033] dark:text-slate-100 flex gap-2.5 origin-bottom-left max-w-[480px]"
              style={{
                transform:
                  "perspective(1200px) rotateY(-8deg) rotateX(4deg) rotateZ(0.5deg)",
              }}
            >
              {/* Mini Sidebar */}
              <div className="w-[95px] shrink-0 border-r border-slate-100 dark:border-slate-800 pr-2 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Image
                      src="/cliqhire-f.png"
                      alt="CliqHire"
                      width={16}
                      height={16}
                      className="w-[16px] h-[16px] rounded-[4px]"
                    />
                    <span className="text-[10px] font-bold tracking-tight text-[#172033] dark:text-white">
                      CliqHire
                    </span>
                  </div>
                  <div className="space-y-0.5 mt-1.5">
                    <div className="h-5 px-1.5 rounded-md bg-[#2563EB] text-white flex items-center gap-1 text-[9px] font-semibold">
                      <Home className="w-2.5 h-2.5" />
                      <span>Home</span>
                    </div>
                    {["Leads", "Candidates", "Jobs", "Clients", "Reports"].map(
                      (label, idx) => (
                        <div
                          key={idx}
                          className="h-4 px-1.5 rounded text-slate-500 flex items-center gap-1 text-[8.5px] font-medium"
                        >
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{label}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Mini Dashboard Workspace */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-[#172033] dark:text-white flex items-center gap-1">
                    Welcome back, Sarah! 👋
                  </span>
                  <span className="text-[8px] text-[#64748B] block">
                    Here&apos;s what&apos;s happening with recruitment today.
                  </span>
                </div>

                {/* 2 Metric Cards */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-1.5 rounded-md bg-[#EFF6FF] border border-[#DBEAFE] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-semibold text-[#2563EB]">
                        Candidate Pool
                      </span>
                      <span className="text-[7px] font-bold text-[#10B981] bg-emerald-50 px-1 rounded">
                        ↑ 12%
                      </span>
                    </div>
                    <div className="text-[13px] font-extrabold text-[#172033] leading-none">
                      4,484
                    </div>
                  </div>

                  <div className="p-1.5 rounded-md bg-[#F5F3FF] border border-[#EDE9FE] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-semibold text-[#8B5CF6]">
                        Job Requisitions
                      </span>
                      <span className="text-[7px] font-bold text-[#10B981] bg-emerald-50 px-1 rounded">
                        ↑ 8%
                      </span>
                    </div>
                    <div className="text-[13px] font-extrabold text-[#172033] leading-none">
                      207
                    </div>
                  </div>
                </div>

                {/* Mini Recruitment Pipeline */}
                <div className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[8.5px] font-bold text-[#334155] dark:text-slate-300 block">
                    Recruitment Pipeline
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="p-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-center">
                      <span className="text-[7px] font-medium text-[#2563EB] block">
                        Sourcing
                      </span>
                      <span className="text-[9px] font-bold text-[#172033]">
                        446
                      </span>
                    </div>
                    <div className="p-1 rounded bg-[#FDF2F8] border border-[#FBCFE8] text-center">
                      <span className="text-[7px] font-medium text-[#EC4899] block">
                        Screening
                      </span>
                      <span className="text-[9px] font-bold text-[#172033]">
                        91
                      </span>
                    </div>
                    <div className="p-1 rounded bg-[#FFFBEB] border border-[#FDE68A] text-center">
                      <span className="text-[7px] font-medium text-[#F59E0B] block">
                        Client Scr
                      </span>
                      <span className="text-[9px] font-bold text-[#172033]">
                        49
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge: Hire Faster */}
            <div
              className="absolute -bottom-3 -left-4 z-30 p-2 px-3 rounded-[12px] bg-white/[0.92] dark:bg-slate-900/92 border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex items-center gap-2 animate-pulse"
              style={{ animationDuration: "3.5s" }}
            >
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#172033] dark:text-white block leading-tight">
                  Hire Faster
                </span>
                <span className="text-[9px] text-[#64748B] block leading-tight">
                  Build Stronger Teams
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. BOTTOM TRUST CARD & FOOTER ─── */}
        <div className="relative z-10 pt-2 space-y-3.5">
          {/* Trust Social Proof Box */}
          <div className="rounded-[14px] bg-white/[0.10] backdrop-blur-md border border-white/[0.16] px-3.5 py-2.5 w-fit flex items-center gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
            {/* 4 Overlapping Avatars */}
            <div className="flex -space-x-2 shrink-0">
              <div className="w-7 h-7 rounded-full border-2 border-[#1D4ED8] bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                JD
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-[#1D4ED8] bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700">
                SK
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-[#1D4ED8] bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                AL
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-[#1D4ED8] bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                MR
              </div>
            </div>
            <span className="text-[12px] font-medium text-white/90 leading-tight">
              Trusted by recruitment professionals across the globe.
            </span>
          </div>

          {/* Copyright & Links */}
          <div className="flex items-center justify-between text-[11px] text-white/[0.65] pt-1 border-t border-white/10">
            <span>© 2026 CliqHire. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="text-white/[0.80] hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-white/40">•</span>
              <Link href="/terms" className="text-white/[0.80] hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-white/40">•</span>
              <Link href="/support" className="text-white/[0.80] hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          RIGHT PANEL: LOGIN FORM (46–48% width on desktop)
          ════════════════════════════════════════════════════════════════════════ */}
      <div
        className="flex-1 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-10 xl:p-12 relative overflow-y-auto"
        style={{
          background:
            "radial-gradient(circle at 85% 10%, rgba(37,99,235,0.06), transparent 24%), radial-gradient(circle at 15% 90%, rgba(6,182,212,0.04), transparent 25%), #F8FAFC",
        }}
      >
        {/* Soft Decorative Ambient Depth on Right Side */}
        <div className="absolute top-6 right-8 w-64 h-64 bg-blue-500/[0.05] rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-10 left-6 w-56 h-56 bg-cyan-500/[0.04] rounded-full blur-[50px] pointer-events-none" />

        {/* ─── TOP RIGHT CONTROLS: THEME & LANGUAGE ─── */}
        <div className="relative z-20 flex items-center justify-end gap-2.5 shrink-0">
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-[10px] border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:bg-[#F8FAFC] dark:hover:bg-slate-800 flex items-center justify-center text-[#64748B] dark:text-slate-300 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#64748B]" />
              )}
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu((prev) => !prev)}
              className="h-10 px-3 rounded-[10px] border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-xs font-semibold text-[#334155] dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#64748B]" />
              <span>{selectedLang}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-32 rounded-[10px] bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-medium hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors ${
                      selectedLang === lang
                        ? "text-[#2563EB] font-bold"
                        : "text-[#334155] dark:text-slate-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── LOGIN FORM CONTAINER (Centered vertically) ─── */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-4 relative z-10">
          {/* Mobile-only Branding Header */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6 justify-center">
            <Image
              src="/cliqhire-f.png"
              alt="CliqHire"
              width={40}
              height={40}
              className="w-10 h-10 object-contain rounded-xl shadow-xs"
            />
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold text-[#172033] dark:text-white leading-tight">
                CliqHire
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                Talent Acquisition Management System
              </span>
            </div>
          </div>

          {isLoading || isAuthenticated ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <AuthLoading />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300 space-y-6">
              {/* Header Titles */}
              <div className="space-y-1.5 text-center sm:text-left">
                <h2 className="text-[30px] sm:text-[34px] font-extrabold text-[#172033] dark:text-white tracking-tight leading-tight">
                  Welcome back
                </h2>
                <p className="text-[15px] font-semibold text-[#334155] dark:text-slate-300">
                  Sign in to your CliqHire account
                </p>
                <p className="text-[13px] text-[#64748B] dark:text-slate-400 leading-relaxed pt-0.5">
                  Access your Talent Acquisition Management System and continue
                  building great teams.
                </p>
              </div>

              {/* Functional React-Hook-Form LoginForm */}
              <LoginForm />
            </div>
          )}
        </div>

        {/* ─── BOTTOM RIGHT SPACER / FOOTER (Subtle) ─── */}
        <div className="relative z-10 shrink-0 text-center py-1">
          <span className="text-[11px] text-[#94A3B8]">
            Protected by enterprise-grade 256-bit SSL encryption.
          </span>
        </div>
      </div>
    </div>
  );
}
