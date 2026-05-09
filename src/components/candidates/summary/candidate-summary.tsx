import React, { useState, useEffect, useCallback } from "react";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, ChevronsUpDown, User, Mail, Phone, Briefcase, GraduationCap, Globe, Shield, Wallet, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditFieldModal } from "./edit-field-modal";
import {
  DateOfBirthDialog,
  MaritalStatusDialog,
  GenderDialog,
  StatusDialog,
  WillingToRelocateDialog,
} from "./personal-info-edit-dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import SalaryRange from "./salary-range";
import EditResumeDialog from "@/components/candidates/EditResumeDialog";
import UserSelectDialog from "@/components/shared/UserSelectDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// ReferredByList import removed as we're using UserSelectDialog instead

const detailsFields = [
  { key: "name", label: "Candidate Name" },
  { key: "location", label: "Location" },
  { key: "experience", label: "Experience" },
  { key: "referredBy", label: "CV Referred By" },
  { key: "totalRelevantExperience", label: "Total Relevant Years of Experience" },
  { key: "noticePeriod", label: "Notice Period" },

  {
    key: "resume",
    label: "Resume",
    render: (val: string | undefined) =>
      val ? (
        (() => {
          const href = val.startsWith("http")
            ? val
            : `${process.env.NEXT_PUBLIC_API_URL || ''}${val.startsWith('/') ? '' : '/'}${val}`;
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
              View Resume
            </a>
          );
        })()
      ) : undefined,
    isUpload: true,
  },
  /*   {
      key: "skills",
      label: "Skills",
      render: (val: string[] | undefined) => (val && val.length ? val.join(", ") : undefined),
    }, */
  { key: "status", label: "Status" },
  { key: "gender", label: "Gender" },
  {
    key: "dateOfBirth",
    label: "Date of Birth",
    render: (val: string | undefined) => {
      if (!val) return undefined;
      try {
        const date = new Date(val);
        if (isNaN(date.getTime())) return val; // Return original value if invalid date
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch (error) {
        return val; // Return original value if parsing fails
      }
    },
  },
  { key: "maritalStatus", label: "Marital Status" },
  { key: "country", label: "Country" },
  { key: "nationality", label: "Nationality" },
  { key: "continent", label: "Continent" },
  { key: "universityName", label: "University Name" },
  { key: "educationDegree", label: "Education Degree/Certificate", isTextarea: true },
  { key: "primaryLanguage", label: "Primary Language" },
  { key: "willingToRelocate", label: "Are you willing to relocate ?" },
  { key: "iqama", label: "Iqama is transferable ?" },
];

// Split details fields into default visible and collapsible sections
const defaultDetailsFields = detailsFields.slice(0, 7); // Up to "Referred By"
const collapsibleDetailsFields = detailsFields.slice(7); // From "Gender" onwards

const contactFields = [
  { 
    key: "phone", 
    label: "Phone Number",
    render: (val: string | undefined, record: any) => formatPhoneNumber(val, record?.countryCode) || undefined
  },
  { key: "email", label: "Email" },
  { 
    key: "otherPhone", 
    label: "Other Phone Number",
    render: (val: string | undefined, record: any) => formatPhoneNumber(val, record?.otherCountryCode) || undefined
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    render: (val: string | undefined) => {
      if (!val) return undefined;
      const isValidUrl = val.startsWith("http://") || val.startsWith("https://");
      if (isValidUrl) {
        return (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer hover:underline"
            style={{ textDecoration: "none" }}
          >
            {val}
          </a>
        );
      }
      return val;
    },
  },
];

const previousCompanyFields = [
  { key: "previousCompanyName", label: "Current Company Name" },
  { key: "currentJobTitle", label: "Current Job Title" },
  { key: "reportingTo", label: "Reporting To" },
  { key: "totalStaffReporting", label: "Total Number of Staff Reporting to You" },
];

const skillFields = [
  { key: "softSkill", label: "Soft Skill", isArray: true, isTextarea: true },
  { key: "technicalSkill", label: "Technical Skill", isArray: true, isTextarea: true },
];

interface CandidateSummaryProps {
  candidate: any;
  onCandidateUpdate?: (updatedCandidate: any, fieldKey?: string) => void;
  canModify?: boolean;
}

const CandidateSummary = ({
  candidate,
  onCandidateUpdate,
  canModify = true,
}: CandidateSummaryProps) => {
  const [editField, setEditField] = useState<string | null>(null);
  const [localCandidate, setLocalCandidate] = useState(candidate);
  const [showEditResumeDialog, setShowEditResumeDialog] = useState(false);
  const [showDateOfBirthDialog, setShowDateOfBirthDialog] = useState(false);
  const [showMaritalStatusDialog, setShowMaritalStatusDialog] = useState(false);
  const [showGenderDialog, setShowGenderDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showWillingToRelocateDialog, setShowWillingToRelocateDialog] = useState(false);
  const [showReferredByDialog, setShowReferredByDialog] = useState(false);
  const [showConfirmReferrer, setShowConfirmReferrer] = useState(false);
  const [pendingReferrerName, setPendingReferrerName] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

  const handleReferredBySelect = useCallback((user: any) => {
    if (!user) return;

    // Set the pending user and show confirmation dialog
    setPendingUser(user);
    setPendingReferrerName(user.name || user.email || '');
    setShowConfirmReferrer(true);
  }, []);

  const confirmReferrer = () => {
    if (pendingUser) {
      handleSave('referredBy', pendingUser);
    }
    setShowConfirmReferrer(false);
    setPendingReferrerName(null);
    setPendingUser(null);
  };

  const cancelReferrer = () => {
    setShowConfirmReferrer(false);
    setPendingReferrerName(null);
    setPendingUser(null);
  };

  const handleSave = async (fieldKey: string, newValue: any) => {
    let updatedCandidate = { ...localCandidate };

    if (fieldKey === "phone" && typeof newValue === "object" && newValue.phone) {
      updatedCandidate = {
        ...updatedCandidate,
        phone: newValue.phone,
        countryCode: newValue.countryCode,
      };
    } else if (fieldKey === "otherPhone" && typeof newValue === "object" && newValue.phone) {
      updatedCandidate = {
        ...updatedCandidate,
        otherPhone: newValue.phone,
        otherCountryCode: newValue.countryCode,
      };
    } else if (fieldKey === 'referredBy' && newValue && typeof newValue === 'object') {
      const name = newValue.name || newValue.email || '';
      updatedCandidate = { ...updatedCandidate, [fieldKey]: name };
    } else {
      // LinkedIn validation
      if (fieldKey === "linkedin" && newValue && typeof newValue === "string" && newValue.trim()) {
        const trimmedValue = newValue.trim();
        if (!trimmedValue.startsWith("http://") && !trimmedValue.startsWith("https://")) {
          toast.error("LinkedIn URL must start with 'http://' or 'https://'");
          return;
        }
      }
      updatedCandidate = { ...updatedCandidate, [fieldKey]: newValue };
    }
    setLocalCandidate(updatedCandidate);
    setEditField(null);

    // Notify parent component of the update
    if (onCandidateUpdate) {
      onCandidateUpdate(updatedCandidate, fieldKey);
    }
  };

  const handleResumeUpdated = (updated: any) => {
    const newCandidate = { ...localCandidate, resume: updated?.resume };
    setLocalCandidate(newCandidate);
    if (onCandidateUpdate) onCandidateUpdate(newCandidate, "resume");
    setShowEditResumeDialog(false);
  };

  const handleDateOfBirthSave = (value: string) => {
    handleSave("dateOfBirth", value);
    setShowDateOfBirthDialog(false);
  };

  const handleMaritalStatusSave = (value: string) => {
    handleSave("maritalStatus", value);
    setShowMaritalStatusDialog(false);
  };

  const handleGenderSave = (value: string) => {
    handleSave("gender", value);
    setShowGenderDialog(false);
  };

  const handleStatusSave = (value: string) => {
    handleSave("status", value);
    setShowStatusDialog(false);
  };

  const handleWillingToRelocateSave = (value: string) => {
    handleSave("willingToRelocate", value);
    setShowWillingToRelocateDialog(false);
  };

  const renderField = (field: any, fieldArray: any[]) => {
    const rawValue = localCandidate?.[field.key];
    const value = field.render ? field.render(rawValue, localCandidate) : rawValue;
    const hasValue =
      rawValue !== undefined &&
      rawValue !== null &&
      rawValue !== "" &&
      (!Array.isArray(rawValue) || rawValue.length > 0);

    // Common click handler for specific fields
    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (field.isUpload) setShowEditResumeDialog(true);
      else if (field.key === "dateOfBirth") setShowDateOfBirthDialog(true);
      else if (field.key === "maritalStatus") setShowMaritalStatusDialog(true);
      else if (field.key === "gender") setShowGenderDialog(true);
      else if (field.key === "status") setShowStatusDialog(true);
      else if (field.key === "willingToRelocate") setShowWillingToRelocateDialog(true);
      else if (field.key === "referredBy") setShowReferredByDialog(true);
      else setEditField(field.key);
    };

    return (
      <div 
        key={field.key} 
        className="group flex items-center justify-between py-3 px-4 rounded-xl hover:bg-muted/80 transition-all border border-transparent hover:border-border/60"
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">
            {field.label}
          </span>
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-bold tracking-tight truncate",
              hasValue ? "text-foreground" : "text-muted-foreground italic"
            )}>
              {hasValue ? (field.key === 'referredBy' && typeof value === 'object' ? value.name || value.email : value) : "Not Provided"}
            </span>
            {field.key === 'referredBy' && hasValue && localCandidate.referredBy?.email && (
              <span className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                {localCandidate.referredBy.email}
              </span>
            )}
          </div>
        </div>

        {canModify && (
          <div className="flex items-center ml-4 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-card hover:shadow-sm border-transparent hover:border-border"
              onClick={handleEditClick}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            
            {/* Modal injections for fields that don't use dedicated dialogs */}
            {field.key !== "referredBy" && !field.isUpload && !["dateOfBirth", "maritalStatus", "gender", "status", "willingToRelocate"].includes(field.key) && (
              <EditFieldModal
                open={editField === field.key}
                onClose={() => setEditField(null)}
                fieldName={field.label}
                currentValue={
                  typeof rawValue === "string"
                    ? rawValue
                    : Array.isArray(rawValue)
                      ? rawValue.join(", ")
                      : ""
                }
                onSave={(val: any) => handleSave(field.key, val)}
                isLocation={field.key === "location"}
                isCountry={field.key === "country"}
                isNationality={field.key === "nationality"}
                isContinent={field.key === "continent"}
                isPhone={field.key === "phone" || field.key === "otherPhone"}
                countryCode={field.key === "phone" ? localCandidate?.countryCode : localCandidate?.otherCountryCode}
              />
            )}

            {field.key === "referredBy" && (
               <UserSelectDialog
                 open={showReferredByDialog}
                 onClose={() => setShowReferredByDialog(false)}
                 onSelect={handleReferredBySelect}
                 title="Select Referrer"
               />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSkillField = (field: any) => {
    const rawValue = localCandidate?.[field.key];
    const hasValue =
      rawValue !== undefined &&
      rawValue !== null &&
      (Array.isArray(rawValue) ? rawValue.length > 0 : rawValue !== "");

    // Display value: if array, join with commas; if string, use as is
    const displayValue = Array.isArray(rawValue) ? rawValue.join(", ") : rawValue;
    return (
      <div key={field.key} className="group flex flex-col p-4 rounded-xl bg-muted/50 border border-border/60 hover:bg-card hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
             <div className="h-7 w-7 rounded-lg bg-card flex items-center justify-center text-brand border border-border shadow-sm">
                <Star className="h-3.5 w-3.5" />
             </div>
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{field.label}</span>
          </div>
          {canModify && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
              onClick={() => setEditField(field.key)}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
        <div className={cn(
          "text-sm font-bold leading-relaxed",
          hasValue ? "text-foreground" : "text-muted-foreground italic"
        )}>
          {hasValue ? displayValue : "Not Provided"}
        </div>
        {canModify && (
          <EditFieldModal
            open={editField === field.key}
            onClose={() => setEditField(null)}
            fieldName={field.label}
            currentValue={displayValue || ""}
            onSave={(val: string) => {
              // Convert comma-separated string back to array
              const arrayValue = val.trim()
                ? val
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item)
                : [];
              handleSave(field.key, arrayValue);
            }}
            isTextarea={true}
          />
        )}
      </div>
    );
  };

  // Main component return
  return (
    <div className="p-2 space-y-6 bg-muted/50 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Profile & Professional */}
        <div className="space-y-6">
          {/* Profile Details Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <User className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Profile Details</h4>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Identity & Sourcing</h5>
                <div className="grid grid-cols-1 gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                  {defaultDetailsFields.map((field) => renderField(field, defaultDetailsFields))}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Background Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Briefcase className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Professional Background</h4>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Role & Compensation</h5>
                <div className="grid grid-cols-1 gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                  {previousCompanyFields.map((field) => renderField(field, previousCompanyFields))}
                  <div className="pt-2 border-t border-border">
                    <SalaryRange
                      candidate={localCandidate}
                      onCandidateUpdate={onCandidateUpdate}
                      canModify={canModify}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Matrix Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Star className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Skill Matrix</h4>
            </div>
            <div className="p-5 space-y-4">
              <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Technical Assessment</h5>
              <div className="grid grid-cols-1 gap-4">
                {skillFields.map((field) => renderSkillField(field))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Personal */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Globe className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Contact Information</h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                {contactFields.map((field) => renderField(field, contactFields))}
              </div>
            </div>
          </div>

          {/* Education & Personal Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <GraduationCap className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Education & Personal</h4>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                 <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Background Details</h5>
                 <div className="grid grid-cols-1 gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                    {collapsibleDetailsFields.map((field) => renderField(field, collapsibleDetailsFields))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog (from referredBy logic) */}
      <Dialog open={showConfirmReferrer} onOpenChange={setShowConfirmReferrer}>
        <DialogContent className="rounded-2xl overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-black text-foreground tracking-tight">Confirm Referrer Change</DialogTitle>
          </DialogHeader>
          <div className="p-6 py-8">
            <div className="p-4 bg-muted rounded-xl border border-border text-sm font-semibold text-foreground flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center shadow-sm border border-border text-brand">
                  <User className="h-5 w-5" />
               </div>
               <span>Assign <span className="text-foreground font-black tracking-tight">{pendingReferrerName}</span> as the official referrer for this candidate?</span>
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted border-t flex flex-row items-center gap-3">
            <Button variant="ghost" onClick={cancelReferrer} className="text-muted-foreground font-bold">
              Cancel
            </Button>
            <Button onClick={confirmReferrer} className="bg-foreground hover:bg-black text-white px-8 font-black shadow-xl shadow-black/10">
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resume Dialog */}
      {canModify && (
        <EditResumeDialog
          open={showEditResumeDialog}
          onOpenChange={setShowEditResumeDialog}
          candidate={localCandidate}
          onUpdated={handleResumeUpdated}
        />
      )}

      {/* Date of Birth Dialog */}
      {canModify && (
        <DateOfBirthDialog
          open={showDateOfBirthDialog}
          onClose={() => setShowDateOfBirthDialog(false)}
          currentValue={localCandidate?.dateOfBirth}
          onSave={handleDateOfBirthSave}
        />
      )}

      {/* Marital Status Dialog */}
      {canModify && (
        <MaritalStatusDialog
          open={showMaritalStatusDialog}
          onClose={() => setShowMaritalStatusDialog(false)}
          currentValue={localCandidate?.maritalStatus}
          onSave={handleMaritalStatusSave}
        />
      )}

      {/* Gender Dialog */}
      {canModify && (
        <GenderDialog
          open={showGenderDialog}
          onClose={() => setShowGenderDialog(false)}
          currentValue={localCandidate?.gender}
          onSave={handleGenderSave}
        />
      )}

      {/* Status Dialog */}
      {canModify && (
        <StatusDialog
          open={showStatusDialog}
          onClose={() => setShowStatusDialog(false)}
          currentValue={localCandidate?.status}
          onSave={handleStatusSave}
        />
      )}

      {/* Willing To Relocate Dialog */}
      {canModify && (
        <WillingToRelocateDialog
          open={showWillingToRelocateDialog}
          onClose={() => setShowWillingToRelocateDialog(false)}
          currentValue={localCandidate?.willingToRelocate}
          onSave={handleWillingToRelocateSave}
        />
      )}

      {/* Referred By List Dialog */}
      {/* {canModify && (
        <ReferredByList
          open={showReferredByDialog}
          onOpenChange={setShowReferredByDialog}
          onSelect={handleReferredBySelect}
        />
      )} */}

    </div>
  );
};

export default CandidateSummary;
