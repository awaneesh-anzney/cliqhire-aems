"use client";

import React, { useState } from "react";
import { Building2, Globe, Clock, DollarSign, Calendar, Database, Sparkles, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface GeneralSettingsTabProps {
  searchQuery?: string;
}

export function GeneralSettingsTab({ searchQuery = "" }: GeneralSettingsTabProps = {}) {
  const [settings, setSettings] = useState({
    companyName: "CliqHire Recruitment",
    portalTitle: "CliqHire AEMS Portal",
    supportEmail: "support@cliqhire.com",
    website: "https://cliqhire.com",
    timezone: "Asia/Kolkata",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    retentionYears: "3",
    autoArchiveJobs: true,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("General Organization Settings Saved", {
        description: "Branding, localization, and retention rules have been synchronized.",
      });
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Organization & Branding Details */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <Building2 className="h-3.5 w-3.5 text-brand" />
            <span>Organization Profile & Portal Branding</span>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-7.5 px-3 bg-brand hover:bg-brand/90 text-white text-xs font-semibold rounded-xl"
          >
            <Save className="h-3 w-3 mr-1" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Company / Legal Entity Name
            </Label>
            <Input
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="h-8.5 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Portal Display Title
            </Label>
            <Input
              value={settings.portalTitle}
              onChange={(e) => setSettings({ ...settings, portalTitle: e.target.value })}
              className="h-8.5 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Support / Contact Email
            </Label>
            <Input
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="h-8.5 text-xs rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Corporate Website URL
            </Label>
            <Input
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              className="h-8.5 text-xs rounded-xl font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Localization & Regional Standards */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
          <Globe className="h-3.5 w-3.5 text-brand" />
          <span>Localization & Regional Preferences</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Default Operational Timezone
            </Label>
            <Select
              value={settings.timezone}
              onValueChange={(val) => setSettings({ ...settings, timezone: val })}
            >
              <SelectTrigger className="h-8.5 text-xs rounded-xl">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</SelectItem>
                <SelectItem value="UTC">UTC (Universal Coordinated Time)</SelectItem>
                <SelectItem value="America/New_York">America/New York (EST - UTC-05:00)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT - UTC+00:00)</SelectItem>
                <SelectItem value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Default Salary & Pipeline Currency
            </Label>
            <Select
              value={settings.currency}
              onValueChange={(val) => setSettings({ ...settings, currency: val })}
            >
              <SelectTrigger className="h-8.5 text-xs rounded-xl">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
                <SelectItem value="SGD">SGD ($) - Singapore Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Date Representation Format
            </Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(val) => setSettings({ ...settings, dateFormat: val })}
            >
              <SelectTrigger className="h-8.5 text-xs rounded-xl">
                <SelectValue placeholder="Select Date Format" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (e.g. 04/09/2026)</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/04/2026)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Data Governance & Maintenance */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-4 flex flex-col gap-3.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
          <Database className="h-3.5 w-3.5 text-brand" />
          <span>Data Governance & Compliance Policies</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Candidate Resume & Data Retention Period
            </Label>
            <Select
              value={settings.retentionYears}
              onValueChange={(val) => setSettings({ ...settings, retentionYears: val })}
            >
              <SelectTrigger className="h-8.5 text-xs rounded-xl">
                <SelectValue placeholder="Select Retention Period" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="1">1 Year (Strict GDPR compliance)</SelectItem>
                <SelectItem value="2">2 Years (Standard recruitment cycle)</SelectItem>
                <SelectItem value="3">3 Years (Recommended enterprise archive)</SelectItem>
                <SelectItem value="indefinite">Indefinite (Retain all talent pool data)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-foreground">Auto-Archive Closed Positions</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Automatically archive job pipelines 30 days after all positions are filled
              </span>
            </div>
            <Switch
              checked={settings.autoArchiveJobs}
              onCheckedChange={(c) => setSettings({ ...settings, autoArchiveJobs: c })}
              className="data-[state=checked]:bg-brand scale-80 shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
