"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statuses = [
  "Active",
  "Inactive", 
  "Shortlisted",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn"
] as const;

const statusColors = {
 Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  Shortlisted: "bg-blue-100 text-blue-800",
  Interviewing: "bg-yellow-100 text-yellow-800",
  Offer: "bg-purple-100 text-purple-800",
  Hired: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-800",
  Withdrawn: "bg-orange-100 text-orange-800",
} as const;

type CandidateStatus = keyof typeof statusColors;

interface CandidateStatusBadgeProps {
  id?: string;
  status: CandidateStatus;
  onStatusChange?: (id: string, newStatus: CandidateStatus) => void;
  disabled?: boolean;
}

export function CandidateStatusBadge({ id, status, onStatusChange, disabled }: CandidateStatusBadgeProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<CandidateStatus | null>(null);

  if (!onStatusChange || disabled) {
    return (
      <Badge variant="secondary" className={`${statusColors[status]} border-none`}>
        {status}
      </Badge>
    );
  }

  const handleStatusSelect = (id: string | undefined, option: CandidateStatus) => {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      if (id) {
        setPendingStatus(option);
        setShowConfirmDialog(true);
      } else {
        console.error("Cannot change status: id is undefined");
      }
    };
  };

  const handleConfirmStatusChange = () => {
    if (id && pendingStatus && onStatusChange) {
      onStatusChange(id, pendingStatus);
      setShowConfirmDialog(false);
      setPendingStatus(null);
    }
  };

  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingStatus(null);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent candidate-status-badge">
            <Badge
              variant="secondary"
              className={`${statusColors[status]} border-none flex items-center gap-1`}
            >
              {status}
              <ChevronDown className="h-3 w-3" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {statuses.map((statusOption) => (
            <DropdownMenuItem
              key={statusOption}
              onClick={handleStatusSelect(id, statusOption)}
              data-testid={`status-option-${statusOption}`}
              className="flex items-center gap-2"
            >
              <Badge
                variant="secondary"
                className={`${statusColors[statusOption]} border-none text-black`}
              >
                {statusOption}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the candidate status from{" "}
              <span className="font-medium">{status}</span> to{" "}
              <span className="font-medium">{pendingStatus}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelStatusChange();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmStatusChange();
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
