"use client";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Job, JobStage } from "@/types/job"
import { ChevronDown } from "lucide-react"

const stageColors: Record<JobStage, string> = {
  'Open': "bg-yellow-100 text-yellow-800",
  'Onboarding': "bg-indigo-100 text-indigo-800",
  'Active': "bg-green-100 text-green-800",
  'Hired': "bg-green-100 text-green-800",
  'On Hold': "bg-gray-100 text-gray-800",
  'Closed': "bg-red-100 text-red-800",
}

const stages: JobStage[] = [
  'Open',
  'Active',
  'Onboarding',
  'Hired',
  'On Hold',
  'Closed'
]

interface JobStageBadgeProps {
  stage: JobStage
  onStageChange: (newStage: JobStage) => void
  disabled?: boolean
}



export function JobStageBadge({ stage, onStageChange, disabled }: JobStageBadgeProps) {

  if (disabled) {
    return (
      <Badge 
        variant="secondary" 
        className={`${stageColors[stage]} border-none flex items-center gap-1`}
      >
        {stage}
      </Badge>
    );
  }

    const handleClick = (stageOption : any)=>{
          return (event: React.MouseEvent) => {
      event.stopPropagation();
      if (onStageChange) {
        onStageChange(stageOption);
      } else {
        console.error("Cannot change stage: id is undefined or onStageChange is not provided");
      }
    };
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
            className={`${stageColors[stage]} border-none flex items-center gap-1`}
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
            onClick={handleClick(stageOption)}
            className="flex items-center gap-2"
          >
            <Badge 
              variant="secondary" 
              className={`${stageColors[stageOption]} border-none`}
            >
              {stageOption}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}