"use client";
 
 import { MapPin, Users, Building2, ChevronRight, Briefcase, Target, ArrowRight } from "lucide-react";
 import { useRouter } from "next/navigation";
 import { type Job } from "./dummy-data";
 import { Badge } from "@/components/ui/badge";
 import { cn } from "@/lib/utils";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 
 interface PipelineJobCardProps {
   job: Job;
   isHighlighted?: boolean;
 }
 
 export function PipelineJobCard({ job, isHighlighted = false }: PipelineJobCardProps) {
   const router = useRouter();
 
   return (
     <div
       onClick={() => router.push(`/reactruterpipeline/${job.id}`)}
       className={cn(
         "group relative flex items-center bg-white rounded-2xl border border-slate-100 p-2.5 cursor-pointer transition-all duration-500",
         "hover:bg-brand/[0.03] hover:shadow-xl hover:border-brand/10 hover:translate-x-1",
         isHighlighted ? "ring-2 ring-brand/20 bg-brand/[0.02] border-brand/20" : ""
       )}
     >
       {/* Brand accent strip */}
       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-brand opacity-0 group-hover:opacity-100 transition-all duration-500" />
 
       <div className="flex items-center w-full gap-5">
         {/* Icon Container */}
         <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 transition-all duration-500 group-hover:bg-brand group-hover:text-white group-hover:rotate-6 group-hover:scale-110 shadow-sm">
           <Briefcase className="h-6 w-6" />
         </div>
 
         {/* Main Content */}
         <div className="flex flex-col min-w-0 flex-1 gap-1">
           <div className="flex items-center gap-2">
             <Tooltip>
               <TooltipTrigger asChild>
                 <h3 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-brand transition-colors truncate max-w-[300px]">
                   {job.title}
                 </h3>
               </TooltipTrigger>
               <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[11px] border-none shadow-2xl">
                 {job.title}
               </TooltipContent>
             </Tooltip>
             {job.jobId?.stage && (
               <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/20 transition-all">
                 {job.jobId.stage}
               </span>
             )}
           </div>
 
           <div className="flex items-center gap-4 text-slate-500">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 overflow-hidden cursor-help">
                     <Building2 className="h-3.5 w-3.5 text-slate-300" />
                     <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]">{job.clientName}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                  {job.clientName}
                </TooltipContent>
              </Tooltip>
 
              <div className="flex items-center gap-1.5 overflow-hidden">
                 <MapPin className="h-3.5 w-3.5 text-slate-300" />
                 <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">{job.location}</span>
              </div>
           </div>
         </div>
 
         {/* Stats and Action */}
         <div className="flex items-center gap-8 pr-2">
            {/* Candidate Count */}
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-amber-100 transition-colors shadow-sm">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs font-black tracking-tight">{job.totalCandidates || job.candidates?.length || 0}</span>
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Candidates</span>
            </div>
 
            {/* Arrow Action */}
            <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-brand text-slate-300 group-hover:text-white transition-all duration-500 border border-slate-100 group-hover:border-brand group-hover:rotate-0 rotate-[-45deg] shadow-sm">
              <ArrowRight className="h-5 w-5" />
            </div>
         </div>
       </div>
     </div>
   );
 }
