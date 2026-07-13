"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Date of Birth Dialog
interface DateOfBirthDialogProps {
  open: boolean;
  onClose: () => void;
  currentValue?: string;
  onSave: (value: string) => void;
}

export function DateOfBirthDialog({
  open,
  onClose,
  currentValue,
  onSave,
}: DateOfBirthDialogProps) {
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    currentValue ? new Date(currentValue) : undefined
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Reset form when dialog opens/closes or current value changes
  useEffect(() => {
    if (open) {
      setDateOfBirth(currentValue ? new Date(currentValue) : undefined);
    }
  }, [open, currentValue]);

  const handleSave = () => {
    if (dateOfBirth) {
      // Fix timezone issue by using local date formatting
      const year = dateOfBirth.getFullYear();
      const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
      const day = String(dateOfBirth.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onSave(formattedDate);
    }
    onClose();
  };

  const handleCancel = () => {
    setDateOfBirth(currentValue ? new Date(currentValue) : undefined);
    onClose();
  };

  // Calculate max date (today - no future dates)
  const maxDate = new Date();

  // Calculate min date (100 years ago from today)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Date of Birth</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={dateOfBirth}
                  onSelect={(date) => {
                    setDateOfBirth(date);
                    setDatePickerOpen(false);
                  }}
                  disabled={(date) => {
                    // Only disable future dates
                    return date > maxDate;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Marital Status Dialog
interface MaritalStatusDialogProps {
  open: boolean;
  onClose: () => void;
  currentValue?: string;
  onSave: (value: string) => void;
}

const maritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
];

export function MaritalStatusDialog({
  open,
  onClose,
  currentValue,
  onSave,
}: MaritalStatusDialogProps) {
  const [maritalStatus, setMaritalStatus] = useState(currentValue || "");

  // Reset form when dialog opens/closes or current value changes
  useEffect(() => {
    if (open) {
      setMaritalStatus(currentValue || "");
    }
  }, [open, currentValue]);

  const handleSave = () => {
    onSave(maritalStatus);
    onClose();
  };

  const handleCancel = () => {
    setMaritalStatus(currentValue || "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Marital Status</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select value={maritalStatus} onValueChange={setMaritalStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                {maritalStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Gender Dialog
interface GenderDialogProps {
  open: boolean;
  onClose: () => void;
  currentValue?: string;
  onSave: (value: string) => void;
}

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function GenderDialog({
  open,
  onClose,
  currentValue,
  onSave,
}: GenderDialogProps) {
  const [gender, setGender] = useState(currentValue || "");

  // Reset form when dialog opens/closes or current value changes
  useEffect(() => {
    if (open) {
      setGender(currentValue || "");
    }
  }, [open, currentValue]);

  const handleSave = () => {
    onSave(gender);
    onClose();
  };

  const handleCancel = () => {
    setGender(currentValue || "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Gender</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Status Dialog
interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  currentValue?: string;
  onSave: (value: string) => void;
}

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Shortlisted", label: "Shortlisted" },
  { value: "Interviewing", label: "Interviewing" },
  { value: "Offer", label: "Offer" },
  { value: "Hired", label: "Hired" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
];

export function StatusDialog({
  open,
  onClose,
  currentValue,
  onSave,
}: StatusDialogProps) {
  const [status, setStatus] = useState(currentValue || "");

  // Reset form when dialog opens/closes or current value changes
  useEffect(() => {
    if (open) {
      setStatus(currentValue || "");
    }
  }, [open, currentValue]);

  const handleSave = () => {
    onSave(status);
    onClose();
  };

  const handleCancel = () => {
    setStatus(currentValue || "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Status</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Willing To Relocate Dialog
interface WillingToRelocateDialogProps {
  open: boolean;
  onClose: () => void;
  currentValue?: string;
  onSave: (value: string) => void;
}

const willingToRelocateOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export function WillingToRelocateDialog({
  open,
  onClose,
  currentValue,
  onSave,
}: WillingToRelocateDialogProps) {
  const [willingToRelocate, setWillingToRelocate] = useState(currentValue || "");

  // Reset form when dialog opens/closes or current value changes
  useEffect(() => {
    if (open) {
      setWillingToRelocate(currentValue || "");
    }
  }, [open, currentValue]);

  const handleSave = () => {
    onSave(willingToRelocate);
    onClose();
  };

  const handleCancel = () => {
    setWillingToRelocate(currentValue || "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Relocation Preference</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="willingToRelocate">Are you willing to relocate?</Label>
            <Select value={willingToRelocate} onValueChange={setWillingToRelocate}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {willingToRelocateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
