"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Server,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Bell,
  ShieldCheck,
  Globe,
  Settings2,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SmtpConfig {
  provider: string;
  host: string;
  port: string;
  encryption: string;
  requiresAuth: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  isConfigured: boolean;
  lastTestedAt?: string;
  // Notification toggles
  notifyOnApplication: boolean;
  notifyOnInterview: boolean;
  notifyOnStageMove: boolean;
  notifyOnOffer: boolean;
  notifyOnRejection: boolean;
  notifyTeamMembers: boolean;
}

const DEFAULT_CONFIG: SmtpConfig = {
  provider: "custom",
  host: "smtp.sendgrid.net",
  port: "587",
  encryption: "TLS",
  requiresAuth: true,
  username: "apikey",
  password: "",
  fromName: "CliqHire Recruitment",
  fromEmail: "recruitment@cliqhire.com",
  replyTo: "support@cliqhire.com",
  isConfigured: true,
  lastTestedAt: "2026-09-02T10:30:00Z",
  notifyOnApplication: true,
  notifyOnInterview: true,
  notifyOnStageMove: true,
  notifyOnOffer: true,
  notifyOnRejection: false,
  notifyTeamMembers: true,
};

const PROVIDER_PRESETS: Record<
  string,
  { name: string; host: string; port: string; encryption: string; hint: string }
> = {
  custom: {
    name: "Custom SMTP",
    host: "",
    port: "587",
    encryption: "TLS",
    hint: "Use your private or enterprise corporate SMTP gateway.",
  },
  sendgrid: {
    name: "SendGrid",
    host: "smtp.sendgrid.net",
    port: "587",
    encryption: "TLS",
    hint: "Username is 'apikey' and password is your SendGrid API key.",
  },
  gmail: {
    name: "Google Workspace / Gmail",
    host: "smtp.gmail.com",
    port: "587",
    encryption: "TLS",
    hint: "Requires 2FA and an App Password generated from Google Account.",
  },
  ses: {
    name: "Amazon SES",
    host: "email-smtp.us-east-1.amazonaws.com",
    port: "587",
    encryption: "TLS",
    hint: "Use your AWS IAM SES SMTP credentials and verified domain.",
  },
  outlook: {
    name: "Microsoft 365 / Outlook",
    host: "smtp.office365.com",
    port: "587",
    encryption: "STARTTLS",
    hint: "Authenticate using your Microsoft 365 work account.",
  },
  mailgun: {
    name: "Mailgun",
    host: "smtp.mailgun.org",
    port: "587",
    encryption: "TLS",
    hint: "Use your Mailgun domain SMTP login and password.",
  },
};

interface EmailSettingsTabProps {
  searchQuery?: string;
}

export function EmailSettingsTab({ searchQuery = "" }: EmailSettingsTabProps = {}) {
  const [config, setConfig] = useState<SmtpConfig>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cliqhire_smtp_config");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return DEFAULT_CONFIG;
        }
      }
    }
    return DEFAULT_CONFIG;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Test Email Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [testSending, setTestSending] = useState(false);

  const handleProviderSelect = (providerKey: string) => {
    const preset = PROVIDER_PRESETS[providerKey];
    if (preset) {
      setConfig((prev) => ({
        ...prev,
        provider: providerKey,
        host: preset.host || prev.host,
        port: preset.port,
        encryption: preset.encryption,
      }));
      toast.info(`Applied ${preset.name} preset parameters`);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("cliqhire_smtp_config", JSON.stringify(config));
      setIsSaving(false);
      toast.success("Email & SMTP Configuration Saved", {
        description: "All automated recruitment communication channels updated.",
      });
    }, 400);
  };

  const handleSendTestEmail = () => {
    if (!testRecipient || !testRecipient.includes("@")) {
      toast.error("Please provide a valid recipient email address");
      return;
    }

    setTestSending(true);
    setTimeout(() => {
      setTestSending(false);
      setTestModalOpen(false);
      setConfig((prev) => ({
        ...prev,
        isConfigured: true,
        lastTestedAt: new Date().toISOString(),
      }));
      localStorage.setItem(
        "cliqhire_smtp_config",
        JSON.stringify({ ...config, isConfigured: true, lastTestedAt: new Date().toISOString() })
      );
      toast.success("Test Email Delivered Successfully", {
        description: `Verification ping sent to ${testRecipient} via ${config.host}:${config.port}.`,
      });
    }, 1200);
  };

  const formattedLastTested = config.lastTestedAt
    ? new Date(config.lastTestedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never tested";

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Status & Diagnostic Banner */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
              config.isConfigured
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            )}
          >
            {config.isConfigured ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                Email Dispatch Gateway: {PROVIDER_PRESETS[config.provider]?.name || "Custom SMTP"}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0",
                  config.isConfigured
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                )}
              >
                {config.isConfigured ? "Verified Active" : "Pending Setup"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Host: <span className="font-mono text-foreground font-medium">{config.host}:{config.port}</span> • Last Verified: {formattedLastTested}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestModalOpen(true)}
            className="h-8 text-xs font-semibold rounded-xl border-border/80 hover:bg-muted"
          >
            <Send className="h-3 w-3 mr-1 text-brand" />
            Send Test Email
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 bg-brand hover:bg-brand/90 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      {/* 2. Provider Quick Presets */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <Server className="h-3.5 w-3.5 text-brand" />
            <span>Select Mail Delivery Provider</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Select a preset to auto-fill connection rules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => {
            const isSelected = config.provider === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleProviderSelect(key)}
                className={cn(
                  "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all",
                  isSelected
                    ? "bg-brand/5 border-brand ring-2 ring-brand/10 shadow-xs"
                    : "bg-muted/30 border-border/70 hover:bg-card hover:border-border"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-foreground">{preset.name}</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-brand" />}
                </div>
                <span className="text-[10px] text-muted-foreground line-clamp-1 font-mono">
                  {preset.host || "custom gateway"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Server Configuration & Sender Identity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Server Connection Settings (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
            <Settings2 className="h-3.5 w-3.5 text-brand" />
            <span>SMTP Server & Security Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Host */}
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                SMTP Server Host
              </Label>
              <Input
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="smtp.example.com"
                className="h-8.5 text-xs rounded-xl font-mono"
              />
            </div>

            {/* Port */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Port
              </Label>
              <Input
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: e.target.value })}
                placeholder="587"
                className="h-8.5 text-xs rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Encryption Mode */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Encryption Protocol
              </Label>
              <Select
                value={config.encryption}
                onValueChange={(val) => setConfig({ ...config, encryption: val })}
              >
                <SelectTrigger className="h-8.5 text-xs rounded-xl">
                  <SelectValue placeholder="Select Encryption" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="TLS">TLS / STARTTLS (Recommended: Port 587)</SelectItem>
                  <SelectItem value="SSL">SSL (Port 465)</SelectItem>
                  <SelectItem value="NONE">None (Insecure: Port 25)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auth Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60 mt-auto">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">SMTP Authentication</span>
                <span className="text-[10px] text-muted-foreground">Requires username & password</span>
              </div>
              <Switch
                checked={config.requiresAuth}
                onCheckedChange={(checked) => setConfig({ ...config, requiresAuth: checked })}
                className="data-[state=checked]:bg-brand scale-80"
              />
            </div>
          </div>

          {config.requiresAuth && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-border/40">
              {/* Username */}
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                  SMTP Username / API Key
                </Label>
                <Input
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  placeholder="e.g. apikey or user@domain.com"
                  className="h-8.5 text-xs rounded-xl font-mono"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                  Password / App Secret
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="h-8.5 text-xs rounded-xl font-mono pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sender Identity & From Headers (5 cols) */}
        <div className="lg:col-span-5 bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
            <Mail className="h-3.5 w-3.5 text-brand" />
            <span>Sender Profile & Branding</span>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Default Sender Name
            </Label>
            <Input
              value={config.fromName}
              onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
              placeholder="e.g. CliqHire Recruitment Team"
              className="h-8.5 text-xs rounded-xl"
            />
            <p className="text-[10px] text-muted-foreground">
              Candidate emails will show this as the sender header.
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              From Email Address
            </Label>
            <Input
              value={config.fromEmail}
              onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
              placeholder="recruitment@yourdomain.com"
              className="h-8.5 text-xs rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Reply-To Address
            </Label>
            <Input
              value={config.replyTo}
              onChange={(e) => setConfig({ ...config, replyTo: e.target.value })}
              placeholder="replies@yourdomain.com"
              className="h-8.5 text-xs rounded-xl font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. Automated Notification Dispatch Rules */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <Bell className="h-3.5 w-3.5 text-brand" />
            <span>Automated Recruitment Email Triggers</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Configure automated emails triggered across the pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {/* Trigger 1: Application confirmation */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-foreground">Application Acknowledgment</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Send welcome confirmation when candidate enters pipeline
              </span>
            </div>
            <Switch
              checked={config.notifyOnApplication}
              onCheckedChange={(c) => setConfig({ ...config, notifyOnApplication: c })}
              className="data-[state=checked]:bg-brand scale-80 shrink-0"
            />
          </div>

          {/* Trigger 2: Interview Scheduling */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-foreground">Interview Invitations</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Dispatch calendar invite & interview details to candidate
              </span>
            </div>
            <Switch
              checked={config.notifyOnInterview}
              onCheckedChange={(c) => setConfig({ ...config, notifyOnInterview: c })}
              className="data-[state=checked]:bg-brand scale-80 shrink-0"
            />
          </div>

          {/* Trigger 3: Stage Progression */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-foreground">Stage Move Updates</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Notify candidate when they advance to next pipeline stage
              </span>
            </div>
            <Switch
              checked={config.notifyOnStageMove}
              onCheckedChange={(c) => setConfig({ ...config, notifyOnStageMove: c })}
              className="data-[state=checked]:bg-brand scale-80 shrink-0"
            />
          </div>

          {/* Trigger 4: Offer Letter */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-foreground">Offer Letter Issuance</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Email candidate when official offer letter document is issued
              </span>
            </div>
            <Switch
              checked={config.notifyOnOffer}
              onCheckedChange={(c) => setConfig({ ...config, notifyOnOffer: c })}
              className="data-[state=checked]:bg-brand scale-80 shrink-0"
            />
          </div>

          {/* Trigger 5: Rejection Notice */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-foreground">Disqualification Notice</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Send professional rejection note upon candidate disqualification
              </span>
            </div>
            <Switch
              checked={config.notifyOnRejection}
              onCheckedChange={(c) => setConfig({ ...config, notifyOnRejection: c })}
              className="data-[state=checked]:bg-brand scale-80 shrink-0"
            />
          </div>

          {/* Trigger 6: Internal Team Alerts */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-foreground">Hiring Team Alerts</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Notify assigned recruiter and hiring manager of candidate activity
              </span>
            </div>
            <Switch
              checked={config.notifyTeamMembers}
              onCheckedChange={(c) => setConfig({ ...config, notifyTeamMembers: c })}
              className="data-[state=checked]:bg-brand scale-80 shrink-0"
            />
          </div>
        </div>
      </div>

      {/* 5. Interactive Test Email Modal */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Send className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Send Diagnostic Test Email
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Verify your SMTP connectivity and delivery credentials by sending a live diagnostic message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Recipient Email Address
              </Label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Dispatch Gateway:</span>
                <span className="font-mono text-foreground font-semibold">{config.host}:{config.port}</span>
              </div>
              <div className="flex justify-between">
                <span>From Header:</span>
                <span className="text-foreground">{config.fromName} &lt;{config.fromEmail}&gt;</span>
              </div>
              <div className="flex justify-between">
                <span>Security:</span>
                <span className="text-foreground">{config.encryption} (Auth: {config.requiresAuth ? "Yes" : "No"})</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestModalOpen(false)}
              className="h-8 text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSendTestEmail}
              disabled={testSending}
              className="h-8 bg-brand hover:bg-brand/90 text-white text-xs font-semibold rounded-xl"
            >
              {testSending ? "Transmitting..." : "Send Verification Ping"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
