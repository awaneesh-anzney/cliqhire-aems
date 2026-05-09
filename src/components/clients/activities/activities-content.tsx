"use client"

import { Button } from "@/components/ui/button"
import { Plus, MoreVertical, Lock, Pencil, Trash2, Share2 } from "lucide-react"
import { useState } from "react"
import { CreateActivityModal } from "./create-activity"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  title: string
  date: string
  relatedTo: string
  assignedTo: string
  type: string
  duration: string
  isPrivate?: boolean
  author: {
    name: string
    avatar: string
  }
}

interface ActivitiesContentProps {
  clientId: string;
}

export function ActivitiesContent({ clientId }: ActivitiesContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      title: "Initial client meeting",
      date: "2025-04-05T09:00:00Z",
      relatedTo: "Anzney",
      assignedTo: "AEMS",
      type: "Meeting",
      duration: "15 Minutes",
      author: {
        name: "AEMS",
        avatar: "AE"
      }
    }
  ])

  const handleEdit = (activityId: string) => {
  }

  const handleDelete = (activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId))
  }

  const handleShare = (activityId: string) => {
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-240px)]">
        <div className="w-48 h-48 mb-6">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
          >
            <rect x="40" y="60" width="120" height="100" rx="8" fill="#F3F4F6"/>
            <rect x="40" y="60" width="120" height="30" rx="8" fill="#3B82F6" fillOpacity="0.1"/>
            <line x1="40" y1="100" x2="160" y2="100" stroke="#E5E7EB" strokeWidth="1"/>
            <line x1="40" y1="120" x2="160" y2="120" stroke="#E5E7EB" strokeWidth="1"/>
            <line x1="40" y1="140" x2="160" y2="140" stroke="#E5E7EB" strokeWidth="1"/>
            <rect x="90" y="130" width="20" height="20" rx="4" fill="#3B82F6" fillOpacity="0.2"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">You have not scheduled any activities yet</h3>
        <p className="text-muted-foreground text-center mb-8">
          All scheduled activities will be displayed on this page once the first activity has been scheduled.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add activity
            </Button>
          </DialogTrigger>
          <CreateActivityModal />
        </Dialog>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-card rounded-lg border p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 bg-blue-500">
                  <AvatarFallback>{activity.author.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.author.name}</span>
                    {activity.isPrivate && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                  </span>
                </div>
              </div>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleEdit(activity.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(activity.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare(activity.id)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with guest
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">{activity.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2">{new Date(activity.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2">{activity.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Related to:</span>
                  <span className="ml-2">{activity.relatedTo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned to:</span>
                  <span className="ml-2">{activity.assignedTo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2">{activity.type}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <CreateActivityModal />
      </Dialog>
    </div>
  )
}