"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnectMailbox, useProviderConfig } from "@/hooks/useEmail";
import { useAuth } from "@/contexts/AuthContext";
import { MailProviderPreset } from "@/types/email";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// MUI Icons
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CircularProgress from "@mui/material/CircularProgress";

const PROVIDER_NAMES: Record<MailProviderPreset, string> = {
  godaddy: "GoDaddy Mail",
  zoho: "Zoho Mail",
  google_workspace: "Google Workspace",
  outlook365: "Microsoft 365 / Outlook",
  custom: "Custom Corporate Mail Server",
};

interface MailboxConnectCardProps {
  currentEmail?: string;
  onSuccess?: () => void;
  className?: string;
}

export const MailboxConnectCard: React.FC<MailboxConnectCardProps> = ({
  currentEmail,
  onSuccess,
  className,
}) => {
  const { user } = useAuth();
  const { data: providerConfigData } = useProviderConfig();
  const connectMutation = useConnectMailbox();

  const providerConfig = providerConfigData?.data;

  const [email, setEmail] = useState(currentEmail || user?.email || "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleMicrosoftSignIn = async () => {
    try {
      setOauthLoading(true);
      const { url } = await emailService.getMicrosoftAuthUrl();
      window.location.href = url;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to initiate Microsoft sign-in");
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    connectMutation.mutate(
      { email, password, displayName: displayName || email.split("@")[0] },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  const providerName = providerConfig?.provider
    ? PROVIDER_NAMES[providerConfig.provider] || providerConfig.provider
    : "Corporate Mail Server";

  return (
    <div
      className={cn(
        "w-full h-full flex-1 flex flex-col md:flex-row bg-white dark:bg-[#1C252E] border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-[20px] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.08)] overflow-hidden font-['Public_Sans',sans-serif] animate-in fade-in duration-300",
        className
      )}
    >
      {/* ========================================================= */}
      {/* Left Column: Hero & Value Proposition Panel              */}
      {/* ========================================================= */}
      <div className="w-full md:w-5/12 lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-y-auto bg-[#1C252E] dark:bg-[#161C24] text-white shrink-0 custom-scrollbar">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo & System Badge */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm text-white">
              <MailOutlineIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-white uppercase">CliqHire Mail</span>
              <p className="text-[10px] text-white/60 font-medium">Enterprise Communications</p>
            </div>
          </div>

          <span className="bg-white/10 text-white/90 border border-white/15 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            IMAP / SMTP
          </span>
        </div>

        {/* Middle: Headline & Feature Highlights */}
        <div className="relative z-10 space-y-6 my-auto py-6 max-w-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-white shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Unified Talent Inbox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-white leading-tight">
              Connect your work mailbox.
            </h2>
            <p className="text-xs sm:text-sm text-white/75 font-normal leading-relaxed">
              Communicate with candidates, send offer letters, and follow up directly inside CliqHire with two-way synchronization.
            </p>
          </div>

          {/* Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <BoltOutlinedIcon sx={{ fontSize: 18, color: "#F59E0B" }} />
                <span>2-Way Sync</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                Inbound and sent messages synchronize automatically with zero delays.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <ShieldOutlinedIcon sx={{ fontSize: 18, color: "#22C55E" }} />
                <span>Secure Credentials</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                Tokens are validated live with industry standard SSL/TLS encryption.
              </p>
            </div>
          </div>

          {/* Supported Providers */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Compatible With All Work Providers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["Microsoft 365", "Google Workspace", "Zoho Mail", "GoDaddy", "Custom IMAP"].map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-0.5 rounded-lg text-[10.5px] font-medium bg-white/10 border border-white/10 text-white/80"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Organization Configuration Status */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          {providerConfig ? (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <DnsOutlinedIcon sx={{ fontSize: 16, color: "#22C55E" }} />
                <span className="font-semibold text-[11px] text-white/80">Organization Provider:</span>
                <span className="text-emerald-400 font-bold text-[11px]">{providerName}</span>
              </div>
              {providerConfig.domain && (
                <span className="font-mono text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-md">
                  @{providerConfig.domain}
                </span>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/20 text-amber-200 text-xs flex items-center justify-between">
              <span className="text-[11px]">Organization server defaults pending</span>
              {user?.role === "ADMIN" && (
                <Link
                  href="/settings?tab=email"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white hover:underline"
                >
                  Configure <OpenInNewIcon sx={{ fontSize: 13 }} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Right Column: Clean, Polished Sign-In Form               */}
      {/* ========================================================= */}
      <div className="w-full md:w-7/12 lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#1C252E] relative overflow-y-auto custom-scrollbar">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* User Account Context Banner */}
          {user && (
            <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[#637381] dark:text-[#919EAB] text-[11px]">Logged in as:</span>
              <span className="font-bold text-[#1C252E] dark:text-white truncate text-[11.5px]">
                {user.name || user.email}
              </span>
              {user.role && (
                <span className="ml-auto uppercase text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 text-[#637381] dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  {user.role}
                </span>
              )}
            </div>
          )}

          {/* Header */}
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C252E] dark:text-white">
              Sign In to Your Mailbox
            </h3>
            <p className="text-xs sm:text-[13px] font-normal text-[#919EAB] leading-relaxed">
              Enter your corporate credentials below to establish a secure, synchronized connection.
            </p>
          </div>

          {/* Microsoft OAuth Option or Form */}
          {providerConfig?.provider === "outlook365" ? (
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                disabled={oauthLoading}
                className="w-full h-11 text-xs font-bold gap-2.5 bg-[#00a4ef] hover:bg-[#0078d4] text-white shadow-md rounded-xl transition-all flex items-center justify-center active:scale-[0.99] disabled:opacity-50"
              >
                {oauthLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <>
                    <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h10v10H0zM11 0h10v10H11zM0 11h10v10H0zM11 11h10v10H11z" />
                    </svg>
                    <span>Sign in with Microsoft 365</span>
                  </>
                )}
              </button>
              <p className="text-[11px] font-normal text-[#919EAB] text-center">
                Your organization is configured for Microsoft SSO. Sign in with your work account to proceed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Work Email Address */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#1C252E] dark:text-white">Work Email Address</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#919EAB]">
                    <MailOutlineIcon sx={{ fontSize: 18 }} />
                  </span>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="pl-10 h-11 text-xs sm:text-[13px] rounded-xl bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-700 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:bg-white dark:focus-visible:bg-slate-900 transition-all font-normal"
                    disabled={connectMutation.isPending}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password / App Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#1C252E] dark:text-white">
                    {providerConfig?.requiresAppPassword ? "App Password" : "Password"}
                  </Label>
                  {providerConfig?.requiresAppPassword && (
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      Requires 16-character App Password
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#919EAB]">
                    <LockOutlinedIcon sx={{ fontSize: 18 }} />
                  </span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-10 pr-10 h-11 text-xs sm:text-[13px] font-mono rounded-xl bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-700 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:bg-white dark:focus-visible:bg-slate-900 transition-all font-normal"
                    disabled={connectMutation.isPending}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#919EAB] hover:text-[#1C252E] dark:hover:text-white transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Display Name Field (Optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#1C252E] dark:text-white">Sender Display Name</Label>
                  <span className="text-[10px] text-[#919EAB] font-normal">Optional</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#919EAB]">
                    <PersonOutlineIcon sx={{ fontSize: 18 }} />
                  </span>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Sarah Connor (Talent Acquisition)"
                    className="pl-10 h-11 text-xs sm:text-[13px] rounded-xl bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-700 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:bg-white dark:focus-visible:bg-slate-900 transition-all font-normal"
                    disabled={connectMutation.isPending}
                  />
                </div>
              </div>

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={connectMutation.isPending || !email || !password}
                  className="w-full h-11 text-xs sm:text-sm font-bold gap-2 bg-primary hover:bg-primary-hover active:bg-primary-hover text-primary-foreground shadow-sm shadow-primary/25 hover:shadow-md hover:shadow-primary/30 rounded-xl transition-all flex items-center justify-center active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 cursor-pointer"
                >
                  {connectMutation.isPending ? (
                    <>
                      <CircularProgress size={16} color="inherit" />
                      <span>Validating IMAP & SMTP live...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect Work Mailbox</span>
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security Guarantee Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-1">
            <p className="text-[11px] font-semibold text-[#637381] dark:text-[#919EAB] flex items-center justify-center gap-1.5">
              <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "#22C55E" }} />
              <span>Validated live with your mail host • Zero plaintext credential storage</span>
            </p>
            <p className="text-[10px] text-[#919EAB]">
              Need help? Contact your company IT administrator for mail credentials or app passwords.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
