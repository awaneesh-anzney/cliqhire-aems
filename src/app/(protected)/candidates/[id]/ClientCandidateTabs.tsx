"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RefreshCcw,
  FileText,
  Briefcase,
  StickyNote,
  Paperclip,
  MapPin,
  Clock,
  Mail,
  Phone,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

import CandidateSummary from "@/components/candidates/summary/candidate-summary";
import { CandidateNotesContent } from "@/components/candidates/notes/notes-content";
import { AttachmentsContent } from "@/components/candidates/attachments/attachments-content";
import { JobsContent, JobsContentRef } from "@/components/candidates/jobs/jobs-content";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateStatusBadge } from "@/components/candidate-status-badge";
import { candidateService, type Candidate } from "@/services/candidateService";
import { initializeAuth } from "@/lib/axios-config";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";

function getInitials(name: string = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarGradient(name: string = "") {
  const colors = [
    "from-blue-600 to-indigo-600",
    "from-indigo-600 to-purple-600",
    "from-teal-600 to-emerald-600",
    "from-cyan-600 to-blue-600",
    "from-rose-600 to-pink-600",
    "from-amber-600 to-orange-600",
    "from-purple-600 to-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

interface Tab {
  label: string;
  icon: React.ReactNode;
}

export default function ClientCandidateTabs({
  candidateId,
  tabs,
}: {
  candidateId: string;
  tabs: Tab[];
}) {
  const [activeTab, setActiveTab] = useState("Summary");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const jobsContentRef = useRef<JobsContentRef>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: candidate,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Candidate | null, any>({
    queryKey: ["candidate", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      await initializeAuth();
      return candidateService.getCandidateById(candidateId);
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, updatedCandidate }: { id: string; updatedCandidate: any }) => {
      await initializeAuth();
      const apiPayload = { ...updatedCandidate };
      if (apiPayload.domains) {
        apiPayload.domains = apiPayload.domains.map((d: any) =>
          typeof d === "string" ? d : d._id
        );
      }
      return candidateService.updateCandidate(id, apiPayload);
    },
    onMutate: async ({ updatedCandidate }) => {
      await queryClient.cancelQueries({ queryKey: ["candidate", candidateId] });
      const previous = queryClient.getQueryData(["candidate", candidateId]);
      queryClient.setQueryData(["candidate", candidateId], (old: any) => ({
        ...(old || {}),
        ...(updatedCandidate || {}),
      }));
      return { previous } as { previous: any };
    },
    onError: (err: any, _vars, context) => {
      if ((context as any)?.previous) {
        queryClient.setQueryData(["candidate", candidateId], (context as any).previous);
      }
      if (err?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to update candidate");
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
    },
  });

  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === "ADMIN";

  const canViewCandidates = isAdmin || hasPermission("candidates", "view");
  const canModifyCandidates =
    isAdmin || hasPermission("candidates", "create") || hasPermission("candidates", "edit");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading candidate profile...</p>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <p className="text-sm font-semibold text-destructive">
          {(error as any)?.message || "Candidate not found."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!canViewCandidates) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-sm text-muted-foreground">
          You do not have permission to view this candidate.
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    try {
      await initializeAuth();
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
      toast.success("Candidate data refreshed");
    } catch {
      toast.error("Failed to refresh data");
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCandidateUpdate = async (updatedCandidate: any, fieldKey?: string) => {
    if (!canModifyCandidates) {
      toast.error("You do not have permission to modify candidate details.");
      return;
    }
    try {
      const id = candidate?._id;
      if (!id) throw new Error("Missing candidate id");

      let payload: any = {};
      if (fieldKey) {
        if (fieldKey === "phone") {
          payload.phone = updatedCandidate.phone;
          payload.countryCode = updatedCandidate.countryCode;
        } else if (fieldKey === "otherPhone") {
          payload.otherPhone = updatedCandidate.otherPhone;
          payload.otherCountryCode = updatedCandidate.otherCountryCode;
        } else if (fieldKey.startsWith("education.")) {
          payload.education = updatedCandidate.education;
        } else {
          payload[fieldKey] = updatedCandidate[fieldKey];
        }
      } else {
        payload = updatedCandidate;
      }

      await updateCandidateMutation.mutateAsync({ id, updatedCandidate: payload });
      if (fieldKey) {
        toast.success("Candidate updated successfully");
      }
    } catch (err) {
      console.error("Error updating candidate:", err);
    }
  };

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Top Breadcrumb & Candidate Header Bar */}
      <header className="border-b border-border/70 bg-card/75 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 shrink-0 transition-colors">
        {/* Navigation Breadcrumb Row */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 overflow-hidden">
          <Link
            href="/candidates"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium text-[11px]"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Candidates</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          {candidate.profileId && (
            <>
              <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                #{candidate.profileId}
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            </>
          )}
          <span className="truncate text-foreground font-semibold text-[11px] max-w-[200px] sm:max-w-md">
            {candidate.name || "Untitled Candidate"}
          </span>
        </div>

        {/* Main Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Avatar + Title + Chips */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold text-white shrink-0 bg-gradient-to-tr shadow-xs select-none",
                getAvatarGradient(candidate.name)
              )}
            >
              {getInitials(candidate.name)}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate max-w-[280px] sm:max-w-md">
                  {candidate.name || "Untitled Candidate"}
                </h1>

                {candidate.profileId && (
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono font-semibold text-muted-foreground border border-border/60">
                    #{candidate.profileId}
                  </span>
                )}

                <CandidateStatusBadge
                  id={candidate._id}
                  status={(candidate.status as any) || "Active"}
                  onStatusChange={async (id, newStatus) => {
                    await handleCandidateUpdate({ status: newStatus }, "status");
                  }}
                  disabled={!canModifyCandidates}
                />
              </div>

              {/* Meta row: Location, Experience, Contacts */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-1 text-[11px]">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="truncate max-w-[140px]">{candidate.location || "Global"}</span>
                </div>

                <span className="text-border">•</span>

                <div className="inline-flex items-center gap-1 text-[11px]">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                  <span>{candidate.experience || "No experience specified"}</span>
                </div>

                {candidate.email && (
                  <>
                    <span className="text-border hidden md:inline">•</span>
                    <div className="hidden md:inline-flex items-center gap-1 text-[11px]">
                      <a
                        href={`mailto:${candidate.email}`}
                        className="hover:text-foreground transition-colors truncate max-w-[160px]"
                      >
                        {candidate.email}
                      </a>
                      <button
                        onClick={() => candidate.email && handleCopy(candidate.email, "Email")}
                        className="text-muted-foreground/60 hover:text-foreground p-0.5"
                        title="Copy email"
                      >
                        {copiedField === "Email" ? (
                          <Check className="h-2.5 w-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-2.5 w-2.5" />
                        )}
                      </button>
                    </div>
                  </>
                )}

                {candidate.phone && (
                  <>
                    <span className="text-border hidden lg:inline">•</span>
                    <div className="hidden lg:inline-flex items-center gap-1 text-[11px]">
                      <a
                        href={`tel:${candidate.phone}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {(candidate as any).countryCode
                          ? `${(candidate as any).countryCode} `
                          : ""}
                        {candidate.phone}
                      </a>
                      <button
                        onClick={() =>
                          handleCopy(
                            `${(candidate as any).countryCode || ""}${candidate.phone}`,
                            "Phone"
                          )
                        }
                        className="text-muted-foreground/60 hover:text-foreground p-0.5"
                        title="Copy phone"
                      >
                        {copiedField === "Phone" ? (
                          <Check className="h-2.5 w-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-2.5 w-2.5" />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title="Refresh candidate data"
            >
              <RefreshCcw
                className={cn("h-3 w-3 mr-1", isFetching && "animate-spin text-primary")}
              />
              Sync
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation & Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex-1 max-w-full min-w-0 flex flex-col overflow-hidden"
      >
        {/* Sleek Tab Bar */}
        <div className="w-full border-b border-border/70 bg-muted/25 px-2 sm:px-4 py-1 shrink-0 overflow-hidden">
          <TabsList className="flex h-auto w-full justify-start items-center gap-1 p-0.5 bg-transparent overflow-x-auto scrollbar-none max-w-full min-w-0">
            <TabsTrigger
              value="Summary"
              className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-medium rounded-md text-muted-foreground transition-all duration-150 shrink-0 cursor-pointer select-none hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:border data-[state=active]:border-border/70"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Summary</span>
            </TabsTrigger>

            <TabsTrigger
              value="Jobs"
              className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-medium rounded-md text-muted-foreground transition-all duration-150 shrink-0 cursor-pointer select-none hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:border data-[state=active]:border-border/70"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Applied Jobs</span>
            </TabsTrigger>

            <TabsTrigger
              value="Notes"
              className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-medium rounded-md text-muted-foreground transition-all duration-150 shrink-0 cursor-pointer select-none hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:border data-[state=active]:border-border/70"
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Notes</span>
            </TabsTrigger>

            <TabsTrigger
              value="Attachments"
              className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-medium rounded-md text-muted-foreground transition-all duration-150 shrink-0 cursor-pointer select-none hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:border data-[state=active]:border-border/70"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>Attachments</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Wrapper with minimal padding */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3.5">
          <TabsContent
            value="Summary"
            className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
          >
            <CandidateSummary
              candidate={candidate}
              onCandidateUpdate={handleCandidateUpdate}
              canModify={canModifyCandidates}
            />
          </TabsContent>

          <TabsContent
            value="Jobs"
            className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
          >
            <JobsContent
              ref={jobsContentRef}
              candidateId={candidateId}
              candidateName={candidate.name || "Unknown Candidate"}
            />
          </TabsContent>

          <TabsContent
            value="Notes"
            className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
          >
            <CandidateNotesContent
              candidateId={candidateId}
              canModify={canModifyCandidates}
            />
          </TabsContent>

          <TabsContent
            value="Attachments"
            className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
          >
            <AttachmentsContent
              candidateId={candidateId}
              canModify={canModifyCandidates}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}