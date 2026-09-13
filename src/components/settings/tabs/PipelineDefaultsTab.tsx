"use client";

import React, { useState } from "react";
import { 
  GitBranch, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  UserCheck, 
  Save, 
  RotateCcw,
  Sparkles,
  Sliders,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface PipelineDefaultsTabProps {
  searchQuery?: string;
}

const DEFAULT_STAGES = [
  { id: "sourced", name: "Sourced", color: "bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/40 dark:text-blue-300", required: false },
  { id: "screened", name: "Screening", color: "bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:border-indigo-900/40 dark:text-indigo-300", required: true },
  { id: "assessment", name: "Technical / Assessment", color: "bg-purple-500/10 text-purple-700 border-purple-200 dark:border-purple-900/40 dark:text-purple-300", required: false },
  { id: "interview", name: "Onsite / Final Interview", color: "bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-900/40 dark:text-amber-300", required: true },
  { id: "offer", name: "Offer Extended", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:border-emerald-900/40 dark:text-emerald-300", required: true },
  { id: "hired", name: "Hired & Onboarding", color: "bg-teal-500/10 text-teal-700 border-teal-200 dark:border-teal-900/40 dark:text-teal-300", required: true },
];

export const PipelineDefaultsTab: React.FC<PipelineDefaultsTabProps> = ({ searchQuery = "" }) => {
  const [duplicateDetection, setDuplicateDetection] = useState(true);
  const [duplicateAction, setDuplicateAction] = useState<"warn" | "block">("warn");
  const [duplicateLookback, setDuplicateLookback] = useState("180");
  
  const [defaultInterviewDuration, setDefaultInterviewDuration] = useState("45");
  const [bufferTime, setBufferTime] = useState("15");
  const [sendCandidateReminder, setSendCandidateReminder] = useState(true);
  const [sendInterviewerReminder, setSendInterviewerReminder] = useState(true);

  const [blindEvaluations, setBlindEvaluations] = useState(true);
  const [minScorecards, setMinScorecards] = useState("2");
  const [autoRejectUnqualified, setAutoRejectUnqualified] = useState(false);

  const handleSave = () => {
    toast.success("Pipeline default policies updated successfully!");
  };

  const handleReset = () => {
    setDuplicateDetection(true);
    setDuplicateAction("warn");
    setDuplicateLookback("180");
    setDefaultInterviewDuration("45");
    setBufferTime("15");
    setSendCandidateReminder(true);
    setSendInterviewerReminder(true);
    setBlindEvaluations(true);
    setMinScorecards("2");
    setAutoRejectUnqualified(false);
    toast.info("Reset pipeline defaults to system standards.");
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-3 sm:p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Pipeline & Interview Defaults</h2>
            <Badge variant="outline" className="text-xs bg-muted/60">Recruitment Rules</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure default stages, candidate deduplication rules, interview scheduling buffers, and evaluation policies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Save className="h-3.5 w-3.5" />
            Save Policies
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Default Pipeline Stages */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Standard Pipeline Workflow</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">{DEFAULT_STAGES.length} Core Stages</span>
          </div>
          <p className="text-xs text-muted-foreground">
            These stages are automatically populated when a hiring manager launches a new recruitment pipeline.
          </p>

          <div className="space-y-2 pt-1">
            {DEFAULT_STAGES.map((stage, idx) => (
              <div 
                key={stage.id} 
                className="flex items-center justify-between p-2.5 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-medium text-foreground">{stage.name}</span>
                    {stage.required && (
                      <span className="ml-2 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/30">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] capitalize ${stage.color}`}>
                  Active
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border/70 flex items-start gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              Stage customization on a per-job basis can be customized within each individual Job Requisition settings.
            </span>
          </div>
        </div>

        {/* Candidate Deduplication Settings */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Candidate Deduplication Rules</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Prevent multiple recruiters from submitting or contacting identical candidates within your organization.
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/10">
              <div className="space-y-0.5 pr-4">
                <Label className="text-xs font-semibold cursor-pointer">Enable Duplicate Detection</Label>
                <p className="text-[11px] text-muted-foreground">
                  Match across primary email address, phone number, and LinkedIn profile URLs.
                </p>
              </div>
              <Switch checked={duplicateDetection} onCheckedChange={setDuplicateDetection} />
            </div>

            {duplicateDetection && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Duplicate Action Enforcement</Label>
                  <Select value={duplicateAction} onValueChange={(val: "warn" | "block") => setDuplicateAction(val)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select enforcement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warn" className="text-xs">
                        Warn Recruiter (Allow proceeding with duplicate badge)
                      </SelectItem>
                      <SelectItem value="block" className="text-xs">
                        Strict Block (Prevent candidate addition if active within lookback)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Duplicate Detection Window</Label>
                  <Select value={duplicateLookback} onValueChange={setDuplicateLookback}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select window" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90" className="text-xs">Past 90 Days (3 Months)</SelectItem>
                      <SelectItem value="180" className="text-xs">Past 180 Days (6 Months - Recommended)</SelectItem>
                      <SelectItem value="365" className="text-xs">Past 365 Days (1 Year)</SelectItem>
                      <SelectItem value="always" className="text-xs">All Time (Lifetime)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Candidates who applied or were archived outside this window will be treated as re-applications.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Interview Scheduling Defaults */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Interview Scheduling Policies</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure timing defaults applied when scheduling screening calls and panel interviews.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Default Duration</Label>
              <Select value={defaultInterviewDuration} onValueChange={setDefaultInterviewDuration}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30" className="text-xs">30 Minutes</SelectItem>
                  <SelectItem value="45" className="text-xs">45 Minutes (Standard)</SelectItem>
                  <SelectItem value="60" className="text-xs">60 Minutes (1 Hour)</SelectItem>
                  <SelectItem value="90" className="text-xs">90 Minutes (Panel)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Buffer Between Sessions</Label>
              <Select value={bufferTime} onValueChange={setBufferTime}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-xs">No Buffer (0m)</SelectItem>
                  <SelectItem value="10" className="text-xs">10 Minutes</SelectItem>
                  <SelectItem value="15" className="text-xs">15 Minutes (Recommended)</SelectItem>
                  <SelectItem value="30" className="text-xs">30 Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between p-2 rounded-md border bg-muted/10">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-medium">Candidate Email Reminder</span>
                <p className="text-[11px] text-muted-foreground">Send automated reminder email 24 hours prior to interview.</p>
              </div>
              <Switch checked={sendCandidateReminder} onCheckedChange={setSendCandidateReminder} />
            </div>

            <div className="flex items-center justify-between p-2 rounded-md border bg-muted/10">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-medium">Interviewer Alert</span>
                <p className="text-[11px] text-muted-foreground">Ping interviewers 15 minutes before the session starts.</p>
              </div>
              <Switch checked={sendInterviewerReminder} onCheckedChange={setSendInterviewerReminder} />
            </div>
          </div>
        </div>

        {/* Evaluation & Scorecards */}
        <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Scorecards & Evaluation Governance</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Enforce fairness and structured hiring decision-making across hiring teams.
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/10">
              <div className="space-y-0.5 pr-4">
                <Label className="text-xs font-semibold cursor-pointer">Blind Evaluations</Label>
                <p className="text-[11px] text-muted-foreground">
                  Interviewers cannot see peer ratings or feedback notes until their own scorecard is submitted.
                </p>
              </div>
              <Switch checked={blindEvaluations} onCheckedChange={setBlindEvaluations} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Minimum Scorecards for Offer Stage</Label>
              <Select value={minScorecards} onValueChange={setMinScorecards}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-xs">1 Completed Scorecard</SelectItem>
                  <SelectItem value="2" className="text-xs">2 Completed Scorecards (Recommended)</SelectItem>
                  <SelectItem value="3" className="text-xs">3 Completed Scorecards (Strict)</SelectItem>
                  <SelectItem value="4" className="text-xs">4 Completed Scorecards</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/10">
              <div className="space-y-0.5 pr-4">
                <Label className="text-xs font-semibold cursor-pointer">Auto-archive on Strong Negative</Label>
                <p className="text-[11px] text-muted-foreground">
                  Flag candidate for rejection review if overall score is 1/5 stars across all interviewers.
                </p>
              </div>
              <Switch checked={autoRejectUnqualified} onCheckedChange={setAutoRejectUnqualified} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
