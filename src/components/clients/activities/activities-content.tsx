"use client";

import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateActivityModal } from "./create-activity";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { getClientActivities, getClientFollowUps, ClientActivity } from "@/services/clientService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CompleteFollowUpModal } from "@/components/todo/CompleteFollowUpModal";

interface ActivitiesContentProps {
  clientId: string;
}

export function ActivitiesContent({ clientId }: ActivitiesContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Follow-up completion modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const [activitiesRes, followUpsRes] = await Promise.all([
        getClientActivities(clientId),
        getClientFollowUps(clientId)
      ]);
      
      const actList = (activitiesRes.data || []).map((a: any) => ({ ...a, _type: 'activity' }));
      const folList = (followUpsRes.data || []).map((f: any) => ({ ...f, _type: 'followup' }));
      
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-240px)]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="mt-4 text-sm text-muted-foreground">Loading activities...</p>
      </div>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-240px)]">
        <div className="w-48 h-48 mb-6">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <rect x="40" y="60" width="120" height="100" rx="8" fill="#F3F4F6"/>
            <rect x="40" y="60" width="120" height="30" rx="8" fill="#3B82F6" fillOpacity="0.1"/>
            <line x1="40" y1="100" x2="160" y2="100" stroke="#E5E7EB" strokeWidth="1"/>
            <line x1="40" y1="120" x2="160" y2="120" stroke="#E5E7EB" strokeWidth="1"/>
            <line x1="40" y1="140" x2="160" y2="140" stroke="#E5E7EB" strokeWidth="1"/>
            <rect x="90" y="130" width="20" height="20" rx="4" fill="#3B82F6" fillOpacity="0.2"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No activities yet</h3>
        <p className="text-muted-foreground text-center mb-8">
          All scheduled activities will be displayed here once added.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add activity
            </Button>
          </DialogTrigger>
          <CreateActivityModal clientId={clientId} onActivityCreated={fetchActivities} onClose={() => setIsDialogOpen(false)} />
        </Dialog>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <CreateActivityModal clientId={clientId} onActivityCreated={fetchActivities} onClose={() => setIsDialogOpen(false)} />
        </Dialog>
      </div>

      <div className="space-y-4">
        {timelineEvents.map((event) => {
          if (event._type === 'activity') {
            const activity = event;
            return (
              <div key={`act-${activity._id}`} className="bg-card rounded-lg border p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-blue-500">
                      <AvatarFallback>{activity.createdBy?.firstName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {activity.createdBy?.firstName} {activity.createdBy?.lastName}
                        </span>
                        <Badge variant="outline">Activity</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {activity.activityDate 
                          ? formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">{activity.discussionSummary || "No summary provided"}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    {activity.activityDate && (
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="ml-2">{new Date(activity.activityDate).toLocaleDateString()} {activity.activityTime}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2">{activity.activityType}</span>
                    </div>
                    {activity.mode && (
                      <div>
                        <span className="text-muted-foreground">Mode:</span>
                        <span className="ml-2">{activity.mode}</span>
                      </div>
                    )}
                    {activity.outcome && (
                      <div>
                        <span className="text-muted-foreground">Outcome:</span>
                        <span className="ml-2">{activity.outcome}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (event._type === 'followup') {
            const fol = event;
            const isCompleted = fol.status === "Completed";
            const isCancelled = fol.status === "Cancelled";
            const isPending = fol.status === "Pending";
            
            return (
              <div key={`fol-${fol._id}`} className={`rounded-lg border p-4 ${isPending ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-card'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-brand">
                      <AvatarFallback>{(isCompleted ? fol.completedBy?.firstName?.[0] : fol.owner?.firstName?.[0]) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isCompleted ? `${fol.completedBy?.firstName} ${fol.completedBy?.lastName}` : (fol.owner ? `${fol.owner?.firstName} ${fol.owner?.lastName}` : 'Unassigned')}
                        </span>
                        <Badge 
                          variant={isCompleted ? "default" : isPending ? "secondary" : "destructive"}
                          className={isCompleted ? "bg-green-500 hover:bg-green-600" : isPending ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-500 hover:bg-gray-600"}
                        >
                          {fol.status} Follow-up
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {fol.createdAt ? `Created ${formatDistanceToNow(new Date(fol.createdAt), { addSuffix: true })}` : ""}
                      </span>
                    </div>
                  </div>
                  {isPending && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      onClick={() => {
                        setSelectedFollowUpId(fol._id);
                        setCompleteModalOpen(true);
                      }}
                    >
                      Complete
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="border-l-2 border-brand/20 pl-4 py-1">
                    <h3 className="font-medium text-lg">
                      Scheduled for: {fol.scheduledDate ? new Date(fol.scheduledDate).toLocaleDateString() : "TBD"}
                    </h3>
                    {fol.notes && <p className="text-sm text-muted-foreground mt-1">{fol.notes}</p>}
                  </div>

                  {isCompleted && (
                    <div className="mt-4 bg-muted/30 p-3 rounded-md border">
                      <h4 className="font-medium mb-1">Completion Notes:</h4>
                      <p className="text-sm">{fol.completionNotes}</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t">
                        <div>
                          <span className="font-medium">Completed on:</span> 
                          {fol.completionDate ? new Date(fol.completionDate).toLocaleDateString() : "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Logged at:</span> 
                          {fol.completedAt ? new Date(fol.completedAt).toLocaleString() : ""}
                        </div>
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="mt-4 bg-muted/30 p-3 rounded-md border border-red-200 dark:border-red-900/30">
                      <h4 className="font-medium mb-1 text-red-600 dark:text-red-400">Cancel Reason:</h4>
                      <p className="text-sm">{fol.cancelReason || "No reason provided"}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>
      
      {selectedFollowUpId && (
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
      )}
    </div>
  );
}