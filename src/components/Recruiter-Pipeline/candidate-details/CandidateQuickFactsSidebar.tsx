"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Award, 
  Mail, 
  Phone, 
  MapPin, 
  User2, 
  GraduationCap, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CandidateQuickFactsSidebarProps {
  candidate: Candidate;
  pipelineId: string;
}

export function CandidateQuickFactsSidebar({
  candidate,
  pipelineId,
}: CandidateQuickFactsSidebarProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDemographics, setShowDemographics] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Process technical skills
  const technicalSkills: string[] = [];
  if (candidate.technicalSkill && candidate.technicalSkill.length > 0) {
    candidate.technicalSkill.forEach((skill) => {
      skill.split("\n").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) technicalSkills.push(trimmed);
      });
    });
  } else if (candidate.skills && candidate.skills.length > 0) {
    candidate.skills.forEach((s) => {
      const trimmed = s.trim();
      if (trimmed) technicalSkills.push(trimmed);
    });
  }

  // Notice period badge styling
  const getNoticePeriodBadgeColor = (notice?: string) => {
    if (!notice) return "bg-muted text-muted-foreground";
    const lower = notice.toLowerCase();
    if (lower.includes("immediate") || lower.includes("0") || lower.includes("15")) {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    }
    if (lower.includes("30") || lower.includes("1 month")) {
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    }
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  };

  return (
    <aside className="flex flex-col gap-3 sticky top-3">
      {/* Primary Dossier Card */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-3 sm:p-3.5 flex flex-col gap-3.5">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-foreground font-bold text-xs tracking-tight uppercase">
            <User2 className="h-3.5 w-3.5 text-brand" />
            <span>Candidate Dossier</span>
          </div>
          {!candidate.isTempCandidate && candidate.id && (
            <Link
              href={`/candidates/${candidate.id}`}
              className="text-[10px] font-semibold text-brand hover:underline flex items-center gap-1 group"
            >
              Master Profile
              <ExternalLink className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* 1. Career & Experience Section */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Briefcase className="h-2.5 w-2.5 text-brand" />
            Professional Experience
          </span>

          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Total Exp.</span>
              <span className="font-semibold text-foreground mt-0.5 text-[11px]">
                {candidate.experience
                  ? candidate.experience.toLowerCase().includes("year")
                    ? candidate.experience
                    : `${candidate.experience} Year(s)`
                  : "Not specified"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Relevant Exp.</span>
              <span className="font-semibold text-foreground mt-0.5 text-[11px]">
                {candidate.totalRelevantExperience
                  ? candidate.totalRelevantExperience.toLowerCase().includes("year")
                    ? candidate.totalRelevantExperience
                    : `${candidate.totalRelevantExperience} Year(s)`
                  : "Not specified"}
              </span>
            </div>

            <div className="flex flex-col col-span-2 pt-1 border-t border-border/40">
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Notice Period</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className={cn("text-[9px] font-semibold px-1.5 py-0", getNoticePeriodBadgeColor(candidate.noticePeriod))}
                >
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  {candidate.noticePeriod || "Not specified"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col col-span-2 pt-1 border-t border-border/40">
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Current Role</span>
              <span className="font-semibold text-foreground mt-0.5 truncate text-[11px]">
                {candidate.currentJobTitle || "Not specified"}
              </span>
            </div>

            <div className="flex flex-col col-span-2">
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Current Company</span>
              <span className="font-semibold text-foreground mt-0.5 truncate text-[11px]">
                {candidate.previousCompanyName || candidate.currentCompanyName || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Compensation Section */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="h-2.5 w-2.5 text-emerald-600" />
            Compensation Structure
          </span>

          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Current CTC</span>
              <span className="font-semibold text-foreground mt-0.5 font-mono text-xs">
                {candidate.currentSalary
                  ? `${candidate.currentSalaryCurrency || ""} ${candidate.currentSalary}`
                  : "Not specified"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Expected CTC</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono text-xs">
                {candidate.expectedSalary
                  ? `${candidate.expectedSalaryCurrency || ""} ${candidate.expectedSalary}`
                  : "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Skills Matrix */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Award className="h-2.5 w-2.5 text-amber-500" />
            Key Competencies & Skills
          </span>

          <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60">
            {/* Technical Skills */}
            <div>
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                Technical Stack
              </span>
              {technicalSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {technicalSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-[10px] font-medium bg-background border border-border/70 text-foreground px-1.5 py-0"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic">No technical skills listed</p>
              )}
            </div>

            {/* Soft Skills */}
            {candidate.softSkill && candidate.softSkill.length > 0 && (
              <div className="pt-1.5 border-t border-border/40">
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                  Soft Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {candidate.softSkill.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-[9px] font-medium bg-muted/50 text-muted-foreground border-border/70 px-1.5 py-0"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Contact & Availability */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Mail className="h-2.5 w-2.5 text-blue-500" />
            Contact & Availability
          </span>

          <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
            {/* Email */}
            <div className="flex items-center justify-between gap-1.5 group/item">
              <div className="flex items-center gap-1.5 min-w-0">
                <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="font-medium text-foreground hover:text-brand truncate max-w-[170px] hover:underline text-[11px]"
                >
                  {candidate.email || "Not provided"}
                </a>
              </div>
              {candidate.email && (
                <button
                  onClick={() => copyToClipboard(candidate.email!, "Email")}
                  className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded hover:bg-muted transition-colors"
                  title="Copy email"
                >
                  {copiedField === "Email" ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between gap-1.5 group/item">
              <div className="flex items-center gap-1.5 min-w-0">
                <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="font-medium text-foreground font-mono text-[11px]">
                  {candidate.phone
                    ? formatPhoneNumber(candidate.phone, candidate.countryCode)
                    : "Not provided"}
                </span>
              </div>
              {candidate.phone && (
                <button
                  onClick={() => copyToClipboard(candidate.phone!, "Phone")}
                  className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded hover:bg-muted transition-colors"
                  title="Copy phone"
                >
                  {copiedField === "Phone" ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
              <span className="text-foreground font-medium truncate">
                {candidate.location || "Not specified"}
              </span>
            </div>

            {/* Relocation */}
            {candidate.willingToRelocate && (
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                <span className="text-muted-foreground font-medium">Relocation:</span>
                <Badge variant="outline" className="text-[9px] font-semibold px-1 py-0">
                  {candidate.willingToRelocate}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* 5. Collapsible Personal & Demographics */}
        <div className="border-t border-border/60 pt-2">
          <button
            type="button"
            onClick={() => setShowDemographics(!showDemographics)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-0.5"
          >
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-brand" />
              Education & Demographics
            </span>
            {showDemographics ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {showDemographics && (
            <div className="mt-1.5 p-2 rounded-lg bg-muted/40 border border-border/60 grid grid-cols-2 gap-1.5 text-[11px] animate-in fade-in slide-in-from-top-1">
              <div>
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Degree</span>
                <p className="font-semibold text-foreground mt-0.5 truncate text-[10px]">
                  {candidate.educationDegree || "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Language</span>
                <p className="font-semibold text-foreground mt-0.5 truncate text-[10px]">
                  {candidate.primaryLanguage || "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Gender</span>
                <p className="font-semibold text-foreground mt-0.5 text-[10px]">
                  {candidate.gender || "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Nationality</span>
                <p className="font-semibold text-foreground mt-0.5 truncate text-[10px]">
                  {candidate.nationality || "Not specified"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
