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
  EyeOff
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
         <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-3">
               <Skeleton className="h-8 w-64" />
               <Skeleton className="h-4 w-48" />
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl md:col-span-2" />
         </div>
      </div>
    );
  }

  const user = profile;
  const userProfile = profile?.profile;

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
    <div className="min-h-screen bg-slate-50/30">
      {/* Hero Header */}
      <div className="h-48 bg-gradient-to-r from-brand/90 to-brand-dark relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar / Profile Info */}
          <div className="w-full md:w-80 space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardContent className="p-0 text-center">
                <div className="p-8 pt-10 flex flex-col items-center">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                      <AvatarImage src={userProfile?.avatar} />
                      <AvatarFallback className="text-3xl font-bold bg-brand text-white">
                        {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-1 right-1 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer border border-slate-100 text-slate-600 hover:text-brand transition-all hover:scale-110 active:scale-95">
                      <Camera className="h-5 w-5" />
                      <input type="file" className="hidden" onChange={handleAvatarUpload} accept=".jpg,.jpeg,.png" />
                    </label>
                  </div>
                  
                  <h1 className="mt-6 text-2xl font-black text-slate-900 tracking-tight">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </h1>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {userProfile?.teamRole || user?.role}
                  </p>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary" className={cn(
                      "border-none px-3 font-bold uppercase text-[10px] tracking-widest",
                      userProfile?.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                    )}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {userProfile?.status || "Active"}
                    </Badge>
                  </div>
                </div>

                <div className="border-t border-slate-50 p-6 space-y-4">
                   <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 group hover:text-brand transition-colors cursor-default">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-brand/10 flex items-center justify-center transition-all">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="truncate">{user?.email}</span>
                   </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 group hover:text-brand transition-colors cursor-default">
                       <div className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-brand/10 flex items-center justify-center transition-all">
                         <Phone className="h-4 w-4" />
                       </div>
                       <span>{formatPhoneNumber(userProfile?.phone, userProfile?.countryCode) || "Not Set"}</span>
                    </div>
                   <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 group hover:text-brand transition-colors cursor-default">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-brand/10 flex items-center justify-center transition-all">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span>{userProfile?.location || "Not Set"}</span>
                   </div>
                </div>
              </CardContent>
            </Card>

             <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden p-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                   <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand/30 transition-colors">
                      <p className="text-lg font-black text-slate-900">{userProfile?.experience || "0 Year"}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Exp</p>
                   </div>
                   <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand/30 transition-colors">
                      <p className="text-lg font-black text-slate-900">0</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Hires</p>
                   </div>
                </div>
             </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6 pb-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                <TabsList className="bg-transparent h-auto p-0 gap-2">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-brand data-[state=active]:text-white h-11 px-6 rounded-xl font-bold text-sm text-slate-500 transition-all border-none shadow-none"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:bg-brand data-[state=active]:text-white h-11 px-6 rounded-xl font-bold text-sm text-slate-500 transition-all border-none shadow-none"
                  >
                    Security
                  </TabsTrigger>
                </TabsList>
                
                <Button variant="ghost" className="text-slate-400 hover:text-brand font-bold h-11 px-6 rounded-xl">
                   <Settings className="h-4 w-4 mr-2" />
                   Customize
                </Button>
              </div>

              <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* About Card */}
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden md:col-span-2">
                    <CardHeader className="px-8 pt-8 border-b border-slate-50">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                               <Briefcase className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Professional Profile</CardTitle>
                         </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl font-bold border-slate-200 hover:border-brand hover:text-brand"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                             <Edit2 className="h-3.5 w-3.5 mr-2" />
                             Edit Details
                          </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-1">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</Label>
                              <p className="text-sm font-bold text-slate-700">{userProfile?.department || "N/A"}</p>
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</Label>
                              <p className="text-sm font-bold text-slate-700">{userProfile?.specialization || "N/A"}</p>
                           </div>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skills & Expertise</Label>
                             <div className="flex flex-wrap gap-2 mt-1">
                                {userProfile?.skills?.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">
                                    {skill}
                                  </Badge>
                                ))}
                                {(!userProfile?.skills || userProfile.skills.length === 0) && (
                                  <p className="text-sm text-slate-400 italic">No skills added yet</p>
                                )}
                             </div>
                          </div>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</Label>
                             <p className="text-sm font-bold text-slate-700">
                               {userProfile?.createdAt 
                                 ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
                                 : "January 2024"}
                             </p>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Recognition */}
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                    <CardHeader className="px-8 pt-8">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                             <Award className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Awards</CardTitle>
                       </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                             <Globe className="h-6 w-6 text-brand" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-800">Top Recruiter Q1</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Awarded 2024</p>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Account Identity */}
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                    <CardHeader className="px-8 pt-8">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                             <ShieldCheck className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Account ID</CardTitle>
                       </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                       <div className="bg-slate-900 p-4 rounded-2xl shadow-lg">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Public Unique Identifier</p>
                          <p className="text-xs font-mono text-indigo-300 font-bold truncate">{user?.id || user?._id}</p>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                  <CardHeader className="px-8 pt-8 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                          <KeyRound className="h-5 w-5" />
                       </div>
                       <div>
                          <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Security & Credentials</CardTitle>
                          <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Manage your account protection</CardDescription>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</Label>
                        <div className="relative">
                          <Input 
                            type={showPasswords.current ? "text" : "password"} 
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-mono pr-12"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</Label>
                        <div className="relative">
                          <Input 
                            type={showPasswords.new ? "text" : "password"} 
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-mono pr-12"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</Label>
                        <div className="relative">
                          <Input 
                            type={showPasswords.confirm ? "text" : "password"} 
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-mono pr-12"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <div className="flex items-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            Updating...
                          </div>
                        ) : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-red-100/50 rounded-3xl overflow-hidden border-2 border-red-50">
                  <CardHeader className="px-8 pt-8">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                           <LogOut className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Danger Zone</CardTitle>
                     </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                     <p className="text-sm text-slate-500 font-medium mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                     <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 font-black uppercase tracking-widest text-xs h-11 px-6 rounded-xl">
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
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-brand" />
              Preview Original Image
            </DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-4 flex justify-center bg-slate-50 py-10">
            <img 
              src={selectedImage || ""} 
              alt="Preview" 
              className="max-h-[50vh] rounded-2xl shadow-lg border-4 border-white" 
            />
          </div>
          <DialogFooter className="p-6 bg-white flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsPreviewOpen(false);
                setSelectedImage(null);
              }} 
              className="rounded-xl font-bold text-slate-500"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsPreviewOpen(false);
                setIsCropperOpen(true);
              }} 
              className="rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest px-8"
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
