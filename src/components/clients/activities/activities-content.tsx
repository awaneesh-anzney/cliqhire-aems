"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare } from "lucide-react";
import { CreateActivityModal } from "./create-activity";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { getClientActivities, getClientFollowUps } from "@/services/clientService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CompleteFollowUpModal } from "@/components/todo/CompleteFollowUpModal";
import { EditFollowUpModal } from "@/components/clients/modals/edit-follow-up-modal";
import { CancelFollowUpModal } from "@/components/clients/modals/cancel-follow-up-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivitiesContentProps {
  clientId: string;
}

export function ActivitiesContent({ clientId }: ActivitiesContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);
  const [selectedFollowUpData, setSelectedFollowUpData] = useState<any>(null);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const [activitiesRes, followUpsRes] = await Promise.all([
        getClientActivities(clientId),
        getClientFollowUps(clientId),
      ]);

      const actList = (activitiesRes.data || []).map((a: any) => ({ ...a, _type: "activity" }));
      const folList = (followUpsRes.data || []).map((f: any) => ({ ...f, _type: "followup" }));

      const combined = [...actList, ...folList].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setTimelineEvents(combined);
    } catch (error) {
      console.error("Failed to fetch activities", error);
      toast.error("Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loading Activity Stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Activities & Follow-ups</h3>
              <Badge variant="outline" className="h-5 px-1.5 text-xs font-bold bg-primary/10 text-primary border-primary/20">
                {timelineEvents.length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Historical interactions and scheduled pending tasks</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Activity
            </Button>
          </DialogTrigger>
          <CreateActivityModal
            clientId={clientId}
            onActivityCreated={fetchActivities}
            onClose={() => setIsDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Timeline Stream */}
      {timelineEvents.length === 0 ? (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center">
          <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center mb-3 text-muted-foreground">
            <Calendar className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-foreground">No Activities Logged</h4>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Keep track of client meetings, emails, and follow-ups by logging an activity.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm" className="text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Log First Activity
          </Button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
          {timelineEvents.map((event) => {
            if (event._type === "activity") {
              const activity = event;
              return (
                <div key={`act-${activity._id}`} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-3 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20" />

                  <div className="bg-card rounded-xl border border-border/70 p-4 shadow-2xs hover:border-primary/40 transition-colors space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            {activity.createdBy?.firstName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-foreground">
                              {activity.createdBy?.firstName} {activity.createdBy?.lastName}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20">
                              {activity.activityType || "Activity"}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {activity.activityDate
                              ? formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })
                              : "Recently"}
                          </span>
                        </div>
                      </div>

                      {activity.activityDate && (
                        <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                          {format(new Date(activity.activityDate), "MMM dd, yyyy")} {activity.activityTime}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-foreground font-medium">
                      {activity.discussionSummary || "No summary provided"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                      {activity.mode && (
                        <div>
                          <span className="font-semibold text-foreground">Channel:</span> {activity.mode}
                        </div>
                      )}
                      {activity.outcome && (
                        <div>
                          <span className="font-semibold text-foreground">Outcome:</span> {activity.outcome}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            if (event._type === "followup") {
              const fol = event;
              const isCompleted = fol.status === "Completed";
              const isCancelled = fol.status === "Cancelled";
              const isPending = fol.status === "Pending";

              return (
                <div key={`fol-${fol._id}`} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={cn(
                      "absolute -left-6 sm:-left-8 top-3 h-3.5 w-3.5 rounded-full border-2 border-background ring-2",
                      isCompleted && "bg-emerald-500 ring-emerald-500/20",
                      isPending && "bg-amber-500 ring-amber-500/20",
                      isCancelled && "bg-destructive ring-destructive/20",
                    )}
                  />

                  <div
                    className={cn(
                      "rounded-xl border p-4 shadow-2xs transition-colors space-y-2.5",
                      isPending ? "bg-amber-500/5 border-amber-500/30" : "bg-card border-border/70",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            {(isCompleted ? fol.completedBy?.firstName?.[0] : fol.owner?.firstName?.[0]) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-foreground">
                              {isCompleted
                                ? `${fol.completedBy?.firstName || ""} ${fol.completedBy?.lastName || ""}`
                                : fol.owner
                                  ? `${fol.owner?.firstName || ""} ${fol.owner?.lastName || ""}`
                                  : "Unassigned"}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-bold",
                                isCompleted && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                isPending && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                isCancelled && "bg-destructive/10 text-destructive border-destructive/20",
                              )}
                            >
                              {isCompleted && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {isPending && <AlertCircle className="h-3 w-3 mr-1" />}
                              {isCancelled && <XCircle className="h-3 w-3 mr-1" />}
                              {fol.status} Follow-up
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {fol.createdAt ? formatDistanceToNow(new Date(fol.createdAt), { addSuffix: true }) : ""}
                          </span>
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                            onClick={() => {
                              setSelectedFollowUpId(fol._id);
                              setCompleteModalOpen(true);
                            }}
                          >
                            Complete
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedFollowUpId(fol._id);
                                  setSelectedFollowUpData(fol);
                                  setEditModalOpen(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedFollowUpId(fol._id);
                                  setSelectedFollowUpData(fol);
                                  setCancelModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>

                    {fol.note && <p className="text-xs text-foreground font-medium">{fol.note}</p>}

                    {fol.scheduledDate && (
                      <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                        <span className="font-semibold text-foreground">Scheduled For:</span>{" "}
                        {format(new Date(fol.scheduledDate), "MMM dd, yyyy")}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Completion Modal */}
      {selectedFollowUpId && (
        <CompleteFollowUpModal
          open={completeModalOpen}
          onOpenChange={(open) => {
            setCompleteModalOpen(open);
            if (!open) setSelectedFollowUpId(null);
          }}
          clientId={clientId}
          followUpId={selectedFollowUpId}
          onSuccess={fetchActivities}
        />
      )}

      {/* Edit Modal */}
      {selectedFollowUpId && (
        <EditFollowUpModal
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) {
              setSelectedFollowUpId(null);
              setSelectedFollowUpData(null);
            }
          }}
          clientId={clientId}
          followUpId={selectedFollowUpId}
          currentNotes={selectedFollowUpData?.note}
          onSuccess={fetchActivities}
        />
      )}

      {/* Cancel Modal */}
      {selectedFollowUpId && (
        <CancelFollowUpModal
          open={cancelModalOpen}
          onOpenChange={(open) => {
            setCancelModalOpen(open);
            if (!open) {
              setSelectedFollowUpId(null);
              setSelectedFollowUpData(null);
            }
          }}
          clientId={clientId}
          followUpId={selectedFollowUpId}
          onSuccess={fetchActivities}
        />
      )}
    </div>
  );
}