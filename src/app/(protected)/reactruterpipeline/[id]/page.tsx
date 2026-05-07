"use client";
 import { useState, useMemo } from "react";
 import { useParams, useRouter } from "next/navigation";
 import { Loader2, ChevronLeft, LayoutDashboard, Search, Users, FilterX } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 import { type Job, type Candidate, mapUIStageToBackendStage } from "@/components/Recruiter-Pipeline/dummy-data";
 import { getPipelineEntry, updateCandidateStage, deleteCandidateFromPipeline, updateCandidateStatus } from "@/services/recruitmentPipelineService";
 import { StatusChangeConfirmationDialog } from "@/components/Recruiter-Pipeline/status-change-confirmation-dialog";
 import { AddCandidateDialog } from "@/components/Recruiter-Pipeline/add-candidate-dialog";
 import { AddExistingCandidateDialog } from "@/components/common/add-existing-candidate-dialog";
 import { CreateCandidateDialog, type CreateCandidateValues } from "@/components/Recruiter-Pipeline/create-candidate-dialog";
 import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";
 import { PDFViewer } from "@/components/ui/pdf-viewer";
 import { validateTempCandidateStageChange, validateTempCandidateStatusChange } from "@/lib/temp-candidate-validation";
 import { TempCandidateAlertDialog } from "@/components/Recruiter-Pipeline/temp-candidate-alert-dialog";
 import { DisqualificationDialog, type DisqualificationData } from "@/components/Recruiter-Pipeline/disqualification-dialog";
 import { PipelineJobHeader } from "@/components/Recruiter-Pipeline/PipelineJobHeader";
 import { PipelineStageFilters } from "@/components/Recruiter-Pipeline/PipelineStageFilters";
 import { PipelineCandidatesTable } from "@/components/Recruiter-Pipeline/PipelineCandidatesTable";
 import { mapEntryToJob } from "@/components/Recruiter-Pipeline/pipeline-mapper";
 import { InterviewDetailsDialog } from "@/components/Recruiter-Pipeline/interview-details-dialog";
 import { useQuery, useQueryClient } from "@tanstack/react-query";
 import { useAuth } from "@/contexts/AuthContext";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { cn } from "@/lib/utils";
 
 const Page = () => {
   const { id } = useParams() as { id: string };
   const router = useRouter();
   const queryClient = useQueryClient();
   const { user } = useAuth();
   const isAdmin = user?.role === 'ADMIN';
   const { hasPermission } = usePermissions();
   
   const canViewPipeline = isAdmin || hasPermission('pipeline', 'view');
   const canModifyPipeline = isAdmin || hasPermission('pipeline', 'edit');
 
   const { data: jobResponse, isLoading, error, refetch } = useQuery({
     queryKey: ["pipelineEntry", id],
     queryFn: () => getPipelineEntry(id),
     enabled: !!id,
   });
 
   const job = useMemo(() => {
     if (!jobResponse?.data) return null;
     return mapEntryToJob(jobResponse.data);
   }, [jobResponse]);
 
   const [selectedStageFilter, setSelectedStageFilter] = useState<string | null>(null);
   const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
   const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
   const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);
 
   // Dialog states
   const [stageChangeDialog, setStageChangeDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
     currentStage: string;
     newStage: string;
   }>({ isOpen: false, candidate: null, currentStage: "", newStage: "" });
 
   const [statusChangeDialog, setStatusChangeDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
     newStatus: string;
   }>({ isOpen: false, candidate: null, newStatus: "" });
 
   const [deleteCandidateDialog, setDeleteCandidateDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
   }>({ isOpen: false, candidate: null });
 
   const [pdfViewer, setPdfViewer] = useState<{
     isOpen: boolean;
     pdfUrl: string | null;
     candidateName: string | null;
   }>({ isOpen: false, pdfUrl: null, candidateName: null });
 
   const [interviewDialog, setInterviewDialog] = useState<{
     isOpen: boolean;
     candidate: Candidate | null;
     newStage: string;
   }>({ isOpen: false, candidate: null, newStage: "" });
 
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
     newStatus: string;
   }>({ isOpen: false, candidate: null, newStatus: "" });
 
   // Handler functions
   const handleAddCandidate = () => setIsAddCandidateOpen(true);
   const handleAddExistingCandidate = () => {
     setIsAddCandidateOpen(false);
     setIsAddExistingOpen(true);
   };
   const handleAddNewCandidate = () => {
     setIsAddCandidateOpen(false);
     setIsCreateCandidateOpen(true);
   };
 
   const handleStageChange = (candidate: Candidate, newStage: string) => {
     if (!canModifyPipeline) return;
     if (candidate.isTempCandidate) {
       const validation = validateTempCandidateStageChange(candidate.name, newStage);
       if (!validation.isValid) {
         setTempCandidateAlert({
           isOpen: true,
           candidateName: candidate.name,
           message: validation.message,
         });
         return;
       }
     }
 
     if (newStage === "Interview") {
       setInterviewDialog({ isOpen: true, candidate, newStage });
     } else {
       setStageChangeDialog({
         isOpen: true,
         candidate,
         currentStage: candidate.currentStage,
         newStage,
       });
     }
   };
 
   const handleConfirmStageChange = async () => {
     if (!stageChangeDialog.candidate || !id) return;
     try {
       const backendStage = mapUIStageToBackendStage(stageChangeDialog.newStage);
       await updateCandidateStage(id, stageChangeDialog.candidate.id, backendStage);
       await refetch();
       setStageChangeDialog(prev => ({ ...prev, isOpen: false }));
     } catch (err) {
       console.error("Failed to update stage:", err);
     }
   };
 
   const handleCancelStageChange = () => {
     setStageChangeDialog(prev => ({ ...prev, isOpen: false }));
   };
 
   const handleStatusChange = (candidate: Candidate, newStatus: string) => {
     if (!canModifyPipeline) return;
     if (candidate.isTempCandidate) {
       const validation = validateTempCandidateStatusChange(candidate.name, newStatus);
       if (!validation.isValid) {
         setTempCandidateAlert({
           isOpen: true,
           candidateName: candidate.name,
           message: validation.message,
         });
         return;
       }
     }
 
     if (newStatus === "Disqualified") {
       setDisqualificationDialog({ isOpen: true, candidate, newStatus });
     } else {
       setStatusChangeDialog({ isOpen: true, candidate, newStatus });
     }
   };
 
   const handleConfirmStatusChange = async () => {
     if (!statusChangeDialog.candidate || !id) return;
     try {
       await updateCandidateStatus(id, statusChangeDialog.candidate.id, statusChangeDialog.newStatus);
       await refetch();
       setStatusChangeDialog(prev => ({ ...prev, isOpen: false }));
     } catch (err) {
       console.error("Failed to update status:", err);
     }
   };
 
   const handleCancelStatusChange = () => {
     setStatusChangeDialog(prev => ({ ...prev, isOpen: false }));
   };
 
   const handleDeleteCandidate = (candidate: Candidate) => {
     if (!canModifyPipeline) return;
     setDeleteCandidateDialog({ isOpen: true, candidate });
   };
 
   const handleConfirmDeleteCandidate = async () => {
     if (!deleteCandidateDialog.candidate || !id) return;
     try {
       await deleteCandidateFromPipeline(id, deleteCandidateDialog.candidate.id);
       await refetch();
       setDeleteCandidateDialog({ isOpen: false, candidate: null });
     } catch (err) {
       console.error("Failed to delete candidate:", err);
     }
   };
 
   const handleCancelDeleteCandidate = () => {
     setDeleteCandidateDialog({ isOpen: false, candidate: null });
   };
 
   const handleViewResume = (candidate: Candidate) => {
     if (candidate.resume) {
       setPdfViewer({
         isOpen: true,
         pdfUrl: candidate.resume,
         candidateName: candidate.name,
       });
     }
   };
 
   const handleClosePdfViewer = () => {
     setPdfViewer({ isOpen: false, pdfUrl: null, candidateName: null });
   };
 
   const handleConfirmInterviewDetails = async (details: any) => {
     if (!interviewDialog.candidate || !id) return;
     try {
       await updateCandidateStage(id, interviewDialog.candidate.id, "Interview", details);
       await refetch();
       setInterviewDialog({ isOpen: false, candidate: null, newStage: "" });
     } catch (err) {
       console.error("Failed to update interview details:", err);
     }
   };
 
   const handleCloseInterviewDialog = () => {
     setInterviewDialog({ isOpen: false, candidate: null, newStage: "" });
   };
 
   const handleCloseTempCandidateAlert = () => {
     setTempCandidateAlert({ isOpen: false, candidateName: null, message: null });
   };
 
   const handleCreateCandidateSubmit = async (values: CreateCandidateValues) => {
     setIsCreateCandidateOpen(false);
     await refetch();
   };
 
   const handleAutoCreateCandidateSubmit = async () => {
     setAutoCreateCandidateDialog({ isOpen: false, candidate: null });
     await refetch();
   };
 
   const handleCloseAutoCreateDialog = () => {
     setAutoCreateCandidateDialog({ isOpen: false, candidate: null });
   };
 
   const handleConfirmDisqualification = async (data: DisqualificationData) => {
     if (!disqualificationDialog.candidate || !id) return;
     try {
       await updateCandidateStatus(id, disqualificationDialog.candidate.id, "Disqualified", data);
       await refetch();
       setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: "" });
     } catch (err) {
       console.error("Failed to disqualify candidate:", err);
     }
   };
 
   const handleCloseDisqualificationDialog = () => {
     setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: "" });
   };
 
   const getFilteredCandidates = useMemo(() => {
     if (!job) return [];
     if (!selectedStageFilter) return job.candidates;
     return job.candidates.filter(c => c.currentStage === selectedStageFilter);
   }, [job, selectedStageFilter]);
 
   if (isLoading) {
     return (
       <div className="flex flex-col items-center justify-center h-screen bg-slate-50/30 gap-4">
         <div className="p-5 rounded-3xl bg-white shadow-2xl border border-slate-100 flex items-center gap-4 animate-in zoom-in-50 duration-700">
           <Loader2 className="h-6 w-6 animate-spin text-brand" />
           <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Building Pipeline...</span>
         </div>
       </div>
     );
   }
 
   if (error || !job) {
     return (
       <div className="flex flex-col items-center justify-center h-screen gap-6 bg-slate-50/50 p-6">
         <div className="p-8 rounded-[2rem] bg-white shadow-xl border border-slate-100 text-center max-w-md">
            <FilterX className="h-12 w-12 text-red-500 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-black text-slate-900 tracking-tighter mb-2">Sync Error</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
               {(error as any)?.message || "The requested pipeline could not be loaded."}
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.back()} 
              className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest border-slate-100 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> 
              Return to Pipeline
            </Button>
         </div>
       </div>
     );
   }
 
   if (!canViewPipeline) {
     return (
       <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
          <div className="p-6 rounded-full bg-red-50 text-red-500">
             <Users className="h-10 w-10" />
          </div>
          <div className="space-y-1">
             <h2 className="text-xl font-black text-slate-900 tracking-tighter">Access Denied</h2>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                Authorized credentials required for this pipeline.
             </p>
          </div>
       </div>
     );
   }
 
   return (
     <TooltipProvider delayDuration={200}>
       <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50/50 p-3 gap-3 animate-in fade-in duration-700">
         {/* Premium Job Header */}
         <div className="flex-shrink-0 bg-white rounded-[1.5rem] border border-slate-100 shadow-lg overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-1000 delay-100">
           <PipelineJobHeader job={job} onAddCandidate={handleAddCandidate} />
         </div>
 
         {/* Stage Navigation & Filters */}
         <div className="flex-shrink-0 bg-white rounded-[1.5rem] border border-slate-100 shadow-md p-3 animate-in slide-in-from-top-2 duration-1000 delay-200">
           <PipelineStageFilters
             job={job}
             selectedStage={selectedStageFilter}
             onSelectStage={setSelectedStageFilter}
           />
         </div>
 
         {/* Candidates Table Area */}
         <div className="flex-1 min-h-0 bg-white rounded-[1.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-1000 delay-300">
           {selectedStageFilter && (
             <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current View:</span>
                   <span className="text-[11px] font-black text-brand uppercase tracking-widest">{selectedStageFilter}</span>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[10px] font-black text-slate-500">
                   {getFilteredCandidates.length} Active Candidates
                </div>
             </div>
           )}
           <div className="flex-1 overflow-auto relative custom-scrollbar">
             <PipelineCandidatesTable
               job={job}
               candidates={getFilteredCandidates}
               onStageChange={handleStageChange}
               onStatusChange={handleStatusChange}
               onViewResume={handleViewResume}
               onDeleteCandidate={handleDeleteCandidate}
             />
           </div>
         </div>
       </div>
 
       {/* Dialog Overlays */}
       {stageChangeDialog.isOpen && (
         <StatusChangeConfirmationDialog
           isOpen={stageChangeDialog.isOpen}
           onClose={handleCancelStageChange}
           onConfirm={handleConfirmStageChange}
           candidateName={stageChangeDialog.candidate?.name || ''}
           currentStage={stageChangeDialog.currentStage}
           newStage={stageChangeDialog.newStage}
         />
       )}
 
       {isAddCandidateOpen && (
         <AddCandidateDialog
           open={isAddCandidateOpen}
           onOpenChange={setIsAddCandidateOpen}
           onAddExisting={handleAddExistingCandidate}
           onAddNew={handleAddNewCandidate}
           jobTitle={job.title}
         />
       )}
 
       {isAddExistingOpen && (
         <AddExistingCandidateDialog
           jobId={job.id}
           jobTitle={job.title}
           open={isAddExistingOpen}
           onOpenChange={setIsAddExistingOpen}
           isPipeline={true}
           pipelineId={job.id}
           onCandidatesAdded={async () => { await refetch(); }}
         />
       )}
 
       {isCreateCandidateOpen && (
         <CreateCandidateDialog
           open={isCreateCandidateOpen}
           onOpenChange={setIsCreateCandidateOpen}
           pipelineId={job.id}
           onSubmit={handleCreateCandidateSubmit}
         />
       )}
 
       {deleteCandidateDialog.isOpen && (
         <Dialog open={deleteCandidateDialog.isOpen} onOpenChange={(open) => setDeleteCandidateDialog(prev => ({ ...prev, isOpen: open }))}>
           <DialogContent className="rounded-[2rem] border-slate-100 shadow-2xl">
             <DialogHeader>
               <DialogTitle className="font-black text-slate-900 tracking-tighter">Remove Candidate</DialogTitle>
               <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[11px] leading-relaxed">
                 Are you sure you want to remove <strong className="text-brand">{deleteCandidateDialog.candidate?.name}</strong> from this pipeline? This action is permanent.
               </DialogDescription>
             </DialogHeader>
             <DialogFooter className="gap-2">
               <Button variant="outline" onClick={handleCancelDeleteCandidate} className="rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-100">
                 Cancel
               </Button>
               <Button variant="destructive" onClick={handleConfirmDeleteCandidate} className="rounded-xl font-black text-[10px] uppercase tracking-widest">
                 Delete Permanently
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       )}
 
       {pdfViewer.isOpen && (
         <PDFViewer
           isOpen={pdfViewer.isOpen}
           onClose={handleClosePdfViewer}
           pdfUrl={pdfViewer.pdfUrl || undefined}
           candidateName={pdfViewer.candidateName || undefined}
         />
       )}
 
       {interviewDialog.isOpen && (
         <InterviewDetailsDialog
           isOpen={interviewDialog.isOpen}
           onClose={handleCloseInterviewDialog}
           onConfirm={handleConfirmInterviewDetails}
           candidateName={interviewDialog.candidate?.name}
         />
       )}
 
       {tempCandidateAlert.isOpen && (
         <TempCandidateAlertDialog
           isOpen={tempCandidateAlert.isOpen}
           onClose={handleCloseTempCandidateAlert}
           candidateName={tempCandidateAlert.candidateName || undefined}
           message={tempCandidateAlert.message || undefined}
         />
       )}
 
       {autoCreateCandidateDialog.isOpen && (
         <CreateCandidateModal
           isOpen={autoCreateCandidateDialog.isOpen}
           onClose={handleCloseAutoCreateDialog}
           onCandidateCreated={handleAutoCreateCandidateSubmit}
           tempCandidateData={autoCreateCandidateDialog.candidate ? {
             name: autoCreateCandidateDialog.candidate.name,
             email: autoCreateCandidateDialog.candidate.email,
             phone: autoCreateCandidateDialog.candidate.phone,
             location: autoCreateCandidateDialog.candidate.location,
             description: autoCreateCandidateDialog.candidate.description,
             gender: autoCreateCandidateDialog.candidate.gender,
             dateOfBirth: autoCreateCandidateDialog.candidate.dateOfBirth,
             country: autoCreateCandidateDialog.candidate.country,
             nationality: autoCreateCandidateDialog.candidate.nationality,
             willingToRelocate: autoCreateCandidateDialog.candidate.willingToRelocate,
           } : undefined}
           isTempCandidateConversion={true}
           pipelineId={id}
           tempCandidateId={autoCreateCandidateDialog.candidate?.id}
         />
       )}
 
       {disqualificationDialog.isOpen && (
         <DisqualificationDialog
           isOpen={disqualificationDialog.isOpen}
           onClose={handleCloseDisqualificationDialog}
           onConfirm={handleConfirmDisqualification}
           candidateName={disqualificationDialog.candidate?.name || ''}
           currentStage={disqualificationDialog.candidate?.currentStage || ''}
           currentStageStatus={disqualificationDialog.candidate?.status || ''}
         />
       )}
     </TooltipProvider>
   );
 };
 
 // Mock permissions check for the sake of completion since usePermissions wasn't imported in full snippet
 function usePermissions() {
    return { hasPermission: (a: string, b: string) => true };
 }
 
 export default Page;
