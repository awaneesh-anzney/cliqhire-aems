"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

const stageStatuses = [
  "Calls",
  "Profile Sent",
  "Contract Sent",
  "Attended a meeting",
  "Replied to a message",
  "Contract Negotiation",
] as const

type ClientStageStatus = (typeof stageStatuses)[number]

const stageStatusColors: Record<ClientStageStatus, string> = {
  "Calls": "bg-blue-100 text-blue-800",
  "Profile Sent": "bg-purple-100 text-purple-800",
  "Contract Sent": "bg-yellow-100 text-foreground",
  "Attended a meeting": "bg-indigo-100 text-indigo-800",
  "Replied to a message": "bg-muted text-foreground",
  "Contract Negotiation": "bg-green-100 text-green-800",
} as const

interface ClientStageStatusBadgeProps {
  id?: string;
  status: ClientStageStatus;
  stage: "Lead" | "Engaged" | "Signed";
  onStatusChange?: (id: string, newStatus: ClientStageStatus) => void;
  disabled?: boolean;
}

export function ClientStageStatusBadge({ id, status, stage, onStatusChange, disabled = false }: ClientStageStatusBadgeProps) {
  if (stage !== "Engaged" || disabled) {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">
        N/A
      </Badge>
    );
  }

  if (!onStatusChange || disabled) {
    const currentStatusColor = (stageStatusColors as any)[status] || "bg-muted text-foreground";
    return (
      <Badge variant="secondary" className={`${currentStatusColor} border-none`}>
        {status || "N/A"}
      </Badge>
    )
  }

  const handleClick = (id: string | undefined, option: ClientStageStatus) => {
    return (event: React.MouseEvent) => {
      event.stopPropagation()
      if (id && onStatusChange) {
        onStatusChange(id, option)
      } else {
        console.error('Cannot change status: id is undefined or onStatusChange is not provided')
      }
    }
  }

  const currentStatusColor = (stageStatusColors as any)[status] || "bg-muted text-foreground";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-0 hover:bg-transparent"
        >
          <Badge 
            variant="secondary" 
            className={`${currentStatusColor} border-none flex items-center gap-1`}
          >
            {status || "Select Status"}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {stageStatuses.map((statusOption) => (
          <DropdownMenuItem
            key={statusOption}
            onClick={handleClick(id, statusOption)}
            className="flex items-center gap-2"
          >
            <Badge 
              variant="secondary" 
              className={`${stageStatusColors[statusOption]} border-none`}
            >
              {statusOption}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
