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

export type ConnectionType = "LinkedIn" | "Indeed" | "Referral" | "Direct" | "Other";

const connectionColors: Record<ConnectionType, string> = {
  'LinkedIn': "bg-blue-100 text-blue-800 border-blue-200",
  'Indeed': "bg-purple-100 text-purple-800 border-purple-200",
  'Referral': "bg-green-100 text-green-800 border-green-200",
  'Direct': "bg-orange-100 text-orange-800 border-orange-200",
  'Other': "bg-muted text-foreground border-border"
};

const connectionTypes: ConnectionType[] = [
  'LinkedIn',
  'Indeed',
  'Referral',
  'Direct',
  'Other'
];

interface ConnectionBadgeProps {
  connection: ConnectionType | null;
  onConnectionChange?: (newConnection: ConnectionType) => void;
  isReadOnly?: boolean;
}

export function ConnectionBadge({ 
  connection, 
  onConnectionChange, 
  isReadOnly = false 
}: ConnectionBadgeProps) {
  const handleClick = (connectionOption: ConnectionType) => {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      if (onConnectionChange) {
        onConnectionChange(connectionOption);
      }
    };
  };

  // If no connection is set, show a placeholder
  if (!connection) {
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
              Set Connection
              <ChevronDown className="h-3 w-3" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {connectionTypes.map((connectionOption) => (
            <DropdownMenuItem
              key={connectionOption}
              onClick={handleClick(connectionOption)}
              className="flex items-center gap-2"
            >
              <Badge 
                variant="secondary" 
                className={`${connectionColors[connectionOption]} border-none`}
              >
                {connectionOption}
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
        className={`${connectionColors[connection]} border-none`}
      >
        {connection}
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
            className={`${connectionColors[connection]} border-none flex items-center gap-1`}
          >
            {connection}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {connectionTypes.map((connectionOption) => (
          <DropdownMenuItem
            key={connectionOption}
            onClick={handleClick(connectionOption)}
            className="flex items-center gap-2"
          >
            <Badge 
              variant="secondary" 
              className={`${connectionColors[connectionOption]} border-none`}
            >
              {connectionOption}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
