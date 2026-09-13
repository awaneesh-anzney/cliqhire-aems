"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TeamMember, TeamMemberStatus } from "@/types/teamMember";
import { TeamMemberStatusBadge } from "@/components/teamMembers/team-status-badge";
import { formatPhoneNumber } from "@/lib/countryCodes";
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

interface TeamMemberCardViewProps {
  teamMembers: TeamMember[];
  highlightId?: string;
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

export const TeamMemberCardView: React.FC<TeamMemberCardViewProps> = ({
  teamMembers,
  highlightId,
  onStatusChange,
  onDelete,
}) => {
  const router = useRouter();

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
      {teamMembers.map((member) => {
        const fullName =
          `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
          "Unnamed Member";
        const memberId =
          member.teamMemberId || member._id.slice(-6).toUpperCase();
        const isHighlighted = highlightId === member._id;

        return (
          <div
            key={member._id}
            onClick={() => router.push(`/teammembers/${member._id}`)}
            className={cn(
              "group relative bg-card rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 cursor-pointer select-none",
              "hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5",
              isHighlighted
                ? "border-primary bg-primary/[0.02] shadow-md ring-2 ring-primary/20"
                : "border-border/80 shadow-xs"
            )}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border/60">
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50 uppercase">
                #{memberId}
              </span>

              {/* Action Buttons */}
              <div
                className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => router.push(`/teammembers/${member._id}`)}
                        className="w-7 h-7 rounded-lg bg-muted/70 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-colors"
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
                        className="w-7 h-7 rounded-lg bg-muted/70 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center text-muted-foreground transition-colors"
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
            </div>

            {/* Member Identity Header */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gradient-to-br shadow-sm",
                  getAvatarGradient(fullName)
                )}
              >
                {getInitials(member.firstName, member.lastName)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {fullName}
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border mt-1",
                    getRoleBadgeClasses(member.teamRole || member.role || "")
                  )}
                >
                  <Shield className="w-2.5 h-2.5" />
                  {(member.teamRole || member.role || "Not Assigned").replace(
                    /_/g,
                    " "
                  )}
                </span>
              </div>
            </div>

            {/* Status */}
            <div
              className="flex items-center gap-2 mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="scale-90 origin-left">
                <TeamMemberStatusBadge
                  id={member._id}
                  status={member.status}
                  onStatusChange={onStatusChange}
                />
              </div>
              {member.department && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/60 truncate">
                  <Building className="w-3 h-3 text-muted-foreground/70" />
                  {member.department}
                </span>
              )}
            </div>

            {/* Contact Details Card Strip */}
            <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-1.5 mb-3 text-xs">
              {member.email && (
                <div
                  onClick={(e) => handleCopy(member.email, "Email", e)}
                  className="flex items-center justify-between gap-2 text-muted-foreground hover:text-foreground group/copy"
                  title="Click to copy email"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="truncate font-medium text-[11px]">
                      {member.email}
                    </span>
                  </div>
                  <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0" />
                </div>
              )}

              {member.phone && (
                <div
                  onClick={(e) => handleCopy(member.phone, "Phone", e)}
                  className="flex items-center justify-between gap-2 text-muted-foreground hover:text-foreground group/copy"
                  title="Click to copy phone"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="truncate font-medium text-[11px]">
                      {formatPhoneNumber(member.phone, member.countryCode)}
                    </span>
                  </div>
                  <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0" />
                </div>
              )}

              {/* Location & Experience row */}
              <div className="pt-1 mt-1 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  <span className="truncate">{member.location || "Office"}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  <span className="truncate font-semibold text-foreground/80">
                    {member.experience || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-muted-foreground/70 border-t border-border/50">
              <span className="flex items-center gap-1 truncate">
                <User className="w-3 h-3" />
                {member.specialization || member.department || "Team Member"}
              </span>
              {member.createdAt && (
                <span>
                  {new Date(member.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
