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
  Zap
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
    : "Corporate Mail Server";

  return (
    <div className="w-full flex items-center justify-center p-1 sm:p-2">
      <div className="w-full max-w-4xl min-h-[490px] md:min-h-[510px] bg-card/95 backdrop-blur-md border border-border/70 rounded-2xl shadow-sm overflow-hidden transition-all flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0">
          {/* Left Column: Context, Provider Status, Trust Points */}
          <div className="md:col-span-5 bg-gradient-to-br from-primary/10 via-primary/5 to-muted/20 p-5 sm:p-6 md:p-7 border-b md:border-b-0 md:border-r border-border/70 flex flex-col justify-between gap-5">
            <div className="space-y-3.5">
              {/* Header Badge & Title */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/20 text-[11px] font-bold text-primary">
                  <Mail className="h-3 w-3" />
                  <span>Mailbox Integration</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground">
                  Connect Work Mailbox
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Send offers, schedule interviews, and sync applicant email responses directly in CliqHire.
                </p>
              </div>

              {/* Provider Info Pill */}
              {providerConfig ? (
                <div className="p-3 rounded-xl bg-background/80 border border-border/70 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Provider:</span>
                    <Badge variant="secondary" className="h-5 px-2 text-[10px] font-semibold bg-primary/15 text-primary rounded-md">
                      {providerName}
                    </Badge>
                  </div>
                  {providerConfig.domain && (
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      @{providerConfig.domain}
                    </p>
                  )}
                  {providerConfig.requiresAppPassword && (
                    <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 pt-0.5">
                      Requires an App Password (not standard account password).
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Server Not Configured</span>
                  </div>
                  <p className="text-[10px] leading-snug">
                    Company email settings have not been set up yet.
                  </p>
                  {user?.role === "ADMIN" && (
                    <Link href="/settings?tab=email" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary underline pt-0.5">
                      Configure Settings <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Trust & Feature Highlights */}
            <div className="space-y-2.5 pt-3 border-t border-border/60 text-[11px] text-muted-foreground hidden sm:block">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Live 2-way IMAP & SMTP synchronization</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>AES-256 credential encryption</span>
              </div>
            </div>
          </div>

          {/* Right Column: Connection Form */}
          <div className="md:col-span-7 p-5 sm:p-6 md:p-7 flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-foreground">Sign In to Your Mailbox</h3>
                <p className="text-[11px] text-muted-foreground">Enter your corporate credentials to link your email account.</p>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">Work Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@company.com"
                    className="pl-9 text-xs h-9 rounded-xl bg-muted/20 border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
                    disabled={connectMutation.isPending}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    {providerConfig?.requiresAppPassword ? "App Password" : "Password"}
                  </Label>
                  {providerConfig?.requiresAppPassword && (
                    <span className="text-[10px] text-muted-foreground">
                      From Google / MS account security
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9 pr-9 text-xs h-9 font-mono rounded-xl bg-muted/20 border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
                    disabled={connectMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Display Name Field (Optional) */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Sender Name <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="pl-9 text-xs h-9 rounded-xl bg-muted/20 border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
                    disabled={connectMutation.isPending}
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={connectMutation.isPending || !email || !password}
                  className="w-full h-9 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs rounded-xl transition-all"
                >
                  {connectMutation.isPending ? (
                    <>
                      <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Testing IMAP & SMTP live...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect Mailbox</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <p className="text-[10px] text-center text-muted-foreground/80 pt-3">
              Encrypted credentials are test-connected in real time before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
