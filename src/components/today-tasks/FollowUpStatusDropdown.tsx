import React, { useState } from "react";
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
import { 
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface FollowUpStatusDropdownProps {
  currentStatus: "pending" | "in-progress" | "completed";
  onStatusChange: (status: "pending" | "in-progress" | "completed") => void;
  taskTitle: string;
}

export function FollowUpStatusDropdown({ 
  currentStatus, 
  onStatusChange, 
  taskTitle 
}: FollowUpStatusDropdownProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"pending" | "in-progress" | "completed" | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-foreground hover:bg-muted';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      default:
        return 'bg-muted text-foreground hover:bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-3 h-3" />;
      case 'in-progress':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Pending';
    }
  };

  const handleStatusSelect = (newStatus: "pending" | "in-progress" | "completed") => {
    if (newStatus === currentStatus) return;
    
    setPendingStatus(newStatus);
    setIsDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (pendingStatus) {
      onStatusChange(pendingStatus);
    }
    setIsDialogOpen(false);
    setPendingStatus(null);
  };

  const handleCancelStatusChange = () => {
    setIsDialogOpen(false);
    setPendingStatus(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`${getStatusColor(currentStatus)} cursor-pointer flex items-center gap-1 transition-colors border-0 hover:opacity-80`}
          >
            {getStatusIcon(currentStatus)}
            {getStatusLabel(currentStatus)}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleStatusSelect('pending')}
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span>Pending</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusSelect('in-progress')}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span>In Progress</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusSelect('completed')}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Completed</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of `@quot;{taskTitle}@quot;` from{" "}
              <span className="font-medium">{getStatusLabel(currentStatus)}</span> to{" "}
              <span className="font-medium">{pendingStatus ? getStatusLabel(pendingStatus) : ''}</span>?
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
