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
 import { Target, Clock, Edit3, Check, X, Loader2, Sparkles, User2, Calendar } from "lucide-react";
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
   mapUIStageToBackendStage,
   type InterviewRound 
 } from "../dummy-data";
 import { InterviewRoundsList } from "../InterviewRoundsList";
 import { InterviewRoundDialog } from "../InterviewRoundDialog";
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
   canModify?: boolean;
 }
 
 export function PipelineStageDetails({
   candidate,
   selectedStage,
   onStageSelect,
   onUpdateCandidate,
   pipelineId,
   candidateId,
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
       toast.error("Permission restricted for pipeline modification.");
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
       "interviewReschedules"
     ];
 
     Object.entries(editValues).forEach(([key, val]) => {
       if (val === "" || val === "Not set") {
         updatedFields[key] = null;
       } else if (numericFields.includes(key) && !isNaN(Number(val))) {
         updatedFields[key] = Number(val);
       } else {
         updatedFields[key] = val;
       }
     });
 
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
 
   const handleAddRound = () => setRoundDialog({ isOpen: true, round: null });
   const handleEditRound = (round: InterviewRound) => setRoundDialog({ isOpen: true, round });
 
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
     return field.value?.toString() || "Not set";
   };
 
   const stageMoveInfo = candidate.stageHistory
     ?.filter((h: any) => mapBackendStageToUIStage(h.stage) === displayStage)
     .sort((a: any, b: any) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime())[0];
 
   const movedBy = stageMoveInfo?.movedBy?.name || "System";
   const movedAt = stageMoveInfo?.movedAt ? formatDateTimeForDisplay(stageMoveInfo.movedAt) : null;
 
   return (
     <div className="w-full flex flex-col gap-6">
       {/* Header with Stage Info and Actions */}
       <div className="flex items-center justify-between gap-4">
         <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10">
             <Sparkles className="h-5 w-5" />
           </div>
           <div className="flex flex-col">
             <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                {displayStage} Intel
             </h4>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Intelligence Level</span>
                <Badge className={cn("text-[9px] font-black uppercase tracking-widest py-0 px-2 h-4", getStageColor(displayStage))}>
                  {displayStage}
                </Badge>
             </div>
           </div>
         </div>
 
         <div className="flex items-center gap-2">
           {canModify && !isEditingStage && displayStage !== "Interview" && stageFields.length > 0 && (
             <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditAll}
                className="h-9 px-4 rounded-xl border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
             >
               <Edit3 className="h-3.5 w-3.5 mr-2 text-slate-400" />
               Modify Details
             </Button>
           )}
           {isEditingStage && (
             <div className="flex gap-2 animate-in slide-in-from-right-2">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsEditingStage(false)}
                 className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50"
               >
                 Discard
               </Button>
               <Button
                 size="sm"
                 onClick={handleSaveAll}
                 disabled={isUpdating}
                 className="h-9 px-5 rounded-xl bg-brand hover:bg-brand/90 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 transition-all"
               >
                 {isUpdating ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-2" />}
                 Synchronize
               </Button>
             </div>
           )}
         </div>
       </div>
 
       {/* Movement History Sub-header */}
       {stageMoveInfo && (
         <div className="flex flex-wrap items-center gap-y-2 gap-x-6 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl animate-in fade-in duration-1000">
           <div className="flex items-center gap-2">
             <User2 className="h-3.5 w-3.5 text-slate-300" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned By:</span>
             <span className="text-[11px] font-bold text-slate-700">{movedBy}</span>
           </div>
           {movedAt && (
             <div className="flex items-center gap-2">
               <Calendar className="h-3.5 w-3.5 text-slate-300" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp:</span>
               <span className="text-[11px] font-bold text-slate-700">{movedAt}</span>
             </div>
           )}
           {stageMoveInfo.notes && (
             <div className="flex items-center gap-2 flex-1 min-w-[200px]">
               <Edit3 className="h-3.5 w-3.5 text-slate-300" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observation:</span>
               <span className="text-[11px] font-medium text-slate-600 italic truncate">&quot;{stageMoveInfo.notes}&quot;</span>
             </div>
           )}
         </div>
       )}
 
       {/* Main Content Grid */}
       <div className="relative">
         {displayStage === "Interview" ? (
           <div className="animate-in fade-in slide-in-from-bottom-2">
             <InterviewRoundsList 
               rounds={candidate.interviewRounds || []} 
               onAddRound={handleAddRound}
               onEditRound={handleEditRound}
               canModify={canModify}
             />
           </div>
         ) : stageFields.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/30 gap-3">
             <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Clock className="h-6 w-6 text-slate-200" />
             </div>
             <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Data Pending</p>
                <p className="text-[10px] font-bold text-slate-300">No active fields defined for the {displayStage} stage.</p>
             </div>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
             {stageFields.map((field) => (
               <div 
                  key={field.key} 
                  className={cn(
                    "group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300",
                    isEditingStage ? "bg-white border-brand/20 shadow-md ring-2 ring-brand/5" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-brand/10 hover:shadow-lg"
                  )}
               >
                 <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110", field.color)}>
                    {field.icon}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-brand transition-colors">
                      {field.label}
                   </p>
                   {isEditingStage ? (
                     <div className="mt-1">
                       {renderFieldInput(field, editValues[field.key] ?? "", (val) => handleUpdateFieldValue(field.key, val))}
                     </div>
                   ) : (
                     <p className="text-[13px] font-black text-slate-800 truncate">
                        {renderFieldValue(field)}
                     </p>
                   )}
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
 
       {/* Overlay Dialogs */}
       <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
         <AlertDialogContent className="rounded-[2rem] border-slate-100 shadow-2xl">
           <AlertDialogHeader>
             <AlertDialogTitle className="font-black text-slate-900 tracking-tighter">Commit Stage Data?</AlertDialogTitle>
             <AlertDialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[11px] leading-relaxed">
               You are about to synchronize all updates for the <strong className="text-brand">{displayStage}</strong> intelligence module.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter className="gap-2">
             <AlertDialogCancel onClick={() => setShowConfirmDialog(false)} className="rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-100">
                Abort
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={handleConfirmSave}
               disabled={isUpdating}
               className="bg-brand hover:bg-brand/90 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20"
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