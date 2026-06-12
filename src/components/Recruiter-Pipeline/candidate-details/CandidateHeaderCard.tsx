"use client";
 
 import React from "react";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";
 import { PipelineStageBadge } from "@/components/Recruiter-Pipeline/pipeline-stage-badge";
 import { StatusBadge } from "@/components/Recruiter-Pipeline/status-badge";
 import { useRouter } from "next/navigation";
 import { cn } from "@/lib/utils";
 import { Briefcase, Building2, User2, MapPin, Globe, ChevronLeft, FileText } from "lucide-react";
 import { Button } from "@/components/ui/button";
 
 interface Props {
   candidate: Candidate;
   onStageChange?: (candidate: Candidate, newStage: string) => void;
   onStatusChange?: (candidate: Candidate, newStatus: string) => void;
   canModify?: boolean;
   pipelineId?: string;
 }
 
 export function CandidateHeaderCard({ candidate, onStageChange, onStatusChange, canModify = true, pipelineId }: Props) {
   const router = useRouter();
 
   return (
     <div className="relative overflow-hidden bg-card rounded-xl border border-border shadow-sm p-4">
       {/* Glassmorphic Background Glow */}
       <div className="absolute top-0 right-0 w-64 h-full bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-16" />
 
       <div className="flex items-center justify-between relative z-10">
         <div className="flex items-center gap-6">
           {/* Avatar with Status */}
           <div className="relative group shrink-0">
             <Avatar className="h-16 w-16 rounded-xl border-2 border-white shadow-md ring-1 ring-border transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
               <AvatarImage src={candidate.avatar} />
               <AvatarFallback className="text-xl font-bold bg-brand/5 text-brand uppercase">
                 {candidate.name ? candidate.name.split(' ').map((n: string) => n[0]).join('') : 'NA'}
               </AvatarFallback>
             </Avatar>
             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-card rounded-full animate-pulse" />
             </div>
           </div>
 
           {/* Info Section */}
           <div className="flex flex-col gap-1.5 min-w-0">
             <div className="flex items-center gap-3">
               <h2 
                 className="text-xl font-bold text-foreground tracking-tight cursor-pointer hover:text-brand transition-colors"
                 onClick={() => router.push(`/candidates/${candidate.id}`)}
               >
                 {candidate.name || 'Anonymous Candidate'}
               </h2>
               {candidate.isTempCandidate && (
                 <Badge className="bg-red-50 text-red-600 border-red-100 font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5">
                   Temporary
                 </Badge>
               )}
             </div>
 
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                   <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                   <span className="text-xs font-semibold text-foreground">
                      {candidate.currentJobTitle || "Independent Professional"}
                   </span>
                </div>
                <div className="h-3 w-[1px] bg-muted" />
                <div className="flex items-center gap-1.5 text-muted-foreground">
                   <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                   <span className="text-xs font-medium text-muted-foreground">
                      {candidate.source || "Organic Sourcing"}
                   </span>
                </div>
             </div>
 
             {/* Dynamic Badges Row */}
             <div className="flex items-center gap-3 mt-1.5">
               <div className="scale-95 origin-left">
                  <PipelineStageBadge
                    stage={candidate.currentStage}
                    onStageChange={canModify && onStageChange ? ((newStage: string) => onStageChange(candidate, newStage)) : undefined}
                  />
               </div>
               
               {(() => {
                 const stagesWithStatus = [
                   "Sourcing",
                   "Screening",
                   "Client Review",
                   "Interview",
                   "Verification",
                   "Onboarding",
                 ];
                 if (stagesWithStatus.includes(candidate.currentStage)) {
                   return (
                     <div className="scale-95 origin-left">
                       <StatusBadge
                         status={candidate.status as any}
                         stage={candidate.currentStage}
                         onStatusChange={canModify && onStatusChange ? ((newStatus: string) => onStatusChange(candidate, newStatus)) : undefined}
                       />
                     </div>
                   );
                 }
                 return null;
               })()}
             </div>
           </div>
         </div>
 
         {/* Action Buttons */}
         <div className="flex items-center gap-2">
           {pipelineId && (
             <Button
               variant="outline"
               size="sm"
               onClick={() => router.push(`/reactruterpipeline/${pipelineId}/candidate/${candidate.id}/summary`)}
               className="h-9 px-4 rounded-lg border-border font-semibold text-[10px] uppercase tracking-wider hover:bg-muted transition-all shadow-sm group"
             >
               <FileText className="h-3.5 w-3.5 mr-1.5 text-brand group-hover:scale-110 transition-transform" />
               Journey Summary
             </Button>
           )}
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => router.back()}
             className="h-9 px-4 rounded-lg border-border font-semibold text-[10px] uppercase tracking-wider hover:bg-muted transition-all shadow-sm group"
           >
             <ChevronLeft className="h-3.5 w-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform" />
             Back to Pipeline
           </Button>
         </div>
       </div>
     </div>
   );
 }
