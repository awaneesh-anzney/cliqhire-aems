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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 items-start">
  <ClientTeam jobId={jobId} jobData={jobData} canModify={canModify} />
  <InternalTeam jobId={jobId} jobData={jobData} canModify={canModify} />
</div>
  )
}