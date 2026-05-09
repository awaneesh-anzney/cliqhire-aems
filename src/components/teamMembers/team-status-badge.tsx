"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ChevronDown, RefreshCcw } from "lucide-react";
import { TeamMemberStatus } from "@/types/teamMember";
import { updateTeamMemberStatus } from "@/services/teamMembersService";

interface TeamMemberStatusBadgeProps {
  id: string;
  status: TeamMemberStatus;
  onStatusChange?: (id: string, status: TeamMemberStatus) => void;
  disabled?: boolean;
}

const statusOptions: {
  value: TeamMemberStatus;
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
}[] = [
  { value: "Active", label: "Active", variant: "default" },
  { value: "Inactive", label: "Inactive", variant: "secondary" },
  { value: "On Leave", label: "On Leave", variant: "outline" },
  { value: "Terminated", label: "Terminated", variant: "destructive" },
];

export function TeamMemberStatusBadge({
  id,
  status,
  onStatusChange,
  disabled = false,
}: TeamMemberStatusBadgeProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TeamMemberStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentStatus = statusOptions.find((option) => option.value === status);

  const statusClasses: Record<TeamMemberStatus, string> = {
    Active: "bg-green-100 text-green-800 border-green-200",
    Inactive: "bg-muted text-foreground border-border",
    "On Leave": "bg-amber-100 text-amber-800 border-amber-200",
    Terminated: "bg-red-100 text-red-800 border-red-200",
  };

  const handleStatusChange = (newStatus: TeamMemberStatus) => {
    if (newStatus === status) return;

    setPendingStatus(newStatus);
    setError(null);
    setShowConfirmDialog(true);
  };

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: TeamMemberStatus) => updateTeamMemberStatus(id, newStatus),
    onSuccess: async (updatedTeamMember) => {
      try {
        // Let parent update cache optimistically if provided
        if (onStatusChange) {
          onStatusChange(id, updatedTeamMember.status);
        }
      } finally {
        // Always revalidate the list to pull fresh data
        await queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      }
    },
    onError: (err: any) => {
      console.error("Error updating team member status:", err);
      setError(err?.message || "Failed to update team member status");
    },
    onSettled: () => {
      setIsUpdating(false);
      setShowConfirmDialog(false);
      setPendingStatus(null);
    }
  });

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    setIsUpdating(true);
    setError(null);
    await updateStatusMutation.mutateAsync(pendingStatus);
  };

  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingStatus(null);
    setError(null);
  };

  if (disabled) {
    return (
      <Badge variant={currentStatus?.variant || "default"}>{currentStatus?.label || status}</Badge>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent" disabled={isUpdating}>
            <Badge
              variant={status === "Terminated" ? "destructive" : "outline"}
              className={`cursor-pointer hover:opacity-80 ${statusClasses[status]}`}
            >
              {currentStatus?.label || status}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={option.value === status || isUpdating}
              className="cursor-pointer"
            >
              <Badge
                variant={option.value === "Terminated" ? "destructive" : "outline"}
                className={`${statusClasses[option.value]} mr-2`}
              >
                {option.label}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Team Member Status</AlertDialogTitle>
            <AlertDialogDescription>
              {error ? (
                <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-md">{error}</div>
              ) : (
                `Are you sure you want to change the team member status from "${status}" to "${pendingStatus}"?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelStatusChange}>
              {error ? "Close" : "Cancel"}
            </AlertDialogCancel>
            {!error && (
              <AlertDialogAction onClick={handleConfirmStatusChange} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
