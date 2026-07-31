"use client";

import { useEffect, useState } from "react";
import { getClientTimeline, ClientStageHistory } from "@/services/clientService";
import { Loader2, Calendar, Clock, User, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TimelineContentProps {
  clientId: string;
}

export function TimelineContent({ clientId }: TimelineContentProps) {
  const [timeline, setTimeline] = useState<ClientStageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="bg-muted/30 rounded-3xl p-8 space-y-10 animate-in fade-in duration-500 min-h-[600px] flex flex-col">
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

      <div className="flex-1 relative space-y-12">
        {timeline.map((period, index) => {
          const userName = period.changedBy?.name || period.changedBy?.firstName || "System User";
          const userInitials = userName.substring(0, 2).toUpperCase();

          return (
            <div key={period._id} className="relative group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="absolute left-[-22px] top-4 w-5 h-5 rounded-full border-4 border-border flex items-center justify-center shadow-lg bg-brand z-20 text-white">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>

              <div className="absolute left-[-13px] top-9 bottom-[-48px] w-0.5 bg-border z-10 hidden md:block" />

              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm ml-4">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Stage: {period.stage}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(period.startedAt), "PPP")}
                      {period.endedAt && (
                        <>
                          <span className="text-muted-foreground/50">→</span>
                          {format(new Date(period.endedAt), "PPP")}
                        </>
                      )}
                    </p>
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-border">
                    <AvatarFallback className="bg-muted text-xs font-black">{userInitials}</AvatarFallback>
                  </Avatar>
                </div>

                {period.reason && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Reason</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{period.reason}</p>
                  </div>
                )}

                {period.closureSummary && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Closure Summary</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg italic text-foreground/80">"{period.closureSummary}"</p>
                  </div>
                )}

                {period.activities && period.activities.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-brand" />
                      Activities in this stage ({period.activityCount})
                    </h4>
                    <div className="space-y-3">
                      {period.activities.map(activity => (
                        <div key={activity._id} className="bg-muted/30 rounded-lg p-3 text-sm flex items-start justify-between">
                          <div>
                            <span className="font-semibold">{activity.activityType}</span>
                            <p className="text-muted-foreground text-xs mt-1">{activity.discussionSummary}</p>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground/70 whitespace-nowrap">
                            {activity.activityDate && format(new Date(activity.activityDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
