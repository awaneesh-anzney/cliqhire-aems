"use client";

import { TabsList } from "@/components/ui/tabs";
import { 
  FileText, 
  Users, 
  Users2, 
  MessageSquare, 
  Paperclip, 
  History
} from "lucide-react";
import { JobTabTrigger } from "./tab-trigger";

export function JobTabsList() {
  return (
    <div className="w-full border-b border-border/70 bg-muted/30 dark:bg-muted/15 px-2 sm:px-4 py-1 shrink-0 overflow-hidden">
      <TabsList className="flex h-auto w-full justify-start items-center gap-1 p-0.5 bg-transparent text-foreground overflow-x-auto scrollbar-none max-w-full min-w-0">
        <JobTabTrigger 
          value="summary" 
          icon={<FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />} 
          label="Summary" 
        />
        <JobTabTrigger 
          value="candidates" 
          icon={<Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />} 
          label="Candidates" 
        />
        <JobTabTrigger 
          value="team" 
          icon={<Users2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />} 
          label="Team" 
        />
        <JobTabTrigger 
          value="history" 
          icon={<History className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />} 
          label="History" 
        />
        <JobTabTrigger 
          value="notes" 
          icon={<MessageSquare className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />} 
          label="Notes" 
        />
        <JobTabTrigger 
          value="attachments" 
          icon={<Paperclip className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />} 
          label="Attachments" 
        />
      </TabsList>
    </div>
  );
}