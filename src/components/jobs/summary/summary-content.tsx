"use client";

import { DetailRow } from "@/components/clients/summary/detail-row";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { EditFieldDialog } from "./edit-field-dialog";
import { EditSalaryDialog } from "./edit-salary-dialog";
import { updateJobById, uploadJobFile } from "@/services/jobService";
import { JDBenefitFilesSection } from "./jd-benefit-files-section";
import { Briefcase, MapPin, Building2, Wallet, FileText, ClipboardList, Clock, GraduationCap, Users } from "lucide-react";
import { toast } from "sonner";
import { JobData } from "../types";
import { Label } from "@/components/ui/label";
import { GenderSelector } from "./gender-selector";
import { DeadlinePicker } from "./deadline-picker";
import { DateRangePicker } from "./date-range-picker";
import { NationalitySelector } from "./nationality-selector";
import { JobStageSelector } from "./job-stage-selector";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { EditExperienceDialog } from "./edit-experience-dialog";
import { EditTeamSizeDialog } from "./edit-team-size-dialog";

interface SummaryContentProps {
  jobId: string;
  jobData: JobData;
  canModify?: boolean;
}

interface TeamMemberType {
  name: string;
  role: string;
  email: string;
  isActive?: boolean;
}

function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function SummaryContent({ jobId, jobData, canModify }: SummaryContentProps) {
  const [jobDetails, setJobDetails] = useState<JobData>(jobData);
  const [loading, setLoading] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isInternalDescriptionModalOpen, setIsInternalDescriptionModalOpen] = useState(false);
  const [internalDescription, setInternalDescription] = useState("");
  const [isGenderDialogOpen, setIsGenderDialogOpen] = useState(false);
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [isDateRangeDialogOpen, setIsDateRangeDialogOpen] = useState(false);
  const [isNationalityDialogOpen, setIsNationalityDialogOpen] = useState(false);
  const [isJobStageDialogOpen, setIsJobStageDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [isTeamSizeDialogOpen, setIsTeamSizeDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const canEdit = canModify ?? true;

  const handleFieldSave = async (editingField: any, newValue: string | Date) => {
    if (!editingField || !jobDetails) return;
    try {
      let processedValue: any = newValue;
      if (editingField.isDate) {
        processedValue = new Date(newValue).toISOString();
      }
      const updatedDetails = {
        ...jobDetails,
        [editingField]: processedValue,
      };
      await updateJobById(jobId, { [editingField]: processedValue });
      setJobDetails(updatedDetails);
      toast.success(
        editingField === "jobDescription"
          ? "Job description updated successfully"
          : "Field updated successfully",
      );
      // Ensure the job data is refetched so other views see the latest
      await queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    } catch (err) {
      toast.error(
        editingField === "jobDescription"
          ? "Failed to update job description"
          : "Failed to update field",
      );
    }
  };

  const handleUpdateField = (field: string) => (value: string) => {
    handleFieldSave(field, value);
  };

  const handleUpdateMultipleFields = async (fields: Record<string, any>) => {
    if (!jobDetails) return;
    try {
      const updatedDetails = {
        ...jobDetails,
        ...fields,
      };
      await updateJobById(jobId, fields);
      setJobDetails(updatedDetails);
      toast.success("Team assignment updated successfully");
      // Invalidate the job query to refetch latest data
      await queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    } catch (err) {
      toast.error("Failed to update team assignment");
    }
  };

  const handleSalarySave = async (values: {
    minSalary: number;
    maxSalary: number;
    currency: string;
  }) => {
    if (!jobDetails) return;
    try {
      const updatedDetails = {
        ...jobDetails,
        minimumSalary: values.minSalary,
        maximumSalary: values.maxSalary,
        salaryCurrency: values.currency,
      };
      await updateJobById(jobId, {
        minimumSalary: values.minSalary,
        maximumSalary: values.maxSalary,
        salaryCurrency: values.currency,
      });
      setJobDetails(updatedDetails);
      toast.success("Salary updated successfully");
    } catch (err) {
      toast.error("Failed to update salary");
    }
  };

  const handleInternalDescriptionSave = async (val: string) => {
    if (!jobDetails) return;
    try {
      await updateJobById(jobId, { jobDescriptionInternal: val });
      setInternalDescription(val);
      toast.success("Internal job description updated successfully");
    } catch (err) {
      toast.error("Failed to update internal job description");
    }
  };

  const handleDateRangeSave = async (startDate: Date | undefined, endDate: Date | undefined, totalCVs: number | undefined) => {
    if (!jobDetails) return;
    try {
      const updatedDetails = {
        ...jobDetails,
        startDateByInternalTeam: startDate,
        endDateByInternalTeam: endDate,
        totalCVs: totalCVs !== undefined ? totalCVs : jobDetails.totalCVs,
      };

      // Send Date objects to backend
      await updateJobById(jobId, {
        startDateByInternalTeam: startDate,
        endDateByInternalTeam: endDate,
        totalCVs: totalCVs,
      });

      setJobDetails(updatedDetails);
      toast.success("Date range and CV count updated successfully");
    } catch (err) {
      toast.error("Failed to update date range and CV count");
    }
  };

  const handleNationalitySave = async (nationalitiesArray: string[]) => {
    if (!jobDetails) return;
    try {
      const updatedDetails = {
        ...jobDetails,
        nationalities: nationalitiesArray,
      };

      // Send array of strings to backend
      await updateJobById(jobId, {
        nationalities: nationalitiesArray,
      });

      setJobDetails(updatedDetails);
      toast.success("Nationalities updated successfully");
    } catch (err) {
      toast.error("Failed to update nationalities");
    }
  };

  const handleFileUpdate = async (field: "jobDescriptionPdf" | "benefitPdf", file: File) => {
    if (!jobDetails) return;
    try {
      const uploadResult = await uploadJobFile(jobId, file, field);

      const updatedDetails = {
        ...jobDetails,
        [field]: {
          url: uploadResult.filePath,
          fileName: file.name,
        },
      };

      await updateJobById(jobId, { [field]: uploadResult.filePath });
      setJobDetails(updatedDetails);
      toast.success(
        `${field === "jobDescriptionPdf" ? "Job Description" : "Benefit"} PDF uploaded successfully`,
      );
    } catch (err) {
      console.error(`Error uploading ${field}:`, err);
      toast.error(
        `Failed to upload ${field === "jobDescriptionPdf" ? "Job Description" : "Benefit"} PDF`,
      );
      throw err; // Re-throw to let the modal handle the error
    }
  };

  return (
    <div className="p-2 space-y-6 bg-slate-50/50 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Job Details & Requirements */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Briefcase className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">Position Details</h4>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2 px-1">Basic Information</h5>
                <div className="grid grid-cols-1 gap-4 bg-slate-50/30 p-3 rounded-lg border border-slate-100">
                  <DetailRow
                    label="Job Title"
                    value={jobDetails.jobTitle}
                    onUpdate={handleUpdateField("jobTitle")}
                    disableInternalEdit={!canEdit}
                  />
                  <DetailRow
                    label="Department"
                    value={jobDetails.department}
                    onUpdate={handleUpdateField("department")}
                    disableInternalEdit={!canEdit}
                  />
                  <DetailRow
                    label="Job Location"
                    value={Array.isArray(jobDetails.location) ? jobDetails.location.join(", ") : jobDetails.location}
                    onUpdate={handleUpdateField("location")}
                    disableInternalEdit={!canEdit}
                  />
                  <DetailRow
                    label="Headcount"
                    value={jobDetails.headcount.toString()}
                    onUpdate={handleUpdateField("headcount")}
                    disableInternalEdit={!canEdit}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2 px-1">Requirements & Experience</h5>
                <div className="grid grid-cols-1 gap-4 bg-slate-50/30 p-3 rounded-lg border border-slate-100">
                  <DetailRow
                    label="Experience"
                    value={capitalize(jobDetails.experience)}
                    onUpdate={handleUpdateField("experience")}
                    customEdit={canEdit ? () => setIsExperienceDialogOpen(true) : undefined}
                    disableInternalEdit={!canEdit}
                  />
                  <DetailRow
                    label="Gender"
                    value={capitalize(jobDetails.gender)}
                    onUpdate={handleUpdateField("gender")}
                    customEdit={canEdit ? () => setIsGenderDialogOpen(true) : undefined}
                    disableInternalEdit={!canEdit}
                  />
                  <DetailRow
                    label="Nationality"
                    value={jobDetails.nationalities ? jobDetails.nationalities.join(", ") : ""}
                    onUpdate={() => {}} 
                    customEdit={canEdit ? () => setIsNationalityDialogOpen(true) : undefined}
                    disableInternalEdit={!canEdit}
                  />
                  <DetailRow
                    label="Key Skills"
                    value={jobDetails.keySkills}
                    onUpdate={handleUpdateField("keySkills")}
                    disableInternalEdit={!canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Compensation, Deadlines & Descriptions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Wallet className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">Compensation & Benefits</h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 bg-slate-50/30 p-4 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Salary Range</p>
                    <p className="text-lg font-bold text-slate-700">
                      {jobDetails.salaryCurrency || "SAR"} {jobDetails.minimumSalary || 0} - {jobDetails.maximumSalary || 0}
                    </p>
                  </div>
                  {canEdit && (
                    <Button variant="outline" size="sm" onClick={() => setIsSalaryDialogOpen(true)} className="border-brand/20 text-brand hover:bg-brand hover:text-white">
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Update Salary
                    </Button>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <JDBenefitFilesSection
                    jobDescriptionPdf={jobDetails.jobDescriptionPdf}
                    benefitPdf={jobDetails.benefitPdf}
                    onFileUpdate={handleFileUpdate}
                    canModify={canEdit}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Clock className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">Timelines & Status</h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 bg-slate-50/30 p-4 rounded-lg border border-slate-100">
                <DetailRow
                  label="Job Stage"
                  value={jobDetails.stage}
                  onUpdate={handleUpdateField("stage")}
                  customEdit={canEdit ? () => setIsJobStageDialogOpen(true) : undefined}
                  disableInternalEdit={!canEdit}
                />
                <DetailRow
                  label="Deadline (By Client)"
                  value={jobDetails.deadlineByClient ? format(jobDetails.deadlineByClient, "dd-MM-yyyy") : ""}
                  onUpdate={handleUpdateField("deadlineByClient")}
                  customEdit={canEdit ? () => setIsDeadlineDialogOpen(true) : undefined}
                  disableInternalEdit={!canEdit}
                />
                <DetailRow
                  label="Internal Date Range"
                  value={jobDetails.startDateByInternalTeam && jobDetails.endDateByInternalTeam ? `${format(jobDetails.startDateByInternalTeam, "dd-MM-yyyy")} to ${format(jobDetails.endDateByInternalTeam, "dd-MM-yyyy")}` : ""}
                  onUpdate={() => {}}
                  customEdit={canEdit ? () => setIsDateRangeDialogOpen(true) : undefined}
                  disableInternalEdit={!canEdit}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg">
                  <ClipboardList className="w-4 h-4 text-brand" />
                </div>
                <h4 className="text-base font-semibold text-slate-800">Job Description</h4>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-brand hover:bg-brand/10" onClick={() => setIsDescriptionModalOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Client
                </Button>
                <Button variant="ghost" size="sm" className="text-brand hover:bg-brand/10" onClick={() => setIsInternalDescriptionModalOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Internal
                </Button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description by Client</p>
                {jobDetails.jobDescription ? (
                  <p className="text-sm text-slate-600 line-clamp-6">{jobDetails.jobDescription}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No description provided by client</p>
                )}
              </div>
              <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Internal Team Notes</p>
                {jobDetails.jobDescriptionByInternalTeam ? (
                  <p className="text-sm text-slate-600 line-clamp-6">{jobDetails.jobDescriptionByInternalTeam}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No internal notes added</p>
                )}
              </div>
            </div>
        </div>
        </div>
      </div>
      {canEdit && (
        <EditSalaryDialog
          open={isSalaryDialogOpen}
          onClose={() => setIsSalaryDialogOpen(false)}
          currentValues={{
            minSalary: jobDetails.minimumSalary,
            maxSalary: jobDetails.maximumSalary,
            currency: jobDetails.salaryCurrency || "SAR",
          }}
          onSave={handleSalarySave}
        />
      )}
      {/* Description Modal (reuse EditFieldDialog for description) */}
      {canEdit && isDescriptionModalOpen && (
        <EditFieldDialog
          open={true}
          onClose={() => setIsDescriptionModalOpen(false)}
          fieldName="Job Description By Client"
          currentValue={jobDetails.jobDescription || ""}
          onSave={async (val: string) => {
            await handleFieldSave("jobDescription", val);
            setIsDescriptionModalOpen(false);
          }}
          isTextArea={true}
        />
      )}

      {canEdit && isInternalDescriptionModalOpen && (
        <EditFieldDialog
          open={true}
          onClose={() => setIsInternalDescriptionModalOpen(false)}
          fieldName="Job Description By Internal Team"
          currentValue={jobDetails.jobDescriptionByInternalTeam || ""}
          onSave={async (val: string) => {
            await handleFieldSave("jobDescriptionByInternalTeam", val);
            setIsInternalDescriptionModalOpen(false);
          }}
          isTextArea={true}
        />
      )}

      {/* Gender Selector Dialog */}
      {canEdit && (
      <GenderSelector
        open={isGenderDialogOpen}
        onClose={() => setIsGenderDialogOpen(false)}
        currentValue={jobDetails.gender || ""}
        onSave={async (val: string) => {
          await handleFieldSave("gender", val);
          setIsGenderDialogOpen(false);
        }}
      />
      )}

      {/* Deadline Picker Dialog */}
      {canEdit && (
      <DeadlinePicker
        open={isDeadlineDialogOpen}
        onClose={() => setIsDeadlineDialogOpen(false)}
        currentValue={jobDetails.deadlineByClient || ""}
        onSave={async (val: Date | null) => {
          await handleFieldSave("deadlineByClient", val || "");
          setIsDeadlineDialogOpen(false);
        }}
      />
      )}

      {/* Experience Edit Dialog */}
      {canEdit && (
        <EditExperienceDialog
          open={isExperienceDialogOpen}
          onClose={() => setIsExperienceDialogOpen(false)}
          currentValue={jobDetails.experience || ""}
          onSave={async (val: string) => {
            await handleFieldSave("experience", val);
            setIsExperienceDialogOpen(false);
          }}
        />
      )}

      {/* Team Size Edit Dialog */}
      {canEdit && (
        <EditTeamSizeDialog
          open={isTeamSizeDialogOpen}
          onClose={() => setIsTeamSizeDialogOpen(false)}
          currentValue={jobDetails.teamSize?.toString() || ""}
          onSave={async (val: string) => {
            await handleFieldSave("teamSize", val);
            setIsTeamSizeDialogOpen(false);
          }}
        />
      )}

      {/* Date Range Picker Dialog */}
      {canEdit && (
      <DateRangePicker
        open={isDateRangeDialogOpen}
        onClose={() => setIsDateRangeDialogOpen(false)}
        currentValue={
          jobDetails.startDateByInternalTeam && jobDetails.endDateByInternalTeam
            ? `${jobDetails.startDateByInternalTeam} to ${jobDetails.endDateByInternalTeam}`
            : ""
        }
        initialTotalCVs={jobDetails.totalCVs}
        onSave={async (startDate: Date | undefined, endDate: Date | undefined, totalCVs: number | undefined) => {
          await handleDateRangeSave(startDate, endDate, totalCVs);
          setIsDateRangeDialogOpen(false);
        }}
      />
      )}

      {/* Nationality Selector Dialog */}
      {canEdit && (
      <NationalitySelector
        open={isNationalityDialogOpen}
        onClose={() => setIsNationalityDialogOpen(false)}
        currentValue={jobDetails.nationalities || []}
        onSave={async (val: string[]) => {
          await handleNationalitySave(val);
          setIsNationalityDialogOpen(false);
        }}
      />
      )}

      {canEdit && (
        <JobStageSelector
          open={isJobStageDialogOpen}
          onClose={() => setIsJobStageDialogOpen(false)}
          currentValue={jobDetails.stage || ""}
          onSave={async (val: string) => {
            await handleFieldSave("stage", val);
            setIsJobStageDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
