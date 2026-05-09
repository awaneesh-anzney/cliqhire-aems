"use client";
 import React from "react";
 import { RecruiterPipeline } from "@/components/Recruiter-Pipeline/recruiter-pipeline";
 import { TooltipProvider } from "@/components/ui/tooltip";
 
 const ReactruterPipelinePage = () => {
   return (
     <TooltipProvider delayDuration={200}>
       <div className="flex flex-col h-screen w-full overflow-hidden bg-muted/50 p-3 gap-3 animate-in fade-in duration-700">
         {/* The header is usually handled by the layout or inside the RecruiterPipeline component if it has one.
             Based on the previous code, it was a simple container. 
             I'll wrap it in our premium container style. */}
         <div className="flex-1 min-h-0 bg-card rounded-[1.5rem] border border-border shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-1000 delay-150">
            <RecruiterPipeline />
         </div>
       </div>
     </TooltipProvider>
   );
 };
 
 export default ReactruterPipelinePage;
