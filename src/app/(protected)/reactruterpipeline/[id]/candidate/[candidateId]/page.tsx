"use client";
 
 import React, { useState, useEffect } from "react";
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
 import { CandidateProbationCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateProbationCard";
 import { CandidateOfferLetterCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateOfferLetterCard";
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
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { formatPhoneNumber } from "@/lib/countryCodes";
 
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
 
   useEffect(() => {
     if (candidate && candidate.isTempCandidate) {
       toast.error("Access Denied", { description: "Temporary candidates do not have a details profile page." });
       router.replace(`/reactruterpipeline/${pipelineId}`);
     }
   }, [candidate, pipelineId, router]);
 
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
 
   const handleConfirmStageChange = async (data?: Record<string, any>) => {
     if (!stageChangeDialog.candidate || !pipelineId) return;
     try {
       await updateCandidateStage(pipelineId, stageChangeDialog.candidate.id, { 
         stage: mapUIStageToBackendStage(stageChangeDialog.newStage),
         data 
       });
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
     if (newStatus === "Disqualified") {
       setDisqualificationDialog({ isOpen: true, candidate, newStatus });
     } else {
       setStatusChangeDialog({ isOpen: true, candidate, newStatus });
     }
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
         <div className="p-4 rounded-2xl bg-card shadow-lg border border-border flex items-center gap-3 animate-in zoom-in-50 duration-700">
           <Loader2 className="h-5 w-5 animate-spin text-brand" />
           <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Loading Candidate Profile...</span>
         </div>
       </div>
     );
   }
 
   if (error || !candidate || !job) {
     return (
       <div className="flex flex-col items-center justify-center h-screen gap-4 bg-muted/50 p-4">
         <div className="p-6 rounded-2xl bg-card shadow-md border border-border text-center max-w-md">
            <User2 className="h-10 w-10 text-red-500 mx-auto mb-3 opacity-20" />
            <h2 className="text-lg font-bold text-foreground tracking-tight mb-2">Profile Unreachable</h2>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 leading-relaxed">
               {(error as any)?.message || "The candidate profile could not be synchronized."}
            </p>
            <Button variant="outline" onClick={() => router.back()} className="w-full h-10 rounded-xl font-semibold text-xs uppercase tracking-wider border-border hover:bg-muted">
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
        <div className="flex flex-col min-h-full w-full bg-muted/50 p-3 gap-3 animate-in fade-in duration-700">
          {/* Top Level Section: Header & Progress */}
          <div className="flex-shrink-0 flex flex-col gap-3 animate-in slide-in-from-top-4 duration-1000 delay-100">
            <CandidateHeaderCard
              candidate={candidate}
              onStageChange={handleStageChange}
              onStatusChange={handleStatusChange}
              canModify={canModifyPipeline}
              pipelineId={pipelineId}
            />
            <CandidateProgressCard
              candidate={candidate}
              selectedStage={selectedStage}
              setSelectedStage={setSelectedStage}
              stages={job.stages}
            />
          </div>
  
          {/* Content Area: Tabs Wrapper */}
          <Tabs defaultValue="pipeline" className="w-full flex flex-col gap-3">
            <TabsList className="flex-shrink-0 self-start bg-card border border-border shadow-sm p-1 rounded-xl h-10">
              <TabsTrigger value="pipeline" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-muted">
                <LayoutDashboard className="h-3.5 w-3.5 text-brand" />
                Pipeline & Stage Info
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-muted">
                <User2 className="h-3.5 w-3.5 text-brand" />
                Candidate Profile
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-muted">
                <FileText className="h-3.5 w-3.5 text-brand" />
                Documents
              </TabsTrigger>
            </TabsList>
  
            <div className="w-full pr-1 pb-4">
              <TabsContent value="pipeline" className="mt-0 space-y-3 focus-visible:outline-none">
                <CandidateDisqualificationCard candidate={candidate} />
  
                 {candidate.probation && candidate.currentStage === "Hired" && (
                    <CandidateProbationCard probation={candidate.probation} />
                  )}

                 {candidate.currentStage === "Hired" && (
                   <CandidateOfferLetterCard 
                     candidate={candidate}
                     pipelineId={pipelineId}
                     canModify={canModifyPipeline}
                   />
                 )}
  
                <div className="bg-card rounded-xl border border-border shadow-md overflow-visible p-4">
                  <div className="flex items-center gap-2 mb-4">
                     <LayoutDashboard className="h-4 w-4 text-brand" />
                     <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stage Intelligence</h3>
                  </div>
                  <PipelineStageDetails
                    candidate={candidate}
                    selectedStage={selectedStage}
                    onStageSelect={setSelectedStage}
                    onUpdateCandidate={handleUpdateCandidate}
                    pipelineId={pipelineId}
                    candidateId={candidateId}
                    jobId={job.jobId?._id || (typeof job.jobId === 'string' ? job.jobId : job.id)}
                    jobTeamMembers={job.jobTeamMembers}
                    canModify={canModifyPipeline}
                  />
                </div>
  

              </TabsContent>
  
              <TabsContent value="profile" className="mt-0 space-y-4 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Work Experience & Salary Details */}
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
                    <h4 className="font-bold text-sm text-foreground flex items-center border-b pb-2">
                      <Briefcase className="h-4 w-4 text-brand mr-2" />
                      Salary & Work Experience
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Total Experience</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.experience ? (candidate.experience.toLowerCase().includes("year") ? candidate.experience : `${candidate.experience} Year(s)`) : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Relevant Experience</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.totalRelevantExperience ? (candidate.totalRelevantExperience.toLowerCase().includes("year") ? candidate.totalRelevantExperience : `${candidate.totalRelevantExperience} Year(s)`) : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Current Salary</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.currentSalary ? `${candidate.currentSalaryCurrency || ""} ${candidate.currentSalary}` : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Expected Salary</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.expectedSalary ? `${candidate.expectedSalaryCurrency || ""} ${candidate.expectedSalary}` : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Notice Period</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.noticePeriod || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Current Position</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.currentJobTitle || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Current Company</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.previousCompanyName || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
  
                  {/* Skills Details */}
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
                    <h4 className="font-bold text-sm text-foreground flex items-center border-b pb-2">
                      <Award className="h-4 w-4 text-brand mr-2" />
                      Key Skills Matrix
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] mb-2">Technical Skills</p>
                        {candidate.technicalSkill && candidate.technicalSkill.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.technicalSkill.flatMap((skill: string) => skill.split('\n')).map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="font-bold text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">None provided</p>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] mb-2">Soft Skills</p>
                        {candidate.softSkill && candidate.softSkill.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.softSkill.map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="font-bold text-xs bg-slate-100 text-slate-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">None provided</p>
                        )}
                      </div>
                    </div>
                  </div>
  
                  {/* Personal & Demographic Details */}
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4 md:col-span-2">
                    <h4 className="font-bold text-sm text-foreground flex items-center border-b pb-2">
                      <User2 className="h-4 w-4 text-brand mr-2" />
                      Personal & Demographic Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Gender</p>
                        <p className="text-sm text-foreground font-semibold mt-1">{candidate.gender || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Nationality</p>
                        <p className="text-sm text-foreground font-semibold mt-1">{candidate.nationality || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Country of Residence</p>
                        <p className="text-sm text-foreground font-semibold mt-1">{candidate.country || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Willing to Relocate?</p>
                        <p className="text-sm text-foreground font-semibold mt-1">{candidate.willingToRelocate || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4 md:col-span-2">
                    <h4 className="font-bold text-sm text-foreground flex items-center border-b pb-2">
                      <Mail className="h-4 w-4 text-brand mr-2" />
                      Contact Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Email Address</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.email ? (
                            <a href={`mailto:${candidate.email}`} className="text-brand hover:underline font-medium">
                              {candidate.email}
                            </a>
                          ) : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Phone Number</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.phone ? formatPhoneNumber(candidate.phone, candidate.countryCode) : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Current Location</p>
                        <p className="text-sm text-foreground font-semibold mt-1">
                          {candidate.location || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
  
              <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
                <CandidateDocumentsCard candidate={candidate} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
 
       {/* Dialog Overlays */}
       <StatusChangeConfirmationDialog
         isOpen={stageChangeDialog.isOpen}
         onClose={() => setStageChangeDialog({ isOpen: false, candidate: null, currentStage: '', newStage: '' })}
         onConfirm={handleConfirmStageChange}
         candidateName={stageChangeDialog.candidate?.name || ''}
         currentStage={stageChangeDialog.currentStage}
         newStage={stageChangeDialog.newStage}
         candidate={stageChangeDialog.candidate}
       />
 
       <Dialog
         open={statusChangeDialog.isOpen}
         onOpenChange={(isOpen) => !isOpen && setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null })}
       >
         <DialogContent className="rounded-xl border-border shadow-xl">
           <DialogHeader>
             <DialogTitle className="font-bold text-foreground tracking-tight">Confirm Status Update</DialogTitle>
             <DialogDescription className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] leading-relaxed">
               Confirm changing the status of <strong className="text-brand font-bold">{statusChangeDialog.candidate?.name}</strong> to <strong className="text-brand font-bold">{statusChangeDialog.newStatus}</strong>.
             </DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2">
             <Button variant="outline" onClick={() => setStatusChangeDialog({ isOpen: false, candidate: null, newStatus: null })} className="rounded-xl font-semibold text-[10px] uppercase tracking-wider border-border">
               Cancel
             </Button>
             <Button onClick={handleConfirmStatusChange} className="bg-brand hover:bg-brand/90 rounded-xl font-semibold text-[10px] uppercase tracking-wider shadow-md shadow-brand/20">
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
 
       {disqualificationDialog.isOpen && disqualificationDialog.candidate && (
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
                   data: data,
                 });
                 await refetch();
                 setDisqualificationDialog({ isOpen: false, candidate: null, newStatus: null });
                 toast.success("Disqualification recorded");
               } catch (error) { console.error(error); }
             }
           }}
         />
       )}
     </TooltipProvider>
   );
 }