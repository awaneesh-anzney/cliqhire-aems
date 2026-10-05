"use client";

import React, { useEffect, useState } from "react";
import {
  getClientTimeline,
  getClientSubStageHistory,
  ClientStageHistory,
  ClientSubStageHistory,
} from "@/services/clientService";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface TimelineContentProps {
  clientId: string;
}

const getActivityIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "call":
      return <PhoneOutlinedIcon sx={{ fontSize: 15, color: "#2563EB" }} />;
    case "whatsapp":
      return <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 15, color: "#10B981" }} />;
    case "linkedin":
      return <PeopleAltOutlinedIcon sx={{ fontSize: 15, color: "#0077B5" }} />;
    case "email":
      return <EmailOutlinedIcon sx={{ fontSize: 15, color: "#F59E0B" }} />;
    case "meeting":
      return <PeopleAltOutlinedIcon sx={{ fontSize: 15, color: "#8B5CF6" }} />;
    case "data update":
      return <DescriptionOutlinedIcon sx={{ fontSize: 15, color: "#64748B" }} />;
    case "negotiation":
      return <HandshakeOutlinedIcon sx={{ fontSize: 15, color: "#6366F1" }} />;
    case "proposal sent":
      return <DescriptionOutlinedIcon sx={{ fontSize: 15, color: "#F43F5E" }} />;
    default:
      return <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />;
  }
};

export function TimelineContent({ clientId }: TimelineContentProps) {
  const [timeline, setTimeline] = useState<ClientStageHistory[]>([]);
  const [subStageTimeline, setSubStageTimeline] = useState<ClientSubStageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setIsLoading(true);
        const [timelineData, subStageData] = await Promise.all([
          getClientTimeline(clientId),
          getClientSubStageHistory(clientId),
        ]);
        setTimeline(timelineData || []);
        setSubStageTimeline(subStageData || []);
      } catch (error) {
        console.error("Failed to fetch timeline:", error);
        toast.error("Failed to load timeline");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, [clientId]);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <CircularProgress size={32} thickness={4} sx={{ color: "primary.main" }} />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loading Timeline...</p>
      </div>
    );
  }

  if (timeline.length === 0 && subStageTimeline.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-dashed border-border p-10 text-center max-w-lg mx-auto">
        <TimelineOutlinedIcon sx={{ fontSize: 32 }} className="text-muted-foreground/50 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-foreground">No Timeline Records</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Stage progressions and communication history will be logged here as activities occur.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <TimelineOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Stage & Journey Progress</h3>
            <p className="text-xs text-muted-foreground">Historical progression and stage transition logs</p>
          </div>
        </div>
      </div>

      {/* Sub-Stage Progression Stream */}
      {subStageTimeline.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <LayersOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
            <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              Sub-Stage Transitions
            </h4>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {subStageTimeline.map((row) => {
              const userName =
                typeof row.changedBy === "object"
                  ? `${row.changedBy.firstName || ""} ${row.changedBy.lastName || ""}`.trim() || "User"
                  : "Unknown";

              return (
                <div
                  key={row._id}
                  className="bg-card border border-border/70 rounded-xl p-3 shadow-2xs space-y-1.5 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground truncate">{row.subStage}</span>
                    {row.channel && (
                      <span className="p-1 rounded-md bg-muted/60 shrink-0" title={row.channel}>
                        {getActivityIcon(row.channel)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <p>Sent: {row.sentDate ? format(new Date(row.sentDate), "MMM d, yyyy") : "—"}</p>
                    <p className="text-[10px] text-muted-foreground/70">
                      By {userName} • {format(new Date(row.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Stage History Timeline */}
      {timeline.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <HistoryOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
            <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              Stage History & Activities
            </h4>
          </div>

          <div className="space-y-2.5">
            {timeline.map((period, index) => {
              const isCurrent = index === 0;
              const isExpanded = expandedItems.has(index);

              return (
                <div
                  key={period._id || index}
                  className={cn(
                    "border border-border/70 bg-card rounded-xl shadow-2xs transition-all duration-200 overflow-hidden",
                    isCurrent && "border-primary/40 ring-1 ring-primary/20",
                  )}
                >
                  {/* Collapsible Header */}
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">Stage: {period.stage}</h4>
                        {isCurrent && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                            Current Stage
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AccessTimeOutlinedIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                        {period.startedAt ? format(new Date(period.startedAt), "MMM d, yyyy") : "Unknown"}
                        {period.endedAt ? ` – ${format(new Date(period.endedAt), "MMM d, yyyy")}` : " – Ongoing"}
                      </p>
                      {period.closureSummary && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          &quot;{period.closureSummary}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="hidden sm:inline font-semibold bg-muted/70 px-2.5 py-1 rounded-md text-[11px]">
                        {period.activityCount || 0} activities
                      </span>
                      <KeyboardArrowDownOutlinedIcon
                        sx={{ fontSize: 18 }}
                        className={cn(
                          "shrink-0 transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {/* Collapsible Body */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-border/40 space-y-2.5 bg-muted/10">
                      {period.reason && (
                        <div className="bg-muted/40 p-2.5 rounded-lg text-xs space-y-0.5 border border-border/60">
                          <span className="font-bold text-foreground uppercase text-[10px] tracking-wider">
                            Reason for Transition
                          </span>
                          <p className="text-muted-foreground">{period.reason}</p>
                        </div>
                      )}

                      {/* Activities Section */}
                      <div className="space-y-2">
                        {period.activities && period.activities.length > 0 ? (
                          period.activities.map((activity: any) => (
                            <div
                              key={activity._id}
                              className="p-3 rounded-xl border border-border/60 bg-card space-y-1.5 text-xs shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="p-1 rounded-md bg-muted/60">
                                    {getActivityIcon(activity.activityType)}
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {activity.activityType}
                                  </span>
                                  {activity.isMeeting && (
                                    <Badge variant="outline" className="text-[10px] py-0 h-4 font-semibold">
                                      Meeting
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-muted-foreground text-[11px]">
                                  {activity.activityDate && format(new Date(activity.activityDate), "MMM d, yyyy")}
                                </span>
                              </div>

                              <p className="text-muted-foreground leading-relaxed pl-6">
                                {activity.discussionSummary}
                              </p>

                              {(activity.activityType === "Negotiation" ||
                                activity.activityType === "Proposal Sent") &&
                                activity.negotiationDetails && (
                                  <div className="flex flex-wrap gap-2 pl-6 pt-1">
                                    {activity.negotiationDetails.dealValue && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-primary/10 text-primary border-primary/20 text-[10px]"
                                      >
                                        Value: SAR {activity.negotiationDetails.dealValue}
                                      </Badge>
                                    )}
                                    {activity.negotiationDetails.negotiationStatus && (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-[10px] font-semibold",
                                          activity.negotiationDetails.negotiationStatus === "Agreed" &&
                                            "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30",
                                          activity.negotiationDetails.negotiationStatus === "Stuck" &&
                                            "text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950/30",
                                        )}
                                      >
                                        Status: {activity.negotiationDetails.negotiationStatus}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic py-1">
                            No activities recorded during this stage.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}