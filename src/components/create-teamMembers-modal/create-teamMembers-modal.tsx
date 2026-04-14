"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCcw } from "lucide-react";
import { CreateTeamMemberData } from "@/types/teamMember";
import { createTeamMember } from "@/services/teamMembersService";
import { PersonalInformationTab } from "./PersonalInformationTab";
import { toast } from "sonner";

interface CreateTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.teamRole?.trim() || !formData.roleId) {
      newErrors.teamRole = "Team role is required";
    }

    if (!formData.password?.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try { 
      // Only send exactly what the API expects based on the latest spec
      const payload: Partial<CreateTeamMemberData> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roleId: formData.roleId,
        phone: formData.phone,
      };

      await createTeamMember(payload as any);
      
      toast.success("Team member created successfully");
      handleClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("❌ Error creating team member:", error);
      const errorMessage = error.message || "Failed to create team member";
      toast.error(errorMessage);
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
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-xl flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Fill in the details below to invite a new user to your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <PersonalInformationTab formData={formData} setFormData={setFormData} errors={errors} />
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <div className="flex justify-end w-full gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Team Member"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
