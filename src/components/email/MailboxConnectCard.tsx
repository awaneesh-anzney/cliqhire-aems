"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Server,
  Layers,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useConnectMailbox, useProviderConfig } from "@/hooks/useEmail";
import { useAuth } from "@/contexts/AuthContext";
import { MailProviderPreset } from "@/types/email";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";

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
}

export const MailboxConnectCard: React.FC<MailboxConnectCardProps> = ({
  currentEmail,
  onSuccess,
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
    <div className="w-full h-full flex-1 flex flex-col md:flex-row bg-card/90 backdrop-blur-md border border-border/70 rounded-2xl shadow-sm overflow-hidden min-h-0 animate-in fade-in duration-500">
      {/* Left Column: Brand Hero, Value Proposition, Trust & Live Provider Info */}
      <div className="w-full md:w-5/12 lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-y-auto bg-gradient-to-br from-primary via-primary/95 to-blue-950 text-white shrink-0 scrollbar-thin">
        {/* Subtle Background Pattern & Ambient Glows */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo & System Title */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-lg text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black tracking-widest text-white uppercase">CliqHire Mail</span>
              <p className="text-[10px] text-white/70 font-medium">Enterprise Talent Communications</p>
            </div>
          </div>

          <Badge className="bg-white/15 text-white border-white/20 text-[10px] font-bold px-2 py-0.5 backdrop-blur-sm">
            IMAP / SMTP
          </Badge>
        </div>

        {/* Middle: Headline & Highlights */}
        <div className="relative z-10 space-y-6 my-auto py-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Unified Recruitment Inbox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Connect your <br /> work mailbox.
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
              Communicate with candidates, schedule interviews, and track feedback directly inside CliqHire without juggling browser tabs.
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Zap className="h-4 w-4 text-amber-300 shrink-0" />
                <span>2-Way Live Sync</span>
              </div>
              <p className="text-[11px] text-white/75 leading-relaxed">
                Inbound & sent emails synchronize seamlessly via standard IMAP.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-300 shrink-0" />
                <span>Bank-Grade Encryption</span>
              </div>
              <p className="text-[11px] text-white/75 leading-relaxed">
                Credentials are encrypted with AES-256 and authenticated live.
              </p>
            </div>
          </div>

          {/* Provider Compatibility Pills */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              Compatible With All Enterprise Providers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["Google Workspace", "Microsoft 365", "Zoho Mail", "GoDaddy", "Custom IMAP"].map((provider) => (
                <span
                  key={provider}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/10 backdrop-blur-sm border border-white/15 text-white/90"
                >
                  {provider}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Organization Mail Server Configuration Status */}
        <div className="relative z-10 pt-4 border-t border-white/15">
          {providerConfig ? (
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 text-white text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                  <span className="font-bold text-[11px]">Server Configured:</span>
                  <span className="text-emerald-300 font-bold text-[11px]">{providerName}</span>
                </div>
                {providerConfig.domain && (
                  <span className="font-mono text-[10px] text-white/80 bg-white/15 px-2 py-0.5 rounded-md">
                    @{providerConfig.domain}
                  </span>
                )}
              </div>
              {providerConfig.requiresAppPassword && (
                <p className="text-[10px] text-amber-200 leading-snug">
                  * Notice: Please generate an App Password in your account security settings.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-300/30 text-amber-100 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                <AlertCircle className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>Organization Settings Pending</span>
              </div>
              <p className="text-[10px] leading-snug text-white/80">
                Company email server parameters have not been saved yet.
              </p>
              {user?.role === "ADMIN" && (
                <Link href="/settings?tab=email" className="inline-flex items-center gap-1 text-[11px] font-bold text-white underline pt-0.5 hover:text-amber-200">
                  Configure Email Settings <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Connection Form (Full-width, spacious, elegant) */}
      <div className="w-full md:w-7/12 lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-background relative overflow-y-auto scrollbar-thin">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-[-10%] right-[-10%] h-[40vw] w-[40vw] max-w-[500px] max-h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[40vw] w-[40vw] max-w-[500px] max-h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto w-full relative z-10 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 md:hidden">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Sign In to Your Mailbox
            </h3>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
              Enter your corporate credentials below to establish a secure, synchronized mail connection.
            </p>
          </div>

          {/* Form */}
          {providerConfig?.provider === "outlook365" ? (
            <div className="flex flex-col items-center justify-center space-y-6 pt-6">
              <Button
                type="button"
                onClick={handleMicrosoftSignIn}
                disabled={oauthLoading}
                className="w-full h-11 text-xs font-bold gap-2 bg-[#00a4ef] hover:bg-[#0078d4] text-white shadow-md rounded-xl transition-all active:scale-[0.99]"
              >
                {oauthLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Microsoft...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h10v10H0zM11 0h10v10H11zM0 11h10v10H0zM11 11h10v10H11z"/>
                    </svg>
                    <span>Sign in with Microsoft</span>
                  </>
                )}
              </Button>
              <p className="text-[11px] font-medium text-muted-foreground text-center px-4">
                Your organization requires signing in with Microsoft to connect your mailbox securely.
              </p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Work Email Address</Label>
              <div className="group relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@company.com"
                  className="pl-11 h-11 text-xs rounded-xl bg-background border-muted-foreground/20 focus-visible:ring-primary focus-visible:bg-background focus-visible:border-primary transition-all font-medium"
                  disabled={connectMutation.isPending}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password / App Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">
                  {providerConfig?.requiresAppPassword ? "App Password" : "Password"}
                </Label>
                {providerConfig?.requiresAppPassword && (
                  <span className="text-[10px] font-medium text-primary">
                    Use 16-char App Password
                  </span>
                )}
              </div>
              <div className="group relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-11 pr-11 h-11 text-xs font-mono rounded-xl bg-background border-muted-foreground/20 focus-visible:ring-primary focus-visible:bg-background focus-visible:border-primary transition-all font-medium"
                  disabled={connectMutation.isPending}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Display Name Field (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">Sender Display Name</Label>
                <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
              </div>
              <div className="group relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Priya Sharma (Talent Acquisition)"
                  className="pl-11 h-11 text-xs rounded-xl bg-background border-muted-foreground/20 focus-visible:ring-primary focus-visible:bg-background focus-visible:border-primary transition-all font-medium"
                  disabled={connectMutation.isPending}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={connectMutation.isPending || !email || !password}
                className="w-full h-11 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl transition-all group active:scale-[0.99]"
              >
                {connectMutation.isPending ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Testing IMAP & SMTP connection live...</span>
                  </>
                ) : (
                  <>
                    <span>Connect Work Mailbox</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
          )}

          {/* Security & Verification Guarantee */}
          <div className="pt-3 border-t border-border/60 text-center space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Tested live before saving • Zero plaintext storage</span>
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              Need assistance? Contact your company IT administrator for server credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
