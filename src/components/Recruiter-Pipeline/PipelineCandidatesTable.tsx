"use client";
 import React from "react";
 import { 
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 import { Briefcase, EllipsisVertical, Eye, Trash2, User2, Mail, Phone, MapPin, Building2, MoreVertical } from "lucide-react";
 import { useRouter } from "next/navigation";
 import { PipelineStageBadge } from "./pipeline-stage-badge";
 import { StatusBadge } from "./status-badge";
 import { type Candidate, type Job } from "./dummy-data";
 import { cn } from "@/lib/utils";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 import { Button } from "../ui/button";
 
 type Props = {
   job: Job;
   candidates: Candidate[];
   onStageChange: (candidate: Candidate, newStage: string) => void;
   onStatusChange: (candidate: Candidate, newStatus: string) => void;
   onViewResume: (candidate: Candidate) => void;
   onDeleteCandidate: (candidate: Candidate) => void;
   canModify?: boolean;
   showStageColumn?: boolean;
   statusOptionsOverride?: string[];
   actionsVariant?: "full" | "viewOnly";
 };
 
 export function PipelineCandidatesTable({
   job,
   candidates,
   onStageChange,
   onStatusChange,
   onViewResume,
   onDeleteCandidate,
   canModify = true,
   showStageColumn = true,
   statusOptionsOverride,
   actionsVariant = "full",
 }: Props) {
   const router = useRouter();
 
   return (
     <Table className="w-full border-separate border-spacing-0 table-auto">
       <TableHeader className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md">
         <TableRow className="hover:bg-slate-50/95 transition-colors">
           <TableHead className="w-[60px] px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Candidate</TableHead>
           <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Name & Title</TableHead>
           {showStageColumn && <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Pipeline Stage</TableHead>}
           <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Internal Status</TableHead>
           <TableHead className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">Assignees</TableHead>
           <TableHead className="w-[80px] px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right pr-6">Action</TableHead>
         </TableRow>
       </TableHeader>
       <TableBody>
         {candidates.map((candidate) => (
           <TableRow 
             key={candidate.id} 
             className={cn(
                "group border-b border-slate-50 transition-all duration-300",
                "hover:bg-brand/[0.04] hover:shadow-inner hover:translate-x-1"
             )}
           >
             {/* Avatar Column */}
             <TableCell className="px-3 py-2.5 w-[60px]">
               <Avatar 
                 className="h-9 w-9 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110 group-hover:rotate-3 cursor-pointer"
                 onClick={() => router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`)}
               >
                 <AvatarImage src={candidate.avatar} />
                 <AvatarFallback className="text-[10px] font-black bg-brand/5 text-brand">
                   {candidate.name ? candidate.name.split(" ").map((n) => n[0]).join("") : "NA"}
                 </AvatarFallback>
               </Avatar>
             </TableCell>
 
             {/* Name & Title Column */}
             <TableCell className="px-3 py-2.5">
               <div className="flex flex-col min-w-0 max-w-[300px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                         className="flex items-center gap-2 cursor-pointer group/name truncate"
                         onClick={() => router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`)}
                      >
                         <span className="text-[13px] font-black text-slate-900 group-hover/name:text-brand transition-colors truncate">
                           {candidate.name || "Anonymous Candidate"}
                         </span>
                         {candidate.isTempCandidate && (
                           <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-widest border border-red-100">
                             Temp
                           </span>
                         )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[11px] border-none shadow-2xl">
                      {candidate.name}
                    </TooltipContent>
                  </Tooltip>
                  
                  <div className="flex items-center gap-1.5 overflow-hidden">
                     <Building2 className="h-3 w-3 text-slate-300 shrink-0" />
                     <span className="text-[11px] font-medium text-slate-500 truncate">
                        {candidate.currentJobTitle || "Independent Professional"}
                     </span>
                  </div>
               </div>
             </TableCell>
 
             {/* Stage Column */}
             {showStageColumn && (
               <TableCell className="px-3 py-2.5">
                 <div className="scale-90 origin-left">
                   <PipelineStageBadge
                     stage={candidate.currentStage}
                     onStageChange={(newStage) => { if (canModify) onStageChange(candidate, newStage); }}
                   />
                 </div>
               </TableCell>
             )}
 
             {/* Status Column */}
             <TableCell className="px-3 py-2.5">
               {(() => {
                 const stagesWithStatus = [
                   "Sourcing",
                   "Screening",
                   "Client Review",
                   "Interview",
                   "Verification",
                   "Onboarding",
                 ];
                 const alwaysShowStatus = !!statusOptionsOverride;
                 if (alwaysShowStatus || stagesWithStatus.includes(candidate.currentStage)) {
                   const statusValue = (alwaysShowStatus ? (candidate.subStatus as any) : (candidate.status as any)) || null;
                   return (
                     <div className="scale-90 origin-left">
                       <StatusBadge
                         status={statusValue}
                         stage={candidate.currentStage}
                         onStatusChange={(newStatus) => { if (canModify) onStatusChange(candidate, newStatus as any); }}
                         allowedStatuses={statusOptionsOverride}
                       />
                     </div>
                   );
                 } else {
                   return <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">N/A</span>;
                 }
               })()}
             </TableCell>
 
             {/* Assignees Column */}
             <TableCell className="px-3 py-2.5">
               <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                     <ShieldCheck className="h-2.5 w-2.5 text-slate-300" />
                     <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">
                        HM: {job.hiringManagerName || "Unassigned"}
                     </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <User2 className="h-2.5 w-2.5 text-slate-300" />
                     <span className="text-[10px] font-medium text-slate-500 truncate max-w-[120px]">
                        REC: {job.recruiterName || "Unassigned"}
                     </span>
                  </div>
               </div>
             </TableCell>
 
             {/* Action Column */}
             <TableCell className="px-3 py-2.5 text-right pr-6">
               <DropdownMenu modal={false}>
                 <DropdownMenuTrigger asChild>
                   <Button 
                     variant="ghost" 
                     className="h-8 w-8 p-0 rounded-xl hover:bg-brand/5 group/btn"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <MoreVertical className="h-4 w-4 text-slate-400 group-hover/btn:text-brand transition-colors" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl w-52 p-1.5">
                   <DropdownMenuItem
                     onClick={(e) => {
                       e.stopPropagation();
                       router.push(`/reactruterpipeline/${job.id}/candidate/${candidate.id}`);
                     }}
                     className="rounded-lg p-2 text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-brand/5 hover:text-brand"
                   >
                     <Eye className="h-4 w-4" />
                     View Profile
                   </DropdownMenuItem>
                   {candidate.resume && (
                     <DropdownMenuItem
                       onClick={(e) => {
                         e.stopPropagation();
                         onViewResume(candidate);
                       }}
                       className="rounded-lg p-2 text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-brand/5 hover:text-brand"
                     >
                       <Briefcase className="h-4 w-4" />
                       Inspect CV
                     </DropdownMenuItem>
                   )}
                   {canModify && (
                     <DropdownMenuItem
                       onClick={(e) => {
                         e.stopPropagation();
                         onDeleteCandidate(candidate);
                       }}
                       className="rounded-lg p-2 text-xs font-bold flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                     >
                       <Trash2 className="h-4 w-4" />
                       Remove Candidate
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             </TableCell>
           </TableRow>
         ))}
       </TableBody>
     </Table>
   );
 }
 
 const ShieldCheck = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
 );
