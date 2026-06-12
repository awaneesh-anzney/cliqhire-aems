'use client';

import React from 'react';
import { useTemporaryCandidates } from '@/hooks/useTem-candidate';
import { CandidateList } from '@/components/tem-candidates';
import { TooltipProvider } from '@/components/ui/tooltip';

const TemporaryCandidatesPage = () => {
  const {
    candidates,
    results,
    isLoading,
    error,
    refetch,
  } = useTemporaryCandidates();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-muted/50 p-3 gap-3 animate-in fade-in duration-700">
        <div className="flex-1 min-h-0 bg-card rounded-[1.2rem] border border-border shadow-sm overflow-hidden flex flex-col p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-700 delay-150">
          <CandidateList
            candidates={candidates}
            isLoading={isLoading}
            error={error}
            results={results}
            onRefresh={refetch}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TemporaryCandidatesPage;