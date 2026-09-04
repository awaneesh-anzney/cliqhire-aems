"use client";

import React from "react";
import { RecruiterPipeline } from "@/components/Recruiter-Pipeline/recruiter-pipeline";
import { TooltipProvider } from "@/components/ui/tooltip";

const RecruiterPipelinePage = () => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-[hsl(var(--protected-bg))] p-2 md:p-2.5 gap-2 animate-in fade-in duration-300">
        <div className="flex-1 min-h-0 bg-card rounded-xl border border-border/80 shadow-2xs overflow-hidden flex flex-col">
          <RecruiterPipeline />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RecruiterPipelinePage;
