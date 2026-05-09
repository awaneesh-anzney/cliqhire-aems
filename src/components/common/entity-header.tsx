"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EntityHeaderProps {
  title: string;
  subtitle?: string;
  location?: string;
  tags?: string[];
  status?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode; // For custom actions or extra content
}

export function EntityHeader({
  title,
  subtitle,
  location,
  tags = [],
  status,
  actions,
  children,
}: EntityHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4 bg-muted/30 px-4 py-2 rounded-sm border-b">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          {status && (
            <span className="ml-2 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-medium">{status}</span>
          )}
        </div>
        {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        {location && <div className="text-xs text-muted-foreground flex items-center gap-1">{location}</div>}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag) => (
              <span key={tag} className="bg-muted text-foreground rounded px-2 py-0.5 text-xs font-medium">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 md:mt-0">
        {actions}
        {children}
      </div>
    </div>
  );
}

export default EntityHeader;
