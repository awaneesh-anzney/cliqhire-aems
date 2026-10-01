"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CircularProgress from "@mui/material/CircularProgress";
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
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <CircularProgress size={32} thickness={4} sx={{ color: "primary.main" }} />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loading Activities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BoltOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Activities & Follow-ups</h3>
            <p className="text-xs text-muted-foreground">Recent communications, calls, and pending tasks</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <AddOutlinedIcon sx={{ fontSize: 15, mr: 0.5 }} /> Log Activity
            </Button>
          </DialogTrigger>
          <CreateActivityModal
            clientId={clientId}
            onClose={() => setIsDialogOpen(false)}
            onActivityCreated={fetchActivities}
          />
        </Dialog>
      </div>

      {/* Events Timeline */}
      {timelineEvents.length === 0 ? (
        <div className="bg-card rounded-xl border border-dashed border-border p-10 text-center max-w-lg mx-auto">
          <BoltOutlinedIcon sx={{ fontSize: 32 }} className="text-muted-foreground/50 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-foreground">No Activities Recorded</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Log notes, calls, emails, or meetings with this client to track progress.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold"
            onClick={() => setIsDialogOpen(true)}
          >
            <AddOutlinedIcon sx={{ fontSize: 15, mr: 0.5 }} /> Log First Activity
          </Button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-3.5 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
          {timelineEvents.map((event) => {
            if (event._type === "activity") {
              const activity = event;
              return (
                <div key={`act-${activity._id}`} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-3 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20" />

                  <div className="bg-card rounded-xl border border-border/70 p-3.5 shadow-2xs hover:border-primary/40 transition-colors space-y-2">
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
                            <AccessTimeOutlinedIcon sx={{ fontSize: 12, opacity: 0.7 }} />
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
                      "rounded-xl border p-3.5 shadow-2xs transition-colors space-y-2",
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
                                "text-[10px] font-bold flex items-center gap-1",
                                isCompleted && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                isPending && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                isCancelled && "bg-destructive/10 text-destructive border-destructive/20",
                              )}
                            >
                              {isCompleted && <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 13 }} />}
                              {isPending && <WarningAmberOutlinedIcon sx={{ fontSize: 13 }} />}
                              {isCancelled && <CancelOutlinedIcon sx={{ fontSize: 13 }} />}
                              <span>{fol.status} Follow-up</span>
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <AccessTimeOutlinedIcon sx={{ fontSize: 12, opacity: 0.7 }} />
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
                                <MoreHorizOutlinedIcon sx={{ fontSize: 16 }} />
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
                                <EditOutlinedIcon sx={{ fontSize: 14, mr: 1 }} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedFollowUpId(fol._id);
                                  setSelectedFollowUpData(fol);
                                  setCancelModalOpen(true);
                                }}
                              >
                                <DeleteOutlineOutlinedIcon sx={{ fontSize: 15, mr: 1 }} /> Cancel
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