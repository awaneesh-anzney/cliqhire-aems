"use client";
 
 import React from "react";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";
 import { PipelineStageBadge } from "@/components/Recruiter-Pipeline/pipeline-stage-badge";
 import { StatusBadge } from "@/components/Recruiter-Pipeline/status-badge";
 import { useRouter } from "next/navigation";
 import { cn } from "@/lib/utils";
 import { Briefcase, Building2, User2, MapPin, Globe, ChevronLeft } from "lucide-react";
 import { Button } from "@/components/ui/button";
 
 interface Props {
   candidate: Candidate;
   onStageChange?: (candidate: Candidate, newStage: string) => void;
   onStatusChange?: (candidate: Candidate, newStatus: string) => void;
   canModify?: boolean;
 }
 
 export function CandidateHeaderCard({ candidate, onStageChange, onStatusChange, canModify = true }: Props) {
   const router = useRouter();
 
   return (
     <div className="relative overflow-hidden bg-white rounded-[1.5rem] border border-slate-100 shadow-xl p-5">
       {/* Glassmorphic Background Glow */}
       <div className="absolute top-0 right-0 w-64 h-full bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-16" />
 
       <div className="flex items-center justify-between relative z-10">
         <div className="flex items-center gap-6">
           {/* Avatar with Status */}
           <div className="relative group shrink-0">
             <Avatar className="h-20 w-20 rounded-[1.5rem] border-4 border-white shadow-lg ring-1 ring-slate-100 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
               <AvatarImage src={candidate.avatar} />
               <AvatarFallback className="text-2xl font-black bg-brand/5 text-brand uppercase">
                 {candidate.name ? candidate.name.split(' ').map((n: string) => n[0]).join('') : 'NA'}
               </AvatarFallback>
             </Avatar>
             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
             </div>
           </div>
 
           {/* Info Section */}
           <div className="flex flex-col gap-1.5 min-w-0">
             <div className="flex items-center gap-3">
               <h2 
                 className="text-2xl font-black text-slate-900 tracking-tighter cursor-pointer hover:text-brand transition-colors"
                 onClick={() => router.push(`/candidates/${candidate.id}`)}
               >
                 {candidate.name || 'Anonymous Candidate'}
               </h2>
               {candidate.isTempCandidate && (
                 <Badge className="bg-red-50 text-red-600 border-red-100 font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                   Temporary
                 </Badge>
               )}
             </div>
 
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-500">
                   <Briefcase className="h-4 w-4 text-slate-300" />
                   <span className="text-[13px] font-bold text-slate-600">
                      {candidate.currentJobTitle || "Independent Professional"}
                   </span>
                </div>
                <div className="h-3 w-[1px] bg-slate-200" />
                <div className="flex items-center gap-1.5 text-slate-500">
                   <Globe className="h-4 w-4 text-slate-300" />
                   <span className="text-[13px] font-medium text-slate-500">
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
 
         {/* Back Action */}
         <Button 
           variant="outline" 
           size="sm" 
           onClick={() => router.back()}
           className="h-10 px-5 rounded-xl border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm group"
         >
           <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
           Back to Pipeline
         </Button>
       </div>
     </div>
   );
 }
