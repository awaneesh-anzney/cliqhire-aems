import { type Job, mapBackendStageToUIStage } from "../dummy-data";
import { type PipelineListItem } from "@/services/recruitmentPipelineService";

// Converts pipeline list (summary) data to Job format for UI lists
export const convertPipelineListDataToJob = (
  pipelineData: PipelineListItem,
  isExpanded: boolean = false,
): Job => {
  const formatSalaryRange = () => {
    const minSalary = (pipelineData as any).jobId?.minimumSalary;
    const maxSalary = (pipelineData as any).jobId?.maximumSalary;
    const currency = (pipelineData as any).jobId?.salaryCurrency;

    if (minSalary && maxSalary && currency) {
      return `${minSalary} - ${maxSalary} ${currency}`;
    } else if (minSalary && currency) {
      return `${minSalary} ${currency}`;
    } else if (maxSalary && currency) {
      return `${maxSalary} ${currency}`;
    } else if (minSalary || maxSalary) {
      return `${minSalary || maxSalary}`;
    }
    return "Salary not specified";
  };

  return {
    id: (pipelineData as any)._id,
    title: (pipelineData as any).jobId?.jobTitle || "Untitled Job",
    clientName: (pipelineData as any).jobId?.client?.name || (pipelineData as any).jobId?.clientName || "Unknown Client",
    location: (pipelineData as any).jobId?.location || "Location not specified",
    salaryRange: formatSalaryRange(),
    headcount: (pipelineData as any).jobId?.numberOfPositions || 1,
    jobType: (pipelineData as any).jobId?.jobType || "full time",
    isExpanded,
    jobId: (pipelineData as any).jobId,
    candidates: [],
    priority: (pipelineData as any).priority,
    notes: (pipelineData as any).notes,
    assignedDate: (pipelineData as any).assignedDate,
    totalCandidates: (pipelineData as any).totalCandidates,
    activeCandidates: (pipelineData as any).activeCandidates,
    completedCandidates: (pipelineData as any).completedCandidates,
    droppedCandidates: (pipelineData as any).droppedCandidates,
    numberOfCandidates: (pipelineData as any).numberOfCandidates,
    recruiterName: (pipelineData as any).recruiterId?.name || "Unknown Recruiter",
    recruiterEmail: (pipelineData as any).recruiterId?.email || "",
    department: (pipelineData as any).jobId?.department,
    numberOfPositions: (pipelineData as any).jobId?.numberOfPositions,
  } as Job;
};

// Converts detailed pipeline entry to Job format with full candidate mapping
export const convertPipelineDataToJob = (pipelineData: any, isExpanded: boolean = false): Job => {
  const formatSalaryRange = () => {
    const minSalary = pipelineData.jobId?.minimumSalary;
    const maxSalary = pipelineData.jobId?.maximumSalary;
    const currency = pipelineData.jobId?.salaryCurrency;

    if (minSalary && maxSalary && currency) {
      return `${minSalary} - ${maxSalary} ${currency}`;
    } else if (minSalary && currency) {
      return `${minSalary} ${currency}`;
    } else if (maxSalary && currency) {
      return `${maxSalary} ${currency}`;
    } else if (minSalary || maxSalary) {
      return `${minSalary || maxSalary}`;
    }
    return "Salary not specified";
  };

  return {
    id: pipelineData._id,
    title: pipelineData.jobId?.jobTitle || "Untitled Job",
    clientName: pipelineData.jobId?.client?.name || "Unknown Client",
    location: pipelineData.jobId?.location || "Location not specified",
    salaryRange: formatSalaryRange(),
    headcount: pipelineData.jobId?.headcount || 1,
    jobType: pipelineData.jobId?.jobType || "Full-time",
    isExpanded,
    jobId: pipelineData.jobId,
    candidates: (pipelineData.candidateIdArray || []).map((candidateData: any) => {
      const candidate = candidateData.candidateId;
      return {
        id: candidate._id,
        name: candidate.name,
        source: candidate.referredBy || "Pipeline",
        currentStage: mapBackendStageToUIStage(candidateData.currentStage || "Sourcing"),
        avatar: undefined,
        experience: candidate.experience,
        currentSalary: candidate.currentSalary,
        currentSalaryCurrency: candidate.currentSalaryCurrency,
        expectedSalary: candidate.expectedSalary,
        expectedSalaryCurrency: candidate.expectedSalaryCurrency,
        currentJobTitle: candidate.currentJobTitle,
        previousCompanyName: candidate.previousCompanyName,
        applicationId: candidate._id,
        appliedDate: candidateData.addedToPipelineDate,
        lastUpdated: candidateData.lastUpdated,
        applicationDuration: 0,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        skills: candidate.skills,
        softSkill: candidate.softSkill,
        technicalSkill: candidate.technicalSkill,
        gender: candidate.gender,
        dateOfBirth: candidate.dateOfBirth,
        country: candidate.country,
        nationality: candidate.nationality,
        willingToRelocate: candidate.willingToRelocate,
        description: candidate.description,
        linkedin: candidate.linkedin,
        reportingTo: candidate.reportingTo,
        educationDegree: candidate.educationDegree,
        primaryLanguage: candidate.primaryLanguage,
        resume: candidate.resume,
        status: candidateData.status,
        subStatus: candidateData.status,
        priority: candidateData.priority,
        notes: candidateData.notes,
        sourcing: candidateData.sourcing,
        screening: candidateData.screening,
        clientScreening: candidateData.clientScreening,
        interview: candidateData.interview,
        verification: candidateData.verification,
        onboarding: candidateData.onboarding,
        hired: candidateData.hired,
        disqualified: candidateData.disqualified,
        connection: candidateData.connection,
        hiringManager: candidateData.hiringManager,
        recruiter: candidateData.recruiter,
        isTempCandidate: candidate.isTempCandidate || false,
      };
    }),
    priority: pipelineData.priority,
    notes: pipelineData.notes,
    assignedDate: pipelineData.assignedDate,
    totalCandidates: pipelineData.totalCandidates,
    activeCandidates: pipelineData.activeCandidates,
    completedCandidates: pipelineData.completedCandidates,
    droppedCandidates: pipelineData.droppedCandidates,
    numberOfCandidates: pipelineData.totalCandidates,
    recruiterName: pipelineData.recruiterId?.name || "Unknown Recruiter",
    recruiterEmail: pipelineData.recruiterId?.email || "",
    jobPosition: Array.isArray(pipelineData.jobId?.jobPosition)
      ? pipelineData.jobId.jobPosition.join(", ")
      : pipelineData.jobId?.jobPosition,
    department: pipelineData.jobId?.department,
    experience: pipelineData.jobId?.experience,
    education: Array.isArray(pipelineData.jobId?.education)
      ? pipelineData.jobId.education.join(", ")
      : pipelineData.jobId?.education,
    specialization: Array.isArray(pipelineData.jobId?.specialization)
      ? pipelineData.jobId.specialization.join(", ")
      : pipelineData.jobId?.specialization,
    teamSize: pipelineData.jobId?.teamSize,
    numberOfPositions: pipelineData.jobId?.numberOfPositions,
    workVisa: pipelineData.jobId?.workVisa
      ? (typeof pipelineData.jobId.workVisa === "object"
          ? !!pipelineData.jobId.workVisa.workVisa
          : !!pipelineData.jobId.workVisa)
      : false,
    gender: pipelineData.jobId?.gender,
    deadlineByClient: pipelineData.jobId?.deadlineByClient || undefined,
    keySkills: Array.isArray(pipelineData.jobId?.specialization)
      ? pipelineData.jobId.specialization
      : [],
    certifications: Array.isArray(pipelineData.jobId?.certifications)
      ? pipelineData.jobId.certifications
      : [],
    otherBenefits: Array.isArray(pipelineData.jobId?.otherBenefits)
      ? pipelineData.jobId.otherBenefits.join(", ")
      : pipelineData.jobId?.otherBenefits,
    jobDescription: pipelineData.jobId?.jobDescription,
    clientIndustry: pipelineData.jobId?.client?.industry,
    clientLocation: pipelineData.jobId?.client?.location,
    clientStage: pipelineData.jobId?.client?.clientStage,
    clientCountry: pipelineData.jobId?.client?.countryOfBusiness,
    clientWebsite: pipelineData.jobId?.client?.website,
    clientPhone: pipelineData.jobId?.client?.phoneNumber,
    clientEmails: pipelineData.jobId?.client?.emails,
  } as Job;
};
