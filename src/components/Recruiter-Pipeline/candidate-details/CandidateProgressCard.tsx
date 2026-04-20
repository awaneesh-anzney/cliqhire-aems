import React from "react";
import { Check } from "lucide-react";
import { pipelineStages, type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";

type Props = {
  candidate: Candidate;
  selectedStage: string | undefined;
  setSelectedStage: (stage: string | undefined) => void;
  stages?: string[];
};

export function CandidateProgressCard({ candidate, selectedStage, setSelectedStage, stages: propStages }: Props) {
  const stages = propStages && propStages.length > 0 ? propStages : pipelineStages;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
      <div className="w-full bg-slate-50/50 rounded-lg p-3 border border-slate-100/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900">Pipeline Progress</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${candidate.status === 'Disqualified' ? 'bg-red-500' : 'bg-indigo-500 animate-pulse'}`}></div>
            <span className="text-xs text-gray-600 font-medium">
              {candidate.status === 'Disqualified' 
                ? (candidate.disqualified?.disqualificationStage || 'Disqualified')
                : (candidate.status || 'No Status')
              }
            </span>
          </div>
        </div>
        <div className="relative px-1 mb-1">
          <div className="w-full h-6 bg-white rounded-full relative overflow-hidden shadow-inner border border-slate-200/50">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                candidate.status === 'Disqualified' 
                  ? 'bg-gradient-to-r from-red-300 to-red-400' 
                  : 'bg-gradient-to-r from-blue-400 to-indigo-400'
              }`}
              style={{ 
                width: `${(() => {
                  const currentOrDisqualStage = candidate.status === 'Disqualified' 
                    ? (candidate.disqualified?.disqualificationStage || candidate.currentStage)
                    : candidate.currentStage;
                  return ((stages.indexOf(currentOrDisqualStage) + 1) / stages.length) * 100;
                })()}%` 
              }}
            ></div>
            
            <div className="absolute inset-0 flex items-center justify-between px-1.5">
              {stages.map((stage, index) => {
                const isDisqualified = candidate.status === 'Disqualified';
                const disqualificationStage = candidate.disqualified?.disqualificationStage || candidate.currentStage;
                
                let isCompleted, isCurrent;
                if (isDisqualified) {
                  const disqualificationIndex = stages.indexOf(disqualificationStage);
                  isCompleted = disqualificationIndex >= index;
                  isCurrent = disqualificationStage === stage;
                } else {
                  const currentIndex = stages.indexOf(candidate.currentStage);
                  isCompleted = currentIndex >= index;
                  isCurrent = candidate.currentStage === stage;
                }
                
                const isSelected = selectedStage === stage;
                const isClickable = isCompleted; 
                
                return (
                  <div 
                    key={stage} 
                    className={`flex items-center ${isClickable ? 'cursor-pointer group' : 'cursor-default'}`}
                    onClick={() => isClickable ? setSelectedStage(stage) : undefined}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 shadow-sm transition-all duration-200 ${
                      isCompleted 
                        ? isDisqualified 
                          ? 'bg-white text-red-500 ring-1 ring-red-200' 
                          : 'bg-white text-blue-500 ring-1 ring-indigo-200 block'
                        : 'bg-slate-100 text-slate-300 border border-slate-200'
                    } ${isSelected ? (isDisqualified ? 'ring-2 ring-red-400 scale-110' : 'ring-2 ring-indigo-400 scale-110') : ''} `}>
                      {isCompleted && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold transition-all duration-200 ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-white/90' : 'text-slate-400 font-medium'
                    } ${isSelected ? (isDisqualified ? 'text-red-50' : 'text-indigo-50') : ''} hidden sm:inline-block`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
