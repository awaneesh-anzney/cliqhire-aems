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
import { Target, Clock, Edit3, Check, X, Loader2 } from "lucide-react";
import { RecruiterPipelineService } from "@/services/recruiterPipelineService";
import { toast } from "sonner";
import {
  getStageFields,
  getStageColor,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  StageField,
} from "./stage-fields";
import { renderFieldInput } from "./field-inputs";
import { 
  mapBackendStageToUIStage, 
  mapUIStageToBackendStage 
} from "../dummy-data";
import { updateCandidateStageData } from "@/services/recruitmentPipelineService";

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
  onUpdateCandidate?: (updatedCandidate: any) => void;
  pipelineId?: string;
  canModify?: boolean;
}

export function PipelineStageDetails({
  candidate,
  selectedStage,
  onStageSelect,
  onUpdateCandidate,
  pipelineId,
  canModify = true,
}: PipelineStageDetailsProps) {
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  React.useEffect(() => {
    return () => setShowConfirmDialog(false);
  }, []);

  if (!candidate) return null;

  const displayStage = selectedStage || candidate.currentStage || "Sourcing";
  const stageFields = getStageFields(displayStage, candidate);

  const handleEditAll = () => {
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
    if (!canModify) {
      toast.error("You do not have permission to modify the recruitment pipeline.");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    // ── Get the correct candidate ID for the API call
    // The API response maps this to candidate.id via the pipeline-mapper
    const candidateId = candidate.id || candidate._id;
    const hasApiIntegration = pipelineId && candidateId;

    const updatedFields: Record<string, any> = {};
    Object.entries(editValues).forEach(([key, val]) => {
      updatedFields[key] = val === "" || val === "Not set" ? null : val;
    });

    if (!hasApiIntegration) {
      // Local-only update
      const stageKey = getStageKey(displayStage);
      const updatedCandidate = {
        ...candidate,
        [stageKey]: { ...candidate[stageKey], ...updatedFields },
      };
      onUpdateCandidate?.(updatedCandidate);
      toast.success("Stage details updated locally");
      setIsEditingStage(false);
      setShowConfirmDialog(false);
      return;
    }

    setIsUpdating(true);
    try {
      // ── Using plural service with explicit stage name
      const backendStage = mapUIStageToBackendStage(displayStage);
      const stageKey = getStageKey(displayStage);
      const existingStageData = candidate[stageKey] || {};

      const response = await updateCandidateStageData(
        pipelineId!,
        candidateId,
        {
          stage: backendStage,
          data: { ...existingStageData, ...updatedFields },
          notes: `Bulk updated stage details for ${displayStage}`,
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Update failed");
      }

      // Optimistically update local state
      const stageKeyLocal = getStageKey(displayStage);
      const updatedCandidate = {
        ...candidate,
        [stageKeyLocal]: {
          ...candidate[stageKeyLocal],
          ...updatedFields,
        },
      };
      
      // Notify parent to refresh query
      await onUpdateCandidate?.(updatedCandidate);

      toast.success(`${displayStage} stage details saved`);
      setIsEditingStage(false);
      setShowConfirmDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save stage details");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderFieldValue = (field: StageField) => {
    if (field.type === "date") return formatDateForDisplay(field.value?.toString() || "");
    if (field.type === "datetime") return formatDateTimeForDisplay(field.value?.toString() || "");
    return field.value?.toString() || "Not set";
  };

  const stageMoveInfo = candidate.stageHistory
    ?.filter((h: any) => {
      const mappedStage = mapBackendStageToUIStage(h.stage);
      return mappedStage === displayStage;
    })
    .sort((a: any, b: any) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime())[0];

  const movedBy = stageMoveInfo?.movedBy?.name || "System";
  const movedAt = stageMoveInfo?.movedAt ? formatDateTimeForDisplay(stageMoveInfo.movedAt) : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-semibold">{displayStage} Details</CardTitle>
            <Badge className={`text-xs ${getStageColor(displayStage)}`}>{displayStage}</Badge>
          </div>
          {canModify && !isEditingStage && stageFields.length > 0 && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleEditAll}>
              <Edit3 className="h-3 w-3 mr-1" /> Edit All
            </Button>
          )}
          {isEditingStage && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setIsEditingStage(false)}
              >
                <X className="h-3 w-3 mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSaveAll}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
        {stageMoveInfo && (
          <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground bg-slate-50 p-2 rounded-md border border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold uppercase tracking-wider text-slate-400">Moved By:</span>
              <span className="text-slate-600 font-medium">{movedBy}</span>
            </div>
            {movedAt && (
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span className="font-semibold uppercase tracking-wider text-slate-400">Date:</span>
                <span className="text-slate-600 font-medium">{movedAt}</span>
              </div>
            )}
            {stageMoveInfo.notes && (
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4 flex-1 truncate">
                <span className="font-semibold uppercase tracking-wider text-slate-400">Notes:</span>
                <span className="text-slate-600 font-medium italic truncate">&quot;{stageMoveInfo.notes}&quot;</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {stageFields.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            No fields for {displayStage} stage
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {stageFields.map((field) => (
              <div key={field.key} className="flex items-start gap-3">
                <div className={`p-1.5 rounded-md shrink-0 ${field.color}`}>{field.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">{field.label}</p>
                  {isEditingStage ? (
                    <div className="min-h-[40px]">
                      {renderFieldInput(field, editValues[field.key] ?? "", (val) => handleUpdateFieldValue(field.key, val))}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-700 truncate">{renderFieldValue(field)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Confirm save dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Updates</AlertDialogTitle>
            <AlertDialogDescription>
              Save all changes to the <strong>{displayStage}</strong> stage? This will update the
              candidate&quot;s stage data in the pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Confirm Updates"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
