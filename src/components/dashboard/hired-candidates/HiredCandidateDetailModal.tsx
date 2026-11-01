"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  Download,
  ExternalLink,
  Users,
  CheckCircle,
  AlertCircle,
  Banknote,
  Award,
} from "lucide-react";
import { HiredCandidateRecord, DynamicTeamMember } from "@/types/hiredCandidate";
import { format } from "date-fns";

interface HiredCandidateDetailModalProps {
  candidate: HiredCandidateRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HiredCandidateDetailModal: React.FC<HiredCandidateDetailModalProps> = ({
  candidate,
  open,
  onOpenChange,
}) => {
  if (!candidate) return null;

  const {
    candidate: info,
    job,
    client,
    hiredDetails,
  } = candidate;

  const teamData = candidate.jobTeamInfo || candidate.jobTeam || candidate.teamHierarchy;
  const dynamicMembers: DynamicTeamMember[] = teamData?.dynamicMembers || [];
  const displayPhone = info.fullPhone || (info.countryCode ? `${info.countryCode} ${info.phone}` : info.phone);

  const probation = hiredDetails.probation;
  const offerLetter = hiredDetails.offerLetter;

  // Format date helper safely
  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Probation Status Badge Color
  const getProbationStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
      case "expiring soon":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 animate-pulse";
      case "expired":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* ─── Modal Header Banner ─── */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-bold text-xl shrink-0 p-3">
                {info.name
                  ? info.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "HC"}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  {info.name}
                </DialogTitle>
                <p className="text-xs text-blue-200 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{hiredDetails.designation || job.title}</span>
                  <span>•</span>
                  <span>{client.name}</span>
                </p>
              </div>
            </div>

            {/* Probation Status Tag */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getProbationStatusColor(
                probation?.status || "None"
              )}`}
            >
              Probation: {probation?.status || "None"}
            </div>
          </div>

          {/* Quick Contact Chips */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            {info.email && (
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-blue-300" />
                {info.email}
              </span>
            )}
            {displayPhone && (
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                {displayPhone}
              </span>
            )}
            {info.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-300" />
                {info.location}
              </span>
            )}
            {info.nationality && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-300" />
                {info.nationality}
              </span>
            )}
            {info.experience && (
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-300" />
                {info.experience}
              </span>
            )}
          </div>
        </div>

        {/* ─── Modal Body Content ─── */}
        <div className="p-6 space-y-5 text-slate-800 dark:text-slate-100">
          {/* Row 1: Job, Client & Placement Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job & Client Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Position & Client
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Job Title:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">
                    {job.title}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Job Code:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold">
                    {job.jobId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">
                    {client.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Client Code:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px] font-bold">
                    {client.clientId}
                  </span>
                </div>
              </div>
            </div>

            {/* Placement & Compensation Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                <Banknote className="w-4 h-4 text-emerald-500" />
                Placement & Terms
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Offered Salary:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {hiredDetails.salary
                      ? `${hiredDetails.salary.toLocaleString()} ${
                          hiredDetails.salaryCurrency || ""
                        }`
                      : "Confidential"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Contract Type:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hiredDetails.contractType || "Full Time"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Offer Letter No:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {hiredDetails.offerLetterNo || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Reporting To:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hiredDetails.reportingTo || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Probation Lifecycle Tracker */}
          <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Probation Evaluation Progress
              </h4>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {probation?.periodLabel || "3 Months"} (
                {probation?.periodDays || 90} Days)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(probation?.percentComplete || 0, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">
              <span>{probation?.daysElapsed || 0} days elapsed</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {probation?.percentComplete || 0}% Complete
              </span>
              <span>{probation?.remainingDays ?? 0} days remaining</span>
            </div>

            {/* Timeline Milestones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-blue-100 dark:border-blue-900/40 text-xs">
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Hired On
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateSafe(hiredDetails.hiredAt)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Join Date
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateSafe(hiredDetails.joinDate || probation?.startDate)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Probation End
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateSafe(probation?.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Assigned Job Team (Dynamic Members with positionLabel, Name, Email) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-500" />
                Assigned Job Team
              </h4>
              {teamData?.teamName && (
                <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                  {teamData.teamName}
                </span>
              )}
            </div>

            {dynamicMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {dynamicMembers.map((member, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shadow-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-700/60 pb-1.5">
                      <span className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        {member.positionLabel || member.position}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-0.5">
                      {member.users && member.users.length > 0 ? (
                        member.users.map((u, uIdx) => (
                          <div key={uIdx} className="flex flex-col text-xs leading-tight">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {u.name || (u.firstName ? `${u.firstName} ${u.lastName || ""}` : "Team Member")}
                            </span>
                            {u.email && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{u.email}</span>
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 text-[11px]">
                          {member.userNames?.join(", ") || "No assigned users"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 text-center">
                No dynamic team members assigned.
              </div>
            )}
          </div>

          {/* Row 4: Offer Letter Document */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              Official Offer Letter Document
            </h4>
            {offerLetter?.hasOfferLetter && offerLetter?.url ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-1">
                      {offerLetter.fileName || "Offer_Letter.pdf"}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatFileSize(offerLetter.fileSize)} • Uploaded{" "}
                      {formatDateSafe(offerLetter.uploadedAt)}
                    </span>
                  </div>
                </div>

                <a
                  href={offerLetter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Document</span>
                </a>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                No offer letter PDF attached for this placement yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

