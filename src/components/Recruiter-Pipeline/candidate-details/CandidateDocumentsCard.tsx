import React from "react";
import { FileText } from "lucide-react";
import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";

export function CandidateDocumentsCard({ candidate }: { candidate: Candidate }) {
  if (!candidate.description && !candidate.resume) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {candidate.description && (
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/60 h-full">
          <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center">
            <FileText className="h-4 w-4 text-muted-foreground mr-2" />
            Description
          </h4>
          <div className="bg-muted p-3 rounded-lg border border-border/60 max-h-40 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-foreground leading-relaxed">{candidate.description}</p>
          </div>
        </div>
      )}

      {candidate.resume && (
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/60 h-full">
          <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center">
            <FileText className="h-4 w-4 text-blue-500 mr-2" />
            Documents
          </h4>
          <div className="flex items-center space-x-3 bg-blue-50/30 p-3 rounded-lg border border-blue-100/50">
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground mb-0.5">Resume / CV</span>
              <a 
                href={candidate.resume} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-xs font-semibold underline hover:no-underline transition-all"
              >
                View Document
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
