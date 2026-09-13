"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Candidate } from "@/services/candidateService";
import { CandidateStatusBadge } from "@/components/candidate-status-badge";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  ExternalLink,
  Copy,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CandidateTableRowProps {
  candidate: Candidate;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  canModify: boolean;
  canDelete: boolean;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
  onDeleteSingle?: (id: string) => void;
}

// Generate initials for avatar
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

export const CandidateTableRow: React.FC<CandidateTableRowProps> = ({
  candidate,
  isSelected,
  onToggleSelect,
  canModify,
  canDelete,
  onStatusChange,
  onDeleteSingle,
}) => {
  const router = useRouter();
  const id = candidate._id || "";

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

  const resumeUrl = getResumeUrl(candidate.resume);

  return (
    <TableRow
      onClick={() => id && router.push(`/candidates/${id}`)}
      className={cn(
        "group border-b border-border/70 hover:bg-muted/40 cursor-pointer transition-colors select-none text-xs",
        isSelected && "bg-primary/[0.03] border-primary/30"
      )}
    >
      {/* Selection Checkbox */}
      <TableCell
        className="w-10 px-3 py-2.5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {canDelete && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => id && onToggleSelect(id)}
            className="rounded-md border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        )}
      </TableCell>

      {/* Candidate Name & Title */}
      <TableCell className="px-3.5 py-2.5 min-w-[200px]">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-gradient-to-br shadow-xs",
              getAvatarGradient(candidate.name)
            )}
          >
            {getInitials(candidate.name)}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
              {candidate.name || "Unnamed Candidate"}
            </span>
            {candidate.currentJobTitle ? (
              <span className="text-[11px] text-muted-foreground block truncate">
                {candidate.currentJobTitle}
              </span>
            ) : candidate.profileId ? (
              <span className="text-[10px] font-mono text-muted-foreground/80 block uppercase">
                {candidate.profileId}
              </span>
            ) : null}
          </div>
        </div>
      </TableCell>

      {/* Profile ID */}
      <TableCell className="px-3 py-2.5 w-[110px]">
        {candidate.profileId ? (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50 uppercase">
            {candidate.profileId}
          </span>
        ) : (
          <span className="text-muted-foreground/50 text-[11px]">—</span>
        )}
      </TableCell>

      {/* Contact Info */}
      <TableCell
        className="px-3.5 py-2.5 min-w-[220px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          {candidate.email && (
            <div
              onClick={(e) => handleCopy(candidate.email!, "Email", e)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground group/copy cursor-pointer max-w-[200px]"
              title="Click to copy email"
            >
              <Mail className="w-3 h-3 text-primary/70 shrink-0" />
              <span className="truncate text-[11px] font-medium">
                {candidate.email}
              </span>
              <Copy className="w-2.5 h-2.5 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0 ml-auto" />
            </div>
          )}

          {candidate.phone && (
            <div
              onClick={(e) => handleCopy(candidate.phone!, "Phone", e)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground group/copy cursor-pointer max-w-[200px]"
              title="Click to copy phone"
            >
              <Phone className="w-3 h-3 text-primary/70 shrink-0" />
              <span className="truncate text-[11px] font-medium">
                {formatPhoneNumber(
                  candidate.phone,
                  (candidate as any).countryCode
                )}
              </span>
              <Copy className="w-2.5 h-2.5 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0 ml-auto" />
            </div>
          )}
        </div>
      </TableCell>

      {/* Location */}
      <TableCell className="px-3 py-2.5 min-w-[120px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          <span className="truncate text-[11px] font-medium text-foreground/80">
            {candidate.location || "Global"}
          </span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell
        className="px-3 py-2.5 w-[140px]"
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
      </TableCell>

      {/* Experience */}
      <TableCell className="px-3 py-2.5 min-w-[110px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Briefcase className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          <span className="truncate text-[11px] font-semibold text-foreground/80">
            {candidate.experience || "N/A"}
          </span>
        </div>
      </TableCell>

      {/* Notice Period */}
      <TableCell className="px-3 py-2.5 w-[110px]">
        {candidate.noticePeriod && candidate.noticePeriod !== "All" ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/60 truncate">
            <Calendar className="w-2.5 h-2.5" />
            {candidate.noticePeriod}
          </span>
        ) : (
          <span className="text-muted-foreground/50 text-[11px]">—</span>
        )}
      </TableCell>

      {/* Skills */}
      <TableCell className="px-3 py-2.5 min-w-[150px]">
        {candidate.skills && candidate.skills.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
            {candidate.skills.slice(0, 2).map((skill, idx) => (
              <span
                key={idx}
                className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10 truncate max-w-[80px]"
                title={skill}
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 2 && (
              <span className="text-[9px] font-semibold px-1 rounded-md bg-muted text-muted-foreground border border-border/60">
                +{candidate.skills.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground/50 text-[11px]">—</span>
        )}
      </TableCell>

      {/* Resume */}
      <TableCell
        className="px-3 py-2.5 text-center w-[80px]"
        onClick={(e) => e.stopPropagation()}
      >
        {candidate.resume ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                View Resume
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground/40 text-[11px] italic">None</span>
        )}
      </TableCell>

      {/* Created By */}
      <TableCell className="px-3 py-2.5 text-right w-[110px]">
        <span className="text-[11px] text-muted-foreground font-medium block truncate max-w-[100px] ml-auto">
          {candidate.createdBy?.name ||
            (typeof candidate.createdBy === "string"
              ? candidate.createdBy
              : "System")}
        </span>
      </TableCell>

      {/* Row Actions */}
      <TableCell
        className="px-3 py-2.5 text-right w-[70px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => id && router.push(`/candidates/${id}`)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                View Details
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canDelete && onDeleteSingle && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => id && onDeleteSingle(id)}
                    className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Delete
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
