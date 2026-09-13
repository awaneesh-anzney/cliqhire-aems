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
  Check,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { pipelineStages, type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CandidatePipelineStepperProps {
  candidate: Candidate;
  selectedStage: string | undefined;
  setSelectedStage: (stage: string | undefined) => void;
  stages?: string[];
}

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

export function CandidatePipelineStepper({
  candidate,
  selectedStage,
  setSelectedStage,
  stages: propStages,
}: CandidatePipelineStepperProps) {
  const stages = propStages && propStages.length > 0 ? propStages : pipelineStages;
  const isDisqualified = candidate.status === "Disqualified";
  const disqualificationStage = candidate.disqualified?.disqualificationStage || candidate.currentStage;
  
  const currentStageName = isDisqualified ? disqualificationStage : candidate.currentStage;
  const currentIndex = Math.max(0, stages.indexOf(currentStageName));
  const activeInspectedStage = selectedStage || candidate.currentStage;
  const isViewingDifferentStage = Boolean(selectedStage && selectedStage !== candidate.currentStage);

  return (
    <div className="bg-card rounded-xl border border-border/80 shadow-xs p-2.5 sm:p-3 transition-all">
      <div className="flex flex-col gap-2.5">
        {/* Compact Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                isDisqualified ? "bg-rose-500 animate-pulse" : "bg-emerald-500 animate-pulse"
              )}
            />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold uppercase tracking-wider text-foreground text-[11px]">
                Pipeline Track
              </span>
              <span className="text-muted-foreground text-[10px]">•</span>
              <span className="text-[11px] text-muted-foreground">
                Current: <strong className="text-foreground font-semibold">{candidate.currentStage}</strong>
              </span>
            </div>
          </div>

          {/* Status & Inspector Mode Indicator */}
          <div className="flex flex-wrap items-center gap-1.5">
            {isViewingDifferentStage && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-400 font-medium animate-in fade-in">
                <span>Inspecting: <strong>{selectedStage}</strong> (View-Only)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStage(undefined)}
                  className="h-4 px-1 text-[9px] text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 rounded ml-0.5"
                >
                  <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                  Reset to Current
                </Button>
              </div>
            )}

            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold",
                isDisqualified
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              )}
            >
              {isDisqualified ? (
                <>
                  <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
                  <span>Disqualified ({disqualificationStage})</span>
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>{candidate.status || "Active in Pipeline"}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compact Horizontal Pipeline Steps Track */}
        <div className="overflow-x-auto pb-1 select-none custom-scrollbar">
          <div className="relative flex items-center justify-between min-w-[620px] px-4 py-1">
            {/* Connecting Progress Track Line */}
            <div className="absolute left-[28px] right-[28px] top-[18px] h-[2px] bg-muted rounded-full z-0">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  isDisqualified ? "bg-rose-500" : "bg-brand"
                )}
                style={{
                  width: `${(currentIndex / Math.max(1, stages.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Stepper Nodes */}
            {stages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isFuture = index > currentIndex;
              const isSelected = activeInspectedStage === stage;
              const isClickable = index <= currentIndex;
              const StageIcon = getStageIcon(stage, isDisqualified && isCurrent);

              return (
                <div
                  key={stage}
                  onClick={() => (isClickable ? setSelectedStage(stage) : undefined)}
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-1 group transition-all duration-200",
                    isClickable ? "cursor-pointer" : "cursor-default opacity-60"
                  )}
                  title={
                    isClickable
                      ? `Click to view ${stage} stage intelligence`
                      : `${stage} stage not yet reached`
                  }
                >
                  {/* Step Icon Circle */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 bg-card",
                      // Current stage
                      isCurrent && (
                        isDisqualified
                          ? "border-rose-500 text-rose-500 ring-3 ring-rose-500/20 shadow-xs"
                          : "border-brand text-brand ring-3 ring-brand/20 shadow-xs"
                      ),
                      // Completed stage
                      isCompleted && (
                        isDisqualified
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-brand border-brand text-white hover:bg-brand/90"
                      ),
                      // Future stage
                      isFuture && "border-border/80 text-muted-foreground/60 bg-muted/30",
                      // Currently selected / inspected stage
                      isSelected && "ring-2 ring-foreground/40 ring-offset-1 ring-offset-card"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      <StageIcon className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Stage Label & Status */}
                  <div className="flex flex-col items-center text-center max-w-[85px]">
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-tight transition-colors leading-tight",
                        isSelected
                          ? "text-foreground font-bold"
                          : isCurrent
                          ? isDisqualified
                            ? "text-rose-600 font-bold"
                            : "text-brand font-bold"
                          : isCompleted
                          ? "text-foreground/80 group-hover:text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {stage}
                    </span>

                    <span
                      className={cn(
                        "text-[8px] font-medium tracking-wide uppercase mt-0.5",
                        isCurrent
                          ? isDisqualified
                            ? "text-rose-500 font-semibold"
                            : "text-brand font-semibold"
                          : isCompleted
                          ? "text-muted-foreground/70"
                          : "text-muted-foreground/40"
                      )}
                    >
                      {isCurrent
                        ? isDisqualified
                          ? "Failed"
                          : "In Progress"
                        : isCompleted
                        ? "Done"
                        : "Pending"}
                    </span>
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
