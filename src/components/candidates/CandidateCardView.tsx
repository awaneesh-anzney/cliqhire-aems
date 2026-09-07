"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Candidate } from "@/services/candidateService";
import { CandidateStatusBadge } from "@/components/candidate-status-badge";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  ExternalLink,
  Copy,
  Calendar,
  Sparkles,
  User,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CandidateCardViewProps {
  candidates: Candidate[];
  selectedRows: Set<string>;
  onToggleRow: (id: string) => void;
  canModify: boolean;
  canDelete: boolean;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
}

// Generate initials for candidate avatar
function getInitials(name: string = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate gradient based on candidate name
function getAvatarGradient(name: string = "") {
  const gradients = [
    "from-pink-500 to-rose-600",
    "from-purple-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-purple-600",
    "from-fuchsia-500 to-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export const CandidateCardView: React.FC<CandidateCardViewProps> = ({
  candidates,
  selectedRows,
  onToggleRow,
  canModify,
  canDelete,
  onStatusChange,
}) => {
  const router = useRouter();

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getResumeUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  return (
    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
      {candidates.map((candidate) => {
        const id = candidate._id || "";
        const isSelected = id ? selectedRows.has(id) : false;
        const resumeUrl = getResumeUrl(candidate.resume);

        return (
          <div
            key={id || Math.random().toString()}
            onClick={() => id && router.push(`/candidates/${id}`)}
            className={cn(
              "group relative bg-card rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 cursor-pointer select-none",
              "hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5",
              isSelected
                ? "border-primary bg-primary/[0.02] shadow-md ring-2 ring-primary/20"
                : "border-border/80 shadow-xs"
            )}
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border/60">
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {canDelete && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => id && onToggleRow(id)}
                    className="rounded-md border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                )}
                {candidate.profileId && (
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50 uppercase">
                    {candidate.profileId}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                {candidate.resume && (
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-muted/70 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        View Resume
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => id && router.push(`/candidates/${id}`)}
                        className="w-7 h-7 rounded-lg bg-muted/70 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      View Profile Details
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Candidate Identity Header */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gradient-to-br shadow-sm",
                  getAvatarGradient(candidate.name)
                )}
              >
                {getInitials(candidate.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {candidate.name || "Unnamed Candidate"}
                </h3>
                {candidate.currentJobTitle ? (
                  <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">
                    {candidate.currentJobTitle}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                    {candidate.experience ? `${candidate.experience} experience` : "Talent Profile"}
                  </p>
                )}
              </div>
            </div>

            {/* Status & Notice Period */}
            <div
              className="flex flex-wrap items-center gap-2 mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="scale-90 origin-left">
                <CandidateStatusBadge
                  id={id}
                  status={(candidate.status as any) || "Active"}
                  onStatusChange={onStatusChange}
                  disabled={!canModify}
                />
              </div>

              {candidate.noticePeriod && candidate.noticePeriod !== "All" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/60">
                  <Calendar className="w-3 h-3 text-muted-foreground/70" />
                  NP: {candidate.noticePeriod}
                </span>
              )}
            </div>

            {/* Contact Details Card Strip */}
            <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-1.5 mb-3 text-xs">
              {candidate.email && (
                <div
                  onClick={(e) => handleCopy(candidate.email!, "Email", e)}
                  className="flex items-center justify-between gap-2 text-muted-foreground hover:text-foreground group/copy"
                  title="Click to copy email"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="truncate font-medium text-[11px]">
                      {candidate.email}
                    </span>
                  </div>
                  <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0" />
                </div>
              )}

              {candidate.phone && (
                <div
                  onClick={(e) => handleCopy(candidate.phone!, "Phone", e)}
                  className="flex items-center justify-between gap-2 text-muted-foreground hover:text-foreground group/copy"
                  title="Click to copy phone number"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="truncate font-medium text-[11px]">
                      {formatPhoneNumber(
                        candidate.phone,
                        (candidate as any).countryCode
                      )}
                    </span>
                  </div>
                  <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0" />
                </div>
              )}

              {/* Location & Experience row */}
              <div className="pt-1 mt-1 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  <span className="truncate">{candidate.location || "Global"}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  <span className="truncate font-semibold text-foreground/80">
                    {candidate.experience || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills & Footer */}
            <div className="mt-auto pt-2 flex flex-col gap-2">
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10 truncate max-w-[90px]"
                      title={skill}
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                      +{candidate.skills.length - 3}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground/50 italic">
                  No skills listed
                </span>
              )}

              {/* Creator & Timestamp */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 pt-2 border-t border-border/50">
                <span className="flex items-center gap-1 truncate">
                  <User className="w-3 h-3" />
                  {candidate.createdBy?.name ||
                    (typeof candidate.createdBy === "string"
                      ? candidate.createdBy
                      : "System")}
                </span>
                {candidate.createdAt && (
                  <span>
                    {new Date(candidate.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
