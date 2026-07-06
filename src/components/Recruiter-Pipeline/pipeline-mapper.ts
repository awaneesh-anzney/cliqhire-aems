import { type Job, type Candidate, mapBackendStageToUIStage } from "./dummy-data";
import { getProbationPeriodLabel, getProbationPeriodDays } from "./pipeline-stage-details/stage-fields";

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
  const entries = stageHistory.filter(
    (h) => h.stage?.toLowerCase() === stageName.toLowerCase()
  );
  if (entries.length === 0) return {};

  // The API usually returns descending (newest first). 
  // We sort ascending to ensure the 'last' entry is truly the most recent.
  const sorted = [...entries].sort((a, b) => 
    new Date(a.movedAt || 0).getTime() - new Date(b.movedAt || 0).getTime()
  );
  return sorted[sorted.length - 1]?.data || {};
}

/**
 * Maps new API v2 pipeline entry to UI Job type used across the Recruiter Pipeline
 */
export function mapEntryToJob(entry: any): Job {
  console.log('DEBUG: Raw API entry:', entry);
  const jobData: any = entry.jobId || {};
  console.log('DEBUG: Job data:', jobData);

  const salaryMin = jobData?.salaryRange?.min ?? jobData?.minimumSalary;
  const salaryMax = jobData?.salaryRange?.max ?? jobData?.maximumSalary;
  const salaryCurrency = jobData?.salaryRange?.currency ?? jobData?.salaryCurrency ?? "";
  const salaryRangeString =
    salaryMin != null && salaryMax != null
      ? `${salaryMin}-${salaryMax} ${salaryCurrency}`
      : "";

  // ── Support both v1 (candidateIdArray), v2 (candidates), and new structure (candidates.data)
  const rawCandidates: any[] = entry.candidates?.data || entry.candidates || entry.candidateIdArray || [];
  console.log('DEBUG: Raw candidates:', rawCandidates);

  const candidates: Candidate[] = rawCandidates.map((c: any) => {
    console.log('DEBUG: Processing candidate:', c);
    // v2: candidateId is a populated object with _id, firstName, lastName, etc.
    // v1: candidateId may be a plain string or partially populated
    const candidateInfo = c?.candidateId || {};
    const candidateId =
      typeof candidateInfo === "string" ? candidateInfo : candidateInfo._id || "";

    const firstName = candidateInfo?.firstName || "";
    const lastName = candidateInfo?.lastName || "";
    const fullName =
      candidateInfo?.name ||
      candidateInfo?.fullName ||
      `${firstName} ${lastName}`.trim() ||
      `Candidate ${candidateInfo?._id?.slice(-6) || 'Unknown'}`;

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
    let hiredData = getStageDataFromHistory(stageHistory, "Hired") || c?.hired || {};
    if ((c?.currentStage === "Hired" || c?.currentStage === "hired") && c?.currentStageData) {
      hiredData = { ...hiredData, ...c.currentStageData };
    }
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
      isTempCandidate: candidateInfo?.isTempCandidate || candidateInfo?.isTemp || c?.isTemp || false,
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
      probation: mapBackendStageToUIStage(c?.currentStage || "Sourcing") === "Hired" ? (c?.probation || (hiredData.probationPeriod && hiredData.probationPeriod !== "none" && hiredData.startDate && hiredData.endDate ? {
        isOnProbation: true,
        period: hiredData.probationPeriod,
        periodLabel: getProbationPeriodLabel(hiredData.probationPeriod),
        periodDays: getProbationPeriodDays(hiredData.probationPeriod),
        joinDate: hiredData.startDate,
        startDate: hiredData.startDate,
        endDate: hiredData.endDate,
        status: "Active",
        notes: hiredData.probationNotes || "",
        remainingDays: Math.max(0, Math.ceil((new Date(hiredData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        daysElapsed: Math.max(0, Math.ceil((Date.now() - new Date(hiredData.startDate).getTime()) / (1000 * 60 * 60 * 24))),
        percentComplete: Math.min(100, Math.max(0, Math.round((Math.max(0, Math.ceil((Date.now() - new Date(hiredData.startDate).getTime()) / (1000 * 60 * 60 * 24))) / (getProbationPeriodDays(hiredData.probationPeriod) || 30)) * 100))),
        isExpired: Date.now() > new Date(hiredData.endDate).getTime(),
        isExpiringSoon: Math.max(0, Math.ceil((new Date(hiredData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) <= 7
      } : null)) : null,

      interviewRounds: c?.interviewRounds || [],
      currentInterviewRound: c?.currentInterviewRound,

      // Team info (from job, not per-candidate in v2)
      hiringManager: c?.hiringManager,
      recruiter: c?.recruiter,
    } as Candidate;
  });

  // ── Dynamic stages from pipeline (v2) ─────────────────────────────────
  const dynamicStages = (entry.stages || []).map((s: any) => mapBackendStageToUIStage(s.name)).filter(Boolean);

  // Extract hiring managers and recruiters from jobTeamMembers
  console.log('DEBUG: jobTeamMembers raw:', jobData?.jobTeamMembers);
  
  const hiringManagers = jobData?.jobTeamMembers
    ?.filter((member: any) => member.position === 'hiringManager')
    ?.flatMap((member: any) => member.users || []) || [];
  
  const recruiters = jobData?.jobTeamMembers
    ?.filter((member: any) => member.position === 'recruiter')
    ?.flatMap((member: any) => member.users || []) || [];

  console.log('DEBUG: Extracted hiring managers:', hiringManagers);
  console.log('DEBUG: Extracted recruiters:', recruiters);

  const countSource = Array.isArray(entry.candidates?.data)
    ? entry.candidates.data
    : (Array.isArray(entry.candidates)
      ? entry.candidates
      : (Array.isArray(entry.candidateIdArray) ? entry.candidateIdArray : []));

  const stageCounts: Record<string, number> = {};
  
  if (entry.stageCounts && typeof entry.stageCounts === "object") {
    Object.entries(entry.stageCounts).forEach(([backendStage, count]) => {
      // Exclude grand total and disqualified aggregates from individual stage filters
      if (backendStage === 'total' || backendStage === 'disqualified') return;
      const uiStage = mapBackendStageToUIStage(backendStage);
      if (uiStage) {
        stageCounts[uiStage] = (stageCounts[uiStage] || 0) + (count as number);
      }
    });
  } else if (Array.isArray(entry.stages) && entry.stages.some((s: any) => s && (typeof s.candidateCount === "number" || typeof s.count === "number"))) {
    entry.stages.forEach((s: any) => {
      if (s && s.name) {
        const uiStage = mapBackendStageToUIStage(s.name);
        const count = typeof s.candidateCount === "number" ? s.candidateCount : (typeof s.count === "number" ? s.count : 0);
        if (uiStage) {
          stageCounts[uiStage] = (stageCounts[uiStage] || 0) + count;
        }
      }
    });
  } else {
    countSource.forEach((c: any) => {
      const rawStage = c?.currentStage || "Sourcing";
      const uiStage = mapBackendStageToUIStage(rawStage);
      if (uiStage) {
        stageCounts[uiStage] = (stageCounts[uiStage] || 0) + 1;
      }
    });
  }

  const mappedJob = {
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
    stageCounts,

    // Pipeline meta
    priority: entry.priority,
    notes: entry.notes,
    assignedDate: entry.assignedDate || entry.createdAt,
    totalCandidates: entry.totalCandidates ?? 
      entry.candidates?.pagination?.total ?? 
      entry.pagination?.total ?? 
      (Object.keys(stageCounts).length > 0
        ? Object.values(stageCounts).reduce((a, b) => a + b, 0)
        : (Array.isArray(entry.candidateIdArray) ? entry.candidateIdArray.length : 0)),
    activeCandidates: entry.activeCandidates,
    completedCandidates: entry.completedCandidates,
    droppedCandidates: entry.droppedCandidates,
    pipelineStatus: entry.status,

    // Dynamic stages (v2)
    stages: dynamicStages,
    stageObjects: entry.stages || [],

    // Team (from jobTeamMembers in v2)
    jobTeamMembers: jobData?.jobTeamMembers || [],
    recruiterName: recruiters[0]?.firstName && recruiters[0]?.lastName 
      ? `${recruiters[0].firstName} ${recruiters[0].lastName}` 
      : recruiters[0]?.name || entry.recruiterId?.name,
    recruiterEmail: recruiters[0]?.email || entry.recruiterId?.email,
    hiringManagerName: hiringManagers[0]?.firstName && hiringManagers[0]?.lastName
      ? `${hiringManagers[0].firstName} ${hiringManagers[0].lastName}`
      : hiringManagers[0]?.name || "No HM Found",
    hiringManagerEmail: hiringManagers[0]?.email,
  } as Job;
  
  console.log('DEBUG: Final hiringManagerName:', mappedJob.hiringManagerName);
  console.log('DEBUG: Final recruiterName:', mappedJob.recruiterName);
  console.log('DEBUG: Final mapped job:', mappedJob);
  return mappedJob;
}

/**
 * Maps single candidate response from GET /api/recruiter-pipeline/:pid/candidates/:cid
 */
export function mapPipelineCandidateResponse(data: any): { job: Job; candidate: Candidate } {
  const candidateInfo = data.candidateId || {};
  const firstName = candidateInfo.firstName || "";
  const lastName = candidateInfo.lastName || "";
  const fullName = 
    candidateInfo.name || 
    candidateInfo.fullName || 
    `${firstName} ${lastName}`.trim() || 
    `Candidate ${candidateInfo._id?.slice(-6) || 'Unknown'}`;

  const stageHistory = data.stageHistory || [];
  
  // Extract stage-specific data from history
  const sourcingData = getStageDataFromHistory(stageHistory, "Sourcing");
  const screeningData = getStageDataFromHistory(stageHistory, "Screening");
  const clientReviewData = 
    getStageDataFromHistory(stageHistory, "Client Screening") || 
    getStageDataFromHistory(stageHistory, "Client Review");
  const interviewData = getStageDataFromHistory(stageHistory, "Interview");
  const verificationData = getStageDataFromHistory(stageHistory, "Verification");
  const onboardingData = getStageDataFromHistory(stageHistory, "Onboarding");
  let hiredData = getStageDataFromHistory(stageHistory, "Hired");
  if ((data.currentStage === "Hired" || data.currentStage === "hired") && data.currentStageData) {
    hiredData = { ...hiredData, ...data.currentStageData };
  }
  const disqualifiedData = getStageDataFromHistory(stageHistory, "Disqualified");

  const candidate: Candidate = {
    id: data._id || candidateInfo._id || "",
    name: fullName,
    email: candidateInfo.email || "",
    phone: candidateInfo.phone || "",
    currentStage: mapBackendStageToUIStage(data.currentStage || "Sourcing"),
    currentStatus: data.currentStatus || "",
    status: data.currentStatus || "",
    subStatus: data.currentStatus || "",
    experience: candidateInfo.experience || "",
    totalRelevantExperience: candidateInfo.totalRelevantExperience || "",
    noticePeriod: candidateInfo.noticePeriod || "",
    currentSalary: candidateInfo.currentSalary || "",
    currentSalaryCurrency: candidateInfo.currentSalaryCurrency || "",
    expectedSalary: candidateInfo.expectedSalary || "",
    expectedSalaryCurrency: candidateInfo.expectedSalaryCurrency || "",
    previousCompanyName: candidateInfo.previousCompanyName || "",
    currentJobTitle: candidateInfo.currentJobTitle || "",
    softSkill: candidateInfo.softSkill || [],
    technicalSkill: candidateInfo.technicalSkill || [],
    resumeUrl: candidateInfo.resumeUrl || candidateInfo.resume || "",
    linkedin: candidateInfo.linkedin || "",
    reportingTo: candidateInfo.reportingTo || "",
    educationDegree: candidateInfo.educationDegree || "",
    primaryLanguage: candidateInfo.primaryLanguage || "",
    willingToRelocate: candidateInfo.willingToRelocate || "",
    description: candidateInfo.description || "",
    location: candidateInfo.location || "",
    skills: candidateInfo.skills || [],
    gender: candidateInfo.gender || "",
    dateOfBirth: candidateInfo.dateOfBirth || "",
    country: candidateInfo.country || "",
    nationality: candidateInfo.nationality || "",
    resume: candidateInfo.resume || "",
    countryCode: candidateInfo.countryCode || "",
    isTempCandidate: candidateInfo.isTempCandidate || candidateInfo.isTemp || data.isTemp || false,
    priority: data.priority,
    notes: data.notes || (stageHistory.length > 0 ? stageHistory[stageHistory.length - 1].notes : ""),
    addedAt: data.addedAt,
    lastUpdated: data.lastUpdated,
    stageHistory: stageHistory.map((h: any) => ({
      ...h,
      stage: mapBackendStageToUIStage(h.stage),
    })),
    rejectionHistory: (data.rejectionHistory || []).map((rej: any) => ({
      ...rej,
      rejectedAt: rej.rejectionDate || rej.rejectedAt,
      stage: mapBackendStageToUIStage(rej.stage),
    })),
    sourcing: sourcingData,
    screening: screeningData,
    clientScreening: clientReviewData,
    interview: interviewData,
    verification: verificationData,
    onboarding: onboardingData,
    hired: hiredData,
    disqualified: disqualifiedData,
    probation: mapBackendStageToUIStage(data.currentStage || "Sourcing") === "Hired" ? (data.probation || (hiredData.probationPeriod && hiredData.probationPeriod !== "none" && hiredData.startDate && hiredData.endDate ? {
      isOnProbation: true,
      period: hiredData.probationPeriod,
      periodLabel: getProbationPeriodLabel(hiredData.probationPeriod),
      periodDays: getProbationPeriodDays(hiredData.probationPeriod),
      joinDate: hiredData.startDate,
      startDate: hiredData.startDate,
      endDate: hiredData.endDate,
      status: "Active",
      notes: hiredData.probationNotes || "",
      remainingDays: Math.max(0, Math.ceil((new Date(hiredData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      daysElapsed: Math.max(0, Math.ceil((Date.now() - new Date(hiredData.startDate).getTime()) / (1000 * 60 * 60 * 24))),
      percentComplete: Math.min(100, Math.max(0, Math.round((Math.max(0, Math.ceil((Date.now() - new Date(hiredData.startDate).getTime()) / (1000 * 60 * 60 * 24))) / (getProbationPeriodDays(hiredData.probationPeriod) || 30)) * 100))),
      isExpired: Date.now() > new Date(hiredData.endDate).getTime(),
      isExpiringSoon: Math.max(0, Math.ceil((new Date(hiredData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) <= 7
    } : null)) : null,
    source: sourcingData?.connection || candidateInfo?.source || "",
    connection: sourcingData?.connection || candidateInfo?.source || "",
    interviewRounds: data.interviewRounds || [],
    currentInterviewRound: data.currentInterviewRound,
  } as any;

  // If candidate is disqualified and no explicit disqualified data in history,
  // try to infer it from the last history entry or current state
  if ((data.currentStatus === 'Disqualified' || data.status === 'Disqualified') && (!candidate.disqualified || Object.keys(candidate.disqualified).length === 0)) {
    // Sort history by date ascending to get the absolute latest status
    const sortedHistory = [...stageHistory].sort((a, b) => 
      new Date(a.movedAt || 0).getTime() - new Date(b.movedAt || 0).getTime()
    );
    const lastHistory = sortedHistory[sortedHistory.length - 1];
    const lastRejection = data.rejectionHistory?.[data.rejectionHistory.length - 1];
    
    candidate.disqualified = {
      disqualificationStage: mapBackendStageToUIStage(lastRejection?.stage || lastHistory?.stage || data.currentStage || "Sourcing"),
      disqualificationStatus: lastHistory?.status || data.currentStatus || "Disqualified",
      disqualificationReason: lastRejection?.rejectionReason || lastHistory?.notes || data.notes || "No reason provided",
      disqualificationFeedback: lastRejection?.feedback || lastHistory?.data?.feedback || "",
      disqualifiedAt: lastRejection?.rejectionDate || lastHistory?.movedAt || data.lastUpdated,
      disqualifiedBy: lastRejection?.rejectedBy || lastHistory?.movedBy
    };
  }

  const jobData = data.job || {};
  const job: Job = {
    id: data.pipelineId,
    title: jobData.jobTitle || "",
    clientName: jobData.client?.name || "",
    location: jobData.location || "",
    jobType: jobData.jobType || "",
    pipelineStatus: data.pipelineStatus || "Active",
    stages: (data.availableStages || []).map((s: any) => mapBackendStageToUIStage(s.name)),
    stageObjects: data.availableStages || []
  } as any;

  return { job, candidate };
}
