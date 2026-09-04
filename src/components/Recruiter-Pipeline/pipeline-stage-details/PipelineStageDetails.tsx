"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Target, Clock, Edit3, Check, X, Loader2, Sparkles, User2, Calendar, Undo } from "lucide-react";
import { RecruiterPipelineService } from "@/services/recruiterPipelineService";
import { toast } from "sonner";
import {
  getStageFields,
  getStageColor,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  StageField,
  getProbationPeriodLabel,
} from "./stage-fields";
import { renderFieldInput } from "./field-inputs";
import { 
  mapBackendStageToUIStage, 
  mapUIStageToBackendStage,
  type InterviewRound 
} from "../dummy-data";
import { InterviewRoundsList } from "../InterviewRoundsList";
import { InterviewRoundDialog } from "../InterviewRoundDialog";
import { CvSubmissionResponsibility } from "../cv-submission/CvSubmissionResponsibility";
import { cn } from "@/lib/utils";

// Helper to get stage key from stage name (for local state only)
const getStageKey = (stageName: string): string => {
  let stageKey = stageName.toLowerCase().replace(/\s+/g, "");
  if (stageName === "Client Review") stageKey = "clientScreening";
  return stageKey;
};

interface PipelineStageDetailsProps {
  candidate: any;
  selectedStage?: string;
  onStageSelect?: (stage: string) => void;
  onUpdateCandidate?: (updatedCandidate?: any) => void;
  pipelineId?: string;
  candidateId?: string;
  jobId?: string;
  jobTeamMembers?: any[];
  canModify?: boolean;
}

export function PipelineStageDetails({
  candidate,
  selectedStage,
  onStageSelect,
  onUpdateCandidate,
  pipelineId,
  candidateId,
  jobId,
  jobTeamMembers,
  canModify = true,
}: PipelineStageDetailsProps) {
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [roundDialog, setRoundDialog] = useState<{
    isOpen: boolean;
    round: InterviewRound | null;
  }>({ isOpen: false, round: null });

  React.useEffect(() => {
    return () => setShowConfirmDialog(false);
  }, []);

  if (!candidate) return null;

  const displayStage = selectedStage || candidate.currentStage || "Sourcing";
  const stageFields = getStageFields(displayStage, candidate);
  const isCurrentStage = displayStage === candidate.currentStage;
  const isStageEditable = canModify && isCurrentStage;

  // Automatically discard edit mode if switching between stages
  React.useEffect(() => {
    setIsEditingStage(false);
  }, [displayStage]);

  const handleEditAll = () => {
    if (!isStageEditable) {
      toast.info("Previous stage data is read-only.");
      return;
    }
    setIsEditingStage(true);
    const initialValues: Record<string, string> = {};
    stageFields.forEach((field) => {
      const val = field.value?.toString() || "";
      initialValues[field.key] = val === "Not set" ? "" : val;
    });
    setEditValues(initialValues);
  };

  const handleUpdateFieldValue = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    if (!isStageEditable) {
      toast.error("Previous stage details cannot be modified.");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    const cid = candidateId || candidate.id || candidate._id;
    const hasApiIntegration = pipelineId && cid;

    const updatedFields: Record<string, any> = {};
    const numericFields = [
      "sourcingRating", "screeningRating", "overallRating", "clientRating", 
      "hiringRating", "offeredSalary", "finalSalary", "interviewRoundNo", 
      "interviewReschedules", "salary"
    ];

    Object.entries(editValues).forEach(([key, val]) => {
      if (val === "" || val === "Not set" || val === "none") {
        updatedFields[key] = null;
      } else if (numericFields.includes(key) && !isNaN(Number(val))) {
        updatedFields[key] = Number(val);
      } else {
        updatedFields[key] = val;
      }
    });

    if (updatedFields.probationPeriod && updatedFields.probationPeriod !== "none" && (!updatedFields.startDate || updatedFields.startDate === "")) {
      toast.error("Start Date is required when a Probation Period is selected.");
      return;
    }

    if (!hasApiIntegration) {
      const stageKey = getStageKey(displayStage);
      const updatedCandidate = {
        ...candidate,
        [stageKey]: { ...candidate[stageKey], ...updatedFields },
      };
      onUpdateCandidate?.(updatedCandidate);
      toast.success("Details updated locally");
      setIsEditingStage(false);
      setShowConfirmDialog(false);
      return;
    }

    setIsUpdating(true);
    try {
      const backendStage = mapUIStageToBackendStage(displayStage);
      const stageKey = getStageKey(displayStage);
      const existingStageData = candidate[stageKey] || {};

      const response = await RecruiterPipelineService.updateStageData(
        pipelineId!,
        cid,
        {
          data: { ...existingStageData, ...updatedFields },
          notes: `Updated ${displayStage} stage details`,
        }
      );

      if (!response.success) throw new Error(response.message || "Update failed");
      await onUpdateCandidate?.();
      toast.success(`${displayStage} details saved`);
      setIsEditingStage(false);
      setShowConfirmDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save details");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddRound = () => {
    if (!isStageEditable) {
      toast.info("Previous stages are view-only.");
      return;
    }
    setRoundDialog({ isOpen: true, round: null });
  };

  const handleEditRound = (round: InterviewRound) => {
    if (!isStageEditable) {
      toast.info("Previous stages are view-only.");
      return;
    }
    setRoundDialog({ isOpen: true, round });
  };

  const handleConfirmRound = async (roundData: any) => {
    const cid = candidateId || candidate.id || candidate._id || (candidate as any).candidateId?._id;
    if (!pipelineId || !cid) {
      toast.error("Critical: Missing IDs. Please reload.");
      return;
    }

    setIsUpdating(true);
    try {
      let response;
      if (roundDialog.round) {
        const originalRound = roundDialog.round as any;
        const roundId = originalRound._id || originalRound.id;
        const updatePayload: any = { status: roundData.status, result: roundData.result };
        const fields = ['overallScore', 'technicalScore', 'communicationScore', 'duration', 'strengths', 'areasOfImprovement', 'feedback', 'rescheduleReason', 'notes', 'roundLabel', 'interviewType', 'extraData', 'interviewers'];
        fields.forEach(field => { if (roundData[field] !== undefined) updatePayload[field] = roundData[field]; });
        const dateFields = ['scheduledAt', 'conductedAt'];
        dateFields.forEach(field => { if (roundData[field] !== originalRound[field]) updatePayload[field] = roundData[field]; });
        
        if (!roundId) throw new Error("Round ID missing");
        response = await RecruiterPipelineService.updateInterviewRound(pipelineId, cid, roundId, updatePayload);
      } else {
        response = await RecruiterPipelineService.addInterviewRound(pipelineId, cid, roundData);
      }

      if (response.success) {
        await onUpdateCandidate?.();
        setRoundDialog({ isOpen: false, round: null });
        toast.success("Interview data synchronized");
      } else {
        toast.error(response.message || "Sync failed");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderFieldValue = (field: StageField) => {
    if (field.type === "date") return formatDateForDisplay(field.value?.toString() || "");
    if (field.type === "datetime") return formatDateTimeForDisplay(field.value?.toString() || "");
    if (field.key === "probationPeriod" && field.value) {
      return getProbationPeriodLabel(field.value.toString());
    }
    return field.value?.toString() || "Not set";
  };

  const stageMoveInfo = candidate.stageHistory
    ?.filter((h: any) => mapBackendStageToUIStage(h.stage) === displayStage)
    .sort((a: any, b: any) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime())[0];

  const movedBy = stageMoveInfo?.movedBy?.name || "System";
  const movedAt = stageMoveInfo?.movedAt ? formatDateTimeForDisplay(stageMoveInfo.movedAt) : null;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header with Stage Info and Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand/5 flex items-center justify-center text-brand border border-brand/10">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-foreground tracking-tight uppercase">
               {displayStage} Intel
            </h4>
            <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Level</span>
               <Badge className={cn("text-[9px] font-semibold uppercase tracking-wider py-0 px-1.5 h-4", getStageColor(displayStage))}>
                 {displayStage}
               </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isCurrentStage && (
            <Badge variant="outline" className="text-[9px] font-semibold text-muted-foreground border-border/80 bg-muted/40 py-0.5 px-2">
              View Only
            </Badge>
          )}

          {isStageEditable && !isEditingStage && displayStage !== "Interview" && stageFields.length > 0 && (
            <Button 
               variant="outline" 
               size="sm" 
               onClick={handleEditAll}
               className="h-7.5 px-2.5 rounded-lg border-border/80 font-semibold text-[10px] uppercase tracking-wider hover:bg-muted transition-all shadow-xs"
            >
              <Edit3 className="h-3 w-3 mr-1 text-muted-foreground" />
              Modify Details
            </Button>
          )}
          {isEditingStage && (
            <div className="flex gap-1.5 animate-in slide-in-from-right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingStage(false)}
                className="h-7.5 px-2.5 rounded-lg font-semibold text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={isUpdating}
                className="h-7.5 px-3 rounded-lg bg-brand hover:bg-brand/90 font-semibold text-[10px] uppercase tracking-wider shadow-xs shadow-brand/20 transition-all"
              >
                {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                Synchronize
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Movement History Sub-header */}
      {stageMoveInfo && (
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 px-2.5 py-1.5 bg-muted/65 border border-border/70 rounded-lg text-xs animate-in fade-in duration-500">
          <div className="flex items-center gap-1.5">
            <User2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned:</span>
            <span className="text-[11px] font-semibold text-foreground">{movedBy}</span>
          </div>
          {movedAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Timestamp:</span>
              <span className="text-[11px] font-semibold text-foreground">{movedAt}</span>
            </div>
          )}
          {stageMoveInfo.notes && (
            <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
              <Edit3 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Observation:</span>
              <span className="text-[11px] font-medium text-foreground italic truncate">&quot;{stageMoveInfo.notes}&quot;</span>
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="relative">
        {displayStage === "Screening" && pipelineId && candidateId && (
          <div className="animate-in fade-in slide-in-from-bottom-2 mb-4">
             <CvSubmissionResponsibility 
                pipelineId={pipelineId}
                candidateId={candidateId}
                jobId={jobId || (candidate as any)?.jobId?._id}
                jobTeamMembers={jobTeamMembers || []}
                canModify={isStageEditable}
             />
          </div>
        )}

        {displayStage === "Interview" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <InterviewRoundsList 
              rounds={candidate.interviewRounds || []} 
              onAddRound={handleAddRound}
              onEditRound={handleEditRound}
              canModify={isStageEditable}
            />
          </div>
        ) : stageFields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-xl bg-muted/30 gap-3">
            <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center shadow-sm">
               <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
               <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Data Pending</p>
               <p className="text-[10px] font-medium text-muted-foreground">No active fields defined for the {displayStage} stage.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-in fade-in slide-in-from-bottom-2">
            {stageFields.map((field) => {
              const originalVal = (field.value?.toString() || "") === "Not set" ? "" : (field.value?.toString() || "");
              const currentVal = editValues[field.key] ?? "";
              const isEditable = isEditingStage && field.key !== "probationEndDate";
              const isModified = isEditable && currentVal !== originalVal;

              return (
                <div 
                   key={field.key} 
                   className={cn(
                     "group relative flex items-start gap-2.5 p-2.5 rounded-lg border transition-all duration-200",
                     isEditingStage ? "bg-card border-brand/20 shadow-xs ring-2 ring-brand/5" : "bg-muted/40 border-border/70 hover:bg-card hover:border-border hover:shadow-xs"
                   )}
                >
                  <div className={cn("p-1.5 rounded-md shrink-0 transition-transform group-hover:scale-105", field.color)}>
                     {field.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-brand transition-colors">
                         {field.label}
                      </p>
                      {isModified && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateFieldValue(field.key, originalVal)}
                          className="h-4.5 px-1.5 text-[8px] font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded border border-amber-200/50 bg-amber-50/30 flex items-center gap-0.5 transition-all"
                          title="Revert to original value"
                        >
                          <Undo className="h-2.5 w-2.5" />
                          Revert
                        </Button>
                      )}
                    </div>
                    {isEditable ? (
                      <div className="mt-0.5">
                        {renderFieldInput(field, currentVal, (val) => handleUpdateFieldValue(field.key, val))}
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-foreground truncate">
                         {renderFieldValue(field)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Overlay Dialogs */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-xl border-border shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-foreground tracking-tight">Commit Stage Data?</AlertDialogTitle>
            <AlertDialogDescription className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] leading-relaxed">
              You are about to synchronize all updates for the <strong className="text-brand font-bold">{displayStage}</strong> intelligence module.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)} className="rounded-xl font-semibold text-[10px] uppercase tracking-wider border-border">
               Abort
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              disabled={isUpdating}
              className="bg-brand hover:bg-brand/90 text-white rounded-xl font-semibold text-[10px] uppercase tracking-wider shadow-md shadow-brand/20"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Confirm & Sync"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InterviewRoundDialog 
        isOpen={roundDialog.isOpen}
        onClose={() => setRoundDialog({ isOpen: false, round: null })}
        onConfirm={handleConfirmRound}
        round={roundDialog.round}
        candidateName={candidate.name}
        isUpdating={isUpdating}
      />
    </div>
  );
}