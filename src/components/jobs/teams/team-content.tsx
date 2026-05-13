"use client"

import { JobData } from "../types";
import { ClientTeam } from "./Client-Team"
import { InternalTeam } from "./Internal-Team"

interface TeamContentProps {
  jobId: string;
  jobData: JobData;
  canModify?: boolean;
}

export function TeamContent({ jobId, jobData, canModify }: TeamContentProps) {
  return (
    <div className="p-2 space-y-6 bg-muted/50 rounded-2xl min-h-[60vh]">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-full">
          <ClientTeam jobId={jobId} jobData={jobData} canModify={canModify} />
        </div>
        <div className="h-full">
          <InternalTeam jobId={jobId} jobData={jobData} canModify={canModify} />
        </div>
      </div>
    </div>
  )
}