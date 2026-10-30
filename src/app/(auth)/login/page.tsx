"use client";

/**
 * app/(auth)/login/page.tsx — CliqHire Enterprise ATS Login Page
 *
 * Ultra-modern split-layout with:
 * - Luxury deep-sapphire & emerald cyber-mesh branding panel
 * - Live Recruitment Intelligence glassmorphic showcase
 * - Real-time candidate placement velocity dossier
 * - Enterprise trust accreditation strip
 * - High-performance responsive login form
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
  Sparkles,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  ArrowUpRight,
  Activity,
  FileCheck,
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

  const languages = ["English", "Spanish", "French", "German", "Arabic"];

  return (
    <div className="relative w-full h-screen min-h-screen max-h-screen overflow-hidden flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-[#0B132B] font-sans select-none">
      {/* ════════════════════════════════════════════════════════════════════════
          LEFT PANEL: ULTRA-MODERN RECRUITMENT INTELLIGENCE SHOWCASE
          ════════════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] h-full flex-col justify-between p-7 xl:p-10 relative overflow-hidden text-white shrink-0 z-20 shadow-[8px_0_32px_rgba(15,23,42,0.12)] border-r border-slate-800/60"
        style={{
          background:
            "linear-gradient(145deg, #070E1E 0%, #0B172E 35%, #0D1F3C 70%, #091325 100%)",
        }}
      >
        {/* Subtle Precision Grid Mesh & Ambient Luminous Orbs */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem]"
        />

        {/* Multi-layered Luminous Glows (Emerald & Indigo Accents) */}
        <div className="absolute -top-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-emerald-500/10 blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-[36rem] h-[36rem] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-teal-500/[0.08] blur-[90px] pointer-events-none" />

        {/* ─── 1. TOP BRAND HEADER & LIVE STATUS ─── */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Logo Mark + Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex shrink-0 items-center justify-center p-1.5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 shadow-md shadow-black/20 backdrop-blur-md">
              <Image
                src="/cliqhire-f.png"
                alt="CliqHire"
                width={40}
                height={40}
                priority
                className="w-9 h-9 object-contain rounded-lg"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[19px] font-extrabold tracking-tight text-white leading-none">
                  CliqHire
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide mt-1">
                Talent Acquisition Management System
              </span>
            </div>
          </div>

          {/* Enterprise Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-sm shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Enterprise Suite v2.4</span>
          </div>
        </div>

        {/* ─── 2. MAIN HERO STATEMENT & LIVE INTELLIGENCE DOSSIER ─── */}
        <div className="relative z-10 my-auto py-2 space-y-4 max-w-[620px]">
          {/* Main Headline */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl xl:text-[40px] font-extrabold tracking-tight text-white leading-[1.12]">
              Intelligent Recruitment &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Placement Infrastructure
              </span>
            </h1>
            <p className="text-xs sm:text-[13.5px] text-slate-300 font-normal leading-relaxed max-w-[520px]">
              Coordinate high-velocity hiring, monitor probation lifecycles, and
              orchestrate multi-tier recruitment teams with unified real-time analytics.
            </p>
          </div>

          {/* ─── LIVE RECRUITMENT INTELLIGENCE SHOWCASE CARD ─── */}
          <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/[0.12] p-4 backdrop-blur-xl shadow-[0_24px_50px_rgba(0,0,0,0.35)] space-y-3.5 overflow-hidden">
            {/* Top Subhead Strip */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  Live Operations & Conversion Velocity
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                Real-time Sync
              </span>
            </div>

            {/* 3 High-Impact Live Metric Pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                  Verified Pool
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-white leading-none">
                    14,820+
                  </span>
                  <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                    ↑ 28%
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                  Placement SLA
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-white leading-none">
                    99.4%
                  </span>
                  <span className="text-[9.5px] font-bold text-teal-400 bg-teal-500/10 px-1 rounded">
                    Optimal
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                  Time-to-Hire
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-white leading-none">
                    14.2d
                  </span>
                  <span className="text-[9.5px] font-bold text-blue-400 bg-blue-500/10 px-1 rounded">
                    2.8x Fast
                  </span>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Velocity Bar */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="font-semibold text-slate-300">
                  Pipeline Throughput
                </span>
                <span className="text-emerald-400 font-bold">
                  84% Target Achieved
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex gap-0.5">
                <div
                  className="h-full bg-blue-500 rounded-l-full"
                  style={{ width: "38%" }}
                  title="Sourcing (38%)"
                />
                <div
                  className="h-full bg-teal-400"
                  style={{ width: "26%" }}
                  title="Screening (26%)"
                />
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: "22%" }}
                  title="Interview (22%)"
                />
                <div
                  className="h-full bg-emerald-400 rounded-r-full"
                  style={{ width: "14%" }}
                  title="Hired (14%)"
                />
              </div>
              <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-medium pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Sourcing
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  Screening
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Interviews
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Placed
                </span>
              </div>
            </div>

            {/* Floating Live Placement Capsule */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/[0.12] via-teal-500/[0.08] to-blue-500/[0.08] border border-emerald-500/25 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                  ME
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px] font-bold text-white truncate">
                      Mostafa Ahmed Elsawy
                    </span>
                    <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      Confirmed Hire
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 block truncate mt-0.5">
                    Sales Manager • Digital Wages (MySalary) • SAR 14,000
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-emerald-400 block">
                  Probation: Active
                </span>
                <span className="text-[9px] text-slate-400 block">
                  62 days remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. BOTTOM TRUST ACCREDITATION & FOOTER ─── */}
        <div className="relative z-10 pt-2 space-y-3">
          {/* Trust strip with Agency Avatars & Security Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
            {/* Avatars */}
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 shrink-0">
                <div className="w-6 h-6 rounded-full border border-slate-900 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                  AK
                </div>
                <div className="w-6 h-6 rounded-full border border-slate-900 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-[9px] font-bold">
                  RV
                </div>
                <div className="w-6 h-6 rounded-full border border-slate-900 bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-[9px] font-bold">
                  AF
                </div>
                <div className="w-6 h-6 rounded-full border border-slate-900 bg-gradient-to-tr from-purple-500 to-pink-600 text-white flex items-center justify-center text-[9px] font-bold">
                  SJ
                </div>
              </div>
              <span className="text-[11.5px] font-medium text-slate-300">
                Trusted by 500+ recruitment agencies worldwide
              </span>
            </div>

            {/* Compliance Pills */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400/90">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SOC 2
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-blue-400/90">
                <Lock className="w-3 h-3 text-blue-400" />
                256-Bit SSL
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-teal-400/90">
                <CheckCircle2 className="w-3 h-3 text-teal-400" />
                ISO 27001
              </span>
            </div>
          </div>

          {/* Copyright & Legal Links */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>© 2026 CliqHire AEMS. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <Link
                href="/privacy"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <span>•</span>
              <Link
                href="/support"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          RIGHT PANEL: LOGIN FORM (45–48% width on desktop)
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-9 xl:p-12 relative overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B132B] transition-colors duration-200">
        {/* Soft Decorative Ambient Radial Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.04),transparent_25%),radial-gradient(circle_at_15%_90%,rgba(37,99,235,0.04),transparent_25%)] dark:bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_28%),radial-gradient(circle_at_15%_90%,rgba(59,130,246,0.08),transparent_30%)]" />

        {/* Ambient Depth Blurs */}
        <div className="absolute top-6 right-8 w-64 h-64 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-10 left-6 w-56 h-56 bg-blue-500/[0.04] dark:bg-blue-500/[0.08] rounded-full blur-[50px] pointer-events-none" />

        {/* ─── TOP RIGHT CONTROLS: THEME & LANGUAGE ─── */}
        <div className="relative z-20 flex items-center justify-end gap-2 shrink-0">
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131E3D] shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu((prev) => !prev)}
              className="h-9 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131E3D] shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{selectedLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-32 rounded-xl bg-white dark:bg-[#131E3D] border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      selectedLang === lang
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-700 dark:text-slate-200"
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
        <div className="w-full max-w-[430px] mx-auto my-auto py-4 relative z-10">
          {/* Mobile-only Branding Header */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6 justify-center">
            <Image
              src="/cliqhire-f.png"
              alt="CliqHire"
              width={38}
              height={38}
              className="w-9 h-9 object-contain rounded-xl shadow-xs"
            />
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                CliqHire
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Talent Acquisition Management System
              </span>
            </div>
          </div>

          {isLoading || isAuthenticated ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <AuthLoading />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300 space-y-5">
              {/* Header Titles */}
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Welcome back
                </h2>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Sign in to your CliqHire workspace
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
                  Access your talent pipeline, candidate dossiers, and team hiring operations.
                </p>
              </div>

              {/* Functional React-Hook-Form LoginForm */}
              <LoginForm />
            </div>
          )}
        </div>

        {/* ─── BOTTOM RIGHT FOOTER ─── */}
        <div className="relative z-10 shrink-0 text-center py-1">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            Protected by enterprise-grade 256-bit SSL encryption.
          </span>
        </div>
      </div>
    </div>
  );
}
