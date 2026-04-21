"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus, Users } from "lucide-react";

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
}

function OptionCard({ icon, title, description, onClick }: OptionCardProps) {
  return (
    <Button
      variant="outline"
      className="h-auto flex flex-col items-center gap-4 p-8 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 group shadow-sm hover:shadow-md bg-white"
      onClick={onClick}
    >
      <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300">
        {React.cloneElement(icon as React.ReactElement, {
          className: "w-8 h-8 text-primary transition-colors duration-300"
        })}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">{title}</span>
        {description && (
          <span className="text-sm text-slate-500 font-normal group-hover:text-slate-600 transition-colors duration-300">{description}</span>
        )}
      </div>
    </Button>
  );
}

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExisting: () => void;
  onAddNew: () => void;
  jobTitle?: string;
}

export function AddCandidateDialog({
  open,
  onOpenChange,
  onAddExisting,
  onAddNew,
  jobTitle,
}: AddCandidateDialogProps) {
  const handleExistingClick = () => {
    onAddExisting();
    onOpenChange(false);
  };

  const handleNewClick = () => {
    onAddNew();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-8 border-primary/10">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black text-primary leading-tight tracking-tight">
            Add Candidate
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-base mt-2">
            {jobTitle
              ? `Expand your talent pool for "${jobTitle}" by choosing one of the methods below.`
              : "Choose your preferred method to add a new candidate to the pipeline."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OptionCard
            icon={<Users />}
            title="Attach Existing Candidate"
            description="Select from main candidate list"
            onClick={handleExistingClick}
          />
          <OptionCard
            icon={<UserPlus />}
            title="Add Temporary Candidate"
            description="No email or phone available"
            onClick={handleNewClick}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
