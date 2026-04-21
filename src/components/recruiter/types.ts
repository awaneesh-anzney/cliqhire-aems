export type RecruiterCandidate = {
  id: string
  apiId?: string
  name: string
  source?: string
  currentJobTitle?: string
  email?: string
  phone?: string
  location?: string
  currentStage?: string
  status?: string | undefined
  resume?: string
  rejectedDate?: string
  rejectionReason?: string
}

export type RecruiterJob = {
  id: string
  title: string
  clientName: string
  location?: string
  salaryRange?: string
  headcount?: number
  jobType?: string
  isExpanded: boolean
  candidates: RecruiterCandidate[]
  jobId: { stage: string }
  totalCandidates: number
  pipelineId?: string
}
