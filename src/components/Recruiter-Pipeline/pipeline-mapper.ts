import { type Job, type Candidate, mapBackendStageToUIStage } from "./dummy-data";

// ============================================================
// pipeline-mapper.ts — Updated for API v2
//
// API v2 changes:
// - Pipeline entry comes from GET /api/recruiter-pipeline/entry/:id
// - Candidates are in entry.candidates[] (not candidateIdArray)
// - Each candidate has: candidateId (populated), currentStage, currentStatus,
//   priority, addedAt, lastUpdated, stageHistory[], rejectionHistory[]
// - Stage-specific data is stored inside stageHistory[].data (NOT flat on candidate)
// - Team info comes from entry.jobId.jobTeamMembers[] (populated positions)
// - Stages are dynamic: entry.stages[] from pipeline templates
// ============================================================

/**
 * Extract the most recent data object for a given stage from stageHistory
 */
function getStageDataFromHistory(
  stageHistory: any[],
  stageName: string
): Record<string, any> {
  if (!Array.isArray(stageHistory)) return {};
  // Take the last entry that matches the stage name (most recent)
  const entries = stageHistory.filter(
    (h) => h.stage?.toLowerCase() === stageName.toLowerCase()
  );
  if (entries.length === 0) return {};
  return entries[entries.length - 1]?.data || {};
}

/**
 * Maps new API v2 pipeline entry to UI Job type used across the Recruiter Pipeline
 */
export function mapEntryToJob(entry: any): Job {
  const jobData: any = entry.jobId || {};

  const salaryMin = jobData?.salaryRange?.min ?? jobData?.minimumSalary;
  const salaryMax = jobData?.salaryRange?.max ?? jobData?.maximumSalary;
  const salaryCurrency = jobData?.salaryRange?.currency ?? jobData?.salaryCurrency ?? "";
  const salaryRangeString =
    salaryMin != null && salaryMax != null
      ? `${salaryMin}-${salaryMax} ${salaryCurrency}`
      : "";

  // ── Support both v1 (candidateIdArray) and v2 (candidates) shape ──────
  const rawCandidates: any[] = entry.candidates || entry.candidateIdArray || [];

  const candidates: Candidate[] = rawCandidates.map((c: any) => {
    // v2: candidateId is a populated object with _id, firstName, lastName, etc.
    // v1: candidateId may be a plain string or partially populated
    const candidateInfo = c?.candidateId || {};
    const candidateId =
      typeof candidateInfo === "string" ? candidateInfo : candidateInfo._id || "";

    const firstName = candidateInfo?.firstName || "";
    const lastName = candidateInfo?.lastName || "";
    const fullName =
      candidateInfo?.name ||
      `${firstName} ${lastName}`.trim() ||
      "Unknown";

    // Extract stage-specific data from stageHistory (v2) or flat fields (v1)
    const stageHistory: any[] = c?.stageHistory || [];

    const sourcingData = getStageDataFromHistory(stageHistory, "Sourcing") || c?.sourcing || {};
    const screeningData = getStageDataFromHistory(stageHistory, "Screening") || c?.screening || {};
    const clientReviewData =
      getStageDataFromHistory(stageHistory, "Client Screening") ||
      getStageDataFromHistory(stageHistory, "Client Review") ||
      c?.clientScreening ||
      {};
    const interviewData = getStageDataFromHistory(stageHistory, "Interview") || c?.interview || {};
    const verificationData = getStageDataFromHistory(stageHistory, "Verification") || c?.verification || {};
    const onboardingData = getStageDataFromHistory(stageHistory, "Onboarding") || c?.onboarding || {};
    const hiredData = getStageDataFromHistory(stageHistory, "Hired") || c?.hired || {};
    const disqualifiedData = getStageDataFromHistory(stageHistory, "Disqualified") || c?.disqualified || {};

    return {
      // Identity
      id: c?._id || candidateId,
      name: fullName,
      email: candidateInfo?.email || c?.email || "",
      phone: candidateInfo?.phone || c?.phone || "",

      // Stage state
      currentStage: mapBackendStageToUIStage(c?.currentStage || "Sourcing"),
      currentStatus: c?.currentStatus || "",
      status: c?.currentStatus || c?.status,
      subStatus: c?.currentStatus || c?.status,

      // Source info
      source: sourcingData?.connection || c?.sourcing?.source || "",
      connection: sourcingData?.connection || c?.connection || "",

      // Candidate profile fields
      experience: candidateInfo?.experience,
      currentSalary: candidateInfo?.currentSalary,
      currentSalaryCurrency: candidateInfo?.currentSalaryCurrency,
      expectedSalary: candidateInfo?.expectedSalary,
      expectedSalaryCurrency: candidateInfo?.expectedSalaryCurrency,
      currentJobTitle: candidateInfo?.currentJobTitle,
      previousCompanyName: candidateInfo?.previousCompanyName,
      currentCompanyName: candidateInfo?.currentCompanyName,
      location: candidateInfo?.location,
      skills: candidateInfo?.skills,
      softSkill: candidateInfo?.softSkill,
      technicalSkill: candidateInfo?.technicalSkill,
      gender: candidateInfo?.gender,
      dateOfBirth: candidateInfo?.dateOfBirth,
      country: candidateInfo?.country,
      nationality: candidateInfo?.nationality,
      willingToRelocate: candidateInfo?.willingToRelocate,
      description: candidateInfo?.description,
      linkedin: candidateInfo?.linkedin,
      reportingTo: candidateInfo?.reportingTo,
      educationDegree: candidateInfo?.educationDegree,
      primaryLanguage: candidateInfo?.primaryLanguage,
      resume: candidateInfo?.resume,
      isTempCandidate: candidateInfo?.isTempCandidate || false,
      avatar: undefined,

      // Meta
      priority: c?.priority,
      notes: c?.notes || stageHistory[stageHistory.length - 1]?.notes || "",
      addedAt: c?.addedAt,
      lastUpdated: c?.lastUpdated,
      stageHistory,
      rejectionHistory: c?.rejectionHistory || [],

      // Stage-specific data (for PipelineStageDetails)
      sourcing: sourcingData,
      screening: screeningData,
      clientScreening: clientReviewData,
      interview: interviewData,
      verification: verificationData,
      onboarding: onboardingData,
      hired: hiredData,
      disqualified: disqualifiedData,

      // Team info (from job, not per-candidate in v2)
      hiringManager: c?.hiringManager,
      recruiter: c?.recruiter,
    } as Candidate;
  });

  // ── Dynamic stages from pipeline (v2) ─────────────────────────────────
  const dynamicStages = (entry.stages || []).map((s: any) => s.name).filter(Boolean);

  return {
    id: entry._id,
    title: jobData?.jobTitle || "",
    clientName: (jobData as any)?.client?.name || "",
    location: Array.isArray(jobData?.location)
      ? jobData.location.join(", ")
      : jobData?.location || "",
    salaryRange: salaryRangeString,
    headcount: jobData?.numberOfPositions || jobData?.headcount || 0,
    jobType: jobData?.jobType || "",
    isExpanded: true,
    jobId: entry.jobId,
    jobIdString: jobData?.jobId,
    candidates,

    // Pipeline meta
    priority: entry.priority,
    notes: entry.notes,
    assignedDate: entry.assignedDate || entry.createdAt,
    totalCandidates: entry.totalCandidates,
    activeCandidates: entry.activeCandidates,
    completedCandidates: entry.completedCandidates,
    droppedCandidates: entry.droppedCandidates,
    pipelineStatus: entry.status,

    // Dynamic stages (v2)
    stages: dynamicStages,
    stageObjects: entry.stages || [],

    // Team (from jobTeamMembers in v2)
    jobTeamMembers: jobData?.jobTeamMembers || [],
    recruiterName: entry.recruiterId?.name,
    recruiterEmail: entry.recruiterId?.email,
  } as Job;
}
