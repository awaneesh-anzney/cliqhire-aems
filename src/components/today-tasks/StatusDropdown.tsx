import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown } from "lucide-react";

export type JobStatus = "To-do" | "In Progress" | "Completed";

const statusColors: Record<JobStatus, string> = {
  'To-do': "bg-muted text-foreground",
  'In Progress': "bg-blue-100 text-blue-800",
  'Completed': "bg-green-100 text-green-800",
}

const statuses: JobStatus[] = [
  'To-do',
  'In Progress',
  'Completed'
]

interface StatusDropdownProps {
  currentStatus: JobStatus;
  onStatusChange: (newStatus: JobStatus) => void;
  jobTitle: string;
}

export function StatusDropdown({ currentStatus, onStatusChange, jobTitle }: StatusDropdownProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);

  const handleStatusSelect = (newStatus: JobStatus) => {
    if (newStatus === currentStatus) return;
    
    setPendingStatus(newStatus);
    setIsAlertOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (pendingStatus) {
      onStatusChange(pendingStatus);
    }
    setIsAlertOpen(false);
    setPendingStatus(null);
  };

  const handleCancelStatusChange = () => {
    setIsAlertOpen(false);
    setPendingStatus(null);
  };

  const handleClick = (statusOption: JobStatus) => {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      handleStatusSelect(statusOption);
    };
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-auto p-0 hover:bg-transparent"
          >
            <Badge 
              variant="secondary" 
              className={`${statusColors[currentStatus]} border-none flex items-center gap-1`}
            >
              {currentStatus}
              <ChevronDown className="h-3 w-3" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {statuses.map((statusOption) => (
            <DropdownMenuItem
              key={statusOption}
              onClick={handleClick(statusOption)}
              className="flex items-center gap-2"
            >
              <Badge 
                variant="secondary" 
                className={`${statusColors[statusOption]} border-none`}
              >
                {statusOption}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
            Are you sure you want to change the status of <strong>{`"${jobTitle}"`}</strong> from{" "}
              <Badge className={`${statusColors[currentStatus]} border-none`}>{currentStatus}</Badge> to{" "}
              <Badge className={`${statusColors[pendingStatus!]} border-none`}>{pendingStatus}</Badge>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelStatusChange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
