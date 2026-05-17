"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User, Mail, Briefcase, CheckCircle2, CalendarIcon, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { InterviewRound } from "./dummy-data";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  // Parse Date and Time parts from "yyyy-MM-ddTHH:mm"
  let dateObj: Date | undefined = undefined;
  let hourStr = "09";
  let minStr = "00";

  if (value) {
    const [dPart, tPart] = value.split("T");
    if (dPart) {
      const parsed = new Date(dPart);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      }
    }
    if (tPart) {
      const [hh, mm] = tPart.split(":");
      hourStr = hh || "09";
      minStr = mm || "00";
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    const formattedDate = format(newDate, "yyyy-MM-dd");
    onChange(`${formattedDate}T${hourStr}:${minStr}`);
    setOpen(false);
  };

  const handleTimeChange = (type: "hour" | "minute", val: string) => {
    const dStr = dateObj ? format(dateObj, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    const h = type === "hour" ? val : hourStr;
    const m = type === "minute" ? val : minStr;
    onChange(`${dStr}T${h}:${m}`);
  };

  return (
    <div className="flex gap-2 w-full animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Date Picker Trigger */}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="flex-1 justify-start text-left font-normal border-border bg-card hover:bg-muted/50 transition-all duration-200 h-10 px-3 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {dateObj ? format(dateObj, "PPP") : <span className="text-muted-foreground">{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl border border-border shadow-xl bg-card" align="start">
          <Calendar
            mode="single"
            selected={dateObj}
            onSelect={handleDateSelect}
            initialFocus
            className="rounded-xl border-0 p-3"
          />
        </PopoverContent>
      </Popover>

      {/* Time Picker Trigger */}
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="w-[110px] justify-start text-left font-normal border-border bg-card hover:bg-muted/50 transition-all duration-200 h-10 px-3 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20"
          >
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            {`${hourStr}:${minStr}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-3 rounded-xl border border-border shadow-xl bg-card" align="end">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hour</span>
              <Select value={hourStr} onValueChange={(val) => handleTimeChange("hour", val)}>
                <SelectTrigger className="h-8 text-xs rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => {
                    const str = h.toString().padStart(2, "0");
                    return <SelectItem key={str} value={str}>{str}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Min</span>
              <Select value={minStr} onValueChange={(val) => handleTimeChange("minute", val)}>
                <SelectTrigger className="h-8 text-xs rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48 animate-in fade-in duration-100">
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface InterviewRoundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  round?: InterviewRound | null;
  candidateName?: string;
  isUpdating?: boolean;
}

const emptyForm = {
  roundLabel: "",
  interviewType: "Video",
  scheduledAt: "",
  interviewers: [{ name: "", designation: "", email: "" }],
  notes: "",
  status: "Scheduled",
  conductedAt: "",
  duration: "",
  overallScore: "",
  technicalScore: "",
  communicationScore: "",
  result: "Pending",
  strengths: "",
  areasOfImprovement: "",
  feedback: "",
  rescheduleReason: "",
  extraData: { meetLink: "" },
};

export function InterviewRoundDialog({
  isOpen,
  onClose,
  onConfirm,
  round,
  candidateName,
  isUpdating = false,
}: InterviewRoundDialogProps) {
  const [formData, setFormData] = useState<any>({ ...emptyForm });

  useEffect(() => {
    if (!isOpen) return;
    if (round) {
      setFormData({
        roundLabel: round.roundLabel || "",
        interviewType: round.interviewType || "Video",
        scheduledAt: round.scheduledAt ? format(new Date(round.scheduledAt), "yyyy-MM-dd'T'HH:mm") : "",
        interviewers: round.interviewers?.length > 0 ? [...round.interviewers] : [{ name: "", designation: "", email: "" }],
        notes: round.notes || "",
        status: round.status || "Scheduled",
        conductedAt: round.conductedAt ? format(new Date(round.conductedAt), "yyyy-MM-dd'T'HH:mm") : "",
        duration: round.duration ?? "",
        overallScore: round.overallScore ?? "",
        technicalScore: round.technicalScore ?? "",
        communicationScore: round.communicationScore ?? "",
        result: round.result || "Pending",
        strengths: round.strengths || "",
        areasOfImprovement: round.areasOfImprovement || "",
        feedback: round.feedback || "",
        rescheduleReason: round.rescheduleReason || "",
        extraData: round.extraData ? { ...round.extraData } : { meetLink: "" },
      });
    } else {
      setFormData({ ...emptyForm });
    }
  }, [isOpen, round]);

  const set = (key: string, val: any) =>
    setFormData((prev: any) => ({ ...prev, [key]: val }));

  const handleStatusChange = (val: string) => {
    setFormData((prev: any) => ({
      ...prev,
      status: val,
      result: val !== "Completed" ? "Pending" : prev.result,
    }));
  };

  const handleInterviewerChange = (index: number, field: string, value: string) => {
    const list = [...formData.interviewers];
    list[index] = { ...list[index], [field]: value };
    set("interviewers", list);
  };

  const addInterviewer = () =>
    set("interviewers", [...formData.interviewers, { name: "", designation: "", email: "" }]);

  const removeInterviewer = (index: number) => {
    const list = formData.interviewers.filter((_: any, i: number) => i !== index);
    set("interviewers", list.length > 0 ? list : [{ name: "", designation: "", email: "" }]);
  };

  const toISO = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const toNum = (val: any) =>
    val !== "" && val !== null && val !== undefined ? Number(val) : null;

  const handleSubmit = () => {
    if (!formData.scheduledAt) {
      toast.error("Please select a scheduled time");
      return;
    }
    const isNewRound = !round;
    if (
      !isNewRound &&
      formData.status === "Completed" &&
      (!formData.result || formData.result === "Pending")
    ) {
      toast.error("Please select a Result before marking round as Completed");
      return;
    }

    const filteredInterviewers = formData.interviewers.filter(
      (i: any) => i.name.trim() !== ""
    );

    const payload: any = {
      roundLabel: formData.roundLabel,
      interviewType: formData.interviewType,
      scheduledAt: toISO(formData.scheduledAt),
      interviewers: filteredInterviewers,
      notes: formData.notes,
      extraData: formData.extraData,
    };

    if (!isNewRound) {
      payload.status = formData.status;
      payload.result = formData.result;
      payload.conductedAt = toISO(formData.conductedAt);
      payload.duration = toNum(formData.duration);
      payload.overallScore = toNum(formData.overallScore);
      payload.technicalScore = toNum(formData.technicalScore);
      payload.communicationScore = toNum(formData.communicationScore);
      payload.strengths = formData.strengths;
      payload.areasOfImprovement = formData.areasOfImprovement;
      payload.feedback = formData.feedback;
      payload.rescheduleReason = formData.rescheduleReason;
    }

    onConfirm(payload);
  };

  const isEditMode = !!round;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border border-border/80 shadow-2xl rounded-2xl bg-card">
        {/* Modern styled Header */}
        <DialogHeader className="px-6 py-5 shrink-0 bg-gradient-to-r from-muted/50 via-muted/30 to-transparent border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                {isEditMode ? "Update Interview Round" : "Add Interview Round"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEditMode
                  ? `Updating ${round?.roundLabel || `Round ${round?.roundNumber}`}`
                  : "Schedule a new interview round"}
                {candidateName ? (
                  <> for <span className="font-semibold text-foreground">{candidateName}</span></>
                ) : ""}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Container */}
        <div
          style={{ overflowY: "auto", flex: 1 }}
          className="px-6 py-5 space-y-6"
        >
          {/* Section: Context Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Round Details</h4>
            </div>

            {/* Row 1 — Label + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Round Label</Label>
                <Input
                  placeholder="e.g. Technical Round 1"
                  value={formData.roundLabel}
                  onChange={(e) => set("roundLabel", e.target.value)}
                  className="h-10 text-sm rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Interview Type</Label>
                <Select
                  value={formData.interviewType}
                  onValueChange={(v) => set("interviewType", v)}
                >
                  <SelectTrigger className="h-10 text-sm rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-border">
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                    <SelectItem value="Panel">Panel</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2 — Scheduled + Meet Link */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground">Scheduled At</Label>
                <DateTimePicker
                  value={formData.scheduledAt}
                  onChange={(val) => set("scheduledAt", val)}
                  placeholder="Select schedule date"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  Meeting Link
                  <span className="text-[10px] text-muted-foreground font-normal italic">(optional)</span>
                </Label>
                <Input
                  placeholder="https://meet.google.com/..."
                  value={formData.extraData?.meetLink || ""}
                  onChange={(e) =>
                    set("extraData", { ...formData.extraData, meetLink: e.target.value })
                  }
                  className="h-10 text-sm rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 bg-card w-full"
                />
              </div>
            </div>
          </div>

          {/* Section: Interviewers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Interviewers</h4>
              </div>
              <Button
                variant="ghost"
                type="button"
                size="sm"
                onClick={addInterviewer}
                className="h-7 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider bg-blue-500/5 hover:bg-blue-500/10 rounded-md border border-blue-500/10 px-2.5 transition-all"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Interviewer
              </Button>
            </div>
            <div className="space-y-3">
              {formData.interviewers.map((interviewer: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-muted/40 rounded-xl border border-border/80 relative group hover:border-border transition-all shadow-sm flex flex-col gap-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground/70" /> Name
                      </div>
                      <Input
                        className="h-10 text-sm rounded-lg border-border/80 focus:ring-2 focus:ring-blue-500/20 bg-card"
                        placeholder="e.g. John Doe"
                        value={interviewer.name}
                        onChange={(e) =>
                          handleInterviewerChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground/70" /> Designation
                      </div>
                      <Input
                        className="h-10 text-sm rounded-lg border-border/80 focus:ring-2 focus:ring-blue-500/20 bg-card"
                        placeholder="e.g. Engineering Lead"
                        value={interviewer.designation}
                        onChange={(e) =>
                          handleInterviewerChange(index, "designation", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground/70" /> Email
                      </div>
                      <Input
                        className="h-10 text-sm rounded-lg border-border/80 focus:ring-2 focus:ring-blue-500/20 bg-card"
                        placeholder="e.g. john@company.com"
                        value={interviewer.email}
                        onChange={(e) =>
                          handleInterviewerChange(index, "email", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {formData.interviewers.length > 1 && (
                    <Button
                      variant="ghost"
                      type="button"
                      size="icon"
                      onClick={() => removeInterviewer(index)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-card border border-border/80 text-muted-foreground hover:text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Internal Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Internal Notes</h4>
            </div>
            <Textarea
              placeholder="Enter internal details or special notes for the recruitment team..."
              value={formData.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="min-h-[70px] rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 resize-none text-sm p-3"
            />
          </div>

          {/* Outcome section — only for existing rounds (PATCH) */}
          {isEditMode && (
            <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.01] space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-emerald-500/10 pb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Assessment Outcome &amp; Feedback
              </h4>

              {/* Status + Result */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Round Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-10 text-sm rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border">
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="No Show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Result</Label>
                  {formData.status === "Completed" ? (
                    <Select
                      value={formData.result === "Pending" ? "" : formData.result}
                      onValueChange={(v) => set("result", v)}
                    >
                      <SelectTrigger className="h-10 text-sm rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 bg-card">
                        <SelectValue placeholder="Select result..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-border">
                        <SelectItem value="Next Round">Next Round</SelectItem>
                        <SelectItem value="Selected">Selected</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-lg border border-border/80 bg-muted/60 text-sm text-muted-foreground italic font-medium">
                      Select &ldquo;Completed&rdquo; status to unlock results
                    </div>
                  )}
                </div>
              </div>

              {/* Conducted At + Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Conducted At</Label>
                  <DateTimePicker
                    value={formData.conductedAt}
                    onChange={(val) => set("conductedAt", val)}
                    placeholder="Select conducted date"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs font-semibold text-muted-foreground">Duration (mins)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 60"
                    value={formData.duration}
                    onChange={(e) => set("duration", e.target.value)}
                    className="h-10 text-sm rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 bg-card w-full"
                  />
                </div>
              </div>

              {/* Reschedule reason */}
              {formData.status === "Rescheduled" && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <Label className="text-xs font-semibold text-muted-foreground">Reschedule Reason</Label>
                  <Textarea
                    placeholder="Why is this interview being rescheduled?"
                    value={formData.rescheduleReason}
                    onChange={(e) => set("rescheduleReason", e.target.value)}
                    className="min-h-[70px] rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 resize-none bg-card text-sm p-3"
                  />
                </div>
              )}

              {/* Scores */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card p-3 rounded-xl border border-border shadow-sm space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Overall (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="—"
                    value={formData.overallScore}
                    onChange={(e) => set("overallScore", e.target.value)}
                    className="h-10 text-sm font-semibold text-blue-600 border-border/80 focus:ring-2 focus:ring-blue-500/20 bg-card"
                  />
                </div>
                <div className="bg-card p-3 rounded-xl border border-border shadow-sm space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Technical (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="—"
                    value={formData.technicalScore}
                    onChange={(e) => set("technicalScore", e.target.value)}
                    className="h-10 text-sm font-semibold text-blue-600 border-border/80 focus:ring-2 focus:ring-blue-500/20 bg-card"
                  />
                </div>
                <div className="bg-card p-3 rounded-xl border border-border shadow-sm space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Comm. (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="—"
                    value={formData.communicationScore}
                    onChange={(e) => set("communicationScore", e.target.value)}
                    className="h-10 text-sm font-semibold text-blue-600 border-border/80 focus:ring-2 focus:ring-blue-500/20 bg-card"
                  />
                </div>
              </div>

              {/* Strengths + Improvement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Strengths</Label>
                  <Textarea
                    placeholder="Key highlights and candidate strengths..."
                    value={formData.strengths}
                    onChange={(e) => set("strengths", e.target.value)}
                    className="min-h-[80px] rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 resize-none bg-card text-sm p-3"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Areas of Improvement</Label>
                  <Textarea
                    placeholder="Core gaps or areas for technical growth..."
                    value={formData.areasOfImprovement}
                    onChange={(e) => set("areasOfImprovement", e.target.value)}
                    className="min-h-[80px] rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 resize-none bg-card text-sm p-3"
                  />
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Detailed Interview Feedback</Label>
                <Textarea
                  placeholder="Provide structured feedback for evaluation..."
                  value={formData.feedback}
                  onChange={(e) => set("feedback", e.target.value)}
                  className="min-h-[90px] rounded-lg border-border focus:ring-2 focus:ring-blue-500/20 resize-none bg-card text-sm p-3"
                />
              </div>
            </div>
          )}
        </div>

        {/* Separator / Footer */}
        <div className="px-6 py-4 shrink-0 bg-muted/30 border-t border-border/60 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="rounded-lg h-10 px-4 text-sm font-semibold border-border hover:bg-muted/50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdating}
            className="rounded-lg h-10 px-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5"
          >
            {isUpdating ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : isEditMode ? (
              "Update Round"
            ) : (
              "Schedule Round"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}