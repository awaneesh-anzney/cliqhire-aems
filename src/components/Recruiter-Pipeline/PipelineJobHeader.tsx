"use client";
 import React, { useState } from "react";
 import { useRouter } from "next/navigation";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Building2, HandCoins, MapPin, Plus, Users, Copy, Check, Download, Briefcase, User2, ShieldCheck, ChevronLeft } from "lucide-react";
 import { type Job } from "./dummy-data";
 import { ExportCandidatesDialog } from "./ExportCandidatesDialog";
 import { cn } from "@/lib/utils";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 
 type Props = {
   job: Job;
   onAddCandidate: () => void;
 };
 
 export function PipelineJobHeader({ job, onAddCandidate }: Props) {
   const router = useRouter();
   const [isFormLinkCopied, setIsFormLinkCopied] = useState(false);
   const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
 
   const handleCopyCandidateFormLink = async () => {
     const path = `${window.location.origin}/candidate?job=${encodeURIComponent(job.title)}`;
     try {
       if (navigator?.clipboard?.writeText) {
         await navigator.clipboard.writeText(path);
       } else {
         const ta = document.createElement("textarea");
         ta.value = path;
         document.body.appendChild(ta);
         ta.select();
         document.execCommand("copy");
         document.body.removeChild(ta);
       }
       setIsFormLinkCopied(true);
       window.setTimeout(() => setIsFormLinkCopied(false), 5000);
     } catch (err) {
       console.error("Failed to copy!", err);
     }
   };
 
   return (
     <div className="relative overflow-hidden bg-white p-4 border-b border-slate-100">
       {/* Background Accent */}
       <div className="absolute top-0 right-0 w-64 h-full bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-16" />
 
       <div className="flex items-center justify-between relative z-10">
         <div className="flex items-center gap-6">
           {/* Back Button */}
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => router.back()}
             className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-brand/10 hover:text-brand transition-all border border-slate-100 group"
           >
             <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
           </Button>
 
           {/* Icon Hub */}
           <div className="h-14 w-14 shrink-0 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
             <Briefcase className="h-7 w-7" />
           </div>
 
           {/* Job Meta Section */}
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
               <h1 
                 className="text-xl font-black text-slate-900 tracking-tighter cursor-pointer hover:text-brand transition-colors"
                 onClick={() => job.jobId?._id && router.push(`/jobs/${job.jobId._id}`)}
               >
                 {job.title}
               </h1>
               <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  <span 
                    className="text-[11px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-brand transition-colors"
                    onClick={() => {
                      const clientId = job.jobId?.client?._id || (typeof job.jobId?.client === 'string' ? job.jobId.client : null);
                      if (clientId) router.push(`/clients/${clientId}`);
                    }}
                  >
                    {job.clientName}
                  </span>
               </div>
             </div>
 
             {/* Secondary Meta Row */}
             <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
               <div className="flex items-center gap-1.5">
                 <MapPin className="h-3.5 w-3.5 text-brand/60" />
                 <span>{job.location}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <HandCoins className="h-3.5 w-3.5 text-amber-500/60" />
                 <span>{job.salaryRange || "Competitive"}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/60" />
                 <span className="text-emerald-700">{job.jobType}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <Users className="h-3.5 w-3.5 text-purple-500/60" />
                 <span className="text-purple-700">{job.totalCandidates || job.candidates.length} Applicants</span>
               </div>
               
               {/* Team Labels (Compact) */}
               <div className="flex items-center gap-4 border-l border-slate-100 pl-4 ml-2">
                 {job.jobTeamMembers?.slice(0, 2).map((member: any) => (
                   <Tooltip key={member.position}>
                     <TooltipTrigger asChild>
                       <div className="flex items-center gap-1.5 cursor-help">
                         <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500 border border-white">
                            {member.position === 'hiringManager' ? 'HM' : 'RC'}
                         </div>
                         <span className="text-[10px] text-slate-400">
                           {member.users?.[0]?.firstName || 'Assignee'}
                         </span>
                       </div>
                     </TooltipTrigger>
                     <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                       {member.positionLabel}: {member.users?.map((u: any) => u.name || u.email).join(", ")}
                     </TooltipContent>
                   </Tooltip>
                 ))}
               </div>
             </div>
           </div>
         </div>
 
         {/* Action Hub */}
         <div className="flex items-center gap-2">
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => setIsExportDialogOpen(true)}
             className="h-10 px-4 rounded-xl border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm group"
           >
             <Download className="h-4 w-4 mr-2 text-slate-400 group-hover:text-slate-600" />
             Export
           </Button>
           <Button 
             variant="outline" 
             size="sm" 
             onClick={handleCopyCandidateFormLink}
             className="h-10 px-4 rounded-xl border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm group"
           >
             {isFormLinkCopied ? (
               <Check className="h-4 w-4 mr-2 text-emerald-500" />
             ) : (
               <Copy className="h-4 w-4 mr-2 text-slate-400 group-hover:text-slate-600" />
             )}
             {isFormLinkCopied ? "Copied" : "Form Link"}
           </Button>
           <Button 
             onClick={onAddCandidate} 
             size="sm" 
             className="h-10 px-5 rounded-xl bg-brand hover:bg-brand/90 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-brand/20"
           >
             <Plus className="h-4 w-4 mr-2" />
             Add Candidate
           </Button>
         </div>
       </div>
 
       <ExportCandidatesDialog
         isOpen={isExportDialogOpen}
         onClose={() => setIsExportDialogOpen(false)}
         pipelineId={job.id}
         jobTitle={job.title}
       />
     </div>
   );
 }
