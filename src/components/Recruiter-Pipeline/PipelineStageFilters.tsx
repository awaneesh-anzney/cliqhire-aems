"use client";
 import React from "react";
 import { Badge } from "@/components/ui/badge";
 import { X, Layers } from "lucide-react";
 import { pipelineStages, getStageColor, type Job } from "./dummy-data";
 import { cn } from "@/lib/utils";
 
 type Props = {
   job: Job;
   selectedStage: string | null;
   onSelectStage: (stage: string | null) => void;
 };
 
 export function PipelineStageFilters({ job, selectedStage, onSelectStage }: Props) {
   const stages = job.stages && job.stages.length > 0 ? job.stages : pipelineStages;
 
   return (
     <div className="flex flex-col gap-3 p-1">
       <div className="flex items-center gap-2 px-2">
         <Layers className="h-4 w-4 text-brand" />
         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
           Pipeline Stage Filters
         </span>
       </div>
 
       <div className="flex flex-wrap gap-2 px-1">
         {/* All Filter */}
         <Badge
           variant="outline"
           className={cn(
             "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all duration-300 border-border",
             !selectedStage 
               ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" 
               : "bg-card text-muted-foreground hover:bg-muted hover:border-border"
           )}
           onClick={() => onSelectStage(null)}
         >
           All Candidates ({job.candidates.length})
         </Badge>
 
         {/* Stage Specific Filters */}
         {stages.map((stage) => {
           const count = job.candidates.filter((c) => c.currentStage === stage).length;
           const isActive = selectedStage === stage;
           
           return (
             <Badge
               key={stage}
               variant="outline"
               className={cn(
                 "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all duration-300",
                 isActive 
                   ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" 
                   : "bg-card text-foreground border-border hover:bg-muted hover:border-border"
               )}
               onClick={() => onSelectStage(isActive ? null : stage)}
             >
               {stage}
               <span className={cn(
                 "ml-2 px-1.5 py-0.5 rounded-md text-[9px] font-black transition-colors",
                 isActive ? "bg-card/20 text-white" : "bg-muted text-muted-foreground"
               )}>
                 {count}
               </span>
             </Badge>
           );
         })}
       </div>
     </div>
   );
 }
