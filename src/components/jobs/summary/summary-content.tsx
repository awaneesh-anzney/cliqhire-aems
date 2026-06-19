"use client";

import { DetailRow } from "@/components/clients/summary/detail-row";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Plus, Pencil } from "lucide-react";
import { EditFieldDialog } from "./edit-field-dialog";
import { EditSalaryDialog } from "./edit-salary-dialog";
import { updateJobById, uploadJobFile } from "@/services/jobService";
import { JDBenefitFilesSection } from "./jd-benefit-files-section";
import { Briefcase, MapPin, Building2, Wallet, FileText, ClipboardList, Clock, GraduationCap, Users } from "lucide-react";
import { toast } from "sonner";
import { JobData, CvTarget } from "../types";
import { Label } from "@/components/ui/label";
import { GenderSelector } from "./gender-selector";
import { DeadlinePicker } from "./deadline-picker";
import { DateRangePicker } from "./date-range-picker";
import { EditCvTargetsDialog } from "./edit-cv-targets-dialog";
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
  const [isCvTargetsDialogOpen, setIsCvTargetsDialogOpen] = useState(false);
  const [isNationalityDialogOpen, setIsNationalityDialogOpen] = useState(false);
  const [isJobStageDialogOpen, setIsJobStageDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [isTeamSizeDialogOpen, setIsTeamSizeDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const canEdit = canModify ?? true;

  useEffect(() => {
    setJobDetails(jobData);
  }, [jobData]);

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

  const handleCvTargetsSave = async (updatedTargets: CvTarget[]) => {
    if (!jobDetails) return;
    try {
      const res = await updateJobById(jobId, {
        cvTargets: updatedTargets,
      });

      const updatedDetails = {
        ...jobDetails,
        cvTargets: updatedTargets,
      };
      
      if (res?.success && res.data) {
        const jobVal = Array.isArray(res.data) ? res.data[0] : res.data;
        setJobDetails(jobVal as any as JobData);
      } else {
        setJobDetails(updatedDetails);
      }

      toast.success("CV targets updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    } catch (err) {
      toast.error("Failed to update CV targets");
      throw err;
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
    <div className="p-2 space-y-6 bg-muted/50 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Job Details & Requirements */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Briefcase className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Position Details</h4>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Basic Information</h5>
                <div className="grid grid-cols-1 gap-4 bg-muted/30 p-3 rounded-lg border border-border">
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
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Requirements & Experience</h5>
                <div className="grid grid-cols-1 gap-4 bg-muted/30 p-3 rounded-lg border border-border">
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
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Wallet className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Compensation & Benefits</h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Salary Range</p>
                    <p className="text-lg font-bold text-foreground">
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
                <div className="pt-4 border-t border-border">
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
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Clock className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Timelines & Status</h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
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
              </div>
            </div>
          </div>

          {/* CV Targets Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg">
                  <ClipboardList className="w-4 h-4 text-brand" />
                </div>
                <h4 className="text-base font-semibold text-foreground">CV Targets</h4>
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand hover:bg-brand/10 font-bold"
                  onClick={() => setIsCvTargetsDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div className="p-5 space-y-5">
              {!jobDetails.cvTargets || jobDetails.cvTargets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
                  <p className="text-sm font-medium">No CV target slots configured.</p>
                  {canEdit && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsCvTargetsDialogOpen(true)}
                      className="text-brand font-bold mt-1"
                    >
                      Add targets
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Overall progress */}
                  {jobDetails.cvTargetsSummary && (
                    <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-2">
                      <div className="flex justify-between text-sm font-bold text-foreground">
                        <span>Overall Submission Progress</span>
                        <span>
                          {jobDetails.cvTargetsSummary.totalAchievedCVs} / {jobDetails.cvTargetsSummary.totalTargetCVs} CVs
                        </span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (jobDetails.cvTargetsSummary.totalAchievedCVs /
                                (jobDetails.cvTargetsSummary.totalTargetCVs || 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>
                          {Math.round(
                            (jobDetails.cvTargetsSummary.totalAchievedCVs /
                              (jobDetails.cvTargetsSummary.totalTargetCVs || 1)) *
                              100
                          )}
                          % Completed
                        </span>
                        <span>
                          {jobDetails.cvTargetsSummary.totalRemainingCVs} remaining
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Individual slots */}
                  <div className="space-y-4 pt-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Client CV Submission</p>
                    {jobDetails.cvTargets.map((slot) => {
                      const achieved = slot.achievedCount || 0;
                      const target = slot.targetCount || 1;
                      const remaining = slot.remaining ?? Math.max(0, target - achieved);
                      const isCompleted = slot.isCompleted || achieved >= target;
                      const isExpired = slot.isExpired;

                      // Badge configuration
                      let badgeLabel = "Active";
                      let badgeCls = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                      if (isCompleted) {
                        badgeLabel = "Completed";
                        badgeCls = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                      } else if (isExpired) {
                        badgeLabel = "Expired";
                        badgeCls = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                      }

                      // Date format helper
                      const formatDateRange = (startStr: string, endStr: string) => {
                        try {
                          const start = new Date(startStr);
                          const end = new Date(endStr);
                          return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
                        } catch {
                          return "";
                        }
                      };

                      return (
                        <div key={slot._id} className="p-3 bg-muted/20 border border-border rounded-xl space-y-2.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {slot.label || `Submission Slot`}
                              </p>
                              <p className="text-xs text-muted-foreground font-semibold">
                                {formatDateRange(slot.startDate, slot.endDate)}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeCls}`}>
                              {badgeLabel}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isCompleted ? "bg-green-500" : isExpired ? "bg-red-500" : "bg-blue-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, (achieved / target) * 100)}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                              <span>
                                {achieved} / {target} CVs
                              </span>
                              <span>
                                {isCompleted ? "Goal Met" : `${remaining} remaining`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg">
                  <ClipboardList className="w-4 h-4 text-brand" />
                </div>
                <h4 className="text-base font-semibold text-foreground">Job Description</h4>
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
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Description by Client</p>
                {jobDetails.jobDescription ? (
                  <p className="text-sm text-foreground line-clamp-6">{jobDetails.jobDescription}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description provided by client</p>
                )}
              </div>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Internal Team Notes</p>
                {jobDetails.jobDescriptionByInternalTeam ? (
                  <p className="text-sm text-foreground line-clamp-6">{jobDetails.jobDescriptionByInternalTeam}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No internal notes added</p>
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

      {/* CV Targets Dialog */}
      {canEdit && (
        <EditCvTargetsDialog
          open={isCvTargetsDialogOpen}
          onClose={() => setIsCvTargetsDialogOpen(false)}
          cvTargets={jobDetails.cvTargets}
          onSave={handleCvTargetsSave}
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
