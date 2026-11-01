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

const getStageColor = (s?: string) => {
  if (!s) return "bg-muted text-foreground";
  const normalized = s.toLowerCase();
  if (normalized === "signed") return "bg-green-100 text-green-800";
  if (normalized === "engaged") return "bg-yellow-100 text-foreground";
  if (normalized === "lead") return "bg-blue-100 text-blue-800";
  return (stageColors as any)[s] || "bg-muted text-foreground";
};

const stages: (keyof typeof stageColors)[] = ["Lead", "Engaged", "Signed"];

const stageColors = {
  Lead: "bg-blue-100 text-blue-800",
  Engaged: "bg-yellow-100 text-foreground",
  Signed: "bg-green-100 text-green-800",
} as const;

interface ClientStageBadgeProps {
  id?: string;
  stage: keyof typeof stageColors;
  onStageChange?: (id: string, newStage: keyof typeof stageColors) => void;
  disabled?: boolean;
}

export function ClientStageBadge({ id, stage, onStageChange, disabled = false }: ClientStageBadgeProps) {
  if (!onStageChange || disabled) {
    const currentStageColor = getStageColor(stage);
    return (
      <Badge variant="secondary" className={`${currentStageColor} border-none`}>
        {stage}
      </Badge>
    );
  }

  const handleClick = (id: string | undefined, option: keyof typeof stageColors) => {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      if (id && onStageChange) {
        setTimeout(() => {
          onStageChange(id, option);
        }, 0);
      } else {
        console.error("Cannot change stage: id is undefined or onStageChange is not provided");
      }
    };
  };

  const currentStageColor = getStageColor(stage);
  return (
    <DropdownMenu modal={true}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Badge
            variant="secondary"
            className={`${currentStageColor} border-none flex items-center gap-1`}
          >
            {stage}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {stages.map((stageOption) => (
          <DropdownMenuItem
            key={stageOption}
            onClick={handleClick(id, stageOption)}
            data-testid={`stage-option-${stageOption}`}
            className="flex items-center gap-2"
          >
            <Badge
              variant="secondary"
              className={`${stageColors[stageOption]} border-none text-black`}
            >
              {stageOption}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
