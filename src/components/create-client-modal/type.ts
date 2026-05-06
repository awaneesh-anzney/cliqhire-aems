export interface PrimaryContact {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  countryCode: string;
  designation: string;
  linkedin?: string;
  isPrimary: boolean
}

export interface ClientForm {
  name: string;
  emails: string[];
  phoneNumber: string;
  website?: string;
  salesLead?: string;
  industry?: string;
  location?: string;
  address?: string;
  googleMapsLink?: string;
  incorporationDate?: string;
  registrationNumber?: string;
  lineOfBusiness?: string[] | string;
  countryOfBusiness?: string;
  referredBy?: string;
  linkedInProfile?: string;
  linkedInPage?: string;
  countryCode: string;
  primaryContacts: PrimaryContact[];
  clientStage?: "Lead" | "Engaged" | "Signed";
  clientSubStage?: string;
  clientTeam?: string;
  clientRm?: string;
  clientAge?: number;
  contractNumber?: string;
  contractStartDate?: Date | null;
  contractEndDate?: Date | null;
  contractValue?: number;
  contractType?: string;
  cLevelPercentage?: number;
  belowCLevelPercentage?: number;
  fixedPercentageNotes?: string;
  fixedPercentageAdvanceNotes?: string;
  advanceMoneyCurrency?: string;
  advanceMoneyAmount?: number;
  cLevelPercentageNotes?: string;
  proposalOptions?: string[];
  crCopy?: any;
  vatCopy?: any;
  gstTinDocument?: any;
  fixedPercentage?: any;
  fixedPercentageAdvance?: any;
  variablePercentageCLevel?: any;
  variablePercentageBelowCLevel?: any;
  fixWithoutAdvance?: any;
  seniorLevel?: any;
  executives?: any;
  nonExecutives?: any;
  other?: any;
  seniorLevelMoney?: number;
  seniorLevelCurrency?: string;
  executivesMoney?: number;
  executivesCurrency?: string;
  nonExecutivesMoney?: number;
  nonExecutivesCurrency?: string;
  otherMoney?: number;
  otherCurrency?: string;
  seniorLevelPercentage?: number;
  executivesPercentage?: number;
  nonExecutivesPercentage?: number;
  otherPercentage?: number;
  seniorLevelNotes?: string;
  executivesNotes?: string;
  nonExecutivesNotes?: string;
  otherNotes?: string;
  clientSource?: string;
  fixWithoutAdvanceNotes?: string;
  fixWithoutAdvanceValue?: number;
  clientPriority?: string;
  clientSegment?: string;
  technicalProposal?: any;
  financialProposal?: any;
  technicalProposalNotes?: string;
  financialProposalNotes?: string;
  // Outsourcing contract form fields
  outsourcingContractStartDate?: Date | null;
  outsourcingContractEndDate?: Date | null;
  outsourcingContractType?: string;
  outsourcingServiceCategory?: string;
  outsourcingNumResources?: string;
  outsourcingDurationPerResource?: string;
  outsourcingSlaTerms?: string;
  outsourcingTotalCost?: string;
  outsourcingContractDocument?: any;
  businessContracts?: Record<string, any>;
}

export interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export type ClientGeneralInfo = {
  clientStage: string | undefined;
  clientSubStage: string | undefined;
  salesLead: string | undefined;
  referredBy: string | undefined;
  clientPriority: string | undefined;
  clientSegment: string | undefined;
  clientSource: string | undefined;
  industry: string | undefined;
}

export type ClientContactInfo = {
  name: string;
  emails: string[];
  phoneNumber: string;
  address: string;
  website: string;
  linkedInProfile: string;
  location: string;
  googleMapsLink: string;
  countryOfBusiness: string;
  primaryContacts: PrimaryContact[];
}

export type ClientContractInfo = {
  lineOfBusiness: string[];
  contractForms: Record<string, any>;
}