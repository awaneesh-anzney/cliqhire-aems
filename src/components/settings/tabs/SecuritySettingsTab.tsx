"use client";

import React, { useState } from "react";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Clock, 
  Lock, 
  FileText, 
  AlertTriangle, 
  Save, 
  RotateCcw,
  CheckCircle2,
  LogOut,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface SecuritySettingsTabProps {
  searchQuery?: string;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({ searchQuery = "" }) => {
  const [twoFactorEnforcement, setTwoFactorEnforcement] = useState<"optional" | "admins" | "all">("admins");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [singleSessionPerUser, setSingleSessionPerUser] = useState(false);
  
  const [minPasswordLength, setMinPasswordLength] = useState("10");
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState("90");

  const [alertNewLogin, setAlertNewLogin] = useState(true);
  const [alertRoleElevation, setAlertRoleElevation] = useState(true);

  const handleSave = () => {
    toast.success("Security and authentication settings updated successfully!");
  };

  const handleReset = () => {
    setTwoFactorEnforcement("admins");
    setSessionTimeout("60");
    setSingleSessionPerUser(false);
    setMinPasswordLength("10");
    setRequireSpecialChars(true);
    setPasswordExpiryDays("90");
    setAlertNewLogin(true);
    setAlertRoleElevation(true);
    toast.info("Reset security preferences to organization baseline.");
  };

  const handleTerminateSessions = () => {
    toast.success("Revoked all active sessions across other devices.");
  };

  const handleExportAuditLogs = () => {
    toast.success("Security audit logs exported to security_audit_export.csv");
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-3 sm:p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Security & Access Governance</h2>
            <Badge variant="outline" className="text-xs bg-muted/60">Compliance</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage two-factor authentication, session lifespans, password complexity standards, and audit trails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Multi-Factor Authentication */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Multi-Factor Authentication (2FA)</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Enforce secondary verification via authenticator apps (Google Authenticator, Microsoft Authenticator, 1Password).
          </p>

          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Enforcement Policy</Label>
              <Select value={twoFactorEnforcement} onValueChange={(val: "optional" | "admins" | "all") => setTwoFactorEnforcement(val)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional" className="text-xs">Optional (Recommended for small internal teams)</SelectItem>
                  <SelectItem value="admins" className="text-xs">Mandatory for Admins & Super Admins (Default)</SelectItem>
                  <SelectItem value="all" className="text-xs">Mandatory for All Employees & Contractors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-md bg-muted/30 border text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Supported 2FA Methods</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Time-based One-Time Password (TOTP RFC 6238) and Hardware Security Keys (FIDO2 / WebAuthn).
              </p>
            </div>
          </div>
        </div>

        {/* Session Inactivity & Management */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Session Lifespan & Timeouts</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Control automated logout intervals for inactive user sessions to prevent unauthorized workstation access.
          </p>

          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Idle Session Inactivity Timeout</Label>
              <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15" className="text-xs">15 Minutes (High Security)</SelectItem>
                  <SelectItem value="30" className="text-xs">30 Minutes</SelectItem>
                  <SelectItem value="60" className="text-xs">1 Hour (Recommended)</SelectItem>
                  <SelectItem value="240" className="text-xs">4 Hours</SelectItem>
                  <SelectItem value="480" className="text-xs">8 Hours (Full Workday)</SelectItem>
                  <SelectItem value="1440" className="text-xs">24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/10">
              <div className="space-y-0.5 pr-4">
                <Label className="text-xs font-semibold cursor-pointer">Restrict to Single Active Device</Label>
                <p className="text-[11px] text-muted-foreground">
                  Logging in on a new device immediately terminates previous sessions.
                </p>
              </div>
              <Switch checked={singleSessionPerUser} onCheckedChange={setSingleSessionPerUser} />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTerminateSessions} 
              className="w-full h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <LogOut className="h-3.5 w-3.5" />
              Revoke All Active User Sessions
            </Button>
          </div>
        </div>

        {/* Password Standards */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Password Complexity Requirements</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Apply rules for team members signing in using email and password credentials.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Minimum Characters</Label>
              <Select value={minPasswordLength} onValueChange={setMinPasswordLength}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8" className="text-xs">8 Characters</SelectItem>
                  <SelectItem value="10" className="text-xs">10 Characters (Recommended)</SelectItem>
                  <SelectItem value="12" className="text-xs">12 Characters (Strong)</SelectItem>
                  <SelectItem value="16" className="text-xs">16 Characters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Password Rotation Expiry</Label>
              <Select value={passwordExpiryDays} onValueChange={setPasswordExpiryDays}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60" className="text-xs">Every 60 Days</SelectItem>
                  <SelectItem value="90" className="text-xs">Every 90 Days</SelectItem>
                  <SelectItem value="180" className="text-xs">Every 180 Days</SelectItem>
                  <SelectItem value="never" className="text-xs">Never (Modern NIST Standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/10">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-medium">Require Symbols & Numbers</span>
              <p className="text-[11px] text-muted-foreground">At least 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.</p>
            </div>
            <Switch checked={requireSpecialChars} onCheckedChange={setRequireSpecialChars} />
          </div>
        </div>

        {/* Security Audit & Anomaly Alerts */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Audit Logs & Anomaly Detection</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Keep track of administrative actions, permission elevations, and suspicious account access.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between p-2 rounded-md border bg-muted/10">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-medium">Unrecognized Device Alert</span>
                <p className="text-[11px] text-muted-foreground">Send security email alert if login occurs from a new IP or browser.</p>
              </div>
              <Switch checked={alertNewLogin} onCheckedChange={setAlertNewLogin} />
            </div>

            <div className="flex items-center justify-between p-2 rounded-md border bg-muted/10">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-medium">Privilege Escalation Notice</span>
                <p className="text-[11px] text-muted-foreground">Alert Super Admins whenever user roles or permissions are updated.</p>
              </div>
              <Switch checked={alertRoleElevation} onCheckedChange={setAlertRoleElevation} />
            </div>

            <div className="pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportAuditLogs} 
                className="w-full h-8 text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export Audit Activity Trail (CSV)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
