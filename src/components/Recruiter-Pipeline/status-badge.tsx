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

// Define status types for each stage
export type SourcingStatus = "Pending" | "Connections Sent" | "Connections Accepted" | "CV Received" | "Disqualified";
export type ScreeningStatus = "AEMS Interview" | "Submission Pending" | "CV Submitted" | "Disqualified";
export type ClientScreeningStatus = "Pending" | "Client Shortlisted" | "Disqualified";
export type InterviewStatus = "Pending" | "Client Interviewed" | "Client Selected" | "Disqualified";
export type VerificationStatus = "Document Pending" | "Document Verified" | "Offer Letter Sent" | "Offer Accepted" | "Offer Rejected" | "Disqualified";
export type OnboardingStatus = "Pending" | "Completed";
export type StatusType = SourcingStatus | ScreeningStatus | ClientScreeningStatus | InterviewStatus | VerificationStatus | OnboardingStatus;


// Status options for each stage
const statusOptions: Record<string, StatusType[]> = {
  "Sourcing": ["Pending", "Connections Sent", "Connections Accepted", "CV Received", "Disqualified"],
  "Screening": ["AEMS Interview", "Submission Pending", "CV Submitted", "Disqualified"],
  "Client Review": ["Pending", "Client Shortlisted", "Disqualified"],
  "Interview": ["Pending", "Client Interviewed", "Client Selected", "Disqualified"],
  "Verification": ["Document Pending", "Document Verified", "Offer Letter Sent", "Offer Accepted", "Offer Rejected", "Disqualified"],
  "Onboarding": ["Pending", "Completed"],
};

// Status colors
const statusColors: Record<StatusType, string> = {
  // Sourcing statuses
  "Pending": "bg-muted text-foreground border-border",
  "Connections Sent": "bg-blue-100 text-blue-800 border-blue-200",
  "Connections Accepted": "bg-green-100 text-green-800 border-green-200",
  "CV Received": "bg-purple-100 text-purple-800 border-purple-200",
  
  // Screening statuses
  "Submission Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "CV Submitted": "bg-green-100 text-green-800 border-green-200",
  "AEMS Interview": "bg-blue-100 text-blue-800 border-blue-200",
  
  // Client Review statuses
  "Client Shortlisted": "bg-green-100 text-green-800 border-green-200",

  
  // Interview statuses
  "Client Interviewed": "bg-blue-100 text-blue-800 border-blue-200",
  "Client Selected": "bg-green-100 text-green-800 border-green-200",
  // Onboarding statuses
  "Completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
  
  // Verification statuses
  "Document Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Document Verified": "bg-green-100 text-green-800 border-green-200",
  "Offer Letter Sent": "bg-blue-100 text-blue-800 border-blue-200",
  "Offer Accepted": "bg-green-100 text-green-800 border-green-200",
  "Offer Rejected": "bg-red-100 text-red-800 border-red-200",
  
  // Disqualified status (available for all stages except Hired and Onboarding)
  "Disqualified": "bg-red-100 text-red-800 border-red-200"
};

// Additional generic statuses for headhunter
const genericStatusColors: Record<string, string> = {
  "Pending": "bg-muted text-foreground border-border",
  "Submitted": "bg-blue-100 text-blue-800 border-blue-200",
  "Accepted": "bg-green-100 text-green-800 border-green-200",
  "Rejected": "bg-red-100 text-red-800 border-red-200",
};

// Display label mapper to keep underlying values intact while changing UI labels
const getDisplayLabel = (status: StatusType | string) => {
  switch (status) {
    case "Connections Sent":
      return "Communications Sent";
    case "Connections Accepted":
      return "Communications Acknowledged";
    case "Client Shortlisted":
      // Existing UX choice to display shorter label
      return "Shortlisted";
    default:
      return status as string;
  }
};

interface StatusBadgeProps {
  status: string | null;
  stage: string;
  onStatusChange?: (newStatus: string) => void;
  isReadOnly?: boolean;
  allowedStatuses?: string[];
}

export function StatusBadge({ 
  status, 
  stage,
  onStatusChange, 
  isReadOnly = false,
  allowedStatuses,
}: StatusBadgeProps) {
  const availableStatuses = allowedStatuses ?? (statusOptions[stage] || []);
  // Default status mapping for stages with default "Pending"
  const defaultStatusByStage: Record<string, StatusType | undefined> = {
    "Sourcing": "Pending",
    "Client Review": "Pending",
    "Interview": "Pending",
    "Onboarding": "Pending",
  };

  const effectiveStatus = (status ?? defaultStatusByStage[stage]) || null;

  const handleClick = (statusOption: string) => {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      if (onStatusChange) {
        onStatusChange(statusOption);
      }
    };
  };

  // If no explicit status is set and there's no default, show a placeholder
  if (!effectiveStatus) {
    if (isReadOnly) {
      return (
        <Badge 
          variant="secondary" 
          className="bg-muted text-muted-foreground border-border"
        >
          Not set
        </Badge>
      );
    }

    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-auto p-0 hover:bg-transparent"
          >
            <Badge 
              variant="secondary" 
              className="bg-muted text-muted-foreground border-border flex items-center gap-1"
            >
              Set Status
              <ChevronDown className="h-3 w-3" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {availableStatuses.map((statusOption) => (
            <DropdownMenuItem
              key={statusOption}
              onClick={handleClick(statusOption)}
              className="flex items-center gap-2"
            >
              <Badge 
                variant="secondary" 
                className={`${statusColors[statusOption as StatusType] || genericStatusColors[statusOption] || "bg-muted text-foreground border-border"} border-none`}
              >
                {getDisplayLabel(statusOption)}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If read-only, just show the badge without dropdown
  if (isReadOnly) {
    return (
      <Badge 
        variant="secondary" 
        className={`${statusColors[effectiveStatus as StatusType] || genericStatusColors[effectiveStatus] || "bg-muted text-foreground border-border"} border-none`}
      >
        {getDisplayLabel(effectiveStatus)}
      </Badge>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-0 hover:bg-transparent"
        >
        <Badge 
          variant="secondary" 
          className={`${statusColors[effectiveStatus as StatusType] || genericStatusColors[effectiveStatus] || "bg-muted text-foreground border-border"} border-none flex items-center gap-1`}
        >
          {getDisplayLabel(effectiveStatus)}
          <ChevronDown className="h-3 w-3" />
        </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {availableStatuses.map((statusOption) => (
          <DropdownMenuItem
            key={statusOption}
            onClick={handleClick(statusOption)}
            className="flex items-center gap-2"
          >
            <Badge 
              variant="secondary" 
              className={`${statusColors[statusOption as StatusType] || genericStatusColors[statusOption] || "bg-muted text-foreground border-border"} border-none`}
            >
              {getDisplayLabel(statusOption)}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
