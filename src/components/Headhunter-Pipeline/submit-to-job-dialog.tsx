"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { headhunterCandidatesService } from "@/services/headhunterCandidatesService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SubmitToJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateIds: string[];
  jobs: any[];
  onSuccess?: () => void;
}

export const SubmitToJobDialog: React.FC<SubmitToJobDialogProps> = ({
  isOpen,
  onClose,
  candidateIds,
  jobs,
  onSuccess,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedJobId) {
      toast.error("Please select a job");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await headhunterCandidatesService.submitToJob(
        selectedJobId,
        candidateIds
      );
      
      if (result.status === "success" || result.success) {
        toast.success(result.message || "Candidates submitted successfully");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(result.message || "Failed to submit candidates");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error submitting candidates");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit to Job</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="job">Select Job</Label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job to submit to" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} ({job.clientName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Submitting {candidateIds.length} candidate(s) for review.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedJobId}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
