/**
 * Utility functions for handling temp candidate validation in recruitment pipeline
 */

export interface TempCandidateValidationResult {
  canChangeStage: boolean;
  message?: string;
  shouldOpenCreateDialog?: boolean;
}

/**
 * Checks if a candidate is a temp candidate
 * @param candidate - The candidate object
 * @returns boolean indicating if the candidate is a temp candidate
 */
export function isTempCandidate(candidate: any): boolean {
  return candidate?.candidateId?.isTempCandidate === true || 
         candidate?.isTempCandidate === true ||
         candidate?.candidateId?.isTemp === true ||
         candidate?.isTemp === true;
}

/**
 * Validates if a candidate's stage can be changed
 * @param candidate - The candidate object
 * @param newStage - The new stage being set (optional)
 * @param newStatus - The new status being set (optional)
 * @returns Validation result with canChangeStage flag and optional message
 */
export function validateTempCandidateStageChange(
  candidate: any, 
  newStage?: string, 
  newStatus?: string
): TempCandidateValidationResult {
  // Check if candidate is a temp candidate
  const isTemp = isTempCandidate(candidate);

  if (isTemp) {
    // If changing status to "CV Received", allow it and trigger create dialog
    if (newStatus === "CV Received") {
      return {
        canChangeStage: true,
        shouldOpenCreateDialog: true,
        message: "CV Received! Please complete the candidate creation process."
      };
    }
    
    // For any other stage change, prevent it
    return {
      canChangeStage: false,
      message: "First, update the candidate status to (CV Received), then proceed to create the candidate profile, and finally update the stage accordingly."
    };
  }

  return {
    canChangeStage: true
  };
}

/**
 * Validates if a candidate's status can be changed
 * @param candidate - The candidate object
 * @param newStatus - The new status being set
 * @returns Validation result with canChangeStage flag and optional message
 */
export function validateTempCandidateStatusChange(
  candidate: any, 
  newStatus: string
): TempCandidateValidationResult {
  // Check if candidate is a temp candidate
  const isTemp = isTempCandidate(candidate);

  if (isTemp) {
    // If changing status to "CV Received", allow it and trigger create dialog
    if (newStatus === "CV Received") {
      return {
        canChangeStage: true,
        shouldOpenCreateDialog: true,
        message: "CV Received! Please complete the candidate creation process."
      };
    }
    
    // For any other status change, allow it (temp candidates can change status)
    return {
      canChangeStage: true
    };
  }

  return {
    canChangeStage: true
  };
}

/**
 * Gets the appropriate stage for a temp candidate
 * @param candidate - The candidate object
 * @returns The stage that should be used for temp candidates
 */
export function getTempCandidateStage(candidate: any): string {
  if (isTempCandidate(candidate)) {
    return "Sourcing";
  }
  return candidate?.currentStage || "Sourcing";
}
