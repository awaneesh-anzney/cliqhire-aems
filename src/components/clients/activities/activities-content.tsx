"use client";

import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateActivityModal } from "./create-activity";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { getClientActivities, ClientActivity } from "@/services/clientService";
import { toast } from "sonner";

interface ActivitiesContentProps {
  clientId: string;
}

export function ActivitiesContent({ clientId }: ActivitiesContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await getClientActivities(clientId);
      setActivities(response.data || []);
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

  if (activities.length === 0) {
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
        {activities.map((activity) => (
          <div key={activity._id} className="bg-card rounded-lg border p-4">
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
                {activity.outcome && (
                  <div>
                    <span className="text-muted-foreground">Outcome:</span>
                    <span className="ml-2">{activity.outcome}</span>
                  </div>
                )}
                {activity.stageAtTime && (
                  <div>
                    <span className="text-muted-foreground">Stage at Time:</span>
                    <span className="ml-2">{activity.stageAtTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}