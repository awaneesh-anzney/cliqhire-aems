"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initiallyCollapsed?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  initiallyCollapsed = true,
  className = "",
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  return (
    <div className={`bg-card rounded-lg border shadow-sm ${className}`}>
      <div className="flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-auto"
        >
          {isCollapsed ? 
            <>
              Show Complete Details
              <ChevronRight className="h-4 w-4" /> 
            </>
          : 
            <>
              Hide Complete Details
              <ChevronDown className="h-4 w-4" />
            </>
          }
        </Button>
      </div>
      {!isCollapsed && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
