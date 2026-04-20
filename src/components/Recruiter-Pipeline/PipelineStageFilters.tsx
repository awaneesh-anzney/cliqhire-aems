"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { pipelineStages, getStageColor, type Job } from "./dummy-data";

type Props = {
  job: Job;
  selectedStage: string | null;
  onSelectStage: (stage: string | null) => void;
};

export function PipelineStageFilters({ job, selectedStage, onSelectStage }: Props) {
  return (
    <>
      <div className="flex flex-wrap gap-2 ml-6">
        {(job.stages && job.stages.length > 0 ? job.stages : pipelineStages).map((stage) => {
          const count = job.candidates.filter((c) => c.currentStage === stage).length;
          const isActive = selectedStage === stage;
          return (
            <Badge
              key={stage}
              variant="outline"
              className={`${getStageColor(stage)} border cursor-pointer hover:opacity-80 transition-opacity ${
                isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
              onClick={() => onSelectStage(isActive ? null : stage)}
            >
              {stage}: {count}
            </Badge>
          );
        })}
        {selectedStage && (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-600 border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSelectStage(null)}
          >
            <X className="text-red-500 h-3 w-3 mr-1" />
            Clear Filter
          </Badge>
        )}
      </div>
    </>
  );
}



