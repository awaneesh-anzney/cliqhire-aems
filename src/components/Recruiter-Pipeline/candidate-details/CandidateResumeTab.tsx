"use client";

import React from "react";
import { FileText, Download, ExternalLink, FileSearch, Quote, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";

interface CandidateResumeTabProps {
  candidate: Candidate;
}

export function CandidateResumeTab({ candidate }: CandidateResumeTabProps) {
  const hasResume = Boolean(candidate.resume);
  const hasDescription = Boolean(candidate.description);

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Resume Document Card */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-3.5 sm:p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-foreground font-bold text-xs tracking-tight uppercase">
            <FileText className="h-3.5 w-3.5 text-brand" />
            <span>Curriculum Vitae (CV) / Resume</span>
          </div>
          {hasResume ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold px-1.5 py-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified Document
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold px-1.5 py-0">
              <AlertCircle className="h-3 w-3 mr-1" />
              Missing Resume
            </Badge>
          )}
        </div>

        {hasResume ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                <FileSearch className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate">
                  {candidate.name ? `${candidate.name} - Resume.pdf` : "Candidate_Resume.pdf"}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Primary Candidate Profile Document • Cloud Stored
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(candidate.resume, "_blank")}
                className="h-7.5 px-3 rounded-lg border-border/80 font-semibold text-[11px] hover:bg-muted transition-all shadow-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1 text-muted-foreground" />
                Open
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = candidate.resume!;
                  link.target = "_blank";
                  link.download = `${candidate.name || "candidate"}-resume.pdf`;
                  link.click();
                }}
                className="h-7.5 px-3 rounded-lg bg-brand hover:bg-brand/90 font-semibold text-[11px] shadow-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-dashed border-border/70 bg-muted/20 text-center gap-2">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">No Resume Document Uploaded</p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                This candidate does not currently have a resume file attached to their profile.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Candidate Self-Introduction / Description */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-3.5 sm:p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-foreground font-bold text-xs tracking-tight uppercase border-b border-border/60 pb-2">
          <Quote className="h-3.5 w-3.5 text-brand" />
          <span>Professional Summary & Notes</span>
        </div>

        {hasDescription ? (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
            <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line font-normal">
              {candidate.description}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-border/70 bg-muted/20 text-center text-[11px] text-muted-foreground italic">
            No candidate summary or bio has been recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
