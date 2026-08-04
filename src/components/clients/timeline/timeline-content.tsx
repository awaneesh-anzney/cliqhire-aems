"use client";

import { useEffect, useState } from "react";
import { getClientTimeline, ClientStageHistory } from "@/services/clientService";
import { Loader2, Calendar, Clock, MessageSquare, Phone, Mail, Users, FileText, CheckCircle2, ChevronDown, Handshake } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface TimelineContentProps {
  clientId: string;
}

const getActivityIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'call': return <Phone className="w-4 h-4 text-blue-500" />;
    case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-500" />;
    case 'linkedin': return <Users className="w-4 h-4 text-blue-700" />;
    case 'email': return <Mail className="w-4 h-4 text-orange-500" />;
    case 'meeting': return <Users className="w-4 h-4 text-purple-500" />;
    case 'data update': return <FileText className="w-4 h-4 text-gray-500" />;
    case 'negotiation': return <Handshake className="w-4 h-4 text-brand" />;
    case 'proposal sent': return <FileText className="w-4 h-4 text-red-500" />;
    default: return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
  }
};

export function TimelineContent({ clientId }: TimelineContentProps) {
  const [timeline, setTimeline] = useState<ClientStageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setIsLoading(true);
        const data = await getClientTimeline(clientId);
        setTimeline(data || []);
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
    setExpandedItems(prev => {
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
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
          Loading Timeline...
        </p>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="bg-card rounded-3xl border-2 border-dashed border-border p-20 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <Calendar className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-black text-foreground">No Timeline Available</h3>
        <p className="text-muted-foreground text-sm font-semibold max-w-sm mx-auto mt-2 mb-8">
          This client does not have any stage history yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-3xl p-8 space-y-6 animate-in fade-in duration-500 min-h-[600px] flex flex-col">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            Client Stage Timeline
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            Stage progression and activities
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="w-full space-y-4">
          {timeline.map((period, index) => {
            const userName = period.changedBy?.name || period.changedBy?.firstName || "System User";
            const isCurrent = index === 0;
            const isExpanded = expandedItems.has(index);

            return (
              <div key={period._id || index} className="border bg-card rounded-xl px-4 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full py-4 flex flex-1 items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-t-xl"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-foreground">Stage: {period.stage}</h3>
                      {isCurrent && <Badge variant="secondary" className="bg-brand/10 text-brand">Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {period.startedAt ? format(new Date(period.startedAt), "MMM d, yyyy") : 'Unknown'} 
                      {period.endedAt ? ` – ${format(new Date(period.endedAt), "MMM d, yyyy")}` : ' – Ongoing'}
                    </p>
                    {period.closureSummary && (
                      <p className="text-xs text-muted-foreground italic mt-2">&quot;{period.closureSummary}&quot;</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mr-2">
                    <span>{period.activityCount || 0} activities</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
                  </div>
                </button>
                
                <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isExpanded ? "max-h-[2000px] opacity-100 mb-6" : "max-h-0 opacity-0")}>
                  <div className="pt-2">
                    {period.reason && (
                      <div className="mb-6 bg-muted/50 p-4 rounded-lg">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Reason for Stage Change</h4>
                        <p className="text-sm text-foreground">{period.reason}</p>
                      </div>
                    )}

                    <div className="space-y-4 pl-2">
                      {period.activities && period.activities.length > 0 ? (
                        period.activities.map((activity: any) => (
                          <div key={activity._id} className="relative pl-6 before:absolute before:left-[11px] before:top-8 before:bottom-[-16px] before:w-px before:bg-border last:before:hidden">
                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center z-10">
                              {getActivityIcon(activity.activityType)}
                            </div>
                            <div className="bg-muted/30 rounded-xl p-4 border border-border">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-bold text-foreground">{activity.activityType}</span>
                                  {activity.isMeeting && <Badge variant="outline" className="ml-2 text-[10px]">Meeting</Badge>}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                  {activity.activityDate && format(new Date(activity.activityDate), "MMM d, yyyy")}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{activity.discussionSummary}</p>
                              
                              {(activity.activityType === "Negotiation" || activity.activityType === "Proposal Sent") && activity.negotiationDetails && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {activity.negotiationDetails.dealValue && (
                                    <Badge variant="secondary" className="bg-brand/10 text-brand border-brand/20">
                                      Deal Value: SAR {activity.negotiationDetails.dealValue}
                                    </Badge>
                                  )}
                                  {activity.negotiationDetails.negotiationStatus && (
                                    <Badge variant="outline" className={cn(
                                      activity.negotiationDetails.negotiationStatus === 'Agreed' ? 'text-green-600 border-green-200 bg-green-50' : '',
                                      activity.negotiationDetails.negotiationStatus === 'Stuck' ? 'text-red-600 border-red-200 bg-red-50' : '',
                                    )}>
                                      Status: {activity.negotiationDetails.negotiationStatus}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic pl-6">No activities recorded in this stage yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
