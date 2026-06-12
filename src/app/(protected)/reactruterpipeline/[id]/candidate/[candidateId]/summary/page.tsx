"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCandidateSummary } from "@/hooks/useCandidateSummary";
import { exportCandidateSummaryExcel } from "@/services/recruitmentPipelineService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  UserPlus,
  ArrowRight,
  Video,
  CheckCircle,
  XCircle,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Clock,
  TrendingUp,
  User,
  Globe,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

export default function CandidateJourneySummaryPage() {
  const params = useParams();
  const pipelineId = (params as any)?.id as string;
  const candidateId = (params as any)?.candidateId as string;

  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false);
  const [openInterviewRounds, setOpenInterviewRounds] = useState<Record<number, boolean>>({});

  const { data: summary, isLoading, error } = useCandidateSummary(pipelineId, candidateId);

  const toggleRound = (roundNumber: number) => {
    setOpenInterviewRounds((prev) => ({
      ...prev,
      [roundNumber]: !prev[roundNumber]
    }));
  };

  const handleExcelExport = async () => {
    try {
      setIsExporting(true);
      setIsDownloadConfirmOpen(false);
      const data = await exportCandidateSummaryExcel(pipelineId, candidateId);
      const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const safeName = (summary?.candidateInfo?.name || "Candidate").replace(/\s+/g, "_");
      const safeJob = (summary?.jobInfo?.jobTitle || "Job").replace(/\s+/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      
      a.download = `Summary_${safeName}_${safeJob}_${dateStr}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel summary downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to download Excel report");
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  // Helper for timeline events
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "ADDED":
        return <UserPlus className="h-3 w-3" />;
      case "STAGE_MOVE":
        return <ArrowRight className="h-3 w-3" />;
      case "INTERVIEW_ROUND":
        return <Video className="h-3 w-3" />;
      case "HIRED":
        return <CheckCircle className="h-3 w-3" />;
      case "DISQUALIFIED":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getTimelineColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400",
          border: "border-blue-100/50 dark:border-blue-900/30"
        };
      case "green":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400",
          border: "border-emerald-100/50 dark:border-emerald-900/30"
        };
      case "red":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400",
          border: "border-rose-100/40 dark:border-rose-900/30"
        };
      case "yellow":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
          border: "border-amber-100/50 dark:border-amber-900/30"
        };
      default:
        return {
          bg: "bg-slate-50/70 dark:bg-slate-900/30 text-slate-400 dark:text-slate-400",
          border: "border-slate-100 dark:border-slate-800"
        };
    }
  };

  // Render Overall Status Badge
  const getOverallStatusBadge = (status: string) => {
    let classes = "bg-blue-50/50 text-blue-600 border-blue-100/50";
    if (status === "Hired") {
      classes = "bg-emerald-50/50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/10";
    } else if (status === "Disqualified") {
      classes = "bg-rose-50/50 text-rose-600 border-rose-100/50 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/10";
    } else if (status === "On Hold") {
      classes = "bg-amber-50/50 text-amber-600 border-amber-100/50 dark:bg-amber-950/10 dark:text-amber-400 dark:border-amber-900/10";
    } else if (status === "Withdrawn") {
      classes = "bg-slate-50/60 text-slate-500 border-slate-200/40 dark:bg-slate-900/15 dark:text-slate-400 dark:border-slate-800";
    }
    return (
      <Badge variant="outline" className={`${classes} font-semibold text-[9px] tracking-wider px-2 py-0.5 rounded-md`}>
        {status}
      </Badge>
    );
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full bg-slate-50/40 dark:bg-background p-4 overflow-y-auto gap-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  // Error State
  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50/40 dark:bg-background p-4">
        <div className="p-6 rounded-xl bg-card border border-border text-center max-w-sm shadow-sm">
          <AlertCircle className="h-9 w-9 text-red-500 mx-auto mb-2 opacity-60" />
          <h2 className="text-base font-bold text-foreground mb-1">Journey Summary Unavailable</h2>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {error?.message || "There was an issue fetching the candidate journey summary."}
          </p>
        </div>
      </div>
    );
  }

  const {
    candidateInfo,
    jobInfo,
    currentPosition,
    overallStatus,
    metrics,
    stageJourney = [],
    interviewSummary,
    rejectionInfo,
    timeline = []
  } = summary;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50/30 dark:bg-background/20 p-4 overflow-y-auto custom-scrollbar gap-4 animate-in fade-in duration-300">
      
      {/* 3-Column Hero Header Card */}
      <div className="relative overflow-hidden bg-card rounded-lg border border-border/60 shadow-sm py-3 px-4 flex flex-col md:flex-row md:items-stretch justify-between gap-4 md:gap-6 shrink-0 transition-shadow hover:shadow-md">
        
        {/* Column 1: Candidate Profile details */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Avatar className="h-12 w-12 rounded-lg border border-border/40 shrink-0">
            <AvatarImage src={candidateInfo?.avatar || ""} />
            <AvatarFallback className="text-base font-semibold bg-brand/5 text-brand uppercase">
              {candidateInfo?.name ? candidateInfo.name.split(" ").map((n: string) => n[0]).join("") : "NA"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base font-bold text-foreground tracking-tight truncate">
                {candidateInfo?.name || "Anonymous Candidate"}
              </h1>
              {getOverallStatusBadge(overallStatus)}
            </div>

            <div className="flex flex-wrap items-center gap-y-0.5 gap-x-2.5 text-[11px] text-muted-foreground mt-0.5">
              {candidateInfo?.email && (
                <a href={`mailto:${candidateInfo.email}`} className="flex items-center gap-1 hover:text-brand transition-colors">
                  <Mail className="h-3 w-3 text-muted-foreground/60" /> {candidateInfo.email}
                </a>
              )}
              {candidateInfo?.phone && (
                <a href={`tel:${candidateInfo.phone}`} className="flex items-center gap-1 hover:text-brand transition-colors">
                  <Phone className="h-3 w-3 text-muted-foreground/60" /> {candidateInfo.phone}
                </a>
              )}
              {candidateInfo?.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground/60" /> {candidateInfo.location}
                </span>
              )}
              {candidateInfo?.nationality && (
                <span className="flex items-center gap-0.5">
                  <Globe className="h-3 w-3 text-muted-foreground/60" /> {candidateInfo.nationality}
                </span>
              )}
              {candidateInfo?.specialization?.map((spec: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-[9px] font-medium py-0 px-1.5 bg-muted/10 text-muted-foreground border-border/20 rounded-sm">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Job Position details */}
        <div className="border-t md:border-t-0 md:border-l border-border/50 pt-2.5 md:pt-0 md:pl-6 shrink-0 flex flex-col justify-center gap-0.5 min-w-[200px] max-w-[260px]">
          <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            <Briefcase className="h-3 w-3 text-brand" /> Job Position
          </div>
          <div className="font-semibold text-xs text-foreground truncate max-w-[240px] leading-tight">
            {jobInfo?.jobTitle || "Independent Position"}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {jobInfo?.client?.name && `${jobInfo.client.name}`}
            {jobInfo?.jobId && ` • ${jobInfo.jobId}`}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" className="text-[8px] font-medium py-0 px-1 bg-muted/30 text-muted-foreground border-border/25 rounded-sm">
              {jobInfo?.department || "General"}
            </Badge>
            <Badge variant="outline" className="text-[8px] font-medium py-0 px-1 bg-muted/30 text-muted-foreground border-border/25 rounded-sm">
              {jobInfo?.jobType || "Full-time"}
            </Badge>
          </div>
        </div>

        {/* Column 3: Excel download Card Action */}
        <div className="border-t md:border-t-0 md:border-l border-border/50 pt-2.5 md:pt-0 md:pl-6 shrink-0 flex items-center justify-center min-w-[130px]">
          <Button
            onClick={() => setIsDownloadConfirmOpen(true)}
            disabled={isExporting}
            variant="outline"
            className="h-8 w-full bg-brand/5 border-brand/20 hover:bg-brand/10 text-brand rounded text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5 text-brand" />
            )}
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <Card className="border-border/50 shadow-sm bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Pipeline Age</span>
              <span className="text-lg font-bold text-foreground mt-0.5">{metrics?.daysInPipeline ?? 0} {metrics?.daysInPipeline === 1 ? "day" : "days"}</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">Added: {formatDate(metrics?.addedAt)}</span>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-md shrink-0">
              <Clock className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Process Progress</span>
              <span className="text-lg font-bold text-foreground mt-0.5">{metrics?.uniqueStagesVisited ?? 0} stages</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">{metrics?.totalStageMoves ?? 0} updates</span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-md shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Evaluation Rounds</span>
              <span className="text-lg font-bold text-foreground mt-0.5">
                {metrics?.completedInterviewRounds ?? 0} / {metrics?.totalInterviewRounds ?? 0}
              </span>
              <span className="text-[9px] text-muted-foreground mt-0.5">Interviews completed</span>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-md shrink-0">
              <Video className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Current Stage</span>
              <span className="text-xs font-bold text-brand mt-1 truncate max-w-[130px]">
                {currentPosition?.stage || "N/A"}
              </span>
              <span className="text-[9px] text-muted-foreground mt-0.5">
                Status: <strong className="font-medium text-foreground">{currentPosition?.status || "N/A"}</strong>
              </span>
            </div>
            <div className="p-2 bg-brand/5 text-brand rounded-md shrink-0">
              <Activity className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disqualification Notice Section */}
      {rejectionInfo && (
        <Card className="border-rose-100 dark:border-rose-950/30 bg-rose-50/10 dark:bg-rose-950/5 shadow-sm overflow-hidden shrink-0">
          <CardHeader className="bg-rose-50/20 dark:bg-rose-950/10 border-b border-rose-100/30 dark:border-rose-950/20 py-2.5 px-4">
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-rose-500" />
              <CardTitle className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                Disqualified
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col md:flex-row justify-between gap-4 text-xs">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="font-semibold text-rose-800 dark:text-rose-400">
                Disqualified from stage: <strong className="font-bold underline">{rejectionInfo.latestRejection?.stage}</strong>
              </div>
              <div className="text-[11px] text-foreground font-medium">
                Reason: <span className="text-muted-foreground font-normal">{rejectionInfo.latestRejection?.reason || "Not specified"}</span>
              </div>
              {rejectionInfo.latestRejection?.feedback && (
                <div className="text-[11px] bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/10 p-2.5 rounded text-rose-700 dark:text-rose-300 leading-relaxed font-normal mt-1">
                  <strong>Feedback:</strong> {rejectionInfo.latestRejection.feedback}
                </div>
              )}
            </div>

            <div className="border-t md:border-t-0 md:border-l border-rose-100 dark:border-rose-900/20 pt-3 md:pt-0 md:pl-4 shrink-0 flex flex-col gap-0.5 min-w-[200px]">
              <div className="text-muted-foreground">
                Date: <span className="font-medium text-foreground">{formatDate(rejectionInfo.latestRejection?.rejectionDate)}</span>
              </div>
              <div className="text-muted-foreground">
                By: <span className="font-medium text-foreground">{rejectionInfo.latestRejection?.rejectedBy?.name || "HR System"}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className={rejectionInfo.latestRejection?.canReapply ? "bg-emerald-50/60 text-emerald-700 dark:bg-emerald-950/10 dark:text-emerald-400 border-emerald-100 text-[9px] px-1.5 py-0 rounded-sm" : "bg-rose-50/60 text-rose-700 dark:bg-rose-950/10 dark:text-rose-400 border-rose-100 text-[9px] px-1.5 py-0 rounded-sm"}>
                  {rejectionInfo.latestRejection?.canReapply ? "Eligible to Reapply" : "Not Eligible"}
                </Badge>
              </div>
              {rejectionInfo.latestRejection?.canReapply && rejectionInfo.latestRejection?.reapplyDate && (
                <div className="text-[9px] text-muted-foreground mt-0.5 tracking-wide">
                  Eligible after: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatDate(rejectionInfo.latestRejection.reapplyDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0 flex-1">
        
        {/* Stage Journey Flow (Left 2 columns) */}
        <div className="xl:col-span-2 flex flex-col gap-4 overflow-y-auto pr-1">
          <Card className="border-border/60 shadow-sm bg-card hover:border-border/80 transition-colors">
            <CardHeader className="border-b border-border/50 py-3 px-5 flex flex-row items-center gap-2 shrink-0">
              <TrendingUp className="h-4 w-4 text-brand" />
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Stage Journey Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative border-l border-slate-200/80 dark:border-slate-800 pl-4 ml-1.5 flex flex-col gap-4">
                {stageJourney.map((stage: any, index: number) => {
                  const isActive = stage.isActive;
                  return (
                    <div key={index} className="relative group animate-in slide-in-from-left-1 duration-300">
                      {/* Timeline node marker */}
                      <span className={`absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full border bg-card flex items-center justify-center ${
                        isActive
                          ? "border-brand ring-2 ring-brand/15"
                          : "border-slate-300 dark:border-slate-700"
                      }`}>
                        {isActive && <div className="w-1 h-1 bg-brand rounded-full animate-pulse" />}
                      </span>

                      {/* Stage Card */}
                      <div className={`p-3.5 rounded-lg border transition-all duration-200 ${
                        isActive
                          ? "border-brand/40 bg-brand/[0.02] dark:bg-brand/950/[0.02] shadow-sm"
                          : "border-border/50 bg-card hover:border-border/80"
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-xs text-foreground tracking-tight">
                                {stage.stageName}
                              </h4>
                              {isActive ? (
                                <Badge className="bg-brand text-brand-foreground font-semibold text-[8px] tracking-wide px-1.5 py-0 rounded-sm">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="font-medium text-[8px] tracking-wide px-1.5 py-0 bg-muted/30 text-muted-foreground border-border/40 rounded-sm">
                                  {stage.finalStatus || "Completed"}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Entered: <span className="font-medium text-foreground/80">{formatDateTime(stage.enteredAt)}</span>
                              {stage.exitedAt && (
                                <>
                                  <span className="mx-1.5 text-muted-foreground/30">|</span>
                                  Exited: <span className="font-medium text-foreground/80">{formatDateTime(stage.exitedAt)}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-border/40 pt-2 sm:pt-0 sm:pl-3 text-[11px]">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Days spent</span>
                              <span className="font-semibold text-foreground">
                                {stage.daysSpent} {stage.daysSpent === 1 ? "day" : "days"}
                              </span>
                            </div>
                            
                            {stage.totalUpdates > 1 && (
                              <div className="flex flex-col">
                                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Updates</span>
                                <span className="font-medium text-muted-foreground">
                                  {stage.totalUpdates} logs
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mover info */}
                        {stage.movedBy && stage.movedBy.length > 0 && (
                          <div className="mt-2 text-[9px] text-muted-foreground bg-muted/20 border border-border/20 px-2 py-0.5 rounded inline-flex items-center gap-1 flex-wrap">
                            <User className="h-2.5 w-2.5 text-muted-foreground" />
                            <span>Mover:</span>
                            {stage.movedBy.map((mover: any, idx: number) => (
                              <span key={idx} className="font-medium text-foreground/80">
                                {mover.name} ({mover.email})
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Stage specific data */}
                        {stage.stageData && Object.keys(stage.stageData).length > 0 && (
                          <div className="mt-2.5 bg-muted/20 border border-border/30 p-2.5 rounded">
                            <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                              <FileText className="h-2.5 w-2.5" /> Stage Details
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(stage.stageData).map(([key, val]) => (
                                <div key={key} className="flex flex-col bg-card border border-border/30 rounded px-2 py-1">
                                  <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                                    {key === "sourcingDate"
                                      ? "CV Received Date"
                                      : key === "aemsInterviewDate"
                                      ? "Internal Interview Date"
                                      : key.replace(/([A-Z])/g, " $1")}
                                  </span>
                                  <span className="text-[11px] font-semibold text-foreground/90 mt-0.5 truncate">
                                    {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val ?? "N/A")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stage Notes */}
                        {stage.notes && stage.notes.length > 0 && (
                          <div className="mt-2 flex flex-col gap-0.5">
                            <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</div>
                            <ul className="list-disc pl-3.5 text-[11px] text-foreground/75 space-y-0.5 font-normal leading-relaxed">
                              {stage.notes.map((note: string, nIdx: number) => (
                                <li key={nIdx}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Interview Rounds Accordion details */}
          {interviewSummary && (
            <Card className="border-border/60 shadow-sm bg-card hover:border-border/80 transition-colors">
              <CardHeader className="border-b border-border/50 py-3 px-5 flex flex-row items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-brand" />
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Interview Details
                  </CardTitle>
                </div>
                {interviewSummary.averageScore !== null && (
                  <div className="flex items-center gap-1 bg-brand/5 border border-brand/20 px-2 py-0.5 rounded shrink-0">
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Average</span>
                    <span className="text-[10px] font-bold text-brand">{interviewSummary.averageScore.toFixed(1)}/10</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3.5">
                
                {/* Metric metrics info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/30 text-[11px]">
                  <div className="flex flex-col text-center">
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Rounds</span>
                    <span className="font-bold text-foreground mt-0.5">{interviewSummary.totalRounds}</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Completed</span>
                    <span className="font-bold text-emerald-600 mt-0.5">{interviewSummary.completedRounds}</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Highest</span>
                    <span className="font-bold text-brand mt-0.5">{interviewSummary.highestScore != null ? `${interviewSummary.highestScore.toFixed(1)}/10` : "N/A"}</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Final Result</span>
                    <span className="font-bold text-brand mt-0.5 tracking-wider uppercase text-[9px]">{interviewSummary.finalResult || "Pending"}</span>
                  </div>
                </div>

                {/* Interview Accordion List */}
                <div className="flex flex-col gap-2">
                  {interviewSummary.rounds.map((round: any, index: number) => {
                    const isOpen = !!openInterviewRounds[round.roundNumber];
                    const score = round.overallScore;
                    const result = round.result;

                    let resultClass = "bg-muted text-muted-foreground border-border/30";
                    if (result === "Selected") resultClass = "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
                    if (result === "Rejected") resultClass = "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
                    if (result === "Next Round") resultClass = "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";

                    return (
                      <div key={index} className="border border-border/50 rounded shadow-sm bg-card hover:border-border/80 transition-colors">
                        <button
                          onClick={() => toggleRound(round.roundNumber)}
                          className="w-full flex items-center justify-between p-2.5 hover:bg-muted/20 transition-all font-semibold"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded bg-brand/5 border border-brand/20 flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-bold text-brand">{round.roundNumber}</span>
                            </div>
                            <div className="text-left">
                              <h4 className="text-xs font-semibold text-foreground leading-none">{round.roundLabel || `Round ${round.roundNumber}`}</h4>
                              <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5 inline-block">
                                {round.interviewType || "Video"} • {round.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {score != null && (
                              <Badge variant="outline" className="bg-brand/5 border-brand/20 text-brand font-semibold text-[9px] px-1.5 rounded-sm">
                                Score: {score}/10
                              </Badge>
                            )}
                            {result && (
                              <Badge className={`${resultClass} font-semibold text-[8px] tracking-wider px-1.5 py-0 rounded-sm`}>
                                {result}
                              </Badge>
                            )}
                            {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="p-3.5 border-t border-border/40 bg-card flex flex-col gap-3 text-[11px] animate-in slide-in-from-top-1 duration-150">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Scheduled Date</span>
                                <span className="font-medium text-foreground/80 mt-0.5">{formatDateTime(round.scheduledAt)}</span>
                              </div>
                              {round.conductedAt && (
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Conducted Date</span>
                                  <span className="font-medium text-foreground/80 mt-0.5">{formatDateTime(round.conductedAt)}</span>
                                </div>
                              )}
                              {round.duration && (
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</span>
                                  <span className="font-medium text-foreground/80 mt-0.5">{round.duration} mins</span>
                                </div>
                              )}
                            </div>

                            {/* Interviewer detail */}
                            {round.interviewers && round.interviewers.length > 0 && (
                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Interviewers</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {round.interviewers.map((int: any, intIdx: number) => (
                                    <div key={intIdx} className="bg-muted/20 border border-border/30 rounded px-2 py-1 flex flex-col">
                                      <span className="font-semibold text-foreground/80">{int.name}</span>
                                      <span className="text-[9px] text-muted-foreground">{int.designation || "Interviewer"} {int.email && `• ${int.email}`}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Secondary scores */}
                            {(round.technicalScore != null || round.communicationScore != null) && (
                              <div className="flex gap-4 p-2 bg-muted/10 border border-border/20 rounded max-w-xs">
                                {round.technicalScore != null && (
                                  <div className="flex flex-col">
                                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Technical</span>
                                    <span className="font-semibold text-foreground mt-0.5">{round.technicalScore}/10</span>
                                  </div>
                                )}
                                {round.communicationScore != null && (
                                  <div className="flex flex-col">
                                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Communication</span>
                                    <span className="font-semibold text-foreground mt-0.5">{round.communicationScore}/10</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Feedback blocks */}
                            {round.feedback && (
                              <div className="bg-muted/10 border border-border/30 p-2.5 rounded flex flex-col gap-0.5 leading-relaxed font-normal text-foreground/85">
                                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Evaluation Feedback</span>
                                <p>{round.feedback}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {round.strengths && (
                                <div className="bg-emerald-50/[0.06] border border-emerald-100/40 p-2.5 rounded flex flex-col gap-0.5 font-normal">
                                  <span className="text-[8px] font-semibold uppercase tracking-wider text-emerald-700">Strengths</span>
                                  <p className="text-foreground/80">{round.strengths}</p>
                                </div>
                              )}
                              {round.improvements && (
                                <div className="bg-amber-50/[0.06] border border-amber-100/40 p-2.5 rounded flex flex-col gap-0.5 font-normal">
                                  <span className="text-[8px] font-semibold uppercase tracking-wider text-amber-700">Areas of Improvement</span>
                                  <p className="text-foreground/80">{round.improvements}</p>
                                </div>
                              )}
                            </div>

                            {round.notes && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</span>
                                <p className="text-muted-foreground font-normal">{round.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visual Activity Timeline (Right 1 column) */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          <Card className="border-border/60 shadow-sm bg-card h-full flex flex-col hover:border-border/80 transition-colors">
            <CardHeader className="border-b border-border/50 py-3 px-5 flex flex-row items-center gap-2 flex-shrink-0">
              <Activity className="h-4 w-4 text-brand" />
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="relative border-l border-slate-200/80 dark:border-slate-800 pl-4 ml-1.5 flex flex-col gap-5 text-[11px]">
                {timeline.map((event: any, index: number) => {
                  const style = getTimelineColorClasses(event.color);
                  return (
                    <div key={index} className="relative animate-in slide-in-from-bottom-1 duration-300">
                      {/* Node circle marker */}
                      <span className={`absolute -left-[24.5px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center shadow-sm ${style.bg} ${style.border}`}>
                        {getTimelineIcon(event.type)}
                      </span>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-foreground leading-none">{event.label}</span>
                          <span className="text-[8px] text-muted-foreground font-semibold uppercase shrink-0">
                            {formatDate(event.at)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-normal leading-relaxed">
                            {event.description}
                          </p>
                        )}
                        <span className="text-[8px] text-muted-foreground/70 mt-0.5 font-semibold block">
                          {formatDateTime(event.at).split(",")[1]?.trim()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Confirmation Dialog for Excel download */}
      <Dialog open={isDownloadConfirmOpen} onOpenChange={setIsDownloadConfirmOpen}>
        <DialogContent className="rounded-lg border border-border shadow-sm max-w-sm bg-card">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileSpreadsheet className="h-4.5 w-4.5 text-brand" />
              Export Journey Summary
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1 leading-relaxed font-normal">
              Download the complete recruitment history, stages, and interview round notes for <strong className="text-foreground font-semibold">{summary?.candidateInfo?.name || "the candidate"}</strong> inside an Excel (.xlsx) file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3.5">
            <Button
              variant="outline"
              onClick={() => setIsDownloadConfirmOpen(false)}
              className="h-8 rounded text-xs font-semibold border-border bg-card px-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExcelExport}
              className="h-8 rounded text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground px-3.5 shadow-sm"
            >
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
