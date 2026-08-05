"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Briefcase, 
  Wallet, 
  ClipboardList, 
  Clock, 
  Pencil 
} from "lucide-react";

import { DetailRow } from "@/components/clients/summary/detail-row";
import { Button } from "@/components/ui/button";
import { updateJobById, uploadJobFile } from "@/services/jobService";
import { JDBenefitFilesSection } from "./jd-benefit-files-section";
import { JobCvSubmissionSummary } from "./JobCvSubmissionSummary";
import { JobData, CvTarget } from "../types";

// Dialog Components
import { EditFieldDialog } from "./edit-field-dialog";
import { EditSalaryDialog } from "./edit-salary-dialog";
import { GenderSelector } from "./gender-selector";
import { DeadlinePicker } from "./deadline-picker";
import { DateRangePicker } from "./date-range-picker";
import { EditCvTargetsDialog } from "./edit-cv-targets-dialog";
import { NationalitySelector } from "./nationality-selector";
import { JobStageSelector } from "./job-stage-selector";
import { EditExperienceDialog } from "./edit-experience-dialog";
import { EditTeamSizeDialog } from "./edit-team-size-dialog";

interface SummaryContentProps {
  jobId: string;
  jobData: JobData;
  canModify?: boolean;
}

function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function SummaryContent({ jobId, jobData, canModify }: SummaryContentProps) {
  const [jobDetails, setJobDetails] = useState<JobData>(jobData);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isInternalDescriptionModalOpen, setIsInternalDescriptionModalOpen] = useState(false);
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
          : "Field updated successfully"
      );
      await queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    } catch (err) {
      toast.error(
        editingField === "jobDescription"
          ? "Failed to update job description"
          : "Failed to update field"
      );
    }
  };

  const handleUpdateField = (field: string) => (value: string) => {
    handleFieldSave(field, value);
  };

  const handleSalarySave = async (values: { minSalary: number; maxSalary: number; currency: string }) => {
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

  const handleDateRangeSave = async (startDate: Date | undefined, endDate: Date | undefined, totalCVs: number | undefined) => {
    if (!jobDetails) return;
    try {
      const updatedDetails = {
        ...jobDetails,
        startDateByInternalTeam: startDate,
        endDateByInternalTeam: endDate,
        totalCVs: totalCVs !== undefined ? totalCVs : jobDetails.totalCVs,
      };

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
      const res = await updateJobById(jobId, { cvTargets: updatedTargets });
      const updatedDetails = { ...jobDetails, cvTargets: updatedTargets };
      
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
      await updateJobById(jobId, { nationalities: nationalitiesArray });
      setJobDetails({ ...jobDetails, nationalities: nationalitiesArray });
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
        [field]: { url: uploadResult.filePath, fileName: file.name },
      };
      await updateJobById(jobId, { [field]: uploadResult.filePath });
      setJobDetails(updatedDetails);
      toast.success(`${field === "jobDescriptionPdf" ? "Job Description" : "Benefit"} PDF uploaded successfully`);
    } catch (err) {
      toast.error(`Failed to upload ${field === "jobDescriptionPdf" ? "Job Description" : "Benefit"} PDF`);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top CV Submission Bar Component */}
      <JobCvSubmissionSummary jobId={jobId} />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Position Details & Requirements */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/40 backdrop-blur-sm">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">Position Details</h4>
            </div>

            {/* Content */}
            <div className="p-4 space-y-5">
              
              {/* Basic Info */}
              <div>
                <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Basic Information
                </h5>
                <div className="space-y-2 bg-muted/20 p-3 rounded-xl border border-border/40">
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
                  <DetailRow
                    label="Reporting To"
                    value={jobDetails.reportingTo || ""}
                    onUpdate={handleUpdateField("reportingTo")}
                    disableInternalEdit={!canEdit}
                  />
                </div>
              </div>

              {/* Requirements & Experience */}
              <div>
                <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Requirements & Experience
                </h5>
                <div className="space-y-2 bg-muted/20 p-3 rounded-xl border border-border/40">
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

        {/* Right Column: Compensation, Timelines, CV Targets & Descriptions */}
        <div className="space-y-6">
          
          {/* Compensation & Benefits */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/40 backdrop-blur-sm">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">Compensation & Benefits</h4>
            </div>
            
            <div className="p-4">
              <div className="bg-muted/20 p-3.5 rounded-xl border border-border/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Salary Range</p>
                    <p className="text-base font-extrabold text-foreground mt-0.5">
                      {jobDetails.salaryCurrency || "SAR"} {jobDetails.minimumSalary || 0} - {jobDetails.maximumSalary || 0}
                    </p>
                  </div>
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsSalaryDialogOpen(true)} 
                      className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Update Salary
                    </Button>
                  )}
                </div>

                <div className="pt-3 border-t border-border/40">
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

          {/* Timelines & Status */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/40 backdrop-blur-sm">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">Timelines & Status</h4>
            </div>

            <div className="p-4">
              <div className="space-y-2 bg-muted/20 p-3 rounded-xl border border-border/40">
                <DetailRow
                  label="Job Stage"
                  value={jobDetails.stage}
                  onUpdate={handleUpdateField("stage")}
                  customEdit={canEdit ? () => setIsJobStageDialogOpen(true) : undefined}
                  disableInternalEdit={!canEdit}
                />
                <DetailRow
                  label="Deadline (By Client)"
                  value={jobDetails.deadlineByClient ? format(new Date(jobDetails.deadlineByClient), "dd-MM-yyyy") : ""}
                  onUpdate={handleUpdateField("deadlineByClient")}
                  customEdit={canEdit ? () => setIsDeadlineDialogOpen(true) : undefined}
                  disableInternalEdit={!canEdit}
                />
              </div>
            </div>
          </div>

          {/* CV Targets Card */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">CV Targets</h4>
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs"
                  onClick={() => setIsCvTargetsDialogOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              )}
            </div>

            <div className="p-4 space-y-4">
              {!jobDetails.cvTargets || jobDetails.cvTargets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/20 border border-dashed border-border/80 rounded-xl">
                  <p className="text-xs font-semibold">No CV target slots configured.</p>
                  {canEdit && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsCvTargetsDialogOpen(true)}
                      className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-1"
                    >
                      Add targets
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Overall progress */}
                  {jobDetails.cvTargetsSummary && (
                    <div className="bg-muted/20 p-3.5 rounded-xl border border-border/40 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-foreground">
                        <span>Overall Submission Progress</span>
                        <span>
                          {jobDetails.cvTargetsSummary.totalAchievedCVs} / {jobDetails.cvTargetsSummary.totalTargetCVs} CVs
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-500"
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
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>
                          {Math.round(
                            (jobDetails.cvTargetsSummary.totalAchievedCVs /
                              (jobDetails.cvTargetsSummary.totalTargetCVs || 1)) *
                              100
                          )}% Completed
                        </span>
                        <span>{jobDetails.cvTargetsSummary.totalRemainingCVs} remaining</span>
                      </div>
                    </div>
                  )}

                  {/* Individual Slots */}
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Client CV Submission</p>
                    {jobDetails.cvTargets.map((slot) => {
                      const achieved = slot.achievedCount || 0;
                      const target = slot.targetCount || 1;
                      const remaining = slot.remaining ?? Math.max(0, target - achieved);
                      const isCompleted = slot.isCompleted || achieved >= target;
                      const isExpired = slot.isExpired;

                      let badgeLabel = "Active";
                      let badgeCls = "bg-blue-500/10 text-blue-700 dark:text-blue-300";
                      if (isCompleted) {
                        badgeLabel = "Completed";
                        badgeCls = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
                      } else if (isExpired) {
                        badgeLabel = "Expired";
                        badgeCls = "bg-rose-500/10 text-rose-700 dark:text-rose-300";
                      }

                      const formatDateRange = (startStr: string, endStr: string) => {
                        try {
                          const safeStart = startStr ? startStr.split('T')[0] + 'T00:00:00' : '';
                          const safeEnd = endStr ? endStr.split('T')[0] + 'T00:00:00' : '';
                          return `${format(new Date(safeStart), "d MMM")} – ${format(new Date(safeEnd), "d MMM yyyy")}`;
                        } catch {
                          return "";
                        }
                      };

                      return (
                        <div key={slot._id} className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {slot.label || `Submission Slot`}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-semibold">
                                {formatDateRange(slot.startDate, slot.endDate)}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeCls}`}>
                              {badgeLabel}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isCompleted ? "bg-emerald-500" : isExpired ? "bg-rose-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${Math.min(100, (achieved / target) * 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                              <span>{achieved} / {target} CVs</span>
                              <span>{isCompleted ? "Goal Met" : `${remaining} remaining`}</span>
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

          {/* Job Description Card */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">Job Description</h4>
              </div>
              <div className="flex gap-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-medium" 
                  onClick={() => setIsDescriptionModalOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Client
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-medium" 
                  onClick={() => setIsInternalDescriptionModalOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Internal
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-muted/20 rounded-xl p-3.5 border border-border/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Description by Client</p>
                {jobDetails.jobDescription ? (
                  <p className="text-xs text-foreground/90 line-clamp-6 leading-relaxed">{jobDetails.jobDescription}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No description provided by client</p>
                )}
              </div>

              <div className="bg-muted/20 rounded-xl p-3.5 border border-border/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Internal Team Notes</p>
                {jobDetails.jobDescriptionByInternalTeam ? (
                  <p className="text-xs text-foreground/90 line-clamp-6 leading-relaxed">{jobDetails.jobDescriptionByInternalTeam}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No internal notes added</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dialog Modals Container */}
      {canEdit && (
        <>
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

          {isDescriptionModalOpen && (
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

          {isInternalDescriptionModalOpen && (
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

          <GenderSelector
            open={isGenderDialogOpen}
            onClose={() => setIsGenderDialogOpen(false)}
            currentValue={jobDetails.gender || ""}
            onSave={async (val: string) => {
              await handleFieldSave("gender", val);
              setIsGenderDialogOpen(false);
            }}
          />

          <DeadlinePicker
            open={isDeadlineDialogOpen}
            onClose={() => setIsDeadlineDialogOpen(false)}
            currentValue={jobDetails.deadlineByClient || ""}
            onSave={async (val: Date | null) => {
              await handleFieldSave("deadlineByClient", val || "");
              setIsDeadlineDialogOpen(false);
            }}
          />

          <EditExperienceDialog
            open={isExperienceDialogOpen}
            onClose={() => setIsExperienceDialogOpen(false)}
            currentValue={jobDetails.experience || ""}
            onSave={async (val: string) => {
              await handleFieldSave("experience", val);
              setIsExperienceDialogOpen(false);
            }}
          />

          <EditTeamSizeDialog
            open={isTeamSizeDialogOpen}
            onClose={() => setIsTeamSizeDialogOpen(false)}
            currentValue={jobDetails.teamSize?.toString() || ""}
            onSave={async (val: string) => {
              await handleFieldSave("teamSize", val);
              setIsTeamSizeDialogOpen(false);
            }}
          />

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

          <EditCvTargetsDialog
            open={isCvTargetsDialogOpen}
            onClose={() => setIsCvTargetsDialogOpen(false)}
            cvTargets={jobDetails.cvTargets}
            onSave={handleCvTargetsSave}
          />

          <NationalitySelector
            open={isNationalityDialogOpen}
            onClose={() => setIsNationalityDialogOpen(false)}
            currentValue={jobDetails.nationalities || []}
            onSave={async (val: string[]) => {
              await handleNationalitySave(val);
              setIsNationalityDialogOpen(false);
            }}
          />

          <JobStageSelector
            open={isJobStageDialogOpen}
            onClose={() => setIsJobStageDialogOpen(false)}
            currentValue={jobDetails.stage || ""}
            onSave={async (val: string) => {
              await handleFieldSave("stage", val);
              setIsJobStageDialogOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}