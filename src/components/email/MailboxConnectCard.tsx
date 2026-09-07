"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Server,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useConnectMailbox, useProviderConfig } from "@/hooks/useEmail";
import { useAuth } from "@/contexts/AuthContext";
import { MailProviderPreset } from "@/types/email";

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
    : "Organization Mail Server";

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-3 sm:px-4">
      <div className="bg-card/90 backdrop-blur-md border border-border/70 rounded-3xl shadow-sm overflow-hidden">
        {/* Top Header Glow */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                <Mail className="h-3.5 w-3.5" />
                <span>CliqHire Mailbox Setup</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Connect Your Work Mailbox
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                Send candidate offers, schedule interviews, and sync applicant email replies directly inside your recruitment pipelines.
              </p>
            </div>

            <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center text-primary shrink-0 shadow-inner">
              <Server className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Organization Provider Banner */}
          {providerConfig ? (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-background border border-border/70 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground">Configured Provider:</span>
                  <Badge variant="secondary" className="font-semibold text-[11px] bg-primary/15 text-primary rounded-lg">
                    {providerName}
                  </Badge>
                  {providerConfig.domain && (
                    <span className="text-muted-foreground font-mono text-[11px]">@{providerConfig.domain}</span>
                  )}
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {providerConfig.requiresAppPassword ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Note: Your organization email requires an App Password (not your regular login password).
                    </span>
                  ) : (
                    "Your organization mail server settings are configured and ready for employee login."
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold">Organization Provider Config Not Detected</p>
                <p className="text-[11px] leading-relaxed">
                  If your administrator hasn&apos;t configured the company mail hosting yet, please configure it in Settings first.
                </p>
                {user?.role === "ADMIN" && (
                  <Link href="/settings?tab=email" className="inline-flex items-center gap-1 font-bold text-primary underline mt-1">
                    Go to Settings → Email Configuration <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Connect Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Work Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya@yourcompany.com"
                  className="pl-9 text-xs h-9 rounded-xl bg-muted/20 border-border/70"
                  disabled={connectMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">
                  {providerConfig?.requiresAppPassword ? "App Password" : "Mailbox Password"}
                </Label>
                {providerConfig?.requiresAppPassword && (
                  <span className="text-[11px] text-muted-foreground">
                    Generated from Google or Microsoft account security
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 pr-9 text-xs h-9 font-mono rounded-xl bg-muted/20 border-border/70"
                  disabled={connectMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Sender Display Name (Optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Priya Sharma (CliqHire Talent Team)"
                  className="pl-9 text-xs h-9 rounded-xl bg-muted/20 border-border/70"
                  disabled={connectMutation.isPending}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                This name will appear in the &quot;From&quot; field of candidate interview invites and offer letters.
              </p>
            </div>

            {/* Security note */}
            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/70 text-[11px] text-muted-foreground flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span>
                Credentials are encrypted using AES-256-GCM. Backend validates IMAP and SMTP connectivity live before saving.
              </span>
            </div>

            <Button
              type="submit"
              disabled={connectMutation.isPending || !email || !password}
              className="w-full h-9.5 text-xs font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs rounded-xl transition-all"
            >
              {connectMutation.isPending ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Testing live IMAP & SMTP connection...</span>
                </>
              ) : (
                <>
                  <span>Connect My Mailbox</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
