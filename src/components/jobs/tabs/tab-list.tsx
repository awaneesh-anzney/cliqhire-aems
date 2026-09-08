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
    <div className="w-full border-b border-border/70 bg-muted/25 px-2 sm:px-4 py-1 shrink-0 overflow-hidden">
      <TabsList className="flex h-auto w-full justify-start items-center gap-1 p-0.5 bg-transparent overflow-x-auto scrollbar-none max-w-full min-w-0">
        <JobTabTrigger 
          value="summary" 
          icon={<FileText className="h-3.5 w-3.5" />} 
          label="Summary" 
        />
        <JobTabTrigger 
          value="candidates" 
          icon={<Users className="h-3.5 w-3.5" />} 
          label="Candidates" 
        />
        <JobTabTrigger 
          value="team" 
          icon={<Users2 className="h-3.5 w-3.5" />} 
          label="Team" 
        />
        <JobTabTrigger 
          value="history" 
          icon={<History className="h-3.5 w-3.5" />} 
          label="History" 
        />
        <JobTabTrigger 
          value="notes" 
          icon={<MessageSquare className="h-3.5 w-3.5" />} 
          label="Notes" 
        />
        <JobTabTrigger 
          value="attachments" 
          icon={<Paperclip className="h-3.5 w-3.5" />} 
          label="Attachments" 
        />
      </TabsList>
    </div>
  );
}