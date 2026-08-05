"use client"

import { TabsList } from "@/components/ui/tabs"
import { 
  FileText, 
  Users, 
  Users2, 
  Lightbulb, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  Search, 
  BarChart 
} from "lucide-react"
import { JobTabTrigger } from "./tab-trigger"

export function JobTabsList() {
  return (
    <div className="w-full border-b border-emerald-900/10 bg-white/40 dark:bg-black/20 backdrop-blur-md px-1 pt-1">
      <TabsList className="flex h-auto w-full justify-start items-center gap-1 p-1 bg-transparent overflow-x-auto scrollbar-none max-w-full min-w-0">
        
        {/* Active & Enabled Tabs with Colorful Icons */}
        <JobTabTrigger 
          value="candidates" 
          icon={<Users className="h-3.5 w-3.5 text-emerald-600 shrink-0" />} 
          label="Candidates" 
          count={0} 
        />
        <JobTabTrigger 
          value="summary" 
          icon={<FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />} 
          label="Summary" 
        />
        <JobTabTrigger 
          value="team" 
          icon={<Users2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />} 
          label="Team" 
        />

        {/* Commented Tabs (Ready to enable anytime with unique colors) */}
        {/* <JobTabTrigger 
          value="recommendations" 
          icon={<Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />} 
          label="Recommendations" 
        /> */}
        {/* <JobTabTrigger 
          value="activities" 
          icon={<Calendar className="h-3.5 w-3.5 text-purple-500 shrink-0" />} 
          label="Activities" 
        /> */}

        <JobTabTrigger 
          value="notes" 
          icon={<MessageSquare className="h-3.5 w-3.5 text-amber-500 shrink-0" />} 
          label="Notes" 
        />
        <JobTabTrigger 
          value="attachments" 
          icon={<Paperclip className="h-3.5 w-3.5 text-rose-500 shrink-0" />} 
          label="Attachments" 
        />

        {/* Commented Tabs (Ready to enable anytime with unique colors) */}
        {/* <JobTabTrigger 
          value="sourcing" 
          icon={<Search className="h-3.5 w-3.5 text-teal-500 shrink-0" />} 
          label="Sourcing" 
        /> */}
        {/* <JobTabTrigger 
          value="reports" 
          icon={<BarChart className="h-3.5 w-3.5 text-cyan-500 shrink-0" />} 
          label="Reports" 
        /> */}

      </TabsList>
    </div>
  )
}