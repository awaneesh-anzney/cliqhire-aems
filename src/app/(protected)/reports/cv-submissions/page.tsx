"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Calendar, FileText, CheckCircle2, Clock, AlertTriangle, Filter } from "lucide-react";
import { cvSubmissionService } from "@/services/cvSubmissionService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CvSubmissionsReportPage() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [jobIdFilter, setJobIdFilter] = useState<string>("");
  const [recruiterIdFilter, setRecruiterIdFilter] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cv-submissions-report", fromDate, toDate, jobIdFilter, recruiterIdFilter],
    queryFn: () => cvSubmissionService.getSummary({
      from: fromDate || undefined,
      to: toDate || undefined,
      jobId: jobIdFilter || undefined,
      recruiterId: recruiterIdFilter || undefined
    })
  });

  const summary = data?.data;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-bold">CV Submission SLA Report</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Filters */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">From Date</label>
            <Input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-muted/50 border-border"
            />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">To Date</label>
            <Input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-muted/50 border-border"
            />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Job ID</label>
            <Input 
              placeholder="Filter by Job ID"
              value={jobIdFilter}
              onChange={(e) => setJobIdFilter(e.target.value)}
              className="bg-muted/50 border-border"
            />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recruiter ID</label>
            <Input 
              placeholder="Filter by Recruiter ID"
              value={recruiterIdFilter}
              onChange={(e) => setRecruiterIdFilter(e.target.value)}
              className="bg-muted/50 border-border"
            />
          </div>
          <Button onClick={() => refetch()} className="h-10 px-6 font-bold uppercase tracking-wider bg-primary text-primary-foreground">
            <Filter className="w-4 h-4 mr-2" /> Apply
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 bg-card border border-border rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : summary ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Assigned</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-foreground">{summary.totalAssigned}</span>
                  <span className="text-sm font-semibold text-muted-foreground">CVs</span>
                </div>
              </div>
              
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">On-Time Rate</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={cn(
                    "text-4xl font-extrabold",
                    summary.onTimePercentage >= 80 ? "text-emerald-500" : summary.onTimePercentage >= 50 ? "text-amber-500" : "text-red-500"
                  )}>{summary.onTimePercentage}%</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-2">
                  {summary.onTimeCount} on time, {summary.lateCount} late
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Currently Pending</p>
                <div className="mt-4 flex items-center gap-3 text-amber-500">
                  <span className="text-4xl font-extrabold">{summary.currentlyPending}</span>
                  <Clock className="h-6 w-6 opacity-75" />
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Currently Overdue</p>
                <div className="mt-4 flex items-center gap-3 text-red-500">
                  <span className="text-4xl font-extrabold">{summary.currentlyOverdue}</span>
                  <AlertTriangle className="h-6 w-6 opacity-75" />
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border bg-muted/30">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                  <FileText className="w-4 h-4 text-primary" /> Submission Records
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-bold">Candidate</th>
                      <th className="px-6 py-4 font-bold">Job</th>
                      <th className="px-6 py-4 font-bold">Assigned To</th>
                      <th className="px-6 py-4 font-bold">Assigned Date</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Reopens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-medium">
                    {summary.records && summary.records.length > 0 ? (
                      summary.records.map((record: any) => (
                        <tr key={record._id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-foreground">{record.candidate?.name || "Unknown"}</span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{record.job?.jobTitle || "Unknown"}</td>
                          <td className="px-6 py-4 text-muted-foreground">{record.assignedTo?.name || "Unknown"}</td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {format(new Date(record.assignedAt), "MMM dd, yyyy")}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border",
                              record.status === 'SUBMITTED' ? (record.isLate ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20") :
                              record.status === 'OVERDUE' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                              "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            )}>
                              {record.status === 'SUBMITTED' ? (record.isLate ? "LATE SUBMISSION" : "ON TIME") : record.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-center">
                            {record.reopenCount > 0 ? (
                              <Badge variant="secondary" className="text-[10px]">{record.reopenCount}</Badge>
                            ) : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium bg-muted/10">
                          No records found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-12 bg-card border border-border rounded-2xl text-muted-foreground font-medium">
            Failed to load report data.
          </div>
        )}
      </div>
    </div>
  );
}
