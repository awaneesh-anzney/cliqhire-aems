"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface DisqualificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DisqualificationData) => void;
  candidateName: string;
  currentStage: string;
  currentStageStatus?: string;
}

export interface DisqualificationData {
  disqualificationStage: string;
  disqualificationStatus: string;
  disqualificationReason: string;
  disqualificationFeedback?: string;
}

export function DisqualificationDialog({
  isOpen,
  onClose,
  onConfirm,
  candidateName,
  currentStage,
  currentStageStatus
}: DisqualificationDialogProps) {
  const [reason, setReason] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setReason("");
      setFeedback("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        disqualificationStage: currentStage,
        disqualificationStatus: currentStageStatus || "",
        disqualificationReason: reason.trim(),
        disqualificationFeedback: feedback.trim() || undefined
      });
      onClose();
    } catch (error) {
      console.error('Error submitting disqualification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const isFormValid = reason.trim().length > 0 && currentStageStatus && currentStageStatus.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Disqualify Candidate</DialogTitle>
          <DialogDescription>
            You are about to disqualify <strong>{candidateName}</strong> from the pipeline.
            Please provide the reason for disqualification.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-stage">Current Stage</Label>
            <Input
              id="current-stage"
              value={currentStage}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-stage-status">
              Current Stage Status <span className="text-red-500">*</span>
            </Label>
            <Input
              id="current-stage-status"
              value={currentStageStatus || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Disqualification <span className="text-red-500">*</span>
            </Label>
            <Select value={reason} onValueChange={(val) => setReason(val)}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Candidate Opted Out">Candidate Opted Out</SelectItem>
                <SelectItem value="Budget Exceeded">Budget Exceeded</SelectItem>
                <SelectItem value="Location Preferences">Location Preferences</SelectItem>
                <SelectItem value="Other Considerations">Other Considerations</SelectItem>
                <SelectItem value="Need Female Candidate">Need Female Candidate</SelectItem>
                <SelectItem value="Not Matching the Role">Not Matching the Role</SelectItem>
                <SelectItem value="Overqualified for Function">Overqualified for Function</SelectItem>
                <SelectItem value="Need Arabs Nationals">Need Arabs Nationals</SelectItem>
                <SelectItem value="Need Saudi Nationals">Need Saudi Nationals</SelectItem>
                <SelectItem value="Need Male Candidate">Need Male Candidate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Additional Feedback (optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Add any additional details (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Disqualifying..." : "Disqualify Candidate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
