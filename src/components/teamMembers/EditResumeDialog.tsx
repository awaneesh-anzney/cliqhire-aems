"use client";

import React, { useState } from "react";
import { TeamMember } from "@/types/teamMember";
import { updateTeamMember, uploadResume } from "@/services/teamMembersService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface EditResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember | null;
  onUpdated?: (updated: TeamMember) => void;
}

export function EditResumeDialog({ open, onOpenChange, teamMember, onUpdated }: EditResumeDialogProps) {
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  React.useEffect(() => {
    if (open && teamMember) {
      setResumeFile(null);
    }
  }, [open, teamMember]);

  const handleSave = async () => {
    if (!teamMember?._id) return;
    
    if (!resumeFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    try {
      setSaving(true);
      
      // Upload resume file
      const { resumeUrl } = await uploadResume(teamMember._id, resumeFile);
      const updated = await updateTeamMember({
        _id: teamMember._id,
        resume: resumeUrl
      });
      
      // Call the onUpdated callback
      onUpdated?.(updated);
      
      // Show success toast
      toast.success("Resume updated successfully");
      
      // Close the dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating resume:', error);
      
      // Show error toast with specific message
      const errorMessage = error instanceof Error ? error.message : 'Failed to update resume';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setResumeFile(null);
    onOpenChange(false);
  };

  if (!teamMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Resume</DialogTitle>
          <DialogDescription>
            Update resume for {teamMember.firstName+" "+teamMember.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Resume</Label>
            <input
              id="resume-file-input"
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setResumeFile(file);
                }
              }}
            />
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-border transition-colors"
              onClick={() => document.getElementById("resume-file-input")?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium text-foreground mb-1">Upload File</div>
              <div className="text-xs text-muted-foreground">5MB max</div>
              {resumeFile && (
                <div className="text-xs text-green-600 mt-2">
                  File selected: {resumeFile.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
