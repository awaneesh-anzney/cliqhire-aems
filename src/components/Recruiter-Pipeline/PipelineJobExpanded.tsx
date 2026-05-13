"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { pipelineStages, getStageColor, type Job, type Candidate } from "./dummy-data";
import { PipelineCandidatesTable } from "./PipelineCandidatesTable";

interface PipelineJobExpandedProps {
  job: Job;
  selectedStageFilter: string | null;
  onChangeStageFilter: (stage: string | null) => void;
  resolveCurrentStage: (candidate: Candidate) => string;
  onStageChange: (candidate: Candidate, newStage: string) => void;
  onStatusChange: (candidate: Candidate, newStatus: any) => void;
  onViewResume: (candidate: Candidate) => void;
  onDeleteCandidate: (candidate: Candidate) => void;
  canModify?: boolean;
  tableOptions?: { showStageColumn?: boolean; showClientNameColumn?: boolean };
  hideStageFilters?: boolean;
  statusOptionsOverride?: string[];
  actionsVariant?: "full" | "viewOnly";
}

export function PipelineJobExpanded({
  job,
  selectedStageFilter,
  onChangeStageFilter,
  resolveCurrentStage,
  onStageChange,
  onStatusChange,
  onViewResume,
  onDeleteCandidate,
  canModify = true,
  tableOptions,
  hideStageFilters = false,
  statusOptionsOverride,
  actionsVariant = "full",
}: PipelineJobExpandedProps) {
  // Calculate stage counts with resolution function
  const getUpdatedStageCounts = React.useCallback(() => {
    const stageCounts: { [key: string]: number } = {};
    pipelineStages.forEach((stage) => {
      stageCounts[stage] = 0;
    });
    job.candidates.forEach((candidate) => {
      const currentStage = resolveCurrentStage(candidate);
      stageCounts[currentStage] = (stageCounts[currentStage] || 0) + 1;
    });
    return stageCounts;
  }, [job.candidates, resolveCurrentStage]);

  const getFilteredCandidates = React.useCallback(() => {
    if (!selectedStageFilter) return job.candidates;
    return job.candidates.filter((c) => resolveCurrentStage(c) === selectedStageFilter);
  }, [job.candidates, resolveCurrentStage, selectedStageFilter]);

  const handleStageBadgeClick = (stage: string) => {
    if (selectedStageFilter === stage) {
      onChangeStageFilter(null);
    } else {
      onChangeStageFilter(stage);
    }
  };

  const updatedCounts = hideStageFilters ? {} : getUpdatedStageCounts();
  const filteredCandidates = hideStageFilters ? job.candidates : getFilteredCandidates();

  return (
    <>
      {!hideStageFilters && (
        <div className="flex flex-wrap gap-2 mb-6 ml-6">
          {pipelineStages.map((stage) => {
            const count = (updatedCounts as any)[stage] || 0;
            const isActive = selectedStageFilter === stage;
            return (
              <Badge
                key={stage}
                variant="outline"
                className={`${getStageColor(stage)} border cursor-pointer hover:opacity-80 transition-opacity ${
                  isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""
                }`}
                onClick={() => handleStageBadgeClick(stage)}
              >
                {stage}: {count}
              </Badge>
            );
          })}
          {selectedStageFilter && (
            <Badge
              variant="outline"
              className="bg-muted text-foreground border-border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onChangeStageFilter(null)}
            >
              <X className="text-red-500 h-3 w-3 mr-1" />
              Clear Filter
            </Badge>
          )}
        </div>
      )}

      {/* Candidates Table */}
      <div className="border-2 border-blue-200 rounded-md bg-muted max-h-[300px] overflow-hidden">
        {selectedStageFilter && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm text-blue-700 ">
            Showing candidates in: <span className="font-semibold">{selectedStageFilter}</span>
            <span className="ml-2 text-blue-500">({filteredCandidates.length} candidates)</span>
          </div>
        )}
        <div
          className="overflow-y-auto max-h-[300px]"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db #f3f4f6" }}
        >
          <PipelineCandidatesTable
            job={job}
            candidates={filteredCandidates.map((c) => ({
              ...c,
              currentStage: resolveCurrentStage(c),
            }))}
            onStageChange={onStageChange}
            onStatusChange={onStatusChange as any}
            onViewResume={onViewResume}
            onDeleteCandidate={onDeleteCandidate}
            canModify={canModify}
            showStageColumn={tableOptions?.showStageColumn ?? true}
            statusOptionsOverride={statusOptionsOverride}
            actionsVariant={actionsVariant}
          />
        </div>
      </div>
    </>
  );
}
