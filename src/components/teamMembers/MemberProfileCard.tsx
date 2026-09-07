"use client";

import React from "react";
import { TeamMember, TeamMemberStatus } from "@/types/teamMember";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  Copy,
  Check,
  Shield,
  User,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPhoneNumber } from "@/lib/countryCodes";
import PhoneInput from "@/components/phone/Phoneinput";
import { LocationSuggestion } from "@/components/location/LocationSuggestion";
import { TeamMemberStatusBadge } from "@/components/teamMembers/team-status-badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  location: string;
  experience: string;
}

interface MemberProfileCardProps {
  member: TeamMember;
  isEditing: boolean;
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  onStatusChange: (id: string, status: TeamMemberStatus) => void;
}

// Generate initials
function getInitials(firstName: string = "", lastName: string = "") {
  const f = firstName.trim()[0] || "";
  const l = lastName.trim()[0] || "";
  return (f + l).toUpperCase() || "?";
}

// Generate gradient
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

export const MemberProfileCard: React.FC<MemberProfileCardProps> = ({
  member,
  isEditing,
  editForm,
  setEditForm,
  onStatusChange,
}) => {
  const fullName = `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Unnamed Member";
  const memberId = member.teamMemberId || member._id.slice(-6).toUpperCase();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col select-none">
      {/* Avatar & Hero Header */}
      <div className="p-6 text-center border-b border-border/60 bg-muted/20 relative">
        <div className="relative inline-block mb-3">
          <div
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md bg-gradient-to-br ring-4 ring-background",
              getAvatarGradient(fullName)
            )}
          >
            {getInitials(
              isEditing ? editForm.firstName : member.firstName,
              isEditing ? editForm.lastName : member.lastName
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-xs">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>

        {!isEditing ? (
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight truncate">
              {fullName}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                  getRoleBadgeClasses(member.teamRole || member.role || "")
                )}
              >
                <Shield className="w-2.5 h-2.5" />
                {(member.teamRole || member.role || "Not Assigned").replace(
                  /_/g,
                  " "
                )}
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 uppercase">
                #{memberId}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-left mt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                First Name
              </label>
              <Input
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                className="h-8 text-xs rounded-xl bg-background"
                placeholder="First name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                Last Name
              </label>
              <Input
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="h-8 text-xs rounded-xl bg-background"
                placeholder="Last name"
              />
            </div>
          </div>
        )}
      </div>

      {/* Profile Details List */}
      <div className="p-4 space-y-3 text-xs flex-1">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-primary" />
            Email Address
          </label>
          {!isEditing ? (
            <div
              onClick={() => member.email && handleCopy(member.email, "Email")}
              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/30 border border-border/50 text-foreground group/copy cursor-pointer hover:bg-muted/60 transition-colors"
              title="Click to copy email"
            >
              <span className="truncate font-medium text-xs">
                {member.email || "Not Provided"}
              </span>
              <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0" />
            </div>
          ) : (
            <Input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="h-8.5 text-xs rounded-xl bg-background"
              placeholder="work.email@cliqhire.com"
            />
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-primary" />
            Phone Number
          </label>
          {!isEditing ? (
            <div
              onClick={() => member.phone && handleCopy(member.phone, "Phone")}
              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/30 border border-border/50 text-foreground group/copy cursor-pointer hover:bg-muted/60 transition-colors"
              title="Click to copy phone"
            >
              <span className="truncate font-medium text-xs">
                {formatPhoneNumber(member.phone, member.countryCode) || "Not Provided"}
              </span>
              <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity text-primary shrink-0" />
            </div>
          ) : (
            <PhoneInput
              countryCode={editForm.countryCode}
              onCountryCodeChange={(code) =>
                setEditForm((prev) => ({ ...prev, countryCode: code }))
              }
              phoneNumber={editForm.phone}
              onPhoneNumberChange={(val) =>
                setEditForm((prev) => ({ ...prev, phone: val }))
              }
            />
          )}
        </div>

        {/* Location */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-primary" />
            Work Location
          </label>
          {!isEditing ? (
            <div className="p-2 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium text-xs">
              {member.location || "Office / Remote"}
            </div>
          ) : (
            <LocationSuggestion
              value={editForm.location}
              onChange={(val) =>
                setEditForm((prev) => ({ ...prev, location: val }))
              }
              placeholder="Search city..."
            />
          )}
        </div>

        {/* Experience */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3 h-3 text-primary" />
            Experience
          </label>
          {!isEditing ? (
            <div className="p-2 rounded-xl bg-muted/30 border border-border/50 text-foreground font-semibold text-xs">
              {member.experience || "N/A"}
            </div>
          ) : (
            <Input
              value={editForm.experience}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, experience: e.target.value }))
              }
              className="h-8.5 text-xs rounded-xl bg-background"
              placeholder="e.g. 5 Years"
            />
          )}
        </div>

        {/* Department / Specialization (if available) */}
        {member.department && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3 h-3 text-primary" />
              Department
            </label>
            <div className="p-2 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium text-xs">
              {member.department}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Status & Date */}
      <div className="p-4 border-t border-border/60 bg-muted/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-muted-foreground">
            Current Status
          </span>
          <div className="scale-90 origin-right">
            <TeamMemberStatusBadge
              id={member._id}
              status={member.status}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Onboarded
          </span>
          <span className="font-semibold text-foreground">
            {member.createdAt
              ? new Date(member.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};
