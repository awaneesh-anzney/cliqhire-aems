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
import { DatePickerField, DateTimePickerField } from "./pipeline-stage-details/field-inputs";
import { PROBATION_PERIOD_OPTIONS } from "./pipeline-stage-details/stage-fields";
import { toast } from "sonner";
import { 
  Calendar, 
  Star, 
  MessageSquare, 
  Link, 
  User, 
  Award, 
  DollarSign, 
  Briefcase, 
  ArrowRight,
  Sparkles
} from "lucide-react";

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
  options?: (string | { value: string; label: string })[];
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
    { key: "salary", label: "Salary", type: "text", placeholder: "e.g. 15000" },
    { key: "salaryCurrency", label: "Currency", type: "select", options: ["SAR", "USD", "EUR", "GBP", "INR", "AED", "EGP"] },
    { key: "probationPeriod", label: "Probation Period", type: "select", options: PROBATION_PERIOD_OPTIONS },
    { key: "probationNotes", label: "Probation Notes", type: "textarea", placeholder: "Enter probation notes..." },
    { key: "offerLetterNo", label: "Offer Letter No", type: "text", placeholder: "e.g. OL-2026-001" },
    { key: "designation", label: "Designation", type: "text", placeholder: "e.g. Software Engineer" },
    { key: "department", label: "Department", type: "text", placeholder: "e.g. Engineering" },
    { key: "reportingTo", label: "Reporting To", type: "text", placeholder: "e.g. Ahmed Al-Farsi" },
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
  if (val === null || val === undefined || val === "Not set" || val === "") {
    return key === "probationPeriod" ? "none" : "";
  }
  
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

const getFieldIcon = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes("date") || k.includes("time")) return <Calendar className="h-3.5 w-3.5 text-blue-500" />;
  if (k.includes("rating")) return <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />;
  if (k.includes("feedback") || k.includes("notes") || k.includes("reason")) return <MessageSquare className="h-3.5 w-3.5 text-purple-500" />;
  if (k.includes("link")) return <Link className="h-3.5 w-3.5 text-indigo-500" />;
  if (k.includes("channel") || k.includes("connection")) return <User className="h-3.5 w-3.5 text-green-500" />;
  if (k.includes("assessment")) return <Award className="h-3.5 w-3.5 text-sky-500" />;
  if (k.includes("salary") || k.includes("currency")) return <DollarSign className="h-3.5 w-3.5 text-emerald-500" />;
  return <Briefcase className="h-3.5 w-3.5 text-muted-foreground/85" />;
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
            className="w-full h-10 rounded-xl border-border bg-card/60 focus-visible:ring-brand font-medium text-xs shadow-sm hover:border-brand/20 transition-colors"
          />
        );
      case "date":
        return (
          <DatePickerField
            value={value}
            onChange={(val) => handleFieldChange(field.key, val)}
          />
        );
      case "datetime":
        return (
          <DateTimePickerField
            value={value}
            onChange={(val) => handleFieldChange(field.key, val)}
          />
        );
      case "select":
      case "rating":
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.key, val)}>
            <SelectTrigger id={`field-${field.key}`} className="w-full h-10 rounded-xl border-border bg-card/60 focus:ring-brand font-medium text-xs shadow-sm hover:border-brand/20 transition-colors">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              {field.options?.map((opt) => {
                const val = typeof opt === "string" ? opt : opt.value;
                const lbl = typeof opt === "string" ? opt : opt.label;
                return (
                  <SelectItem key={val} value={val} className="rounded-lg font-medium text-xs">
                    {lbl}
                  </SelectItem>
                );
              })}
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
            className="w-full rounded-xl border-border bg-card/60 focus-visible:ring-brand font-medium text-xs resize-none shadow-sm hover:border-brand/20 transition-colors"
          />
        );
      default:
        return null;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent className="max-w-lg rounded-[2rem] border border-border bg-card/95 backdrop-blur-md shadow-2xl flex flex-col max-h-[85vh] p-6 animate-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <AlertDialogHeader className="flex-shrink-0 space-y-1">
          <div className="flex items-center gap-2 text-brand">
            <Sparkles className="h-5 w-5 fill-brand/10 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Pipeline Intelligence</span>
          </div>
          <AlertDialogTitle className="text-xl font-black text-foreground tracking-tight">
            Confirm Stage Change
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground font-bold uppercase tracking-wider text-[11px] leading-relaxed">
            Move candidate <strong className="text-brand font-black">{candidateName}</strong> into the next stage of selection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Stages Progress Indicator */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted/40 border border-border/60 rounded-2xl my-3 flex-shrink-0 shadow-inner">
          <div className="text-center flex-1">
            <p className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1.5">Current Stage</p>
            <Badge variant="outline" className={`${getStageColor(currentStage)} border font-black uppercase tracking-wider text-[10px] py-0.5 px-3 rounded-lg shadow-sm`}>
              {currentStage}
            </Badge>
          </div>
          
          <div className="px-2 shrink-0">
            <div className="h-8 w-8 rounded-full bg-brand/5 border border-brand/10 flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-brand" />
            </div>
          </div>
          
          <div className="text-center flex-1">
            <p className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1.5">New Stage</p>
            <Badge variant="outline" className={`${getStageColor(newStage)} border font-black uppercase tracking-wider text-[10px] py-0.5 px-3 rounded-lg shadow-sm`}>
              {newStage}
            </Badge>
          </div>
        </div>

        {/* Dynamic Fields Section */}
        {fields.length > 0 ? (
          <div className="flex-1 overflow-y-auto pr-1.5 my-3 min-h-0 space-y-3.5 custom-scrollbar">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-1.5 mb-3">
              Required {newStage} Stage Intel
            </h4>
            <div className="grid grid-cols-1 gap-3.5">
              {fields.map((field) => (
                <div 
                  key={field.key} 
                  className="group relative flex flex-col gap-1.5 p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-card hover:border-brand/20 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <label htmlFor={`field-${field.key}`} className="text-[10px] font-black text-muted-foreground/75 uppercase tracking-widest flex items-center gap-1.5">
                    {getFieldIcon(field.key)}
                    {field.label}
                  </label>
                  <div className="w-full">
                    {renderField(field)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-2xl bg-muted/20 my-3 gap-2 flex-shrink-0">
            <div className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center shadow-sm text-muted-foreground/80">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ready to Transition</p>
              <p className="text-[11px] font-semibold text-muted-foreground/70">No additional fields required for the {newStage} stage.</p>
            </div>
          </div>
        )}
        
        {/* Footer Actions */}
        <AlertDialogFooter className="flex-shrink-0 gap-2.5 mt-3 pt-3 border-t border-border">
          <AlertDialogCancel onClick={onClose} className="border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted py-2.5 px-4 shrink-0 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              const finalData: Record<string, any> = {};
              const numericFields = [
                "sourcingRating", "screeningRating", "overallRating", "clientRating", 
                "hiringRating", "offeredSalary", "finalSalary", "interviewRoundNo", 
                "interviewReschedules", "rating", "salary"
              ];
              
              if (formData.probationPeriod && formData.probationPeriod !== "none" && (!formData.startDate || formData.startDate === "")) {
                toast.error("Start Date is required when a Probation Period is selected.");
                return;
              }

              Object.entries(formData).forEach(([key, val]) => {
                if (val === "" || val === undefined || val === null || val === "none") {
                  finalData[key] = null;
                } else if (numericFields.includes(key) && !isNaN(Number(val))) {
                  finalData[key] = Number(val);
                } else {
                  finalData[key] = val;
                }
              });
              onConfirm(finalData);
            }}
            className="bg-brand hover:bg-brand/90 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 py-2.5 px-4 transition-colors"
          >
            Confirm Change
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
