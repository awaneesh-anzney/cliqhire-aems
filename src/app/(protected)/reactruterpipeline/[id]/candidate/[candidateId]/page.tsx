"use client";
 
 import React, { useState } from "react";
 import { useParams, useRouter } from "next/navigation";
 import { useQuery, useQueryClient } from "@tanstack/react-query";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Button } from "@/components/ui/button";
 import {
   Briefcase,
   Building2,
   Calendar,
   GraduationCap,
   Languages,
   Award,
   FileText,
   Mail,
   Phone,
   MapPin,
   Check,
   ChevronLeft,
   Loader2,
   LayoutDashboard,
   User2
 } from "lucide-react";
 import { getPipelineCandidateDetails, updateCandidateStage, updateCandidateStatus, addInterviewRound } from "@/services/recruitmentPipelineService";
 import { mapPipelineCandidateResponse } from "@/components/Recruiter-Pipeline/pipeline-mapper";
 import { PipelineStageDetails } from "@/components/Recruiter-Pipeline/pipeline-stage-details/PipelineStageDetails";
 import { useAuth } from "@/contexts/AuthContext";
 import { type Job, type Candidate, pipelineStages, mapUIStageToBackendStage } from "@/components/Recruiter-Pipeline/dummy-data";
 import { usePermissions } from "@/contexts/PermissionContext";
 import { toast } from "sonner";
 
 import { CandidateHeaderCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateHeaderCard";
 import { CandidateProgressCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateProgressCard";
 import { CandidateDisqualificationCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateDisqualificationCard";
 import { CandidateInfoGrid } from "@/components/Recruiter-Pipeline/candidate-details/CandidateInfoGrid";
 import { CandidateDocumentsCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateDocumentsCard";
 
 // Dialog imports
 import { StatusChangeConfirmationDialog } from "@/components/Recruiter-Pipeline/status-change-confirmation-dialog";
 import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
 import { validateTempCandidateStageChange, validateTempCandidateStatusChange } from "@/lib/temp-candidate-validation";
 import { TempCandidateAlertDialog } from "@/components/Recruiter-Pipeline/temp-candidate-alert-dialog";
 import { InterviewDetailsDialog } from "@/components/Recruiter-Pipeline/interview-details-dialog";
 import { DisqualificationDialog } from "@/components/Recruiter-Pipeline/disqualification-dialog";
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { cn } from "@/lib/utils";
 
 export default function CandidatePipelineDetailsPage() {
   const router = useRouter();
   const params = useParams();
   const pipelineId = (params as any)?.id as string;
   const candidateId = (params as any)?.candidateId as string;
   const queryClient = useQueryClient();
 
   const { user } = useAuth();
   const { hasPermission } = usePermissions();
   const isAdmin = user?.role === 'ADMIN';
   const canModifyPipeline = isAdmin || hasPermission('pipeline', 'edit');
 
   const { data, isLoading, error, refetch } = useQuery<{ job: Job; candidate: Candidate } | null>({
     queryKey: ["pipeline", pipelineId, "candidate", candidateId],
     queryFn: async () => {
       const res = await getPipelineCandidateDetails(pipelineId, candidateId);
       return mapPipelineCandidateResponse(res.data);
     },
     enabled: !!pipelineId && !!candidateId,
   });
 
   const job = data?.job;
   const candidate = data?.candidate;
 
   const [selectedStage, setSelectedStage] = useState<string | undefined>(undefined);
 
   // Dialog States
   const [statusChangeDialog, setStatusChangeDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
     newStatus: string | null;
   }>({ isOpen: false, candidate: null, newStatus: null });
 
   const [stageChangeDialog, setStageChangeDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
     currentStage: string;
     newStage: string;
   }>({ isOpen: false, candidate: null, currentStage: '', newStage: '' });
 
   const [interviewDialog, setInterviewDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
   }>({ isOpen: false, candidate: null });
 
   const [tempCandidateAlert, setTempCandidateAlert] = useState<{
     isOpen: boolean;
     candidateName: string | null;
     message: string | null;
   }>({ isOpen: false, candidateName: null, message: null });
 
   const [autoCreateCandidateDialog, setAutoCreateCandidateDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
   }>({ isOpen: false, candidate: null });
 
   const [disqualificationDialog, setDisqualificationDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
     newStatus: string | null;
   }>({ isOpen: false, candidate: null, newStatus: null });
 
   const handleStageChange = (candidate: Candidate, newStage: string) => {
     if (!canModifyPipeline) return;
     if (candidate.isTempCandidate) {
       const validation = validateTempCandidateStageChange(candidate, newStage);
       if (!validation.canChangeStage) {
         setTempCandidateAlert({ isOpen: true, candidateName: candidate.name, message: validation.message || null });
         return;
       }
     }
     setStageChangeDialog({ isOpen: true, candidate, currentStage: candidate.currentStage, newStage });
   };
 
   const handleConfirmStageChange = async () => {
     if (!stageChangeDialog.candidate || !pipelineId) return;
     try {
       await updateCandidateStage(pipelineId, stageChangeDialog.candidate.id, { stage: mapUIStageToBackendStage(stageChangeDialog.newStage) });
       await refetch();
       setStageChangeDialog(prev => ({ ...prev, isOpen: false }));
       toast.success("Pipeline stage updated");
     } catch (err) { console.error(err); }
   };
 
   const handleStatusChange = (candidate: Candidate, newStatus: string) => {
     if (!canModifyPipeline) return;
     if (candidate.isTempCandidate) {
       const validation = validateTempCandidateStatusChange(candidate, newStatus);
       if (!validation.canChangeStage) {
         setTempCandidateAlert({ isOpen: true, candidateName: candidate.name, message: validation.message || null });
         return;
       }
     }
     setStatusChangeDialog({ isOpen: true, candidate, newStatus });
   };
 
   const handleConfirmStatusChange = async () => {
     if (!statusChangeDialog.candidate || !statusChangeDialog.newStatus || !pipelineId) return;
     try {
       await updateCandidateStatus(pipelineId, statusChangeDialog.candidate.id, {
         status: statusChangeDialog.newStatus,
         stage: mapUIStageToBackendStage(statusChangeDialog.candidate.currentStage)
       });
       await refetch();
       setStatusChangeDialog(prev => ({ ...prev, isOpen: false }));
       toast.success("Candidate status updated");
     } catch (err) { console.error(err); }
   };
 
   const handleConfirmInterviewDetails = async (details: any) => {
     if (!interviewDialog.candidate || !pipelineId) return;
     try {
       await addInterviewRound(pipelineId, interviewDialog.candidate.id, details);
       await refetch();
       setInterviewDialog({ isOpen: false, candidate: null });
       toast.success("Interview scheduled");
     } catch (err) { console.error(err); }
   };
 
   if (isLoading) {
     return (
       <div className="flex flex-col items-center justify-center h-screen bg-muted/30 gap-4">
         <div className="p-5 rounded-3xl bg-card shadow-2xl border border-border flex items-center gap-4 animate-in zoom-in-50 duration-700">
           <Loader2 className="h-6 w-6 animate-spin text-brand" />
           <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Loading Candidate Profile...</span>
         </div>
       </div>
     );
   }
 
   if (error || !candidate || !job) {
     return (
       <div className="flex flex-col items-center justify-center h-screen gap-6 bg-muted/50 p-6">
         <div className="p-8 rounded-[2rem] bg-card shadow-xl border border-border text-center max-w-md">
            <User2 className="h-12 w-12 text-red-500 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-black text-foreground tracking-tighter mb-2">Profile Unreachable</h2>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 leading-relaxed">
               {(error as any)?.message || "The candidate profile could not be synchronized."}
            </p>
            <Button variant="outline" onClick={() => router.back()} className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest border-border hover:bg-muted">
              <ChevronLeft className="h-4 w-4 mr-2" /> Return to Pipeline
            </Button>
         </div>
       </div>
     );
   }
 
   const handleUpdateCandidate = async () => {
     await refetch();
   };
 
   return (
     <TooltipProvider delayDuration={200}>
       <div className="flex flex-col h-screen w-full overflow-hidden bg-muted/50 p-3 gap-3 animate-in fade-in duration-700">
         {/* Top Level Section: Header & Progress */}
         <div className="flex-shrink-0 flex flex-col gap-3 animate-in slide-in-from-top-4 duration-1000 delay-100">
           <CandidateHeaderCard
             candidate={candidate}
             onStageChange={handleStageChange}
             onStatusChange={handleStatusChange}
             canModify={canModifyPipeline}
           />
           <CandidateProgressCard
             candidate={candidate}
             selectedStage={selectedStage}
             setSelectedStage={setSelectedStage}
             stages={job.stages}
           />
         </div>
 
         {/* Content Area: Scrolling Sections */}
         <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-1000 delay-200 pr-1">
           <CandidateDisqualificationCard candidate={candidate} />
 
           <div className="bg-card rounded-[1.5rem] border border-border shadow-xl overflow-visible p-6">
             <div className="flex items-center gap-3 mb-6">
                <LayoutDashboard className="h-5 w-5 text-brand" />
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Stage Intelligence</h3>
             </div>
             <PipelineStageDetails
               candidate={candidate}
               selectedStage={selectedStage}
               onStageSelect={setSelectedStage}
               onUpdateCandidate={handleUpdateCandidate}
               pipelineId={pipelineId}
               candidateId={candidateId}
               canModify={canModifyPipeline}
             />
           </div>
 
           <CandidateInfoGrid candidate={candidate} />
           <CandidateDocumentsCard candidate={candidate} />
         </div>
       </div>
 
       {/* Dialog Overlays */}
       <StatusChangeConfirmationDialog
         isOpen={stageChangeDialog.isOpen}
         onClose={() => setStageChangeDialog({ isOpen: false, candidate: null, currentStage: '', newStage: '' })}
         onConfirm={handleConfirmStageChange}
         candidateName={stageChangeDialog.candidate?.name || ''}
         currentStage={stageChangeDialog.currentStage}
         newStage={stageChangeDialog.newStage}
       />
 
       <Dialog
         open={statusChangeDialog.isOpen}
         onOpenChange={(isOpen) => !isOpen && setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null })}
       >
         <DialogContent className="rounded-[2rem] border-border shadow-2xl">
           <DialogHeader>
             <DialogTitle className="font-black text-foreground tracking-tighter">Confirm Status Update</DialogTitle>
             <DialogDescription className="font-bold text-muted-foreground uppercase tracking-widest text-[11px] leading-relaxed">
               Confirm changing the status of <strong className="text-brand">{statusChangeDialog.candidate?.name}</strong> to <strong className="text-brand">{statusChangeDialog.newStatus}</strong>.
             </DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2">
             <Button variant="outline" onClick={() => setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null })} className="rounded-xl font-black text-[10px] uppercase tracking-widest border-border">
               Cancel
             </Button>
             <Button onClick={handleConfirmStatusChange} className="bg-brand hover:bg-brand/90 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20">
               Confirm Update
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       <TempCandidateAlertDialog
         isOpen={tempCandidateAlert.isOpen}
         onClose={() => setTempCandidateAlert({ isOpen: false, candidateName: null, message: null })}
         candidateName={tempCandidateAlert.candidateName || ''}
         message={tempCandidateAlert.message || undefined}
       />
 
       {autoCreateCandidateDialog.candidate && (
         <CreateCandidateModal
           isOpen={autoCreateCandidateDialog.isOpen}
           onClose={() => setAutoCreateCandidateDialog({ isOpen: false, candidate: null })}
           tempCandidateData={{
             name: autoCreateCandidateDialog.candidate.name,
             email: autoCreateCandidateDialog.candidate.email || '',
             phone: autoCreateCandidateDialog.candidate.phone || '',
           }}
           tempCandidateId={autoCreateCandidateDialog.candidate.id}
           pipelineId={pipelineId}
           isTempCandidateConversion={true}
           onCandidateCreated={() => {
             queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId] });
             toast.success("Profile Activated", { description: "Candidate moved to CV Received stage." });
           }}
         />
       )}
 
       {disqualificationDialog.candidate && (
         <DisqualificationDialog
           isOpen={disqualificationDialog.isOpen}
           onClose={() => setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: null })}
           candidateName={disqualificationDialog.candidate?.name || ''}
           currentStage={disqualificationDialog.candidate.currentStage}
           currentStageStatus={disqualificationDialog.candidate.status as string}
           onConfirm={async (data) => {
             if (disqualificationDialog.candidate) {
               try {
                 await updateCandidateStatus(pipelineId, disqualificationDialog.candidate.id, {
                   status: 'Disqualified',
                   stage: mapUIStageToBackendStage(disqualificationDialog.candidate.currentStage),
                   notes: data.disqualificationReason,
                 });
                 await refetch();
                 toast.success("Disqualification recorded");
               } catch (error) { console.error(error); }
             }
           }}
         />
       )}
     </TooltipProvider>
   );
 }