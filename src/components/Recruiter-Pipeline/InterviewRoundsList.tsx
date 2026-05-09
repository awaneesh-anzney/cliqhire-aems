"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  Phone, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  ExternalLink,
  MessageSquare,
  Award,
  BarChart3,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InterviewRound } from "./dummy-data";
import { formatDateTimeForDisplay } from "./pipeline-stage-details/stage-fields";

interface InterviewRoundsListProps {
  rounds: InterviewRound[];
  onAddRound: () => void;
  onEditRound: (round: InterviewRound) => void;
  canModify?: boolean;
}

export function InterviewRoundsList({
  rounds,
  onAddRound,
  onEditRound,
  canModify = true
}: InterviewRoundsListProps) {
  const [expandedRounds, setExpandedRounds] = useState<Record<string, boolean>>({});

  const toggleRound = (round: any) => {
    const roundId = round._id || round.id;
    setExpandedRounds(prev => ({
      ...prev,
      [roundId]: !prev[roundId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "Scheduled": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Rescheduled": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "No Show": return "bg-muted text-foreground border-border";
      default: return "bg-muted text-foreground border-border";
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case "Selected": return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">Selected</Badge>;
      case "Rejected": return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-0">Rejected</Badge>;
      case "Next Round": return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0">Next Round</Badge>;
      case "On Hold": return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">On Hold</Badge>;
      case "Pending": return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
      default: return null;
    }
  };

  const getInterviewIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "video": return <Video className="h-4 w-4" />;
      case "phone": return <Phone className="h-4 w-4" />;
      case "in-person": return <MapPin className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-500" />
          Interview Rounds ({rounds.length})
        </h3>
        {canModify && (
          <Button 
            onClick={onAddRound} 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Round
          </Button>
        )}
      </div>

      {rounds.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No interview rounds scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round, index) => {
            const roundId = (round as any)._id || (round as any).id;
            const isExpanded = expandedRounds[roundId] || (index === rounds.length - 1 && Object.keys(expandedRounds).length === 0);
            
            return (
              <Card key={roundId} className={`overflow-hidden border transition-all ${isExpanded ? 'ring-1 ring-blue-100 shadow-md' : 'hover:border-border'}`}>
                <div 
                  className={`p-3 cursor-pointer flex items-center justify-between ${isExpanded ? 'bg-blue-50/30' : 'bg-card'}`}
                  onClick={() => toggleRound(round)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-foreground shadow-sm">
                      {round.roundNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{round.roundLabel || `Round ${round.roundNumber}`}</span>
                        <Badge variant="outline" className={`text-[10px] py-0 h-4 ${getStatusColor(round.status)}`}>
                          {round.status}
                        </Badge>
                        {getResultBadge(round.result)}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDateTimeForDisplay(round.scheduledAt)}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          {getInterviewIcon(round.interviewType)}
                          {round.interviewType}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canModify && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRound(round);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="p-4 bg-card border-t border-border space-y-4">
                    {/* Scores Section */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted p-2.5 rounded-lg border border-border">
                        <div className="flex items-center gap-1.5 mb-1">
                          <BarChart3 className="h-3 w-3 text-blue-500" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overall</span>
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {round.overallScore !== undefined && round.overallScore !== null ? `${round.overallScore}/10` : '—'}
                        </div>
                      </div>
                      <div className="bg-muted p-2.5 rounded-lg border border-border">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Brain className="h-3 w-3 text-purple-500" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Technical</span>
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {round.technicalScore !== undefined && round.technicalScore !== null ? `${round.technicalScore}/10` : '—'}
                        </div>
                      </div>
                      <div className="bg-muted p-2.5 rounded-lg border border-border">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquare className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Comm.</span>
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {round.communicationScore !== undefined && round.communicationScore !== null ? `${round.communicationScore}/10` : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Interviewers */}
                    {round.interviewers && round.interviewers.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interviewers</h4>
                        <div className="flex flex-wrap gap-2">
                          {round.interviewers.map((interviewer, i) => (
                            <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                              <User className="h-3 w-3" />
                              {interviewer.name}
                              <span className="text-[10px] text-blue-400 font-normal">({interviewer.designation})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths & Improvements */}
                    {(round.strengths || round.areasOfImprovement) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Strengths
                          </h4>
                          <p className="text-xs text-foreground leading-relaxed bg-emerald-50/30 p-2 rounded border border-emerald-50">
                            {round.strengths || 'Not provided'}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Improvement Areas
                          </h4>
                          <p className="text-xs text-foreground leading-relaxed bg-amber-50/30 p-2 rounded border border-amber-50">
                            {round.areasOfImprovement || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Reschedule Reason */}
                    {round.status === "Rescheduled" && round.rescheduleReason && (
                      <div className="space-y-1.5 bg-orange-50/50 p-2 rounded border border-orange-100">
                        <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Reschedule Reason
                        </h4>
                        <p className="text-xs text-orange-700 leading-relaxed italic">
                          &quot;{round.rescheduleReason}&quot;
                        </p>
                      </div>
                    )}

                    {/* Feedback */}
                    {round.feedback && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Feedback</h4>
                        <p className="text-xs text-foreground leading-relaxed bg-muted p-2 rounded italic">
                          &quot;{round.feedback}&quot;
                        </p>
                      </div>
                    )}

                    {/* Extra Data / Links */}
                    {round.extraData?.meetLink && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meeting Link:</span>
                        <a 
                          href={round.extraData.meetLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Join Interview <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>Added by:</span>
                        <span className="font-medium text-muted-foreground">{round.addedBy?.name || 'Unknown'}</span>
                      </div>
                      {round.lastEditedBy && (
                        <div className="flex items-center gap-1">
                          <span>Last edited by:</span>
                          <span className="font-medium text-muted-foreground">{round.lastEditedBy.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
