"use client";

import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStageColor, mapUIStageToBackendStage, type Candidate } from "./dummy-data";
import { format } from "date-fns";

interface StatusChangeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data?: Record<string, any>) => void;
  candidateName: string;
  currentStage: string;
  newStage: string;
  candidate?: Candidate | null;
}

interface StageFieldConfig {
  key: string;
  label: string;
  type: "text" | "date" | "datetime" | "select" | "textarea" | "rating";
  options?: string[];
  placeholder?: string;
}

const STAGE_FIELDS_MAP: Record<string, StageFieldConfig[]> = {
  "Sourcing": [
    { key: "sourcingDate", label: "CV Received Date", type: "date" },
    { key: "connection", label: "Sourcing Channel", type: "select", options: ["LinkedIn", "Email", "Indeed", "Referral", "Direct", "Other"] },
    { key: "outreachChannel", label: "Outreach Channel", type: "select", options: ["Email", "Phone", "LinkedIn Message", "WhatsApp", "Other"] },
    { key: "sourcingRating", label: "Sourcing Rating (1-5)", type: "rating", options: ["1", "2", "3", "4", "5"] },
    { key: "notes", label: "Notes", type: "textarea", placeholder: "Enter sourcing notes..." }
  ],
  "Screening": [
    { key: "sourcingDate", label: "CV Received Date", type: "date" },
    { key: "screeningDate", label: "Screening Date", type: "date" },
    { key: "aemsInterviewDate", label: "Internal Interview Date", type: "datetime" },
    { key: "rating", label: "Rating (1-5)", type: "rating", options: ["1", "2", "3", "4", "5"] },
    { key: "screeningRating", label: "Screening Rating (1-5)", type: "rating", options: ["1", "2", "3", "4", "5"] },
    { key: "technicalAssessment", label: "Technical Assessment", type: "text", placeholder: "Enter technical assessment" },
    { key: "softSkillsAssessment", label: "Soft Skills Assessment", type: "text", placeholder: "Enter soft skills assessment" },
    { key: "feedback", label: "Feedback", type: "textarea", placeholder: "Enter feedback..." }
  ],
  "Client Review": [
    { key: "clientScreeningDate", label: "Client Review Date", type: "date" },
    { key: "clientFeedback", label: "Client Feedback", type: "select", options: ["Pending", "In Progress", "Complete"] },
    { key: "clientRating", label: "Client Rating (1-5)", type: "rating", options: ["1", "2", "3", "4", "5"] },
    { key: "feedback", label: "Feedback", type: "textarea", placeholder: "Enter feedback..." }
  ],
  "Client Screening": [
    { key: "clientScreeningDate", label: "Client Review Date", type: "date" },
    { key: "clientFeedback", label: "Client Feedback", type: "select", options: ["Pending", "In Progress", "Complete"] },
    { key: "clientRating", label: "Client Rating (1-5)", type: "rating", options: ["1", "2", "3", "4", "5"] },
    { key: "feedback", label: "Feedback", type: "textarea", placeholder: "Enter feedback..." }
  ],
  "Interview": [
    { key: "interviewDate", label: "Interview Date", type: "datetime" },
    { key: "interviewStatus", label: "Interview Status", type: "select", options: ["Scheduled", "Completed", "Cancelled", "Rescheduled"] },
    { key: "interviewRoundNo", label: "Interview Round No", type: "select", options: ["1", "2", "3", "4", "5"] },
    { key: "interviewMeetingLink", label: "Interview Meeting Link", type: "text", placeholder: "https://..." },
    { key: "feedback", label: "Feedback", type: "textarea", placeholder: "Enter interview feedback..." }
  ],
  "Verification": [
    { key: "documents", label: "Documents Status", type: "select", options: ["Pending", "Complete", "In Progress"] },
    { key: "offerLetter", label: "Offer Letter Status", type: "select", options: ["Not sent", "Sent", "Accepted", "Rejected"] },
    { key: "backgroundCheck", label: "Background Check Status", type: "select", options: ["Pending", "Complete", "Failed"] },
    { key: "notes", label: "Notes", type: "textarea", placeholder: "Enter verification notes..." }
  ],
  "Onboarding": [
    { key: "onboardingStartDate", label: "Onboarding Start Date", type: "date" },
    { key: "onboardingStatus", label: "Onboarding Status", type: "select", options: ["Not Started", "In Progress", "Complete"] },
    { key: "trainingCompleted", label: "Training Completed", type: "select", options: ["Yes", "No", "In Progress"] },
    { key: "notes", label: "Notes", type: "textarea", placeholder: "Enter onboarding notes..." }
  ],
  "Hired": [
    { key: "hireDate", label: "Hire Date", type: "date" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "offeredSalary", label: "Offered Salary", type: "text", placeholder: "e.g. 15000" },
    { key: "offeredSalaryCurrency", label: "Currency", type: "select", options: ["SAR", "USD", "EUR", "GBP", "INR", "AED"] },
    { key: "probationPeriod", label: "Probation Period", type: "text", placeholder: "e.g. 3 months" },
    { key: "hiringRating", label: "Hiring Rating (1-5)", type: "rating", options: ["1", "2", "3", "4", "5"] },
    { key: "contractType", label: "Contract Type", type: "select", options: ["Full Time", "Part Time", "Contract", "Internship"] },
    { key: "notes", label: "Notes", type: "textarea", placeholder: "Enter hire notes..." }
  ],
  "Disqualified": [
    { key: "disqualificationStage", label: "Disqualification Stage", type: "text" },
    { key: "disqualificationStatus", label: "Disqualification Status", type: "text" },
    { key: "disqualificationReason", label: "Disqualification Reason", type: "textarea" },
    { key: "disqualificationFeedback", label: "Feedback", type: "textarea" }
  ]
};

const getFieldValue = (candidate: any, stage: string, key: string): string => {
  if (!candidate) return "";
  
  const sourcingData = candidate.sourcing || {};
  const screeningData = candidate.screening || {};
  const clientReviewData = candidate.clientScreening || candidate.clientreview || {};
  const interviewData = candidate.interview || {};
  const verificationData = candidate.verification || {};
  const onboardingData = candidate.onboarding || {};
  const hiredData = candidate.hired || {};
  const disqualifiedData = candidate.disqualified || {};

  let historyData: any = {};
  if (Array.isArray(candidate.stageHistory)) {
    const sortedHistory = [...candidate.stageHistory].sort(
      (a: any, b: any) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime()
    );
    const match = sortedHistory.find((h: any) => {
      const stageName = h.stage?.toLowerCase() || "";
      return stageName === stage.toLowerCase() || 
             (stage === "Client Review" && stageName === "client screening");
    });
    if (match && match.data) {
      historyData = match.data;
    }
  }

  const combined = {
    ...sourcingData,
    ...screeningData,
    ...clientReviewData,
    ...interviewData,
    ...verificationData,
    ...onboardingData,
    ...hiredData,
    ...disqualifiedData,
    ...historyData
  };

  const val = combined[key] ?? candidate[key] ?? "";
  if (val === null || val === undefined || val === "Not set") return "";
  
  if (key.toLowerCase().includes("date") || key.toLowerCase().includes("time")) {
    if (typeof val === "string" && val.length > 0) {
      try {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
          if (key.toLowerCase().includes("time") || key === "aemsInterviewDate" || key === "interviewDate") {
            return format(date, "yyyy-MM-dd'T'HH:mm");
          } else {
            return format(date, "yyyy-MM-dd");
          }
        }
      } catch (e) {
        // Fallback to original string
      }
    }
  }

  return String(val);
};

export function StatusChangeConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  candidateName,
  currentStage,
  newStage,
  candidate,
}: StatusChangeConfirmationDialogProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (isOpen && newStage) {
      const fields = STAGE_FIELDS_MAP[newStage] || STAGE_FIELDS_MAP[mapUIStageToBackendStage(newStage)] || [];
      const initialData: Record<string, any> = {};
      fields.forEach(f => {
        const val = getFieldValue(candidate, newStage, f.key);
        initialData[f.key] = val;
      });
      setFormData(initialData);
    }
  }, [isOpen, newStage, candidate]);

  if (!isOpen) return null;

  const fields = STAGE_FIELDS_MAP[newStage] || STAGE_FIELDS_MAP[mapUIStageToBackendStage(newStage)] || [];

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (field: StageFieldConfig) => {
    const value = formData[field.key] ?? "";
    
    switch (field.type) {
      case "text":
        return (
          <Input
            id={`field-${field.key}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className="w-full h-10 rounded-xl border-border bg-card focus-visible:ring-brand font-medium"
          />
        );
      case "date":
        return (
          <Input
            id={`field-${field.key}`}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full h-10 rounded-xl border-border bg-card focus-visible:ring-brand font-medium"
          />
        );
      case "datetime":
        return (
          <Input
            id={`field-${field.key}`}
            type="datetime-local"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full h-10 rounded-xl border-border bg-card focus-visible:ring-brand font-medium"
          />
        );
      case "select":
      case "rating":
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.key, val)}>
            <SelectTrigger id={`field-${field.key}`} className="w-full h-10 rounded-xl border-border bg-card focus:ring-brand font-medium">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt} className="rounded-lg font-medium">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "textarea":
        return (
          <Textarea
            id={`field-${field.key}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            rows={3}
            className="w-full rounded-xl border-border bg-card focus-visible:ring-brand font-medium resize-none"
          />
        );
      default:
        return null;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent className="max-w-lg rounded-[2rem] border-border shadow-2xl bg-card flex flex-col max-h-[90vh]">
        <AlertDialogHeader className="flex-shrink-0">
          <AlertDialogTitle className="text-xl font-black text-foreground tracking-tight">
            Confirm Stage Change
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground font-semibold uppercase tracking-wider text-[11px] leading-relaxed">
            Confirm moving candidate <strong className="text-brand font-bold">{candidateName}</strong> to the next stage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Stages Indicators */}
        <div className="flex items-center justify-center space-x-6 py-4 bg-muted/30 border border-border rounded-2xl my-2 flex-shrink-0">
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Current Stage</p>
            <Badge variant="outline" className={`${getStageColor(currentStage)} border font-semibold`}>
              {currentStage}
            </Badge>
          </div>
          
          <div className="text-muted-foreground">
            <svg className="w-5 h-5 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">New Stage</p>
            <Badge variant="outline" className={`${getStageColor(newStage)} border font-semibold`}>
              {newStage}
            </Badge>
          </div>
        </div>

        {/* Dynamic Fields Section */}
        {fields.length > 0 && (
          <div className="flex-1 overflow-y-auto pr-2 my-2 min-h-0 space-y-4 custom-scrollbar">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/60 pb-1 mb-3">
              {newStage} Stage Specific Fields
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label htmlFor={`field-${field.key}`} className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {field.label}
                  </label>
                  <div>
                    {renderField(field)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <AlertDialogFooter className="flex-shrink-0 gap-2 mt-4 pt-3 border-t border-border/60">
          <AlertDialogCancel onClick={onClose} className="border-border rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-muted py-2.5">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              const finalData: Record<string, any> = {};
              const numericFields = [
                "sourcingRating", "screeningRating", "overallRating", "clientRating", 
                "hiringRating", "offeredSalary", "finalSalary", "interviewRoundNo", 
                "interviewReschedules", "rating"
              ];
              
              Object.entries(formData).forEach(([key, val]) => {
                if (val === "" || val === undefined || val === null) {
                  finalData[key] = null;
                } else if (numericFields.includes(key) && !isNaN(Number(val))) {
                  finalData[key] = Number(val);
                } else {
                  finalData[key] = val;
                }
              });
              onConfirm(finalData);
            }}
            className="bg-brand hover:bg-brand/90 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand/20 py-2.5"
          >
            Confirm Change
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
