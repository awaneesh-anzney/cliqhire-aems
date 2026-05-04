"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  UserPlus
} from "lucide-react";
import { CreateTeamMemberData } from "@/types/teamMember";
import { createTeamMember } from "@/services/teamMembersService";
import { useRoles } from "@/hooks/useRoles";
import { toast } from "sonner";
import PhoneInput from "@/components/phone/Phoneinput";
import { cn } from "@/lib/utils";

interface CreateTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const TABS = ["Member Info", "Role & Access"] as const;

export function CreateTeamMemberModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTeamMemberModalProps) {
  const [formData, setFormData] = useState<CreateTeamMemberData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "SA",
    location: "",
    experience: "",
    skills: [],
    status: "Active",
    department: "",
    specialization: "",
    teamRole: "",
    roleId: "",
    password: "",
  });

  const [currentTab, setCurrentTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { roles, loading: rolesLoading, fetchRoles } = useRoles();

  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open, fetchRoles]);

  const handleInputChange = (field: keyof CreateTeamMemberData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRoleSelect = (roleId: string) => {
    const selectedRole = roles.find((r) => (r._id || r.id) === roleId);
    if (selectedRole) {
      setFormData((prev) => ({
        ...prev,
        roleId: roleId,
        teamRole: selectedRole.name,
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    } else if (step === 1) {
      if (!formData.roleId) newErrors.teamRole = "Please select a role";
      if (!formData.password?.trim()) newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentTab)) {
      setCurrentTab(prev => Math.min(prev + 1, TABS.length - 1));
    }
  };

  const handlePrevious = () => setCurrentTab(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(currentTab)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roleId: formData.roleId,
        phone: formData.phone,
        countryCode: formData.countryCode,
      };

      await createTeamMember(payload as any);
      toast.success("Team member onboarded successfully!");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Onboarding failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        countryCode: "SA",
        location: "",
        experience: "",
        skills: [],
        status: "Active",
        department: "",
        specialization: "",
        teamRole: "",
        roleId: "",
        password: "",
      });
      setErrors({});
      setCurrentTab(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="flex h-full lg:h-[550px] min-h-[400px]">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col w-56 bg-slate-50 border-r border-slate-200 p-8 shrink-0">
             <div className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-slate-800 text-lg tracking-tight">CliqHire</span>
              </div>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Team Management</p>
            </div>

            <div className="space-y-8">
              {TABS.map((tab, index) => (
                <div key={tab} className="flex items-start gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${currentTab === index 
                      ? "bg-primary text-white shadow-lg shadow-primary/30" 
                      : (index < currentTab ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500")}
                  `}>
                    {index < currentTab ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${currentTab === index ? "text-slate-900" : "text-slate-400"}`}>
                      {tab}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Step {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto bg-primary/5 p-4 rounded-xl border border-primary/10">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                  New members will receive an invite email with their login credentials.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="p-8 pb-4">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {currentTab === 0 ? "Add New Member" : "Security & Role"}
                </h2>
                <div className="text-[10px] text-primary font-black bg-primary/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                   {currentTab + 1} of 2
                </div>
              </div>
              <DialogDescription className="text-slate-500 font-semibold text-sm">
                {currentTab === 0 
                  ? "Basic details for the new organization member." 
                  : "Define permissions and secure their access."}
              </DialogDescription>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
              <div className="max-w-xl mx-auto py-2">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {currentTab === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700">First Name <span className="text-primary">*</span></Label>
                          <Input 
                            value={formData.firstName} 
                            onChange={(e) => handleInputChange("firstName", e.target.value)} 
                            placeholder="John" 
                            className={cn("h-11 border-slate-200 font-bold", errors.firstName && "border-red-500")}
                          />
                          {errors.firstName && <p className="text-[10px] text-red-500 font-black uppercase">{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700">Last Name</Label>
                          <Input 
                            value={formData.lastName} 
                            onChange={(e) => handleInputChange("lastName", e.target.value)} 
                            placeholder="Doe" 
                            className="h-11 border-slate-200 font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Work Email <span className="text-primary">*</span></Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <Input 
                            type="email"
                            value={formData.email} 
                            onChange={(e) => handleInputChange("email", e.target.value)} 
                            placeholder="john.doe@org.com" 
                            className={cn("pl-10 h-11 border-slate-200 font-bold", errors.email && "border-red-500")}
                          />
                        </div>
                        {errors.email && <p className="text-[10px] text-red-500 font-black uppercase">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Phone Number</Label>
                        <PhoneInput
                          countryCode={formData.countryCode || "SA"}
                          onCountryCodeChange={(v) => handleInputChange("countryCode", v)}
                          phoneNumber={formData.phone}
                          onPhoneNumberChange={(v) => handleInputChange("phone", v)}
                        />
                      </div>
                    </div>
                  )}

                  {currentTab === 1 && (
                    <div className="space-y-8">
                       <div className="space-y-4">
                        <Label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-primary" /> Permission Role
                        </Label>
                        <Select value={formData.roleId || ""} onValueChange={handleRoleSelect}>
                          <SelectTrigger className={cn("h-12 border-slate-200 font-bold bg-slate-50", errors.teamRole && "border-red-500")}>
                            <SelectValue placeholder={rolesLoading ? "Fetching access levels..." : "Select dynamic role"} />
                          </SelectTrigger>
                          <SelectContent className="z-[100]">
                            {roles.map((role) => (
                              <SelectItem key={role._id || role.id} value={(role._id || role.id) as string} className="py-3 font-bold">
                                {role.displayName || role.name}
                                {role.isSystem && <span className="ml-2 text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">SYSTEM</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.teamRole && <p className="text-[10px] text-red-500 font-black uppercase">{errors.teamRole}</p>}
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <Label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                          <Lock className="w-4 h-4 text-primary" /> Initial Password
                        </Label>
                        <div className="relative group">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            value={formData.password} 
                            onChange={(e) => handleInputChange("password", e.target.value)} 
                            placeholder="••••••••" 
                            className={cn("h-12 border-slate-200 font-bold pr-12", errors.password && "border-red-500")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-500 font-black uppercase">{errors.password}</p>}
                        <p className="text-[11px] text-slate-400 font-semibold px-1">Tip: Use at least 8 characters with numbers and symbols.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50 border-t flex flex-row items-center mt-auto shrink-0">
               <div className="flex justify-between w-full h-11 items-center">
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleClose} disabled={isSubmitting} className="text-slate-500 font-bold">
                    Cancel
                  </Button>
                  {currentTab > 0 && (
                    <Button variant="outline" onClick={handlePrevious} className="bg-white border-slate-200 font-bold px-5">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {currentTab === TABS.length - 1 ? (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 text-white px-8 font-black shadow-xl shadow-primary/30"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      Onboard Member
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext} 
                      className="bg-primary hover:bg-primary/90 text-white px-8 font-black shadow-xl shadow-primary/30"
                    >
                      Next Step <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
