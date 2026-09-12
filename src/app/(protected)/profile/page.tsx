"use client";

import React, { useState, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Camera,
  ShieldCheck,
  KeyRound,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Sparkles,
  Bell,
  SlidersHorizontal,
  AlertTriangle,
  FileBadge2,
  CheckCheck,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCropperDialog } from "@/components/profile/image-cropper-dialog";
import { ProfileEditModal } from "@/components/profile/profile-edit-modal";
import { toast } from "sonner";

export default function ProfilePage() {
  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    changePassword,
    isChangingPassword,
  } = useProfile();

  const [activeTab, setActiveTab] = useState("overview");

  // Avatar / Cropping / Preview Modals
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Unique ID copy state & reveal state
  const [copiedId, setCopiedId] = useState(false);
  const [showAccountId, setShowAccountId] = useState(false);

  // Workspace Preference mock toggles
  const [preferences, setPreferences] = useState({
    pipelineAlerts: true,
    emailDigest: true,
    candidateNotes: true,
    securityNotifications: true,
  });

  const user = profile;
  const userProfile = profile?.profile;

  // Calculate profile completeness score
  const { completeness, missingFields } = useMemo(() => {
    const checks = [
      { label: "First Name", valid: Boolean(userProfile?.firstName) },
      { label: "Last Name", valid: Boolean(userProfile?.lastName) },
      { label: "Phone Number", valid: Boolean(userProfile?.phone) },
      { label: "Work Location", valid: Boolean(userProfile?.location) },
      { label: "Department", valid: Boolean(userProfile?.department) },
      { label: "Specialization", valid: Boolean(userProfile?.specialization) },
      {
        label: "Skills",
        valid: Boolean(userProfile?.skills && userProfile.skills.length > 0),
      },
      { label: "Avatar Photo", valid: Boolean(userProfile?.avatar) },
    ];

    const filled = checks.filter((c) => c.valid).length;
    const score = Math.round((filled / checks.length) * 100);
    const missing = checks.filter((c) => !c.valid).map((c) => c.label);

    return { completeness: score, missingFields: missing };
  }, [userProfile]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = passwordForm.newPassword;
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-destructive" };
    if (score === 2) return { score: 50, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 75, label: "Good", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500" };
  }, [passwordForm.newPassword]);

  const handleCopyId = () => {
    const accountId = user?.id || user?._id;
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    toast.success("Account ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsPreviewOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const base64ToBlob = (base64: string) => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleCropComplete = (croppedImage: string) => {
    const blob = base64ToBlob(croppedImage);
    const formData = new FormData();
    formData.append("avatar", blob, "avatar.jpg");
    updateProfile(formData);
    setSelectedImage(null);
  };

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("Preferences updated");
      return next;
    });
  };

  // User initials
  const initials = useMemo(() => {
    const fn = userProfile?.firstName || user?.name?.split(" ")[0] || "";
    const ln = userProfile?.lastName || user?.name?.split(" ")[1] || "";
    if (fn || ln) {
      return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
    }
    return "U";
  }, [userProfile, user]);

  const fullName = useMemo(() => {
    if (userProfile?.firstName || userProfile?.lastName) {
      return `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim();
    }
    return user?.name || "User";
  }, [userProfile, user]);

  const formattedDateJoined = useMemo(() => {
    const d = userProfile?.createdAt || user?.createdAt;
    if (!d) return "January 2024";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "January 2024";
    }
  }, [userProfile, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-12 animate-in fade-in duration-300">
        {/* Skeleton Hero Banner */}
        <div className="h-44 sm:h-52 w-full bg-muted/60 animate-pulse border-b border-border/60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
          {/* Skeleton Identity Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto">
              <Skeleton className="h-28 w-28 rounded-2xl shrink-0" />
              <div className="space-y-2.5 text-center sm:text-left">
                <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
                <Skeleton className="h-6 w-32 mx-auto sm:mx-0 rounded-full" />
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>

          {/* Skeleton Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-44 rounded-3xl" />
            </div>
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-12 w-80 rounded-xl" />
              <Skeleton className="h-96 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* ── Ambient Executive Cover Banner ─────────────────────────── */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden border-b border-border/70 bg-gradient-to-r from-primary via-primary/90 to-destructive/80">
        {/* Ambient mesh orbs */}
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-brand/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 right-10 w-96 h-96 rounded-full bg-destructive/25 blur-3xl pointer-events-none" />

        {/* Decorative Grid Overlay */}
        <div
          className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:32px_32px]"
          aria-hidden="true"
        />

        {/* Top Floating Badge in Cover */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start justify-between pt-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>CliqHire Talent Cloud</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/80 font-medium">
            <span>Workspace Profile</span>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              {user?.role || "Member"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Container ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20 space-y-6">
        {/* ── Floating Profile Identity Header Card ─────────────────── */}
        <div className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-3xl p-5 sm:p-7 shadow-xl shadow-black/[0.03] dark:shadow-none transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
            {/* User Identity Info */}
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
              {/* Avatar Box with Live Indicator & Action Trigger */}
              <div className="relative group shrink-0">
                <Avatar
                  onClick={() => userProfile?.avatar && setIsPreviewOpen(true)}
                  className={cn(
                    "h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-card bg-muted shadow-lg ring-1 ring-border/80 transition-all duration-200",
                    userProfile?.avatar ? "cursor-pointer hover:scale-102" : ""
                  )}
                >
                  <AvatarImage
                    src={userProfile?.avatar}
                    alt={fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl sm:text-3xl font-black bg-primary text-primary-foreground rounded-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Live Online Badge */}
                <div
                  className="absolute -top-1 -right-1 flex h-4 w-4"
                  title="Account Status: Active"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-card" />
                </div>

                {/* Change Avatar Button */}
                <label
                  className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-md cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 border-2 border-card"
                  title="Upload profile photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleAvatarFileSelect}
                    accept="image/*"
                  />
                </label>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {fullName}
                  </h1>

                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-lg"
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {userProfile?.teamRole || user?.role || "Member"}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold text-[10px] px-2.5 py-0.5 rounded-lg"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                    {userProfile?.status || "Active"}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />
                    {userProfile?.department
                      ? `${userProfile.department} • ${userProfile.specialization || "Professional"}`
                      : "Recruitment & Talent Ops"}
                  </span>

                  {userProfile?.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {userProfile.location}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                    Member since {formattedDateJoined}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Profile Score Widget */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4 w-full lg:w-auto shrink-0 pt-2 sm:pt-0">
              {/* Profile Strength Widget */}
              <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-muted/50 dark:bg-muted/20 border border-border/70 w-full sm:w-auto">
                <div className="relative h-11 w-11 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-muted-foreground/15"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-primary transition-all duration-700 ease-out"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - completeness / 100)}
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-foreground">
                    {completeness}%
                  </span>
                </div>

                <div className="text-left min-w-[120px]">
                  <p className="text-xs font-bold text-foreground leading-none">
                    Profile Strength
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground mt-1 truncate">
                    {completeness === 100
                      ? "Profile is fully completed!"
                      : `Add ${missingFields[0] || "details"}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs gap-2 shadow-sm transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyId}
                  title="Copy Account ID"
                  className={cn(
                    "h-10 w-10 rounded-xl border-border hover:bg-muted/80 transition-colors",
                    copiedId ? "text-emerald-500 border-emerald-500/40" : "text-muted-foreground"
                  )}
                >
                  {copiedId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Two-Column Layout ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Column: Profile Summary & System Info ─────────── */}
          <div className="lg:col-span-4 space-y-5">
            {/* Contact Details Card */}
            <Card className="rounded-3xl border-border/80 shadow-sm bg-card/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Contact & Connectivity
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Verified
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Email Item */}
                <div className="flex items-start gap-3 text-xs group">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </p>
                    <p className="font-semibold text-foreground truncate mt-0.5 select-all" title={user?.email}>
                      {user?.email || "No email available"}
                    </p>
                  </div>
                </div>

                {/* Phone Item */}
                <div className="flex items-start gap-3 text-xs group">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="font-semibold text-foreground truncate mt-0.5">
                      {formatPhoneNumber(userProfile?.phone, userProfile?.countryCode) || "Not configured"}
                    </p>
                  </div>
                </div>

                {/* Location Item */}
                <div className="flex items-start gap-3 text-xs group">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Location
                    </p>
                    <p className="font-semibold text-foreground truncate mt-0.5">
                      {userProfile?.location || "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Identifier & Security Pill Card */}
            <Card className="rounded-3xl border-border/80 shadow-sm bg-card/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  System Credentials
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Account ID Display with Masking */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Unique Account ID
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowAccountId(!showAccountId)}
                      className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {showAccountId ? (
                        <>
                          <EyeOff className="h-3 w-3" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" /> Reveal
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/70">
                    <p className="font-mono text-xs font-bold text-foreground truncate flex-1 select-all">
                      {showAccountId
                        ? user?.id || user?._id || "Unavailable"
                        : "••••••••••••••••••••••••"}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="Copy ID"
                    >
                      {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Key Metrics Mini Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Experience
                    </p>
                    <p className="text-base font-extrabold text-foreground mt-1">
                      {userProfile?.experience || "0 Years"}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Access Role
                    </p>
                    <p className="text-base font-extrabold text-foreground mt-1 truncate">
                      {user?.role || "Member"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help / Platform Info */}
            <div className="p-4 rounded-3xl bg-primary/5 border border-primary/15 text-xs flex items-start gap-3">
              <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-foreground">Need role adjustments?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Permissions and organizational reporting structures can be managed via the Administration module.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Tabbed Workspace ──────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Selector Buttons */}
              <div className="bg-card/90 backdrop-blur-sm p-1.5 rounded-2xl border border-border/80 shadow-sm mb-5">
                <TabsList className="bg-transparent h-auto p-0 gap-1 w-full flex justify-start">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Overview</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Security & Password</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="preferences"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Preferences</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── TAB 1: OVERVIEW ─────────────────────────────────── */}
              <TabsContent value="overview" className="space-y-6 focus-visible:outline-none mt-0">
                {/* Professional Details Card */}
                <Card className="rounded-3xl border-border/80 shadow-sm bg-card/95 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Briefcase className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-extrabold text-foreground">
                            Professional Profile
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Career track, department classification, and organizational alignment
                          </CardDescription>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditModalOpen(true)}
                        className="rounded-xl h-8.5 px-3 text-xs font-bold border-border hover:bg-muted"
                      >
                        <Edit3 className="h-3 w-3 mr-1.5" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Department
                        </p>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {userProfile?.department || "Unassigned"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Specialization
                        </p>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {userProfile?.specialization || "Talent Acquisition"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Total Industry Experience
                        </p>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {userProfile?.experience || "Not recorded"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Account Registration Date
                        </p>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {formattedDateJoined}
                        </p>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                            Skills & Expertise
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {userProfile?.skills?.length || 0} skills listed
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-muted/30 border border-border/60">
                        {userProfile?.skills && userProfile.skills.length > 0 ? (
                          userProfile.skills.map((skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-card border border-border/80 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                            >
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <div className="py-4 text-center w-full">
                            <p className="text-xs text-muted-foreground">
                              No skills added yet. Add skills to showcase your expertise.
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setIsEditModalOpen(true)}
                              className="text-xs font-bold text-primary mt-1"
                            >
                              Add skills now →
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Workspace Permissions & Role Overview */}
                <Card className="rounded-3xl border-border/80 shadow-sm bg-card/95 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileBadge2 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-extrabold text-foreground">
                          Workspace Permissions
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          Capabilities and access granted under your current enterprise tier
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: "Candidate Management", desc: "View, create & manage candidate pipelines", enabled: true },
                        { label: "Client & Leads Access", desc: "Access client portals and track business leads", enabled: true },
                        { label: "Job Requisition Publishing", desc: "Publish and update job requisition postings", enabled: true },
                        {
                          label: "System Administration",
                          desc: "Manage team roles, access controls and audit logs",
                          enabled: user?.role === "ADMIN",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/60"
                        >
                          <div
                            className={cn(
                              "h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                              item.enabled
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <CheckCheck className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground leading-tight">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TAB 2: SECURITY & PASSWORDS ─────────────────────── */}
              <TabsContent value="security" className="space-y-6 focus-visible:outline-none mt-0">
                {/* Change Password Card */}
                <Card className="rounded-3xl border-border/80 shadow-sm bg-card/95 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <KeyRound className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-extrabold text-foreground">
                          Change Password
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          Ensure your account stays secure by using a strong, unique password
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                      {/* Current Password */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-foreground">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showPasswords.current ? "text" : "password"}
                            placeholder="Enter current password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                            }
                            required
                            className="h-10 rounded-xl pr-10 text-xs font-medium"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-foreground">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showPasswords.new ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                            }
                            required
                            className="h-10 rounded-xl pr-10 text-xs font-medium"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* Password strength meter */}
                        {passwordForm.newPassword && (
                          <div className="pt-1.5 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span className="text-muted-foreground">Strength:</span>
                              <span className={cn(
                                passwordStrength.score === 100 ? "text-emerald-500" :
                                passwordStrength.score >= 50 ? "text-amber-500" : "text-destructive"
                              )}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <Progress value={passwordStrength.score} className="h-1.5 rounded-full" />
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-foreground">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            type={showPasswords.confirm ? "text" : "password"}
                            placeholder="Re-type new password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                            }
                            required
                            className="h-10 rounded-xl pr-10 text-xs font-medium"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={isChangingPassword}
                          className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-2 shadow-sm"
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              <span>Save Password</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Account Danger Zone */}
                <Card className="rounded-3xl border-destructive/30 shadow-sm bg-destructive/[0.02] dark:bg-destructive/[0.04] overflow-hidden">
                  <CardHeader className="p-5 sm:p-6 pb-4 border-b border-destructive/20">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                        <AlertTriangle className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-extrabold text-foreground">
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          Irreversible and destructive account operations
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">Deactivate / Terminate Account</p>
                      <p className="text-[11px] text-muted-foreground max-w-md">
                        Permanently revoke session tokens, remove profile visibility, and deactivate system privileges.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl h-9 px-4 text-xs font-bold shrink-0 transition-colors"
                    >
                      Deactivate Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TAB 3: WORKSPACE PREFERENCES ────────────────────── */}
              <TabsContent value="preferences" className="space-y-6 focus-visible:outline-none mt-0">
                <Card className="rounded-3xl border-border/80 shadow-sm bg-card/95 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Bell className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-extrabold text-foreground">
                          Notifications & Alerts
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          Configure when and how CliqHire reaches out to you
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 divide-y divide-border/60">
                    <div className="flex items-center justify-between py-3.5 first:pt-0">
                      <div className="space-y-0.5 pr-4">
                        <p className="text-xs font-bold text-foreground">Pipeline Stage Alerts</p>
                        <p className="text-[11px] text-muted-foreground">
                          Receive notifications when candidates advance through recruitment stages.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.pipelineAlerts}
                        onCheckedChange={() => handlePreferenceToggle("pipelineAlerts")}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3.5">
                      <div className="space-y-0.5 pr-4">
                        <p className="text-xs font-bold text-foreground">Weekly Digest Report</p>
                        <p className="text-[11px] text-muted-foreground">
                          Get a summarized email digest of recruitment KPIs and candidate progress.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.emailDigest}
                        onCheckedChange={() => handlePreferenceToggle("emailDigest")}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3.5">
                      <div className="space-y-0.5 pr-4">
                        <p className="text-xs font-bold text-foreground">Candidate Feedback & Notes</p>
                        <p className="text-[11px] text-muted-foreground">
                          Get notified when interviewers leave feedback or tag you on a candidate profile.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.candidateNotes}
                        onCheckedChange={() => handlePreferenceToggle("candidateNotes")}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3.5 last:pb-0">
                      <div className="space-y-0.5 pr-4">
                        <p className="text-xs font-bold text-foreground">Security Audit Notifications</p>
                        <p className="text-[11px] text-muted-foreground">
                          Get immediate alerts on new logins from unrecognized devices or browsers.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.securityNotifications}
                        onCheckedChange={() => handlePreferenceToggle("securityNotifications")}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ── Dialog: Preview High-Resolution Avatar ───────────────────── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md rounded-3xl overflow-hidden border-border/80 shadow-2xl p-0 bg-card">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <span>Profile Photo</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-2 flex flex-col items-center">
            <div className="w-64 h-64 rounded-2xl overflow-hidden border border-border/80 shadow-md relative bg-muted">
              <img
                src={selectedImage || userProfile?.avatar || ""}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <DialogFooter className="p-5 border-t border-border/60 bg-muted/30 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsPreviewOpen(false);
                setSelectedImage(null);
              }}
              className="rounded-xl text-xs font-bold"
            >
              Close
            </Button>
            {selectedImage && (
              <Button
                onClick={() => {
                  setIsPreviewOpen(false);
                  setIsCropperOpen(true);
                }}
                className="rounded-xl bg-primary text-primary-foreground text-xs font-bold"
              >
                Continue to Crop
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Image Cropper Dialog ─────────────────────────────────────── */}
      <ImageCropperDialog
        image={selectedImage}
        open={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setSelectedImage(null);
        }}
        onCrop={handleCropComplete}
      />

      {/* ── Edit Profile Modal ───────────────────────────────────────── */}
      <ProfileEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={userProfile}
        onUpdate={updateProfile}
        isUpdating={isUpdating}
      />

      {/* ── Deactivate Confirmation Dialog ──────────────────────────── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-border/80 shadow-2xl p-6 bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-extrabold text-foreground">
              Deactivate Account?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This will disable your CliqHire workspace credentials and sign you out of all active sessions. You can contact your system administrator to re-enable your account.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsDeleteModalOpen(false);
                toast.error("Please contact your administrator to process account deactivation.");
              }}
              className="rounded-xl text-xs font-bold"
            >
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
