"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  UserCheck,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  HiredCandidateRecord,
  HiredCandidatesPaginationMeta,
  DynamicTeamMember,
} from "@/types/hiredCandidate";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface HiredCandidatesTableProps {
  data: HiredCandidateRecord[];
  pagination?: HiredCandidatesPaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetails: (candidate: HiredCandidateRecord) => void;
}

export const HiredCandidatesTable: React.FC<HiredCandidatesTableProps> = ({
  data,
  pagination,
  isLoading,
  onPageChange,
  onLimitChange,
  onViewDetails,
}) => {
  // Format date helper
  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  // Probation Status Badge Renderer
  const renderProbationBadge = (probation?: HiredCandidateRecord["hiredDetails"]["probation"]) => {
    const status = probation?.status || "None";
    const percent = probation?.percentComplete ?? 0;
    const remaining = probation?.remainingDays;

    switch (status.toLowerCase()) {
      case "active":
        return (
          <div className="flex flex-col gap-1 min-w-[130px]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Active ({remaining !== undefined ? `${remaining}d left` : "In Progress"})
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Completed
          </span>
        );
      case "expiring soon":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse w-fit">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Expiring Soon ({remaining ?? 0}d)
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 w-fit">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 w-fit">
            No Probation
          </span>
        );
    }
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="w-full flex-1 min-h-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
          >
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-40" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-24 hidden md:block" />
            <Skeleton className="h-3.5 w-20 hidden lg:block" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex-1 min-h-0 p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
          <UserCheck className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No hired candidates found
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
          No placement records matched your selected timeframe, search queries, or probation filters.
        </p>
      </div>
    );
  }

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRecords = pagination?.total || data.length;
  const currentLimit = pagination?.limit || 20;

  const startRecord = (currentPage - 1) * currentLimit + 1;
  const endRecord = Math.min(currentPage * currentLimit, totalRecords);

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col gap-1.5 sm:gap-2 overflow-hidden">
      {/* ─── Scrollable Table Container (Only rows scroll) ─── */}
      <div className="w-full flex-1 min-h-0 overflow-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-slate-200 dark:border-slate-800">
            <tr className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10.5px]">
              <th className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800">Candidate</th>
              <th className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800">Job & Client</th>
              <th className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800">Compensation</th>
              <th className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800">Probation</th>
              <th className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800">Job Team</th>
              <th className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800 text-center">Offer Letter</th>
              <th className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {data.map((item, index) => {
              const {
                candidate: c,
                job,
                client,
                hiredDetails,
              } = item;

              const teamData = item.jobTeamInfo || item.jobTeam || item.teamHierarchy;
              const dynamicMembers: DynamicTeamMember[] = teamData?.dynamicMembers || [];
              const displayPhone = c.fullPhone || (c.countryCode ? `${c.countryCode} ${c.phone}` : c.phone);

              return (
                <tr
                  key={c.id || index}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Candidate Info */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10.5px] border border-blue-200 dark:border-blue-800">
                        {c.name
                          ? c.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "HC"}
                      </div>
                      <div className="min-w-0">
                        <span
                          className="font-semibold text-slate-900 dark:text-white block truncate text-xs hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => onViewDetails(item)}
                          title={c.name}
                        >
                          {c.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate" title={c.email}>
                          {c.email}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                          {displayPhone && <span>{displayPhone}</span>}
                          {c.experience && (
                            <>
                              <span>•</span>
                              <span>{c.experience}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Job & Client */}
                  <td className="py-2 px-3">
                    <div className="min-w-0">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[190px]" title={job.title}>
                        {job.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9.5px] font-mono font-medium">
                          {job.jobId}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[10.5px] text-slate-600 dark:text-slate-400 truncate max-w-[130px]" title={client.name}>
                          {client.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Compensation & Designation */}
                  <td className="py-2 px-3">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {hiredDetails.salary
                          ? `${hiredDetails.salary.toLocaleString()} ${
                              hiredDetails.salaryCurrency || ""
                            }`
                          : "—"}
                      </span>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {hiredDetails.designation || hiredDetails.contractType || "Full Time"}
                      </span>
                    </div>
                  </td>

                  {/* Probation Status */}
                  <td className="py-2 px-3">
                    {renderProbationBadge(hiredDetails.probation)}
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">
                      Joined: {formatDateSafe(hiredDetails.joinDate || hiredDetails.hiredAt)}
                    </span>
                  </td>

                  {/* Job Team (Dynamic Members with positionLabel, User Name, and Email) */}
                  <td className="py-2 px-3">
                    {dynamicMembers.length > 0 ? (
                      <div className="flex flex-col gap-1 min-w-0 max-w-[220px]">
                        {dynamicMembers.slice(0, 2).map((dm, idx) => {
                          const u = dm.users?.[0];
                          const memberName = u?.name || dm.userNames?.[0] || "—";
                          const memberEmail = u?.email;
                          return (
                            <div key={idx} className="flex flex-col leading-tight">
                              <div className="flex items-center gap-1 truncate">
                                <span className="font-bold text-blue-600 dark:text-blue-400 text-[10px]">
                                  {dm.positionLabel || dm.position}:
                                </span>
                                <span
                                  className="font-medium text-slate-800 dark:text-slate-200 text-[11px] truncate"
                                  title={memberName}
                                >
                                  {memberName}
                                </span>
                              </div>
                              {memberEmail && (
                                <span
                                  className="text-[10px] text-slate-400 dark:text-slate-500 truncate"
                                  title={memberEmail}
                                >
                                  {memberEmail}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {dynamicMembers.length > 2 && (
                          <span className="text-[9.5px] font-semibold text-slate-400">
                            +{dynamicMembers.length - 2} more team members
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        {teamData?.teamName || "—"}
                      </span>
                    )}
                  </td>

                  {/* Offer Letter */}
                  <td className="py-2 px-3 text-center">
                    {hiredDetails.offerLetter?.hasOfferLetter && hiredDetails.offerLetter?.url ? (
                      <a
                        href={hiredDetails.offerLetter.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors text-[10.5px] font-semibold"
                        title={hiredDetails.offerLetter.fileName || "View Offer Letter"}
                      >
                        <FileText className="w-3 h-3" />
                        <span>PDF</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-[10.5px] text-slate-400 italic">
                        None
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-[11px] transition-colors shadow-xs"
                    >
                      <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination Footer ─── */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-1.5 p-1.5 sm:p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
        {/* Record count info */}
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="font-semibold text-slate-900 dark:text-white">{startRecord}</strong> to{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">{endRecord}</strong> of{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">{totalRecords}</strong> candidates
          </span>

          {/* Page limit selector */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
            <span className="text-[11px] text-slate-400">Rows:</span>
            <select
              value={currentLimit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 py-0.5 text-xs font-semibold">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

