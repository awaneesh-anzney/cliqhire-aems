"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TeamMember, TeamMemberStatus } from "@/types/teamMember";
import { TeamMemberStatusBadge } from "@/components/teamMembers/team-status-badge";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ExternalLink,
  Copy,
  Trash2,
  Shield,
  Building,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TeamMemberTableRowProps {
  member: TeamMember;
  isHighlighted?: boolean;
  onStatusChange: (id: string, newStatus: TeamMemberStatus) => void;
  onDelete: (member: TeamMember) => void;
}

// Generate initials for avatar
function getInitials(firstName: string = "", lastName: string = "") {
  const f = firstName.trim()[0] || "";
  const l = lastName.trim()[0] || "";
  return (f + l).toUpperCase() || "?";
}

// Generate avatar gradient
function getAvatarGradient(name: string = "") {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-teal-500 to-emerald-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-red-600",
    "from-cyan-500 to-blue-600",
    "from-violet-500 to-purple-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

const getRoleBadgeClasses = (role: string = "") => {
  const r = role.toLowerCase();
  if (r.includes("admin")) {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
  }
  if (r.includes("manager")) {
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
  }
  if (r.includes("lead")) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
  }
  if (r.includes("recruiter")) {
    return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20";
  }
  if (r.includes("head") || r.includes("hunter")) {
    return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20";
  }
  if (r.includes("sales")) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
  }
  return "bg-muted/70 text-foreground border-border";
};

export const TeamMemberTableRow: React.FC<TeamMemberTableRowProps> = ({
  member,
  isHighlighted = false,
  onStatusChange,
  onDelete,
}) => {
  const router = useRouter();
  const fullName = `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Unnamed Member";
  const memberId = member.teamMemberId || member._id.slice(-6).toUpperCase();

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <TableRow
      onClick={() => router.push(`/teammembers/${member._id}`)}
      className={cn(
        "group border-b border-border/70 hover:bg-muted/40 cursor-pointer transition-colors select-none text-xs",
        isHighlighted && "bg-primary/[0.04] border-primary/40"
      )}
    >
      {/* Member ID */}
      <TableCell className="px-3.5 py-2.5 w-[100px]">
        <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50 uppercase">
          #{memberId}
        </span>
      </TableCell>

      {/* Member Info */}
      <TableCell className="px-3.5 py-2.5 min-w-[200px]">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shrink-0 bg-gradient-to-br shadow-xs",
              getAvatarGradient(fullName)
            )}
          >
            {getInitials(member.firstName, member.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
              {fullName}
            </span>
            {member.department ? (
              <span className="text-[11px] text-muted-foreground block truncate flex items-center gap-1">
                <Building className="w-2.5 h-2.5" />
                {member.department}
              </span>
            ) : member.specialization ? (
              <span className="text-[11px] text-muted-foreground/80 block truncate">
                {member.specialization}
              </span>
            ) : null}
          </div>
        </div>
      </TableCell>

      {/* Contact */}
      <TableCell
        className="px-3.5 py-2.5 min-w-[220px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          {member.email && (
            <div
              onClick={(e) => handleCopy(member.email, "Email", e)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground group/copy cursor-pointer max-w-[210px]"
              title="Click to copy email"
            >
              <Mail className="w-3 h-3 text-primary/70 shrink-0" />
              <span className="truncate text-[11px] font-medium">
                {member.email}
              </span>
              <Copy className="w-2.5 h-2.5 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0 ml-auto" />
            </div>
          )}

          {member.phone && (
            <div
              onClick={(e) => handleCopy(member.phone, "Phone", e)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground group/copy cursor-pointer max-w-[210px]"
              title="Click to copy phone"
            >
              <Phone className="w-3 h-3 text-primary/70 shrink-0" />
              <span className="truncate text-[11px] font-medium">
                {formatPhoneNumber(member.phone, member.countryCode)}
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
            {member.location || "Office"}
          </span>
        </div>
      </TableCell>

      {/* Experience */}
      <TableCell className="px-3 py-2.5 min-w-[110px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Briefcase className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          <span className="truncate text-[11px] font-semibold text-foreground/80">
            {member.experience || "N/A"}
          </span>
        </div>
      </TableCell>

      {/* Role */}
      <TableCell className="px-3 py-2.5 min-w-[130px]">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-2xs",
            getRoleBadgeClasses(member.teamRole || member.role || "")
          )}
        >
          <Shield className="w-2.5 h-2.5" />
          {(member.teamRole || member.role || "Not Assigned").replace(/_/g, " ")}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell
        className="px-3 py-2.5 w-[140px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scale-90 origin-left">
          <TeamMemberStatusBadge
            id={member._id}
            status={member.status}
            onStatusChange={onStatusChange}
          />
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell
        className="px-3 py-2.5 text-right w-[80px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => router.push(`/teammembers/${member._id}`)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                View Profile
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onDelete(member)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Delete Member
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};
