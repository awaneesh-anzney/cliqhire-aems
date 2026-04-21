import { ClientForm } from "@/components/create-client-modal/type";
import { PrimaryContact } from "@/services/clientService";

export const optionsForClient = [
  {
    value: "Lead",
    label: "Lead",
  },
  {
    value: "Engaged",
    label: "Engaged",
    children: [
      {
        value: "Calls",
        label: "Calls",
      },
      {
        value: "Profile Sent",
        label: "Profile Sent",
      },
      {
        value: "Contract Sent",
        label: "Contract Sent",
      },
      {
        value: "Attended a meeting",
        label: "Attended a meeting",
      },
      {
        value: "Replied to a message",
        label: "Replied to a message",
      },
      {
        value: "Contract Negotiation",
        label: "Contract Negotiation",
      },
    ],
  },
  {
    value: "Signed",
    label: "Signed",
  },
];

// Redundant: custom PhoneInput uses its own country list
export const countryCodes = [];

export const positionOptions = [
  { value: "CEO", label: "CEO" },
  { value: "HR Head", label: "HR Head" },
  { value: "CHRO", label: "CHRO" },
  { value: "HR", label: "HR" },
  { value: "Manager", label: "Manager" },
  { value: "HR Manager", label: "HR Manager" },
  { value: "Director", label: "Director" },
  { value: "Executive", label: "Executive" },
  { value: "General Manager", label: "General Manager" },
];

// export const levelFieldMap: Record<string, { percentage: keyof ClientForm; notes: keyof ClientForm; money: keyof ClientForm; currency: keyof ClientForm; }> = {
//   "Senior Level": { percentage: "seniorLevelPercentage", notes: "seniorLevelNotes", money: "seniorLevelMoney", currency: "seniorLevelCurrency" },
//   "Executives": { percentage: "executivesPercentage", notes: "executivesNotes", money: "executivesMoney", currency: "executivesCurrency" },
//   "Non-Executives": { percentage: "nonExecutivesPercentage", notes: "nonExecutivesNotes", money: "nonExecutivesMoney", currency: "nonExecutivesCurrency" },
//   "Other": { percentage: "otherPercentage", notes: "otherNotes", money: "otherMoney", currency: "otherCurrency" },
// };

export const clientSubStages = [
  "Calls",
  "Profile Sent",
  "Contract Sent",
  "Attended a meeting",
  "Replied to a message",
  "Contract Negotiation",
];

export const levelValue = {
  percentage: 0,
  notes: "",
};

export const levelValueAdvance = {
  percentage: 0,
  notes: "",
  amount: 0,
  currency: "SAR",
};

export const businessInitialState = {
  contractStartDate: null,
  contractEndDate: null,
  contractType: "",
  //fixed with advance
  fixedPercentage: 0,
  advanceMoneyCurrency: "SAR",
  advanceMoneyAmount: 0,
  fixedPercentageAdvanceNotes: "",

  //fixed without advance
  fixWithoutAdvanceValue: 0,
  fixWithoutAdvanceNotes: "",

  levelBasedHiring: {
    levelTypes: [],
    seniorLevel: { ...levelValue },
    executives: { ...levelValue },
    nonExecutives: { ...levelValue },
    other: { ...levelValue },
  },

  levelBasedAdvanceHiring: {
    levelTypes: [],
    seniorLevel: { ...levelValueAdvance },
    executives: { ...levelValueAdvance },
    nonExecutives: { ...levelValueAdvance },
    other: { ...levelValueAdvance },
  },

  contractDocument: null,
};

export const consultingInitialState = {
  contractStartDate: null,
  contractEndDate: null,
  technicalProposalDocument: null,
  financialProposalDocument: null,
  technicalProposalNotes: "",
  financialProposalNotes: "",
};

export const primaryContactInitialState = {
  firstName: "",
  lastName: "",
  gender: "",
  email: "",
  phone: "",
  countryCode: "SA",
  designation: "",
  linkedin: "",
  isPrimary: true,
};

export const outsourcingInitialState = {
  contractStartDate: null,
  contractEndDate: null,
  contractType: "",
  serviceCategory: "",
  numberOfResources: 0,
  durationPerResource: 0,
  slaTerms: "",
  totalCost: 0,
  contractDocument: null,
};

export const clientGeneralInfoInitialState = {
  clientStage: undefined,
  salesLead: undefined,
  referredBy: undefined,
  clientPriority: undefined,
  clientSegment: undefined,
  clientSource: undefined,
  industry: undefined,
  clientSubStage: undefined,
};

export const clientContactInfoInitialstate = {
  name: "",
  emails: [],
  phoneNumber: "",
  address: "",
  website: "",
  linkedInProfile: "",
  location: "",
  googleMapsLink: "",
  countryOfBusiness: "",
  primaryContacts: [],
};

export const CONTRACT_TYPES = [
  "Fix with Advance",
  "Fix without Advance",
  "Level Based (Hiring)",
  "Level Based With Advance",
];

export const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "INR"];
export const LEVELS = ["Senior Level", "Executives", "Non-Executives", "Other"];
export const levelFieldMap: Record<
  string,
  { percentage: string; currency: string; money: string; notes: string }
> = {
  "Senior Level": {
    percentage: "seniorLevelPercentage",
    currency: "seniorLevelCurrency",
    money: "seniorLevelMoney",
    notes: "seniorLevelNotes",
  },
  Executives: {
    percentage: "executivesPercentage",
    currency: "executivesCurrency",
    money: "executivesMoney",
    notes: "executivesNotes",
  },
  "Non-Executives": {
    percentage: "nonExecutivesPercentage",
    currency: "nonExecutivesCurrency",
    money: "nonExecutivesMoney",
    notes: "nonExecutivesNotes",
  },
  Other: {
    percentage: "otherPercentage",
    currency: "otherCurrency",
    money: "otherMoney",
    notes: "otherNotes",
  },
};
