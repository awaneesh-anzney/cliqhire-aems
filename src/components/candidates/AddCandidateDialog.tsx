"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOption: (option: "existing" | "new") => void;
}

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

function OptionCard({ icon, title, onClick }: OptionCardProps) {
  return (
    <Button
      variant="outline"
      className="h-auto flex flex-col items-center gap-6 p-8 hover:border-border hover:bg-muted"
      onClick={onClick}
    >
      <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
        {icon}
      </div>
      <span className="text-lg font-semibold text-foreground">{title}</span>
    </Button>
  );
}

export const AddCandidateDialog: React.FC<AddCandidateDialogProps> = ({ open, onOpenChange, onSelectOption }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl sticky">Select Candidate Option</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <OptionCard
            icon={<Users className="w-8 h-8 text-foreground" />}
            title="Existing Candidate"
            onClick={() => onSelectOption("existing")}
          />
          <OptionCard
            icon={<UserPlus className="w-8 h-8 text-foreground" />}
            title="Add New Candidate"
            onClick={() => onSelectOption("new")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateDialog;
