"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User, Mail, Briefcase, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { InterviewRound } from "./dummy-data";
import { Separator } from "@/components/ui/separator";

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
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle>
            {isEditMode ? "Update Interview Round" : "Add Interview Round"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Updating ${round?.roundLabel || `Round ${round?.roundNumber}`}`
              : "Schedule a new interview round"}
            {candidateName ? ` for ${candidateName}` : ""}.
          </DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <div
          style={{ overflowY: "auto", flex: 1 }}
          className="px-6 py-4 space-y-5"
        >
          {/* Row 1 — Label + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Round Label</Label>
              <Input
                placeholder="e.g. Technical Round 1"
                value={formData.roundLabel}
                onChange={(e) => set("roundLabel", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Interview Type</Label>
              <Select
                value={formData.interviewType}
                onValueChange={(v) => set("interviewType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Scheduled At</Label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => set("scheduledAt", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Meeting Link{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="https://meet.google.com/..."
                value={formData.extraData?.meetLink || ""}
                onChange={(e) =>
                  set("extraData", { ...formData.extraData, meetLink: e.target.value })
                }
              />
            </div>
          </div>

          {/* Interviewers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-500" /> Interviewers
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={addInterviewer}
                className="h-7 text-[11px] font-semibold text-blue-600 uppercase tracking-wide"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Interviewer
              </Button>
            </div>
            <div className="space-y-2">
              {formData.interviewers.map((interviewer: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100 relative group"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <User className="h-3 w-3" /> Name
                      </div>
                      <Input
                        className="h-8 text-xs"
                        placeholder="Name"
                        value={interviewer.name}
                        onChange={(e) =>
                          handleInterviewerChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> Designation
                      </div>
                      <Input
                        className="h-8 text-xs"
                        placeholder="Designation"
                        value={interviewer.designation}
                        onChange={(e) =>
                          handleInterviewerChange(index, "designation", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </div>
                      <Input
                        className="h-8 text-xs"
                        placeholder="Email"
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
                      size="icon"
                      onClick={() => removeInterviewer(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-1.5">
            <Label>Internal Notes</Label>
            <Textarea
              placeholder="Any internal notes for recruiters..."
              value={formData.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="min-h-[70px]"
            />
          </div>

          {/* Outcome section — only for existing rounds (PATCH) */}
          {isEditMode && (
            <div className="space-y-5 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Round Outcome &amp; Feedback
              </h4>

              {/* Status + Result */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Round Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label>Result</Label>
                  {formData.status === "Completed" ? (
                    <Select
                      value={
                        formData.result === "Pending" ? "" : formData.result
                      }
                      onValueChange={(v) => set("result", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select result..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Next Round">Next Round</SelectItem>
                        <SelectItem value="Selected">Selected</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-400 italic">
                      Status &ldquo;Completed&rdquo; karo pehle
                    </div>
                  )}
                </div>
              </div>

              {/* Conducted At + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Conducted At</Label>
                  <Input
                    type="datetime-local"
                    value={formData.conductedAt}
                    onChange={(e) => set("conductedAt", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration (mins)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 60"
                    value={formData.duration}
                    onChange={(e) => set("duration", e.target.value)}
                  />
                </div>
              </div>

              {/* Reschedule reason */}
              {formData.status === "Rescheduled" && (
                <div className="space-y-1.5">
                  <Label>Reschedule Reason</Label>
                  <Textarea
                    placeholder="Why is this interview being rescheduled?"
                    value={formData.rescheduleReason}
                    onChange={(e) => set("rescheduleReason", e.target.value)}
                    className="min-h-[70px]"
                  />
                </div>
              )}

              {/* Scores */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Overall (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="—"
                    value={formData.overallScore}
                    onChange={(e) => set("overallScore", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Technical (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="—"
                    value={formData.technicalScore}
                    onChange={(e) => set("technicalScore", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Comm. (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="—"
                    value={formData.communicationScore}
                    onChange={(e) => set("communicationScore", e.target.value)}
                  />
                </div>
              </div>

              {/* Strengths + Improvement */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Strengths</Label>
                  <Textarea
                    placeholder="Candidate ki strengths..."
                    value={formData.strengths}
                    onChange={(e) => set("strengths", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Areas of Improvement</Label>
                  <Textarea
                    placeholder="Improvement areas..."
                    value={formData.areasOfImprovement}
                    onChange={(e) => set("areasOfImprovement", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-1.5">
                <Label>Detailed Feedback</Label>
                <Textarea
                  placeholder="Full interview feedback..."
                  value={formData.feedback}
                  onChange={(e) => set("feedback", e.target.value)}
                  className="min-h-[90px]"
                />
              </div>
            </div>
          )}
        </div>

        <Separator className="shrink-0" />

        <DialogFooter className="px-6 py-4 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUpdating ? "Saving..." : isEditMode ? "Update Round" : "Schedule Round"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}