"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  LogOut,
  Edit2,
  CheckCircle2,
  Globe,
  Award,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCropperDialog } from "@/components/profile/image-cropper-dialog";
import { ProfileEditModal } from "@/components/profile/profile-edit-modal";

export default function ProfilePage() {
  const { profile, isLoading, updateProfile, isUpdating, changePassword, isChangingPassword } = useProfile();
  const [activeTab, setActiveTab] = useState("overview");

  // Avatar Edit States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
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

  const [copied, setCopied] = useState(false);
  const [showAccountId, setShowAccountId] = useState(false);

  const user = profile;
  const userProfile = profile?.profile;

  // Calculate profile completeness based on filled details
  const getProfileCompleteness = () => {
    if (!userProfile) return 0;
    const fields = [
      userProfile.firstName,
      userProfile.lastName,
      userProfile.phone,
      userProfile.location,
      userProfile.department,
      userProfile.specialization,
      userProfile.skills && userProfile.skills.length > 0,
      userProfile.avatar
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleCopyId = () => {
    const accountId = user?.id || user?._id;
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 pb-4 animate-in fade-in duration-500">
        <div className="h-32 bg-muted animate-pulse relative" />
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 -mt-10 relative z-10 space-y-5">
          <div className="bg-card border border-border/85 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-3 text-center md:text-left flex-1">
                <Skeleton className="h-7 w-40 mx-auto md:mx-0" />
                <Skeleton className="h-4 w-56 mx-auto md:mx-0" />
              </div>
            </div>
            <Skeleton className="h-14 w-32 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="space-y-5">
              <Skeleton className="h-48 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
            </div>
            <div className="lg:col-span-2 space-y-5">
              <Skeleton className="h-10 w-full rounded-2xl" />
              <Skeleton className="h-80 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsPreviewOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
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
    // Send as FormData for multipart upload
    const blob = base64ToBlob(croppedImage);
    
    const formData = new FormData();
    // Using 3 arguments for append (field, blob, filename) ensures it's treated as a file
    formData.append("avatar", blob, "avatar.jpg");
    
    updateProfile(formData);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-10">
      {/* Hero Header - Animated Mesh Gradient */}
      <div className="h-32 bg-gradient-to-r from-zinc-950 via-brand/80 to-emerald-950 relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-[-20%] left-[-10%] w-72 h-72 rounded-full bg-brand/20 blur-3xl animate-pulse duration-[6000ms]"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl animate-pulse duration-[8000ms]"></div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 -mt-10 relative z-10">
        {/* Floating Profile Info Banner */}
        <div className="backdrop-blur-md bg-card/80 dark:bg-zinc-900/75 border border-border/80 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full md:w-auto">
            <div className="relative group">
              {/* Outer Glow Ring on Hover */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand to-emerald-400 opacity-60 blur-md group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
              
              <Avatar className="h-24 w-24 border-4 border-card relative z-10 shadow-2xl">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="text-2xl font-extrabold bg-brand text-white">
                  {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 z-20 h-8 w-8 bg-card hover:bg-brand hover:text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer border border-border text-foreground transition-all duration-200 hover:scale-110 active:scale-95">
                <Camera className="h-4 w-4" />
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept=".jpg,.jpeg,.png" />
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h1>
                <Badge variant="secondary" className={cn(
                  "border-none px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-widest w-fit self-center sm:self-auto",
                  userProfile?.status === "Active" 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15" 
                    : "bg-muted text-muted-foreground hover:bg-muted"
                )}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {userProfile?.status || "Active"}
                </Badge>
              </div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                {userProfile?.teamRole || user?.role} • {userProfile?.department || "No Department"}
              </p>
            </div>
          </div>

          {/* Profile Completeness display in Header */}
          <div className="flex items-center gap-3 bg-muted/65 dark:bg-zinc-800/40 p-2.5 sm:p-3 rounded-2xl border border-border/50 w-full md:w-auto shadow-sm">
            <div className="relative h-12 w-12 flex items-center justify-center">
              {/* Radial progress circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-muted-foreground/10"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-brand transition-all duration-500 ease-out"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - getProfileCompleteness() / 100)}
                />
              </svg>
              <span className="absolute text-[10px] font-black text-foreground">{getProfileCompleteness()}%</span>
            </div>
            <div>
              <p className="text-xs font-black text-foreground tracking-tight">Profile Strength</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">
                {getProfileCompleteness() === 100 ? "All steps complete!" : "Add details to hit 100%"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start mt-6 pb-12">
          {/* Left Column - Contacts Sidebar & Stats */}
          <div className="w-full lg:w-80 space-y-5">
            
            {/* Quick Contacts Card */}
            <Card className="border border-border/60 shadow-xl shadow-black/[0.02] dark:shadow-none rounded-3xl overflow-hidden bg-card/60 backdrop-blur-sm">
              <CardHeader className="p-4 pb-1 border-b border-border/40">
                <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground group transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-muted dark:bg-zinc-800 border border-border/40 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/20 flex items-center justify-center transition-all duration-300">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Email Address</p>
                    <p className="truncate text-foreground font-bold mt-0.5 text-xs" title={user?.email}>{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground group transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-muted dark:bg-zinc-800 border border-border/40 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/20 flex items-center justify-center transition-all duration-300">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Phone Number</p>
                    <p className="truncate text-foreground font-bold mt-0.5 text-xs">
                      {formatPhoneNumber(userProfile?.phone, userProfile?.countryCode) || "Not Set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground group transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-muted dark:bg-zinc-800 border border-border/40 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/20 flex items-center justify-center transition-all duration-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Location</p>
                    <p className="truncate text-foreground font-bold mt-0.5 text-xs">{userProfile?.location || "Not Set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Metrics */}
            <Card className="border border-border/60 shadow-xl shadow-black/[0.02] dark:shadow-none rounded-3xl overflow-hidden bg-card/60 backdrop-blur-sm p-4">
              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-muted/50 dark:bg-zinc-800/40 border border-border/40 hover:border-brand/35 hover:bg-brand/[0.02] transition-all duration-300 group">
                  <p className="text-xl font-black text-foreground group-hover:text-brand transition-colors">{userProfile?.experience || "0 Year"}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Experience</p>
                </div>
                <div className="p-3 rounded-2xl bg-muted/50 dark:bg-zinc-800/40 border border-border/40 hover:border-brand/35 hover:bg-brand/[0.02] transition-all duration-300 group">
                  <p className="text-xl font-black text-foreground group-hover:text-brand transition-colors">0</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Total Hires</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Tabs View */}
          <div className="flex-1 w-full space-y-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Selector Header */}
              <div className="flex items-center justify-between mb-4 bg-card/60 backdrop-blur-sm p-1 rounded-2xl border border-border/60 shadow-sm">
                <TabsList className="bg-transparent h-auto p-0 gap-1">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-brand data-[state=active]:text-white h-9 px-4.5 rounded-xl font-black text-xs uppercase tracking-wider text-muted-foreground transition-all duration-350 border-none shadow-none"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:bg-brand data-[state=active]:text-white h-9 px-4.5 rounded-xl font-black text-xs uppercase tracking-wider text-muted-foreground transition-all duration-350 border-none shadow-none"
                  >
                    Security
                  </TabsTrigger>
                </TabsList>
                
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-brand hover:bg-brand/10 font-bold h-9 px-3 rounded-xl text-xs uppercase tracking-wider"
                >
                   <Settings className="h-4 w-4 mr-2" />
                   Customize
                </Button>
              </div>

              {/* OVERVIEW CONTENT */}
              <TabsContent value="overview" className="space-y-5 mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Professional Details Card */}
                  <Card className="border border-border/60 shadow-xl shadow-black/[0.02] dark:shadow-none rounded-3xl overflow-hidden md:col-span-2 bg-card/60 backdrop-blur-sm">
                    <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/40">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                         <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/15">
                               <Briefcase className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-black text-foreground tracking-tight">Professional Profile</CardTitle>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Your career & skill settings</p>
                            </div>
                         </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl font-black text-[10px] uppercase tracking-wider border-border hover:border-brand hover:text-brand hover:bg-brand/5 transition-all duration-300 h-8.5 px-3"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                             <Edit2 className="h-3 w-3 mr-1.5" />
                             Edit Details
                          </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                           <div className="space-y-0.5 bg-muted/30 dark:bg-zinc-800/10 p-3 rounded-2xl border border-border/30">
                              <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Department</Label>
                              <p className="text-xs font-bold text-foreground mt-0.5">{userProfile?.department || "N/A"}</p>
                           </div>
                           <div className="space-y-0.5 bg-muted/30 dark:bg-zinc-800/10 p-3 rounded-2xl border border-border/30">
                              <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Specialization</Label>
                              <p className="text-xs font-bold text-foreground mt-0.5">{userProfile?.specialization || "N/A"}</p>
                           </div>
                           
                           <div className="space-y-0.5 bg-muted/30 dark:bg-zinc-800/10 p-3 rounded-2xl border border-border/30 sm:col-span-2">
                              <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 block">Skills & Expertise</Label>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                 {userProfile?.skills?.map((skill, index) => (
                                   <Badge key={index} variant="secondary" className="bg-muted dark:bg-zinc-800 hover:bg-brand hover:text-white text-foreground border border-border/50 hover:border-brand font-bold py-0.5 px-2.5 rounded-lg text-[11px] transition-all duration-200 hover:scale-105 select-none cursor-default">
                                     {skill}
                                   </Badge>
                                 ))}
                                 {(!userProfile?.skills || userProfile.skills.length === 0) && (
                                   <p className="text-xs text-muted-foreground italic">No skills added yet</p>
                                 )}
                              </div>
                           </div>
                           
                           <div className="space-y-0.5 bg-muted/30 dark:bg-zinc-800/10 p-3 rounded-2xl border border-border/30 sm:col-span-2">
                              <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Member Since</Label>
                              <p className="text-xs font-bold text-foreground mt-0.5">
                                {userProfile?.createdAt 
                                  ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
                                  : "January 2024"}
                              </p>
                           </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Recognition & Awards */}
                  <Card className="border border-border/60 shadow-xl shadow-black/[0.02] dark:shadow-none rounded-3xl overflow-hidden bg-card/60 backdrop-blur-sm flex flex-col justify-between">
                    <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/40">
                       <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                             <Award className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-black text-foreground tracking-tight">Awards & Recognition</CardTitle>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Achievements and badges</p>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6">
                       <div className="flex items-center gap-3.5 bg-muted/50 dark:bg-zinc-800/20 p-3.5 rounded-2xl border border-border/50 hover:border-amber-500/30 transition-all duration-300 group">
                          <div className="h-10 w-10 rounded-full bg-card shadow-sm flex items-center justify-center border border-border/80 group-hover:scale-110 transition-transform duration-300">
                             <Globe className="h-5 w-5 text-brand" />
                          </div>
                          <div>
                             <p className="text-xs font-black text-foreground tracking-tight group-hover:text-brand transition-colors">Top Recruiter Q1</p>
                             <p className="text-[8px] text-muted-foreground font-black uppercase tracking-wider mt-0.5">Awarded 2024</p>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Secure Identity Card with Copy Functionality */}
                  <Card className="border border-border/60 shadow-xl shadow-black/[0.02] dark:shadow-none rounded-3xl overflow-hidden bg-card/60 backdrop-blur-sm flex flex-col justify-between">
                    <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/40">
                       <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
                             <ShieldCheck className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-black text-foreground tracking-tight">System Identity</CardTitle>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Your secure public ID</p>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
                       <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 shadow-inner relative overflow-hidden group/id">
                          {/* Background glow circle */}
                          <div className="absolute top-[-50%] right-[-30%] w-32 h-32 rounded-full bg-indigo-500/10 blur-xl"></div>
                          
                          <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 relative z-10">Public Unique Identifier</p>
                          
                          <div className="flex items-center justify-between gap-4 relative z-10">
                            <p className="text-[11px] font-mono text-indigo-300 font-bold truncate tracking-wide flex-1 select-all">
                              {showAccountId 
                                ? (user?.id || user?._id || "No ID Available") 
                                : "••••••••••••••••••••••••"
                              }
                            </p>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setShowAccountId(!showAccountId)}
                                className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-all"
                                title={showAccountId ? "Hide Identifier" : "Show Identifier"}
                              >
                                {showAccountId ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              
                              <button
                                type="button"
                                onClick={handleCopyId}
                                className={cn(
                                  "h-7 w-7 rounded-lg border flex items-center justify-center transition-all",
                                  copied 
                                    ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400" 
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                                )}
                                title="Copy Unique ID"
                              >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* SECURITY CONTENT */}
              <TabsContent value="settings" className="space-y-5 mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Card className="border border-border/60 shadow-xl shadow-black/[0.02] dark:shadow-none rounded-3xl overflow-hidden bg-card/60 backdrop-blur-sm">
                  <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-border/40 bg-muted/30">
                    <div className="flex items-center gap-2.5">
                       <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/15">
                          <KeyRound className="h-4.5 w-4.5" />
                       </div>
                       <div>
                          <CardTitle className="text-base font-black text-foreground tracking-tight">Security & Credentials</CardTitle>
                          <CardDescription className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Manage your account protection</CardDescription>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-2xl">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Current Password</Label>
                        <div className="relative">
                          <Input 
                            type={showPasswords.current ? "text" : "password"} 
                            placeholder="••••••••"
                            className="h-10 rounded-xl bg-muted/60 dark:bg-zinc-855/40 border-border/80 focus:bg-card transition-all font-mono pr-12 text-xs"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">New Password</Label>
                          <div className="relative">
                            <Input 
                              type={showPasswords.new ? "text" : "password"} 
                              placeholder="••••••••"
                              className="h-10 rounded-xl bg-muted/60 dark:bg-zinc-855/40 border-border/80 focus:bg-card transition-all font-mono pr-12 text-xs"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Confirm New Password</Label>
                          <div className="relative">
                            <Input 
                              type={showPasswords.confirm ? "text" : "password"} 
                              placeholder="••••••••"
                              className="h-10 rounded-xl bg-muted/60 dark:bg-zinc-855/40 border-border/80 focus:bg-card transition-all font-mono pr-12 text-xs"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto px-8 h-10 bg-foreground hover:bg-black dark:bg-zinc-200 dark:hover:bg-white dark:text-zinc-950 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all duration-200 active:scale-98"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            Updating...
                          </div>
                        ) : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Danger Zone Card */}
                <Card className="border border-red-500/20 shadow-xl shadow-red-100/5 dark:shadow-none rounded-3xl overflow-hidden bg-red-500/[0.02] dark:bg-red-950/[0.02]">
                  <CardHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-red-500/10">
                     <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20">
                           <LogOut className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-black text-foreground tracking-tight">Danger Zone</CardTitle>
                          <p className="text-[9px] font-bold text-red-500/80 uppercase tracking-widest mt-0.5">Destructive actions</p>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                     <p className="text-xs text-muted-foreground font-medium mb-4">Once you delete your account, all credentials, profile history, and association will be permanently wiped. This action is irreversible.</p>
                     <Button variant="outline" className="border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-black uppercase tracking-wider text-xs h-10 px-5 rounded-xl transition-colors">
                        Terminate Account
                     </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Original Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl rounded-3xl overflow-hidden border-none shadow-2xl p-0">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-brand" />
              Preview Original Image
            </DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-4 flex justify-center bg-muted py-10">
            <img 
              src={selectedImage || ""} 
              alt="Preview" 
              className="max-h-[50vh] rounded-2xl shadow-lg border-4 border-white" 
            />
          </div>
          <DialogFooter className="p-6 bg-card flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsPreviewOpen(false);
                setSelectedImage(null);
              }} 
              className="rounded-xl font-bold text-muted-foreground"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsPreviewOpen(false);
                setIsCropperOpen(true);
              }} 
              className="rounded-xl bg-foreground hover:bg-black text-white font-black uppercase tracking-widest px-8"
            >
              Continue to Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Component */}
      <ImageCropperDialog
        image={selectedImage}
        open={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setSelectedImage(null);
        }}
        onCrop={handleCropComplete}
      />
      
      {/* Edit Profile Modal */}
      <ProfileEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={userProfile}
        onUpdate={updateProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
}
