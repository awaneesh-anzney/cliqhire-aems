"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

interface ResumeUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: File) => void;
  candidateName?: string;
}

export function ResumeUploadDialog({ open, onClose, onSelect, candidateName }: ResumeUploadDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const maxBytes = 5 * 1024 * 1024;
    if (f.size >= maxBytes) {
      setError("File must be smaller than 5MB");
      setFile(null);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleSave = () => {
    if (file) {
      onSelect(file);
      onClose();
    } else {
      setError("Please select a file under 5MB");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Resume{candidateName ? ` for ${candidateName}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Label className="text-sm">Select file (PDF preferred, max 5MB)</Label>
          <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-muted">
            <UploadCloud className="h-4 w-4" />
            <span className="text-sm">Choose File</span>
            <input type="file" accept=".pdf,.doc,.docx,.rtf,.jpg,.jpeg,.png,image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <div className="text-sm text-foreground">{file ? file.name : "No file selected"}</div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}