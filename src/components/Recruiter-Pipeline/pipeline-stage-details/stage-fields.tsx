import { format } from "date-fns";
import { 
  CalendarDays, 
  User, 
  Star, 
  Users, 
  MessageSquare, 
  Target, 
  Clock3, 
  CheckCircle, 
  Clock, 
  Link, 
  FileCheck, 
  FileText, 
  FileX, 
  DollarSign, 
  XCircle 
} from "lucide-react";

export interface StageField {
  key: string;
  label: string;
  value: string | number | null;
  icon: React.ReactNode;
  color: string;
  type: 'text' | 'date' | 'datetime' | 'select' | 'textarea' | 'url' | 'rating';
  options?: string[];
  placeholder?: string;
}

// Helper function to parse date string to Date object
export const parseDateString = (dateString: string): Date | undefined => {
  if (!dateString || dateString === "Not set") return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
};

// Helper function to format date for display
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString || dateString === "Not set") return "Not set";
  const date = parseDateString(dateString);
  return date ? format(date, "PPP") : "Not set";
};

// Helper function to format datetime for display
export const formatDateTimeForDisplay = (dateTimeString: string): string => {
  if (!dateTimeString || dateTimeString === "Not set") return "Not set";
  const date = parseDateString(dateTimeString);
  return date ? format(date, "PPp") : "Not set";
};

// Helper function to format datetime for input (YYYY-MM-DDTHH:mm)
export const formatDateTimeForInput = (dateTimeString: string): string => {
  if (!dateTimeString || dateTimeString === "Not set") return "";
  const date = parseDateString(dateTimeString);
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
};

// Helper function to map UI stage names to backend stage names (copied from dummy-data to avoid circular dependency)
const mapUIStageToBackendName = (uiStage: string): string => {
  const stageMapping: Record<string, string> = {
    "Client Review": "Client Screening",
  };
  return stageMapping[uiStage] || uiStage;
};

// Helper function to get stage-specific data
const getStageData = (candidate: any, stageName: string) => {
  // 1. Check if data is already flattened/mapped on the candidate object (Compatibility)
  const legacyKey = stageName.toLowerCase().replace(/\s+/g, '');
  const legacyData = candidate[legacyKey] || (stageName === "Client Review" ? candidate.clientScreening : null);
  
  // 2. NEW API: Search stageHistory for the latest entry with data
  const backendStageName = mapUIStageToBackendName(stageName);
  const historyEntries = Array.isArray(candidate.stageHistory) ? candidate.stageHistory : [];
  
  const latestEntry = historyEntries
    .filter((h: any) => h.stage === backendStageName || h.stage === stageName)
    .sort((a: any, b: any) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime())[0];

  // Merge legacy for transition, but prefer history data
  return {
    ...(legacyData || {}),
    ...(latestEntry?.data || {})
  };
};

// Helper function to format date from API response
const formatApiDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Not set";
  try {
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd");
  } catch {
    return "Not set";
  }
};

// Helper function to format datetime from API response
const formatApiDateTime = (dateTimeString: string | null | undefined): string => {
  if (!dateTimeString) return "Not set";
  try {
    const date = new Date(dateTimeString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "Not set";
  }
};

export const getStageFields = (stage: string, candidate: any): StageField[] => {
  switch (stage) {
    case "Sourcing":
      const sourcingData = getStageData(candidate, "Sourcing");
      return [
        {
          key: "sourcingDate",
          label: "Sourcing Date",
          value: formatApiDate(sourcingData.sourcingDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-blue-50 text-blue-600",
          type: "date"
        },
        {
          key: "connection",
          label: "Sourcing Channel",
          value: sourcingData.connection || "Not set",
          icon: <Users className="h-4 w-4" />,
          color: "bg-green-50 text-green-600",
          type: "select",
          options: ["LinkedIn", "Email", "Indeed", "Referral", "Direct", "Other"]
        },
        {
          key: "referredBy",
          label: "Referred By",
          value: sourcingData.referredBy || "Not set",
          icon: <User className="h-4 w-4" />,
          color: "bg-purple-50 text-purple-600",
          type: "text",
          placeholder: "Enter referrer name"
        },
        // {
        //   key: "source",
        //   label: "Source",
        //   value: sourcingData.source || "Not set",
        //   icon: <Target className="h-4 w-4" />,
        //   color: "bg-orange-50 text-orange-600",
        //   type: "text",
        //   placeholder: "Enter source"
        // },
        {
          key: "sourcingRating",
          label: "Sourcing Rating",
          value: sourcingData.sourcingRating?.toString() || "Not set",
          icon: <Star className="h-4 w-4" />,
          color: "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["1", "2", "3", "4", "5"]
        },
        {
          key: "outreachChannel",
          label: "Outreach Channel",
          value: sourcingData.outreachChannel || "Not set",
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-indigo-50 text-indigo-600",
          type: "select",
          options: ["Email", "Phone", "LinkedIn Message", "WhatsApp", "Other"]
        },
        {
          key: "sourcingDueDate",
          label: "Sourcing Due Date",
          value: formatApiDate(sourcingData.sourcingDueDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-red-50 text-red-600",
          type: "date"
        },
        {
          key: "followUpDateTime",
          label: "Follow-up Date & Time",
          value: formatApiDateTime(sourcingData.followUpDateTime),
          icon: <Clock3 className="h-4 w-4" />,
          color: "bg-orange-50 text-orange-600",
          type: "datetime"
        },
        {
          key: "notes",
          label: "Notes",
          value: sourcingData.notes || "Not set",
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-gray-50 text-gray-600",
          type: "textarea",
          placeholder: "Enter sourcing notes..."
        },
        {
          key: "status",
          label: "Status",
          value: sourcingData.status || "Not set",
          icon: sourcingData.status === "Completed" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
          color: sourcingData.status === "Completed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["Pending", "In Progress", "Completed"]
        }
      ];

    case "Screening":
      const screeningData = getStageData(candidate, "Screening");
      return [
        {
          key: "screeningDate",
          label: "Screening Date",
          value: formatApiDate(screeningData.screeningDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-blue-50 text-blue-600",
          type: "date"
        },
        {
          key: "cvSubmissionDate",
          label: "CV Submission Date",
          value: formatApiDate(screeningData.cvSubmissionDate),
          icon: <FileText className="h-4 w-4" />,
          color: "bg-indigo-50 text-indigo-600",
          type: "date"
        },
        {
          key: "aemsInterviewDate",
          label: "AEMS Interview Date",
          value: formatApiDateTime(screeningData.aemsInterviewDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-green-50 text-green-600",
          type: "datetime"
        },
        {
          key: "screeningStatus",
          label: "Screening Status",
          value: screeningData.screeningStatus || "Not set",
          icon: screeningData.screeningStatus === "Complete" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
          color: screeningData.screeningStatus === "Complete" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["Pending", "In Progress", "Complete"]
        },
        {
          key: "screeningRating",
          label: "Screening Rating",
          value: screeningData.screeningRating?.toString() || "Not set",
          icon: <Star className="h-4 w-4" />,
          color: "bg-purple-50 text-purple-600",
          type: "select",
          options: ["1", "2", "3", "4", "5"]
        },
        {
          key: "screeningFollowUpDate",
          label: "Follow-up Date",
          value: formatApiDate(screeningData.screeningFollowUpDate),
          icon: <Clock3 className="h-4 w-4" />,
          color: "bg-orange-50 text-orange-600",
          type: "date"
        },
        {
          key: "screeningDueDate",
          label: "Screening Due Date",
          value: formatApiDate(screeningData.screeningDueDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-red-50 text-red-600",
          type: "date"
        },
        {
          key: "screeningNotes",
          label: "Screening Notes",
          value: screeningData.screeningNotes || "Not set",
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-gray-50 text-gray-600",
          type: "textarea",
          placeholder: "Enter screening notes..."
        },
        {
          key: "technicalAssessment",
          label: "Technical Assessment",
          value: screeningData.technicalAssessment || "Not set",
          icon: <Target className="h-4 w-4" />,
          color: "bg-blue-50 text-blue-600",
          type: "text",
          placeholder: "Enter technical assessment"
        },
        {
          key: "softSkillsAssessment",
          label: "Soft Skills Assessment",
          value: screeningData.softSkillsAssessment || "Not set",
          icon: <User className="h-4 w-4" />,
          color: "bg-green-50 text-green-600",
          type: "text",
          placeholder: "Enter soft skills assessment"
        },
        {
          key: "overallRating",
          label: "Overall Rating",
          value: screeningData.overallRating?.toString() || "Not set",
          icon: <Star className="h-4 w-4" />,
          color: "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["1", "2", "3", "4", "5"]
        },
        {
          key: "feedback",
          label: "Feedback",
          value: screeningData.feedback || "Not set",
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-purple-50 text-purple-600",
          type: "textarea",
          placeholder: "Enter feedback..."
        }
      ];

    case "Client Review":
      const clientScreeningData = getStageData(candidate, "Client Review");
      return [
        {
          key: "clientScreeningDate",
          label: "Client Review Date",
          value: formatApiDate(clientScreeningData.clientScreeningDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-blue-50 text-blue-600",
          type: "date"
        },
        {
          key: "clientFeedback",
          label: "Client Feedback",
          value: clientScreeningData.clientFeedback || "Not set",
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-green-50 text-green-600",
          type: "select",
          options: ["Pending", "In Progress", "Complete"]
        },
        {
          key: "clientRating",
          label: "Client Rating",
          value: clientScreeningData.clientRating?.toString() || "Not set",
          icon: <Star className="h-4 w-4" />,
          color: "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["1", "2", "3", "4", "5"]
        }
      ];

    case "Interview":
      const interviewData = getStageData(candidate, "Interview");
      return [
        {
          key: "interviewDate",
          label: "Interview Date",
          value: formatApiDateTime(interviewData.interviewDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-blue-50 text-blue-600",
          type: "datetime"
        },
        {
          key: "interviewStatus",
          label: "Interview Status",
          value: interviewData.interviewStatus || "Not set",
          icon: interviewData.interviewStatus === "Completed" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
          color: interviewData.interviewStatus === "Completed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["Scheduled", "Completed", "Cancelled", "Rescheduled"]
        },
        {
          key: "interviewRoundNo",
          label: "Interview Round No",
          value: interviewData.interviewRoundNo?.toString() || "Not set",
          icon: <Target className="h-4 w-4" />,
          color: "bg-purple-50 text-purple-600",
          type: "select",
          options: ["1", "2", "3", "4", "5"]
        },
        {
          key: "interviewReschedules",
          label: "No. of Interview Reschedules",
          value: interviewData.interviewReschedules?.toString() || "Not set",
          icon: <Clock3 className="h-4 w-4" />,
          color: "bg-orange-50 text-orange-600",
          type: "select",
          options: ["0", "1", "2", "3", "4", "5"]
        },
        {
          key: "interviewMeetingLink",
          label: "Interview Meeting Link",
          value: interviewData.interviewMeetingLink || "Not set",
          icon: <Link className="h-4 w-4" />,
          color: "bg-indigo-50 text-indigo-600",
          type: "url",
          placeholder: "https://meet.google.com/..."
        }
      ];

    case "Verification":
      const verificationData = getStageData(candidate, "Verification");
      return [
        {
          key: "documents",
          label: "Documents",
          value: verificationData.documents || "Not set",
          icon: verificationData.documents === "Complete" ? <FileCheck className="h-4 w-4" /> : <FileText className="h-4 w-4" />,
          color: verificationData.documents === "Complete" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["Pending", "Complete", "In Progress"]
        },
        {
          key: "offerLetter",
          label: "Offer Letter",
          value: verificationData.offerLetter || "Not set",
          icon: verificationData.offerLetter === "Sent" ? <FileCheck className="h-4 w-4" /> : <FileX className="h-4 w-4" />,
          color: verificationData.offerLetter === "Sent" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
          type: "select",
          options: ["Not sent", "Sent", "Accepted", "Rejected"]
        },
        {
          key: "backgroundCheck",
          label: "Background Check",
          value: verificationData.backgroundCheck || "Not set",
          icon: verificationData.backgroundCheck === "Complete" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
          color: verificationData.backgroundCheck === "Complete" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["Pending", "Complete", "Failed"]
        }
      ];

    case "Onboarding":
      const onboardingData = getStageData(candidate, "Onboarding");
      return [
        {
          key: "onboardingStartDate",
          label: "Onboarding Start Date",
          value: formatApiDate(onboardingData.onboardingStartDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-blue-50 text-blue-600",
          type: "date"
        },
        {
          key: "onboardingStatus",
          label: "Onboarding Status",
          value: onboardingData.onboardingStatus || "Not set",
          icon: onboardingData.onboardingStatus === "Complete" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
          color: onboardingData.onboardingStatus === "Complete" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["Not Started", "In Progress", "Complete"]
        },
        {
          key: "trainingCompleted",
          label: "Training Completed",
          value: onboardingData.trainingCompleted || "Not set",
          icon: onboardingData.trainingCompleted === "Yes" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
          color: onboardingData.trainingCompleted === "Yes" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600",
          type: "select",
          options: ["Yes", "No", "In Progress"]
        }
      ];

    case "Hired":
      const hiredData = getStageData(candidate, "Hired");
      return [
        {
          key: "hireDate",
          label: "Joining Date",
          value: formatApiDate(hiredData.hireDate),
          icon: <CalendarDays className="h-4 w-4" />,
          color: "bg-green-50 text-green-600",
          type: "date"
        },
        {
          key: "contractType",
          label: "Contract Type",
          value: hiredData.contractType || "Not set",
          icon: <FileText className="h-4 w-4" />,
          color: "bg-blue-50 text-blue-600",
          type: "select",
          options: ["Full-time", "Part-time", "Contract", "Internship"]
        },
        {
          key: "finalSalary",
          label: "Salary",
          value: hiredData.finalSalary || "Not set",
          icon: <DollarSign className="h-4 w-4" />,
          color: "bg-purple-50 text-purple-600",
          type: "text",
          placeholder: "e.g., $75,000"
        }
      ];

    case "Disqualified":
      const disqualifiedData = getStageData(candidate, "Disqualified");
      return [
        {
          key: "disqualificationStage",
          label: "Disqualification Stage",
          value: disqualifiedData.disqualificationStage || candidate.currentStage || "Not set",
          icon: <Target className="h-4 w-4" />,
          color: "bg-red-50 text-red-600",
          type: "text",
          placeholder: "Enter the stage where disqualification occurred"
        },
        {
          key: "disqualificationStatus",
          label: "Disqualification Status",
          value: disqualifiedData.disqualificationStatus || candidate.status || "Not set",
          icon: <XCircle className="h-4 w-4" />,
          color: "bg-red-50 text-red-600",
          type: "text",
          placeholder: "Enter the status at time of disqualification"
        },
        {
          key: "disqualificationReason",
          label: "Reason",
          value: disqualifiedData.disqualificationReason || "Not set",
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-red-50 text-red-600",
          type: "textarea",
          placeholder: "Enter disqualification reason..."
        },
        {
          key: "disqualificationFeedback",
          label: "Feedback",
          value: disqualifiedData.disqualificationFeedback || "Not set",
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-orange-50 text-orange-600",
          type: "textarea",
          placeholder: "Enter detailed feedback..."
        }
      ];

    default:
      return [];
  }
};

// Helper function to get stage color
export const getStageColor = (stage: string) => {
  const colors = {
    "Sourcing": "bg-purple-100 text-purple-800 border-purple-200",
    "Screening": "bg-orange-100 text-orange-800 border-orange-200",
    "Client Review": "bg-green-100 text-green-800 border-green-200",
    "Interview": "bg-blue-100 text-blue-800 border-blue-200",
    "Verification": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Onboarding": "bg-green-100 text-green-800 border-green-200",
    "Hired": "bg-red-100 text-red-800 border-red-200",
    "Disqualified": "bg-red-100 text-red-800 border-red-200"
  };
  return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
};
