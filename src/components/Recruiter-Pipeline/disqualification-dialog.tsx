"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, MessageSquare, Sparkles } from "lucide-react";
import { getStageColor } from "./dummy-data";

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
      <DialogContent className="max-w-lg rounded-[2rem] border border-border bg-card/95 backdrop-blur-md shadow-2xl flex flex-col max-h-[85vh] p-6 animate-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <DialogHeader className="flex-shrink-0 space-y-1">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="h-5 w-5 fill-red-500/10 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Pipeline Control</span>
          </div>
          <DialogTitle className="text-xl font-black text-foreground tracking-tight">
            Disqualify Candidate
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-bold uppercase tracking-wider text-[11px] leading-relaxed">
            Exclude candidate <strong className="text-red-500 font-black">{candidateName}</strong> from active pipeline selection.
          </DialogDescription>
        </DialogHeader>
        
        {/* Stage & Status Details Chip */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50/20 dark:bg-red-950/10 border border-red-200/30 dark:border-red-900/30 rounded-2xl my-3 flex-shrink-0 shadow-inner">
          <div className="text-left flex-1">
            <p className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1.5">Disqualification Stage</p>
            <Badge variant="outline" className={`${getStageColor(currentStage)} border font-black uppercase tracking-wider text-[10px] py-0.5 px-3 rounded-lg shadow-sm`}>
              {currentStage}
            </Badge>
          </div>
          
          <div className="text-right flex-1">
            <p className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1.5">Last Known Status</p>
            <Badge variant="outline" className="bg-red-50/80 text-red-700 border-red-200/50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50 border font-black uppercase tracking-wider text-[10px] py-0.5 px-3 rounded-lg shadow-sm">
              {currentStageStatus || "No Status"}
            </Badge>
          </div>
        </div>

        {/* Dynamic Fields Section */}
        <div className="flex-1 overflow-y-auto pr-1.5 my-3 min-h-0 space-y-4 custom-scrollbar">
          {/* Reason Selection */}
          <div className="group relative flex flex-col gap-1.5 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-card hover:border-red-500/20 transition-all duration-300 shadow-sm hover:shadow-md">
            <Label htmlFor="reason" className="text-[10px] font-black text-muted-foreground/75 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
              <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              Reason for Disqualification <span className="text-red-500 font-bold ml-0.5">*</span>
            </Label>
            <Select value={reason} onValueChange={(val) => setReason(val)}>
              <SelectTrigger id="reason" className="w-full h-10 rounded-xl border-border bg-card/60 focus:ring-red-500 font-medium text-xs shadow-sm hover:border-red-500/25 transition-colors">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="Candidate Opted Out" className="rounded-lg font-medium text-xs">Candidate Opted Out</SelectItem>
                <SelectItem value="Budget Exceeded" className="rounded-lg font-medium text-xs">Budget Exceeded</SelectItem>
                <SelectItem value="Location Preferences" className="rounded-lg font-medium text-xs">Location Preferences</SelectItem>
                <SelectItem value="Other Considerations" className="rounded-lg font-medium text-xs">Other Considerations</SelectItem>
                <SelectItem value="Need Female Candidate" className="rounded-lg font-medium text-xs">Need Female Candidate</SelectItem>
                <SelectItem value="Not Matching the Role" className="rounded-lg font-medium text-xs">Not Matching the Role</SelectItem>
                <SelectItem value="Overqualified for Function" className="rounded-lg font-medium text-xs">Overqualified for Function</SelectItem>
                <SelectItem value="Need Arabs Nationals" className="rounded-lg font-medium text-xs">Need Arabs Nationals</SelectItem>
                <SelectItem value="Need Saudi Nationals" className="rounded-lg font-medium text-xs">Need Saudi Nationals</SelectItem>
                <SelectItem value="Need Male Candidate" className="rounded-lg font-medium text-xs">Need Male Candidate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback Textarea */}
          <div className="group relative flex flex-col gap-1.5 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-card hover:border-red-500/20 transition-all duration-300 shadow-sm hover:shadow-md">
            <Label htmlFor="feedback" className="text-[10px] font-black text-muted-foreground/75 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
              <MessageSquare className="h-3.5 w-3.5 text-red-500" />
              Additional Feedback (optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Provide any additional details or context..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full rounded-xl border-border bg-card/60 focus-visible:ring-red-500 font-medium text-xs resize-none shadow-sm hover:border-red-500/25 transition-colors"
            />
          </div>
        </div>

        {/* Footer actions */}
        <DialogFooter className="flex-shrink-0 gap-2.5 mt-3 pt-3 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted py-2.5 px-4 shrink-0 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/25 py-2.5 px-4 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Disqualifying..." : "Confirm Disqualification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
