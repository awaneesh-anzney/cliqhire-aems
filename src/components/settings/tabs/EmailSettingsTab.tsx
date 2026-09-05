"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Server,
  Save,
  Loader2,
  Settings2,
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
import { cn } from "@/lib/utils";
import { useProviderConfig, useCreateProviderConfig, useUpdateProviderConfig } from "@/hooks/useEmail";
import { MailProviderPreset, MailEncryptionType, MailProviderConfig } from "@/types/email";

const PROVIDER_PRESETS: Record<
  MailProviderPreset,
  { name: string; hint: string }
> = {
  custom: {
    name: "Custom Mail Servers",
    hint: "Manually provide IMAP and SMTP details.",
  },
  google_workspace: {
    name: "Google Workspace / Gmail",
    hint: "Standard Google IMAP/SMTP setup.",
  },
  outlook365: {
    name: "Microsoft 365 / Outlook",
    hint: "Standard Office 365 IMAP/SMTP setup.",
  },
  zoho: {
    name: "Zoho Mail",
    hint: "Standard Zoho IMAP/SMTP setup.",
  },
  godaddy: {
    name: "GoDaddy Workspace",
    hint: "Standard GoDaddy IMAP/SMTP setup.",
  },
};

const DEFAULT_CONFIG: Partial<MailProviderConfig> = {
  provider: "google_workspace",
  domain: "",
  requiresAppPassword: true,
  dailySendLimit: 500,
  status: "active",
  imapHost: "",
  imapPort: 993,
  imapEncryption: "SSL",
  smtpHost: "",
  smtpPort: 465,
  smtpEncryption: "SSL",
};

interface EmailSettingsTabProps {
  searchQuery?: string;
}

export function EmailSettingsTab({ searchQuery = "" }: EmailSettingsTabProps = {}) {
  const { data: configData, isLoading: isLoadingConfig } = useProviderConfig();
  const createMutation = useCreateProviderConfig();
  const updateMutation = useUpdateProviderConfig();

  const [formData, setFormData] = useState<Partial<MailProviderConfig>>(DEFAULT_CONFIG);
  const [isExisting, setIsExisting] = useState(false);

  // Sync data from API to local form state
  useEffect(() => {
    if (configData?.data) {
      setFormData(configData.data);
      setIsExisting(true);
    }
  }, [configData]);

  const handleProviderSelect = (providerKey: MailProviderPreset) => {
    setFormData((prev) => ({
      ...prev,
      provider: providerKey,
      // Default app password requirement based on provider
      requiresAppPassword: providerKey === "google_workspace",
    }));
  };

  const handleSave = () => {
    if (isExisting) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isCustom = formData.provider === "custom";
  const isConfigured = isExisting && formData.status === "active";

  if (isLoadingConfig) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading email configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Status & Diagnostic Banner */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
              isConfigured
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            )}
          >
            {isConfigured ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                Organization Mail Provider: {formData.provider ? PROVIDER_PRESETS[formData.provider]?.name : "None"}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0",
                  isConfigured
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                )}
              >
                {isConfigured ? "Active" : "Pending Setup"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Domain: <span className="font-mono text-foreground font-medium">{formData.domain || "Not configured"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 bg-brand hover:bg-brand/90 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Provider Quick Presets */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <Server className="h-3.5 w-3.5 text-brand" />
            <span>Select Mail Provider</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Select a preset to auto-fill connection rules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
          {(Object.entries(PROVIDER_PRESETS) as [MailProviderPreset, { name: string; hint: string }][]).map(([key, preset]) => {
            const isSelected = formData.provider === key;
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
                <span className="text-[10px] text-muted-foreground line-clamp-1">
                  {preset.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. General Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: General Configuration (6 cols) */}
        <div className="lg:col-span-6 bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
            <Mail className="h-3.5 w-3.5 text-brand" />
            <span>General Configuration</span>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Company Domain
            </Label>
            <Input
              value={formData.domain || ""}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="e.g. yourcompany.com"
              className="h-8.5 text-xs rounded-xl font-mono"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Employees will only be able to connect email addresses belonging to this domain.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Daily Send Limit
              </Label>
              <Input
                type="number"
                value={formData.dailySendLimit || ""}
                onChange={(e) => setFormData({ ...formData, dailySendLimit: parseInt(e.target.value) || 0 })}
                placeholder="500"
                className="h-8.5 text-xs rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Status
              </Label>
              <Select
                value={formData.status || "active"}
                onValueChange={(val: "active" | "disabled") => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="h-8.5 text-xs rounded-xl">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60 mt-2">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">Require App Password</span>
              <span className="text-[10px] text-muted-foreground">Force employees to use App Passwords instead of regular passwords</span>
            </div>
            <Switch
              checked={!!formData.requiresAppPassword}
              onCheckedChange={(checked) => setFormData({ ...formData, requiresAppPassword: checked })}
              className="data-[state=checked]:bg-brand scale-80"
            />
          </div>
        </div>

        {/* Right: Custom IMAP / SMTP Settings (6 cols) */}
        {isCustom && (
          <div className="lg:col-span-6 space-y-4">
            {/* IMAP Setup */}
            <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
                <Settings2 className="h-3.5 w-3.5 text-brand" />
                <span>IMAP Configuration (Incoming)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Host</Label>
                  <Input
                    value={formData.imapHost || ""}
                    onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })}
                    placeholder="imap.example.com"
                    className="h-8.5 text-xs rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Port</Label>
                  <Input
                    type="number"
                    value={formData.imapPort || ""}
                    onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value) || 0 })}
                    placeholder="993"
                    className="h-8.5 text-xs rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Security</Label>
                  <Select
                    value={formData.imapEncryption || "SSL"}
                    onValueChange={(val: MailEncryptionType) => setFormData({ ...formData, imapEncryption: val })}
                  >
                    <SelectTrigger className="h-8.5 text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="SSL">SSL</SelectItem>
                      <SelectItem value="TLS">TLS</SelectItem>
                      <SelectItem value="STARTTLS">STARTTLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SMTP Setup */}
            <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
                <Settings2 className="h-3.5 w-3.5 text-brand" />
                <span>SMTP Configuration (Outgoing)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Host</Label>
                  <Input
                    value={formData.smtpHost || ""}
                    onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                    placeholder="smtp.example.com"
                    className="h-8.5 text-xs rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Port</Label>
                  <Input
                    type="number"
                    value={formData.smtpPort || ""}
                    onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) || 0 })}
                    placeholder="465"
                    className="h-8.5 text-xs rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Security</Label>
                  <Select
                    value={formData.smtpEncryption || "SSL"}
                    onValueChange={(val: MailEncryptionType) => setFormData({ ...formData, smtpEncryption: val })}
                  >
                    <SelectTrigger className="h-8.5 text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="SSL">SSL</SelectItem>
                      <SelectItem value="TLS">TLS</SelectItem>
                      <SelectItem value="STARTTLS">STARTTLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
