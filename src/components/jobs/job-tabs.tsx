"use client"

import { Tabs } from "@/components/ui/tabs"
import { JobTabsList } from "@/components/jobs/tabs/tab-list"
import { JobTabContent } from "@/components/jobs/tabs/tab-content"
import { SummaryContent } from "./summary/summary-content"
import { CandidatesContent } from "./candidates/candidates-content"
import { RecommendationsContent } from "./recommendations/recommendations-content"
import { ActivitiesContent } from "./activities/activities-content"
import { NotesContent } from "./notes/notes-content"
import { AttachmentsContent } from "./attachments/attachments-content"
import { TeamContent } from "./teams/team-content"
import { SourcingContent } from "./sourcing/sourcing-content"
import { ReportsContent } from "./reports/reports-content"
import { JobData } from "./types"

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
      {/* Modern Tabs Navigation Bar */}
      <JobTabsList />
      
      {/* Dynamic Tab Content Wrapper with Fade-In Animation */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5">
        
        {/* Candidates Content */}
        <JobTabContent 
          value="candidates"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
        >
          <CandidatesContent 
            jobId={jobId} 
            jobTitle={jobData.jobTitle} 
            reloadToken={reloadToken} 
          />
        </JobTabContent>
        
        {/* Summary Content */}
        <JobTabContent 
          value="summary"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
        >
          <SummaryContent 
            jobId={jobId} 
            jobData={jobData} 
            canModify={canModify} 
          />
        </JobTabContent>
        
        {/* Team Content */}
        <JobTabContent 
          value="team"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
        >
          <TeamContent 
            jobId={jobId} 
            jobData={jobData} 
            canModify={canModify} 
          />
        </JobTabContent>

        {/* Commented Out Content Tabs (Uncomment when needed) */}
        {/* 
        <JobTabContent value="recommendations" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
          <RecommendationsContent jobId={jobId} />
        </JobTabContent> 
        */}
        
        {/* 
        <JobTabContent value="activities" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
          <ActivitiesContent jobId={jobId} />
        </JobTabContent> 
        */}
        
        {/* Notes Content */}
        <JobTabContent 
          value="notes"
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
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
          className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200"
        >
          <AttachmentsContent 
            jobId={jobId} 
            canModify={canModify} 
          />
        </JobTabContent>

        {/* 
        <JobTabContent value="sourcing" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
          <SourcingContent jobId={jobId} />
        </JobTabContent> 
        */}

        {/* 
        <JobTabContent value="reports" className="m-0 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-50 duration-200">
          <ReportsContent jobId={jobId} />
        </JobTabContent> 
        */}

      </div>
    </Tabs>
  )
}