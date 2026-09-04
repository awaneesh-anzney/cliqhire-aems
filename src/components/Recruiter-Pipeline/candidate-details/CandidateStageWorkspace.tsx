"use client";

import React from "react";
import { LayoutDashboard, Sparkles, AlertCircle } from "lucide-react";
import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";
import { CandidateDisqualificationCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateDisqualificationCard";
import { CandidateProbationCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateProbationCard";
import { CandidateOfferLetterCard } from "@/components/Recruiter-Pipeline/candidate-details/CandidateOfferLetterCard";
import { PipelineStageDetails } from "@/components/Recruiter-Pipeline/pipeline-stage-details/PipelineStageDetails";

interface CandidateStageWorkspaceProps {
  candidate: Candidate;
  selectedStage?: string;
  onStageSelect?: (stage: string) => void;
  onUpdateCandidate?: (updatedCandidate?: any) => void;
  pipelineId: string;
  candidateId: string;
  jobId?: string;
  jobTeamMembers?: any[];
  canModify?: boolean;
}

export function CandidateStageWorkspace({
  candidate,
  selectedStage,
  onStageSelect,
  onUpdateCandidate,
  pipelineId,
  candidateId,
  jobId,
  jobTeamMembers,
  canModify = true,
}: CandidateStageWorkspaceProps) {
  const isCurrentStage = !selectedStage || selectedStage === candidate.currentStage;
  const isHiredStage = candidate.currentStage === "Hired" && isCurrentStage;
  const isWorkspaceEditable = canModify && isCurrentStage;

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Disqualification Alert Card (if applicable) */}
      <CandidateDisqualificationCard candidate={candidate} />

      {/* 2. Offer Letter Card (if Hired and current stage) */}
      {isHiredStage && (
        <CandidateOfferLetterCard
          candidate={candidate}
          pipelineId={pipelineId}
          canModify={isWorkspaceEditable}
        />
      )}

      {/* 3. Probation Tracking Card (if Hired, on probation and current stage) */}
      {isHiredStage && candidate.probation && (
        <CandidateProbationCard probation={candidate.probation} />
      )}

      {/* 4. Active Stage Intelligence & Evaluation */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-3 sm:p-3.5 transition-all">
        <PipelineStageDetails
          candidate={candidate}
          selectedStage={selectedStage}
          onStageSelect={onStageSelect}
          onUpdateCandidate={onUpdateCandidate}
          pipelineId={pipelineId}
          candidateId={candidateId}
          jobId={jobId}
          jobTeamMembers={jobTeamMembers}
          canModify={isWorkspaceEditable}
        />
      </div>
    </div>
  );
}
