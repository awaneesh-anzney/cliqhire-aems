"use client";

import { useEffect, useState } from "react";
import {
  getClientTimeline,
  getClientSubStageHistory,
  ClientStageHistory,
  ClientSubStageHistory,
} from "@/services/clientService";
import {
  Loader2,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Users,
  FileText,
  ChevronDown,
  Handshake,
  Layers,
  History,
  GitCommit,
} from "lucide-react";
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
      return <Phone className="w-3.5 h-3.5 text-blue-500" />;
    case "whatsapp":
      return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
    case "linkedin":
      return <Users className="w-3.5 h-3.5 text-sky-600" />;
    case "email":
      return <Mail className="w-3.5 h-3.5 text-amber-500" />;
    case "meeting":
      return <Users className="w-3.5 h-3.5 text-purple-500" />;
    case "data update":
      return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    case "negotiation":
      return <Handshake className="w-3.5 h-3.5 text-indigo-500" />;
    case "proposal sent":
      return <FileText className="w-3.5 h-3.5 text-rose-500" />;
    default:
      return <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />;
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
        const [data, subData] = await Promise.all([
          getClientTimeline(clientId),
          getClientSubStageHistory(clientId).catch(() => []),
        ]);
        setTimeline(data || []);
        setSubStageTimeline(subData || []);
      } catch (error) {
        console.error("Failed to fetch timeline:", error);
        toast.error("Failed to load client timeline");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, [clientId]);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Loading Timeline...
        </p>
      </div>
    );
  }

  if (timeline.length === 0 && subStageTimeline.length === 0) {
    return (
      <div className="border border-dashed rounded-xl p-12 text-center flex flex-col items-center bg-card shadow-2xs">
        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mb-3 text-muted-foreground">
          <Calendar className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-foreground">No Timeline Available</h4>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          This client does not have any stage history or activity progression recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Stage & Journey Progress</h3>
            <p className="text-xs text-muted-foreground">Historical progression and stage transition logs</p>
          </div>
        </div>
      </div>

      {/* Sub-Stage Progression Stream */}
      {subStageTimeline.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              Sub-Stage Transitions
            </h4>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subStageTimeline.map((row) => {
              const userName =
                typeof row.changedBy === "object"
                  ? `${row.changedBy.firstName || ""} ${row.changedBy.lastName || ""}`.trim() || "User"
                  : "Unknown";

              return (
                <div
                  key={row._id}
                  className="bg-card border border-border/70 rounded-xl p-3.5 shadow-2xs space-y-2 relative"
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
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              Stage History & Activities
            </h4>
          </div>

          <div className="space-y-3">
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
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
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
                        <Clock className="w-3.5 h-3.5" />
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
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {/* Collapsible Body */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/40 space-y-3 bg-muted/10">
                      {period.reason && (
                        <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-0.5 border border-border/60">
                          <span className="font-bold text-foreground uppercase text-[10px] tracking-wider">
                            Reason for Transition
                          </span>
                          <p className="text-muted-foreground">{period.reason}</p>
                        </div>
                      )}

                      {/* Activities Section */}
                      <div className="space-y-2.5">
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