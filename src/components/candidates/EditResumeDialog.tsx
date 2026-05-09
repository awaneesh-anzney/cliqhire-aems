"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { candidateService, Candidate } from "@/services/candidateService";

interface EditResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onUpdated?: (updated: Candidate) => void;
}

export default function EditResumeDialog({ open, onOpenChange, candidate, onUpdated }: EditResumeDialogProps) {
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setResumeFile(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!candidate?._id) return;
    if (!resumeFile) {
      toast.error("Please select a file to upload");
      return;
    }
    try {
      setSaving(true);
      const { resumeUrl } = await candidateService.uploadResume(candidate._id, resumeFile);
      const updated = await candidateService.updateCandidate(candidate._id, { resume: resumeUrl });
      onUpdated?.(updated);
      toast.success("Resume updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating resume:", error);
      const msg = error?.message || "Failed to update resume";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setResumeFile(null);
    onOpenChange(false);
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Edit Resume</DialogTitle>
          <DialogDescription>Upload a new resume for {candidate.name || "candidate"}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Resume</Label>
            <input
              id="candidate-resume-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.rtf,.jpg,.jpeg,.png,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setResumeFile(file);
              }}
            />
            <div
              className="border-2 border-dashed border-border rounded-lg p-24 text-center cursor-pointer hover:border-border transition-colors"
              onClick={() => document.getElementById("candidate-resume-file-input")?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-3 text-blue-400" />
              <div className="text-lg text-foreground">
                Drag & drop your resume here, or <span className="text-blue-600 underline">browse</span>
                
              </div>
              <span className="text-muted-foreground text-sm"> (PDF, DOC, DOCX, RTF, JPG, PNG)</span>
              <div className="text-xs text-muted-foreground mt-1">5MB max</div>
              {resumeFile && (
                <div className="text-xs text-green-600 mt-2">File selected: {resumeFile.name}</div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
