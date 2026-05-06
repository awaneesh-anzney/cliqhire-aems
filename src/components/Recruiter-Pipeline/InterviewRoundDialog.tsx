"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Plus, Trash2, User, Mail, Briefcase, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { InterviewRound } from "./dummy-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface InterviewRoundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  round?: InterviewRound | null;
  candidateName?: string;
  isUpdating?: boolean;
}

export function InterviewRoundDialog({
  isOpen,
  onClose,
  onConfirm,
  round,
  candidateName,
  isUpdating = false
}: InterviewRoundDialogProps) {
  const [formData, setFormData] = useState<any>({
    roundLabel: "",
    interviewType: "Video",
    scheduledAt: "",
    interviewers: [{ name: "", designation: "", email: "" }],
    notes: "",
    status: "Scheduled",
    conductedAt: "",
    duration: 60,
    overallScore: null,
    technicalScore: null,
    communicationScore: null,
    result: "Pending",
    strengths: "",
    areasOfImprovement: "",
    feedback: "",
    extraData: { meetLink: "" }
  });

  useEffect(() => {
    if (round) {
      setFormData({
        roundLabel: round.roundLabel || "",
        interviewType: round.interviewType || "Video",
        scheduledAt: round.scheduledAt ? format(new Date(round.scheduledAt), "yyyy-MM-dd'T'HH:mm") : "",
        interviewers: round.interviewers?.length > 0 ? [...round.interviewers] : [{ name: "", designation: "", email: "" }],
        notes: round.notes || "",
        status: round.status || "Scheduled",
        conductedAt: round.conductedAt ? format(new Date(round.conductedAt), "yyyy-MM-dd'T'HH:mm") : "",
        duration: round.duration || 60,
        overallScore: round.overallScore || null,
        technicalScore: round.technicalScore || null,
        communicationScore: round.communicationScore || null,
        result: round.result || "Pending",
        strengths: round.strengths || "",
        areasOfImprovement: round.areasOfImprovement || "",
        feedback: round.feedback || "",
        extraData: { ...round.extraData } || { meetLink: "" }
      });
    } else {
      setFormData({
        roundLabel: "",
        interviewType: "Video",
        scheduledAt: "",
        interviewers: [{ name: "", designation: "", email: "" }],
        notes: "",
        status: "Scheduled",
        conductedAt: "",
        duration: 60,
        overallScore: null,
        technicalScore: null,
        communicationScore: null,
        result: "Pending",
        strengths: "",
        areasOfImprovement: "",
        feedback: "",
        extraData: { meetLink: "" }
      });
    }
  }, [round, isOpen]);

  const handleInterviewerChange = (index: number, field: string, value: string) => {
    const newList = [...formData.interviewers];
    newList[index] = { ...newList[index], [field]: value };
    setFormData({ ...formData, interviewers: newList });
  };

  const addInterviewer = () => {
    setFormData({
      ...formData,
      interviewers: [...formData.interviewers, { name: "", designation: "", email: "" }]
    });
  };

  const removeInterviewer = (index: number) => {
    const newList = formData.interviewers.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, interviewers: newList.length > 0 ? newList : [{ name: "", designation: "", email: "" }] });
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.scheduledAt) {
      alert("Please select a scheduled time");
      return;
    }
    
    // Filter out empty interviewers
    const filteredInterviewers = formData.interviewers.filter((i: any) => i.name.trim() !== "");
    
    onConfirm({
      ...formData,
      interviewers: filteredInterviewers,
      // Ensure scores are numbers or null
      overallScore: formData.overallScore ? Number(formData.overallScore) : null,
      technicalScore: formData.technicalScore ? Number(formData.technicalScore) : null,
      communicationScore: formData.communicationScore ? Number(formData.communicationScore) : null,
      duration: formData.duration ? Number(formData.duration) : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{round ? 'Update Interview Round' : 'Add Interview Round'}</DialogTitle>
          <DialogDescription>
            {round ? `Updating ${round.roundLabel || `Round ${round.roundNumber}`}` : 'Schedule a new interview round'} for {candidateName}.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roundLabel">Round Label</Label>
                <Input 
                  id="roundLabel" 
                  placeholder="e.g. Technical Round 1" 
                  value={formData.roundLabel}
                  onChange={(e) => setFormData({ ...formData, roundLabel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select 
                  value={formData.interviewType} 
                  onValueChange={(val) => setFormData({ ...formData, interviewType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                    <SelectItem value="Panel">Panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled At</Label>
                <Input 
                  id="scheduledAt" 
                  type="datetime-local" 
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetLink">Meeting Link (Online Only)</Label>
                <Input 
                  id="meetLink" 
                  placeholder="https://meet.google.com/..." 
                  value={formData.extraData?.meetLink || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    extraData: { ...formData.extraData, meetLink: e.target.value } 
                  })}
                />
              </div>
            </div>

            {/* Interviewers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" /> Interviewers
                </Label>
                <Button variant="ghost" size="sm" onClick={addInterviewer} className="h-7 text-[10px] uppercase tracking-wider font-bold text-blue-600">
                  <Plus className="h-3 w-3 mr-1" /> Add Interviewer
                </Button>
              </div>
              <div className="space-y-3">
                {formData.interviewers.map((interviewer: any, index: number) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-100 relative group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <User className="h-3 w-3" /> Name
                        </div>
                        <Input 
                          placeholder="Name" 
                          value={interviewer.name} 
                          className="h-8 text-xs"
                          onChange={(e) => handleInterviewerChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <Briefcase className="h-3 w-3" /> Designation
                        </div>
                        <Input 
                          placeholder="Designation" 
                          value={interviewer.designation} 
                          className="h-8 text-xs"
                          onChange={(e) => handleInterviewerChange(index, 'designation', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <Mail className="h-3 w-3" /> Email
                        </div>
                        <Input 
                          placeholder="Email" 
                          value={interviewer.email} 
                          className="h-8 text-xs"
                          onChange={(e) => handleInterviewerChange(index, 'email', e.target.value)}
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

            {/* Results Section (only if updating or completing) */}
            {round && (
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Round Outcome & Feedback
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Round Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(val) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                        <SelectItem value="No Show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="result">Result</Label>
                    <Select 
                      value={formData.result} 
                      onValueChange={(val) => setFormData({ ...formData, result: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Selected">Selected</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Next Round">Next Round</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overallScore">Overall (1-10)</Label>
                    <Input 
                      id="overallScore" 
                      type="number" 
                      min="0" max="10"
                      value={formData.overallScore || ""}
                      onChange={(e) => setFormData({ ...formData, overallScore: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technicalScore">Technical (1-10)</Label>
                    <Input 
                      id="technicalScore" 
                      type="number" 
                      min="0" max="10"
                      value={formData.technicalScore || ""}
                      onChange={(e) => setFormData({ ...formData, technicalScore: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communicationScore">Comm. (1-10)</Label>
                    <Input 
                      id="communicationScore" 
                      type="number" 
                      min="0" max="10"
                      value={formData.communicationScore || ""}
                      onChange={(e) => setFormData({ ...formData, communicationScore: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="strengths">Strengths</Label>
                    <Textarea 
                      id="strengths" 
                      placeholder="What were the candidate's strengths?" 
                      value={formData.strengths}
                      onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areasOfImprovement">Areas of Improvement</Label>
                    <Textarea 
                      id="areasOfImprovement" 
                      placeholder="Where could the candidate improve?" 
                      value={formData.areasOfImprovement}
                      onChange={(e) => setFormData({ ...formData, areasOfImprovement: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Detailed Feedback</Label>
                  <Textarea 
                    id="feedback" 
                    placeholder="Provide full interview feedback..." 
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any internal notes for recruiters..." 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter className="p-6">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
            {isUpdating ? "Saving..." : (round ? "Update Round" : "Schedule Round")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
