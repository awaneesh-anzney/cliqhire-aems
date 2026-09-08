"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface JobTabTriggerProps {
  value: string;
  icon: ReactNode;
  label: string;
  count?: number;
  className?: string;
}

export function JobTabTrigger({ value, icon, label, count, className }: JobTabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-medium rounded-md text-muted-foreground",
        "transition-all duration-150 shrink-0 cursor-pointer select-none",
        "hover:text-foreground hover:bg-muted/60",
        "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:border data-[state=active]:border-border/70",
        className
      )}
    >
      <span className="shrink-0 text-muted-foreground [&>svg]:size-3.5 group-data-[state=active]:text-primary">
        {icon}
      </span>
      <span>{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
          {count}
        </span>
      )}
    </TabsTrigger>
  );
}