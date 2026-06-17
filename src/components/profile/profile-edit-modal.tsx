"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, Briefcase, Sparkles } from "lucide-react";
import PhoneInput from "@/components/phone/Phoneinput";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  onUpdate: (data: any) => void;
  isUpdating: boolean;
}

export function ProfileEditModal({
  open,
  onClose,
  profile,
  onUpdate,
  isUpdating,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "",
    location: "",
    department: "",
    specialization: "",
    experience: "",
    skills: [] as string[],
  });

  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        countryCode: profile.countryCode || "",
        location: profile.location || "",
        department: profile.department || "",
        specialization: profile.specialization || "",
        experience: profile.experience || "",
        skills: Array.isArray(profile.skills) ? profile.skills : [],
      });
      setSkillsInput(Array.isArray(profile.skills) ? profile.skills.join(", ") : "");
    }
  }, [profile, open]);

  const handleSkillsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillsInput(value);
    const skillsArray = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    setFormData((prev) => ({ ...prev, skills: skillsArray }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl overflow-hidden border border-border/80 shadow-2xl p-0 bg-card/95 backdrop-blur-md">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/15">
              <User className="h-5 w-5" />
            </div>
            <div>
              Edit Profile Details
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 font-normal">Update your public details & credentials</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Section */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="h-11 rounded-xl bg-muted/60 dark:bg-zinc-800/40 border-border/80 focus:bg-card transition-all font-semibold"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="h-11 rounded-xl bg-muted/60 dark:bg-zinc-800/40 border-border/80 focus:bg-card transition-all font-semibold"
                required
              />
            </div>

            {/* Contact Section */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Number</Label>
              <PhoneInput
                phoneNumber={formData.phone}
                onPhoneNumberChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
                countryCode={formData.countryCode}
                onCountryCodeChange={(val) => setFormData((prev) => ({ ...prev, countryCode: val }))}
              />
            </div>

            {/* Work Section */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Department</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Engineering"
                className="h-11 rounded-xl bg-muted/60 dark:bg-zinc-800/40 border-border/80 focus:bg-card transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Specialization</Label>
              <Input
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Frontend Developer"
                className="h-11 rounded-xl bg-muted/60 dark:bg-zinc-800/40 border-border/80 focus:bg-card transition-all font-semibold"
              />
            </div>

            {/* Other Section */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, USA"
                className="h-11 rounded-xl bg-muted/60 dark:bg-zinc-800/40 border-border/80 focus:bg-card transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Experience</Label>
              <Input
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="5 Years"
                className="h-11 rounded-xl bg-muted/60 dark:bg-zinc-800/40 border-border/80 focus:bg-card transition-all font-semibold"
              />
            </div>

            {/* Skills Input */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                Skills & Expertise (separated by commas)
              </Label>
              <Input
                value={skillsInput}
                onChange={handleSkillsInputChange}
                placeholder="React, Next.js, Node.js, TypeScript"
                className="h-11 rounded-xl bg-muted/60 dark:bg-zinc-800/40 border-border/80 focus:bg-card transition-all font-semibold"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold text-muted-foreground hover:bg-muted px-8 h-11 text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="rounded-xl bg-brand hover:bg-brand-dark dark:bg-brand dark:hover:bg-brand/90 text-white font-black uppercase tracking-widest px-8 shadow-lg shadow-brand/10 h-11 text-xs"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
