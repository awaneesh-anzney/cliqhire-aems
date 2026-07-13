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
  EducationDialog,
} from "./personal-info-edit-dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import SalaryRange from "./salary-range";
import EditResumeDialog from "@/components/candidates/EditResumeDialog";
import UserSelectDialog from "@/components/shared/UserSelectDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CandidateDomainDialog } from "./CandidateDomainDialog";
// ReferredByList import removed as we're using UserSelectDialog instead

const detailsFields = [
  { key: "name", label: "Candidate Name" },
  { key: "location", label: "Location" },
  { key: "experience", label: "Experience" },
  { key: "referredBy", label: "CV Referred By" },
  { key: "totalRelevantExperience", label: "Total Relevant Years of Experience" },
  { key: "noticePeriod", label: "Notice Period" },
  {
    key: "domains",
    label: "Candidate Domains",
    render: (val: any[] | undefined) => {
      if (!val || val.length === 0) return undefined;
      return val.map((d: any) => d.name).join(", ");
    }
  },

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
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline" onClick={(e) => e.stopPropagation()}>
              View Resume
            </a>
          );
        })()
      ) : undefined,
    isUpload: true,
  },
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
  { key: "primaryLanguage", label: "Primary Language" },
  { key: "willingToRelocate", label: "Are you willing to relocate ?" },
  { key: "iqama", label: "Iqama is transferable ?" },
];

const academicFields = [
  { key: "universityName", label: "University Name" },
  { key: "educationDegree", label: "Education Degree/Certificate", isTextarea: true },
  { key: "certification", label: "Professional Certifications", isTextarea: true },
];

// Split details fields into default visible and collapsible sections
const defaultDetailsFields = detailsFields.slice(0, 8); // Up to "Resume"
const collapsibleDetailsFields = detailsFields.slice(8); // From "status" onwards

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
            onClick={(e) => e.stopPropagation()}
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
  const [showDomainsDialog, setShowDomainsDialog] = useState(false);
  const [showEditResumeDialog, setShowEditResumeDialog] = useState(false);
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [editEducationLevel, setEditEducationLevel] = useState<"diploma" | "bachelor" | "master" | null>(null);

  useEffect(() => {
    setLocalCandidate(candidate);
  }, [candidate]);
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
    } else if (fieldKey === "experience" || fieldKey === "totalRelevantExperience") {
      let val = typeof newValue === "string" ? newValue.trim() : String(newValue || "");
      if (val && !val.toLowerCase().includes('year')) {
        val = `${val} Year(s)`;
      }
      updatedCandidate = { ...updatedCandidate, [fieldKey]: val };
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

  const handleEducationSave = (level: "diploma" | "bachelor" | "master", value: any) => {
    const currentEducation = localCandidate?.education || {};
    const updatedEducation = {
      ...currentEducation,
      [level]: value,
    };
    const updatedCandidate = {
      ...localCandidate,
      education: updatedEducation
    };
    setLocalCandidate(updatedCandidate);
    if (onCandidateUpdate) {
      onCandidateUpdate(updatedCandidate, `education.${level}`);
    }
    setShowEducationDialog(false);
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const renderEducationLevelCard = (level: "diploma" | "bachelor" | "master", label: string) => {
    const data = localCandidate?.education?.[level];
    const hasData = data && (data.degreeName || data.universityName || data.passingYear || data.status);

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canModify) return;
      setEditEducationLevel(level);
      setShowEducationDialog(true);
    };

    return (
      <div
        onClick={canModify ? handleEditClick : undefined}
        className={cn(
          "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300",
          hasData
            ? "bg-card border-border/70 hover:border-primary/45 hover:shadow-sm"
            : "bg-muted/10 border-dashed border-border/50 opacity-60 hover:opacity-100",
          canModify ? "cursor-pointer" : ""
        )}
      >
        <div className={cn(
          "p-2.5 rounded-lg shrink-0 border",
          hasData ? "bg-primary/5 border-primary/10 text-primary" : "bg-muted border-border text-muted-foreground"
        )}>
          <GraduationCap className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-wider">
              {label}
            </span>
            {hasData && data.status && (
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border leading-none",
                data.status === "Completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
              )}>
                {data.status}
              </span>
            )}
          </div>

          {hasData ? (
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground truncate">
                {data.degreeName || "Unspecified Degree"}
              </h4>
              <p className="text-xs text-muted-foreground/90 font-semibold truncate">
                {data.universityName || "Unspecified University"}
              </p>
              {data.passingYear && (
                <p className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5 inline-block mt-1">
                  Passing Year: {data.passingYear}
                </p>
              )}
            </div>
          ) : (
            <div className="py-1">
              <span className="text-xs font-bold text-muted-foreground/50 italic">Not Provided</span>
              <p className="text-[10px] font-medium text-muted-foreground/40 mt-0.5">Click to add {label.toLowerCase()} details</p>
            </div>
          )}
        </div>

        {canModify && (
          <div className="flex items-center ml-4 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
              onClick={handleEditClick}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderField = (field: any, fieldArray: any[]) => {
    const rawValue = field.key.includes('.') ? getNestedValue(localCandidate, field.key) : localCandidate?.[field.key];
    const value = field.render ? field.render(rawValue, localCandidate) : rawValue;
    const hasValue =
      rawValue !== undefined &&
      rawValue !== null &&
      rawValue !== "" &&
      (!Array.isArray(rawValue) || rawValue.length > 0) &&
      (typeof rawValue !== "object" || Object.values(rawValue).some(v => v !== undefined && v !== null && v !== ""));

    // Common click handler for specific fields
    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canModify) return;
      if (field.isUpload) setShowEditResumeDialog(true);
      else if (field.key === "dateOfBirth") setShowDateOfBirthDialog(true);
      else if (field.key === "maritalStatus") setShowMaritalStatusDialog(true);
      else if (field.key === "gender") setShowGenderDialog(true);
      else if (field.key === "status") setShowStatusDialog(true);
      else if (field.key === "willingToRelocate") setShowWillingToRelocateDialog(true);
      else if (field.key === "referredBy") setShowReferredByDialog(true);
      else if (field.key === "domains") setShowDomainsDialog(true);
      else if (field.key.startsWith("education.")) {
        const level = field.key.split(".")[1];
        setEditEducationLevel(level as "diploma" | "bachelor" | "master");
        setShowEducationDialog(true);
      }
      else setEditField(field.key);
    };

    return (
      <div 
        key={field.key} 
        className={cn(
          "group relative flex items-center justify-between p-3.5 rounded-xl bg-muted/20 border border-border/50 transition-all duration-300",
          field.isTextarea ? "sm:col-span-2" : "",
          canModify ? "cursor-pointer hover:bg-card hover:border-brand/35 hover:shadow-sm" : ""
        )}
        onClick={canModify ? handleEditClick : undefined}
      >
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-black text-muted-foreground/85 uppercase tracking-wider mb-1.5 leading-none">
            {field.label}
          </span>
          <div className="flex flex-col">
            {field.key === 'domains' && hasValue ? (
              <div className="flex flex-wrap gap-1 mt-1 max-w-full">
                {(Array.isArray(rawValue) ? rawValue : []).map((d: any) => (
                  <span key={d._id} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                    {d.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className={cn(
                "text-xs sm:text-sm font-bold tracking-tight truncate",
                hasValue ? "text-foreground" : "text-muted-foreground/40 italic font-medium"
              )}>
                {hasValue ? (field.key === 'referredBy' && typeof value === 'object' ? value.name || value.email : value) : "Not Provided"}
              </span>
            )}
            {field.key === 'referredBy' && hasValue && localCandidate.referredBy?.email && (
              <span className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">
                {localCandidate.referredBy.email}
              </span>
            )}
          </div>
        </div>

        {canModify && (
          <div className="flex items-center ml-4 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
              onClick={handleEditClick}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            
            {/* Modal injections for fields that don't use dedicated dialogs */}
            {field.key !== "referredBy" && field.key !== "domains" && !field.isUpload && !field.key.startsWith("education.") && !["dateOfBirth", "maritalStatus", "gender", "status", "willingToRelocate"].includes(field.key) && (
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
                options={field.key === "noticePeriod" ? [
                  { value: "15 Days", label: "15 Days" },
                  { value: "1 Month", label: "1 Month" },
                  { value: "2 Months", label: "2 Months" },
                  { value: "3 Months", label: "3 Months" }
                ] : field.key === "iqama" ? [
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                  { value: "Saudi Citizen", label: "Saudi Citizen" },
                  { value: "Premium Resident", label: "Premium Resident" }
                ] : undefined}
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
      <div 
        key={field.key} 
        className={cn(
          "group flex flex-col p-4.5 rounded-xl bg-muted/20 border border-border/50 transition-all duration-300",
          canModify ? "cursor-pointer hover:bg-card hover:border-brand/35 hover:shadow-sm" : ""
        )}
        onClick={canModify ? () => setEditField(field.key) : undefined}
      >
        <div className="flex items-center justify-between mb-3.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
             <div className="h-7 w-7 rounded-lg bg-card flex items-center justify-center text-brand border border-border/60 shadow-sm">
                <Star className="h-3.5 w-3.5" />
             </div>
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{field.label}</span>
          </div>
          {canModify && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
              onClick={() => setEditField(field.key)}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
        <div className={cn(
          "text-xs sm:text-sm font-bold leading-relaxed",
          hasValue ? "text-foreground" : "text-muted-foreground/40 italic font-medium"
        )}>
          {hasValue ? displayValue : "Not Provided"}
        </div>
        {canModify && editField === field.key && (
          <div onClick={(e) => e.stopPropagation()}>
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
          </div>
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
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border/60 bg-muted/40">
              <div className="p-2 bg-brand/10 rounded-lg">
                <User className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Profile Details</h4>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Identity & Sourcing</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/60">
                  {defaultDetailsFields.map((field) => renderField(field, defaultDetailsFields))}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Background Card */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border/60 bg-muted/40">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Briefcase className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Professional Background</h4>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Role & Compensation</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/60">
                  {previousCompanyFields.map((field) => renderField(field, previousCompanyFields))}
                  <div className="pt-3 border-t border-border/60 sm:col-span-2">
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
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border/60 bg-muted/40">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Star className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Skill Matrix</h4>
            </div>
            <div className="p-5 space-y-4">
              <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Technical Assessment</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skillFields.map((field) => renderSkillField(field))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Personal */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border/60 bg-muted/40">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Globe className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Contact Information</h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/60">
                {contactFields.map((field) => renderField(field, contactFields))}
              </div>
            </div>
          </div>

          {/* Personal Details Card */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border/60 bg-muted/40">
              <div className="p-2 bg-brand/10 rounded-lg">
                <User className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Personal Details</h4>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                 <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Background Details</h5>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/60">
                    {collapsibleDetailsFields.map((field) => renderField(field, collapsibleDetailsFields))}
                 </div>
              </div>
            </div>
          </div>

          {/* Education & Academic Credentials Card */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden group">
            <div className="flex items-center gap-3 p-5 border-b border-border/60 bg-muted/40">
              <div className="p-2 bg-brand/10 rounded-lg">
                <GraduationCap className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Education & Academic Credentials</h4>
            </div>
            <div className="p-5 space-y-6">
              {/* Structured Education Levels */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Academic Degrees</h5>
                <div className="flex flex-col gap-3">
                  {renderEducationLevelCard("master", "Master's Degree")}
                  {renderEducationLevelCard("bachelor", "Bachelor's Degree")}
                  {renderEducationLevelCard("diploma", "Diploma")}
                </div>
              </div>

              {/* General Academic Fields */}
              <div className="space-y-3 pt-4 border-t border-border/60">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Other Qualifications</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/60">
                  {academicFields.map((field) => renderField(field, academicFields))}
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

      {/* Domains Dialog */}
      {canModify && (
        <CandidateDomainDialog
          open={showDomainsDialog}
          onClose={() => setShowDomainsDialog(false)}
          currentValues={localCandidate?.domains || []}
          onSave={(newValue: { ids: string[]; domains: any[] }) => {
            handleSave("domains", newValue.domains);
          }}
        />
      )}

      {/* Education Dialog */}
      {canModify && showEducationDialog && editEducationLevel && (
        <EducationDialog
          open={showEducationDialog}
          onClose={() => {
            setShowEducationDialog(false);
            setEditEducationLevel(null);
          }}
          level={editEducationLevel}
          currentValue={localCandidate?.education?.[editEducationLevel]}
          onSave={handleEducationSave}
        />
      )}

    </div>
  );
};

export default CandidateSummary;
