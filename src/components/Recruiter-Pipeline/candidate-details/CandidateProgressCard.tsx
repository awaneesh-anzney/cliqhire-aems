"use client";

import React from "react";
import { 
  Users, 
  ClipboardCheck, 
  Eye, 
  MessageSquare, 
  ShieldCheck, 
  Briefcase, 
  Trophy,
  UserX,
  X,
  Check
} from "lucide-react";
import { pipelineStages, type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";
import { cn } from "@/lib/utils";

type Props = {
  candidate: Candidate;
  selectedStage: string | undefined;
  setSelectedStage: (stage: string | undefined) => void;
  stages?: string[];
};

// Map stage names to specific visual icons from the uploaded design
const getStageIcon = (stageName: string, isDisqualified = false) => {
  const normalized = stageName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (isDisqualified) return UserX;
  
  switch (normalized) {
    case "sourcing":
      return Users;
    case "screening":
      return ClipboardCheck;
    case "clientreview":
    case "clientscreening":
      return Eye;
    case "interview":
      return MessageSquare;
    case "verification":
      return ShieldCheck;
    case "onboarding":
      return Briefcase;
    case "hired":
      return Trophy;
    default:
      return Users;
  }
};

export function CandidateProgressCard({ 
  candidate, 
  selectedStage, 
  setSelectedStage, 
  stages: propStages 
}: Props) {
  const stages = propStages && propStages.length > 0 ? propStages : pipelineStages;
  const isDisqualified = candidate.status === 'Disqualified';
  const disqualificationStage = candidate.disqualified?.disqualificationStage || candidate.currentStage;
  
  // Find current index
  const currentIndex = stages.indexOf(isDisqualified ? disqualificationStage : candidate.currentStage);

  return (
    <div className="bg-card rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.01)] p-4">
      <div className="flex flex-col gap-6">
        
        {/* Stepper Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className={cn(
              "h-2 w-2 rounded-full",
              isDisqualified ? "bg-rose-500 animate-pulse" : "bg-emerald-500 animate-pulse"
            )} />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Pipeline Progress</h4>
            {candidate.isTempCandidate && (
              <span className="text-[9px] font-semibold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Temp
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground font-semibold italic hidden sm:inline">
              Click a completed stage to inspect details
            </span>
            <div className="h-3 w-[1px] bg-border hidden sm:block" />
            
            <div className={cn(
              "flex items-center gap-2 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold shadow-sm transition-all",
              isDisqualified
                ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900"
                : "bg-emerald-50/50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
            )}>
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                isDisqualified ? "bg-rose-500 animate-pulse" : "bg-emerald-500 animate-pulse"
              )} />
              <span className="uppercase tracking-wider">
                {isDisqualified 
                  ? `Disqualified at ${disqualificationStage}`
                  : (candidate.status || 'Active')
                }
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Track */}
        <div className="overflow-x-auto custom-scrollbar pb-3 pr-2 select-none">
          <div className="relative flex items-center justify-between min-w-[800px] px-8 pt-3 pb-2">
            
            {/* Connecting Track Line */}
            <div className="absolute left-[40px] right-[40px] top-[32px] h-[2px] bg-gray-200 dark:bg-gray-800 z-0">
              <div 
                className={cn(
                  "h-full transition-all duration-500 ease-out",
                  isDisqualified ? "bg-rose-500" : "bg-emerald-600"
                )}
                style={{ 
                  width: `${(currentIndex / (stages.length - 1)) * 100}%` 
                }}
              />
            </div>

            {/* Stepper Nodes */}
            {stages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isFuture = index > currentIndex;
              const isSelected = selectedStage === stage;
              
              // Clickable logic: Completed stages (current + previous) are clickable
              const isClickable = index <= currentIndex;

              // Get Stage Icon
              const StageIcon = getStageIcon(stage, isDisqualified && isCurrent);

              return (
                <div
                  key={stage}
                  onClick={() => isClickable ? setSelectedStage(stage) : undefined}
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-3.5 transition-all duration-300",
                    isClickable ? "cursor-pointer group" : "cursor-default"
                  )}
                >
                  {/* Node Circle */}
                  <div
                    className={cn(
                      "h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 border-2 bg-card",
                      // Current active stage state (with halo outer ring)
                      isCurrent
                        ? (isDisqualified
                            ? "border-rose-500 text-rose-500 ring-8 ring-rose-100 dark:ring-rose-950/20 shadow-sm"
                            : "border-emerald-600 text-emerald-600 ring-8 ring-emerald-50 dark:ring-emerald-950/15 shadow-sm"
                          )
                        // Completed stage state (filled circle)
                        : isCompleted
                          ? (isDisqualified
                              ? "bg-rose-500 border-rose-500 text-white hover:bg-rose-600"
                              : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                            )
                          // Upcoming future state (gray outline)
                          : "border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-600",
                      
                      // Selected outline highlight
                      isSelected && (isDisqualified 
                        ? "ring-2 ring-rose-400 ring-offset-2 border-rose-600" 
                        : "ring-2 ring-emerald-500 ring-offset-2 border-emerald-700"
                      )
                    )}
                  >
                    <StageIcon className={cn(
                      "h-5 w-5",
                      isCurrent ? "" : isCompleted ? "text-white" : "text-inherit"
                    )} />
                  </div>

                  {/* Stage Labels & Subtitles */}
                  <div className="flex flex-col items-center text-center">
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300",
                        isCurrent 
                          ? (isDisqualified ? "text-rose-600" : "text-emerald-700 dark:text-emerald-400")
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {stage}
                    </span>
                    
                    {/* Subtitle Status Description */}
                    <span className={cn(
                      "text-[9px] font-medium mt-0.5 uppercase tracking-wide transition-colors",
                      isCurrent
                        ? (isDisqualified 
                            ? "text-rose-500" 
                            : (candidate.status === "Pending" ? "text-amber-600" : "text-emerald-600 dark:text-emerald-500")
                          )
                        : isCompleted
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-gray-300 dark:text-gray-600"
                    )}>
                      {isCurrent
                        ? (isDisqualified
                            ? "Failed"
                            : (candidate.status === "Pending" ? "Pending" : "In review")
                          )
                        : isCompleted
                          ? "Completed"
                          : "Pending"
                      }
                    </span>

                    {/* Special Hired Done styling */}
                    {stage.toLowerCase() === "hired" && isCompleted && (
                      <span className="text-[9px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                        🎉 Done
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}
