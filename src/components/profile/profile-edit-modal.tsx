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
import { User, Phone, MapPin, Briefcase, GraduationCap } from "lucide-react";

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
  });

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
      });
    }
  }, [profile, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl overflow-hidden border-none shadow-2xl p-0">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <User className="h-5 w-5" />
            </div>
            Edit Profile Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Section */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Contact Section */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Country Code</Label>
              <Input
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                placeholder="91"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="1234567890"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Work Section */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Department</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Engineering"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</Label>
              <Input
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Frontend Developer"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Other Section */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, USA"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Experience</Label>
              <Input
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="5 Years"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold text-slate-500 hover:bg-slate-50 px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest px-8 shadow-lg shadow-slate-200"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
