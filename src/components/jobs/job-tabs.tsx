"use client";

import { Tabs } from "@/components/ui/tabs";
import { JobTabsList } from "@/components/jobs/tabs/tab-list";
import { JobTabContent } from "@/components/jobs/tabs/tab-content";
import { SummaryContent } from "./summary/summary-content";
import { CandidatesContent } from "./candidates/candidates-content";
import { NotesContent } from "./notes/notes-content";
import { AttachmentsContent } from "./attachments/attachments-content";
import { TeamContent } from "./teams/team-content";
import { HistoryContent } from "./history/history-content";
import { JobData } from "./types";

interface JobTabsProps {
  jobId: string;
  jobData: JobData;
  reloadToken?: number;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  canModify?: boolean;
}

export function JobTabs({ 
  jobId, 
  jobData, 
  reloadToken, 
  activeTab = "summary", 
  onTabChange, 
  canModify 
}: JobTabsProps) {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange} 
      className="w-full flex-1 max-w-full min-w-0 flex flex-col overflow-hidden"
    >
      {/* Sleek Tabs Navigation Bar */}
      <JobTabsList />
      
      {/* Dynamic Tab Content Wrapper with minimal padding */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3.5">
        {/* Summary Content */}
        <JobTabContent 
          value="summary"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
        >
          <SummaryContent 
            jobId={jobId} 
            jobData={jobData} 
            canModify={canModify} 
          />
        </JobTabContent>

        {/* Candidates Content */}
        <JobTabContent 
          value="candidates"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
        >
          <CandidatesContent 
            jobId={jobId} 
            jobTitle={jobData.jobTitle} 
            reloadToken={reloadToken} 
          />
        </JobTabContent>
        
        {/* Team Content */}
        <JobTabContent 
          value="team"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
        >
          <TeamContent 
            jobId={jobId} 
            jobData={jobData} 
            canModify={canModify} 
          />
        </JobTabContent>

        {/* History Content */}
        <JobTabContent 
          value="history"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
        >
          <HistoryContent 
            jobId={jobId} 
          />
        </JobTabContent>
        
        {/* Notes Content */}
        <JobTabContent 
          value="notes"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
        >
          <NotesContent 
            jobId={jobId} 
            jobData={jobData} 
            canModify={canModify} 
          />
        </JobTabContent>
        
        {/* Attachments Content */}
        <JobTabContent 
          value="attachments"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-150"
        >
          <AttachmentsContent 
            jobId={jobId} 
            canModify={canModify} 
          />
        </JobTabContent>
      </div>
    </Tabs>
  );
}