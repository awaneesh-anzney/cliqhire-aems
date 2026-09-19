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
        "group flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-md",
        "text-foreground/80 dark:text-foreground/85",
        "transition-all duration-150 shrink-0 cursor-pointer select-none",
        "hover:text-foreground hover:bg-muted/70",
        "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:shadow-xs data-[state=active]:border data-[state=active]:border-border/80",
        className
      )}
    >
      <span className="shrink-0 [&>svg]:size-3.5 transition-colors">
        {icon}
      </span>
      <span className="tracking-tight">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-muted text-[10px] font-bold text-foreground/80 group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary">
          {count}
        </span>
      )}
    </TabsTrigger>
  );
}