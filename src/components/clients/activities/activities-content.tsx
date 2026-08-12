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

interface ActivitiesContentProps {
  clientId: string;
}

export function ActivitiesContent({ clientId }: ActivitiesContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Follow-up completion modal state
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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground font-medium">Loading activity stream...</p>
      </div>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center border border-dashed rounded-xl bg-card/50 my-6">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No activities logged</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Keep track of client interactions by creating your first activity or follow-up.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
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
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Activity Timeline</h2>
          <p className="text-xs text-muted-foreground">Recent interactions and scheduled follow-ups</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
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

      {/* Modern Vertical Timeline */}
      <div className="relative space-y-2 ">
        {timelineEvents.map((event) => {
          if (event._type === "activity") {
            const activity = event;
            return (
              <div key={`act-${activity._id}`} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-4 h-4 w-4 rounded-full border-2 border-background bg-blue-500 ring-4 ring-background" />

                <div className="bg-card rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold text-xs">
                          {activity.createdBy?.firstName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {activity.createdBy?.firstName} {activity.createdBy?.lastName}
                          </span>
                          <Badge variant="outline" className="text-xs font-normal border-blue-200 text-blue-700 bg-blue-50/50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            Activity
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {activity.activityDate
                            ? formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })
                            : "Recently"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-medium mb-3 text-foreground">
                    {activity.discussionSummary || "No summary provided"}
                  </h3>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground pt-3 border-t bg-muted/20 -mx-5 -mb-5 p-3 rounded-b-xl">
                    {activity.activityDate && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">Date:</span>
                        <span>
                          {format(new Date(activity.activityDate), "MMM dd, yyyy")} {activity.activityTime}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-foreground">Type:</span> {activity.activityType}
                    </div>
                    {activity.mode && (
                      <div>
                        <span className="font-medium text-foreground">Mode:</span> {activity.mode}
                      </div>
                    )}
                    {activity.outcome && (
                      <div>
                        <span className="font-medium text-foreground">Outcome:</span> {activity.outcome}
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
                  className={`absolute -left-[31px] top-4 h-4 w-4 rounded-full border-2 border-background ring-4 ring-background ${
                    isCompleted ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-destructive"
                  }`}
                />

                <div
                  className={`rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-md ${
                    isPending ? "bg-amber-50/30 border-amber-200/60 dark:bg-amber-950/10 dark:border-amber-900/40" : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {(isCompleted ? fol.completedBy?.firstName?.[0] : fol.owner?.firstName?.[0]) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {isCompleted
                              ? `${fol.completedBy?.firstName} ${fol.completedBy?.lastName}`
                              : fol.owner
                              ? `${fol.owner?.firstName} ${fol.owner?.lastName}`
                              : "Unassigned"}
                          </span>
                          <Badge
                            variant={isCompleted ? "default" : isPending ? "secondary" : "destructive"}
                            className={`text-xs gap-1 ${
                              isCompleted
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : isPending
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : ""
                            }`}
                          >
                            {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                            {isPending && <AlertCircle className="h-3 w-3" />}
                            {isCancelled && <XCircle className="h-3 w-3" />}
                            {fol.status} Follow-up
                          </Badge>
                          {fol.attempts && (
                            <Badge variant="outline" className="text-[10px] font-normal px-1.5 bg-muted/50">
                              Attempt #{fol.attempts}
                            </Badge>
                          )}
                          {fol.stageAtTime && (
                            <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border">
                              Stage: {fol.stageAtTime}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {fol.createdAt ? `Created ${formatDistanceToNow(new Date(fol.createdAt), { addSuffix: true })}` : ""}
                        </span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                          onClick={() => {
                            setSelectedFollowUpId(fol._id);
                            setCompleteModalOpen(true);
                          }}
                        >
                          Complete
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
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
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedFollowUpId(fol._id);
                                setCancelModalOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-2 text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Scheduled for: {fol.scheduledDate ? format(new Date(fol.scheduledDate), "MMM dd, yyyy") : "TBD"}
                      </h4>
                      {fol.notes && <p className="text-sm text-muted-foreground mt-1.5 pl-6">{fol.notes}</p>}
                    </div>

                    {isCompleted && (
                      <div className="mt-3 bg-muted/40 p-3 rounded-lg text-xs space-y-2 border">
                        {fol.completionReason && (
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary mb-2">
                            {fol.completionReason}
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium text-foreground">Completion Notes: </span>
                            <span className="text-muted-foreground">{fol.completionNotes || "None"}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-muted-foreground pt-2 border-t">
                          <div>
                            <span className="font-medium text-foreground">Completed:</span>{" "}
                            {fol.completionDate ? format(new Date(fol.completionDate), "MMM dd, yyyy") : "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Logged:</span>{" "}
                            {fol.completedAt ? format(new Date(fol.completedAt), "MMM dd, yyyy p") : "N/A"}
                          </div>
                        </div>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="mt-3 bg-destructive/10 p-3 rounded-lg text-xs border border-destructive/20 text-destructive">
                        <span className="font-semibold">Cancel Reason: </span>
                        {fol.cancelReason || "No reason provided"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>

      {selectedFollowUpId && (
        <>
          <CompleteFollowUpModal
            clientId={clientId}
            followUpId={selectedFollowUpId}
            open={completeModalOpen}
            onOpenChange={(open) => {
              setCompleteModalOpen(open);
              if (!open) setSelectedFollowUpId(null);
            }}
            onSuccess={fetchActivities}
          />
          <EditFollowUpModal
            clientId={clientId}
            followUpId={selectedFollowUpId}
            open={editModalOpen}
            onOpenChange={(open) => {
              setEditModalOpen(open);
              if (!open) {
                setSelectedFollowUpId(null);
                setSelectedFollowUpData(null);
              }
            }}
            currentDate={selectedFollowUpData?.scheduledDate}
            currentOwnerId={selectedFollowUpData?.owner?._id || selectedFollowUpData?.owner}
            currentNotes={selectedFollowUpData?.notes}
            onSuccess={fetchActivities}
          />
          <CancelFollowUpModal
            clientId={clientId}
            followUpId={selectedFollowUpId}
            open={cancelModalOpen}
            onOpenChange={(open) => {
              setCancelModalOpen(open);
              if (!open) setSelectedFollowUpId(null);
            }}
            onSuccess={fetchActivities}
          />
        </>
      )}
    </div>
  );
}