export type ClientSource = 
  | 'Cold Call'
  | 'Reference'
  | 'Sales Team'
  | 'Events'
  | 'Existing Old Client'
  | 'Others';

export type ClientIndustryCategory =
  | 'Engineering & Industrial'
  | 'IT & Technology'
  | 'Corporate & Business Services'
  | 'Healthcare & Life Sciences'
  | 'Logistics & Transportation'
  | 'Retail & Consumer Services'
  | 'Education & Government'
  | 'Infrastructure & Real Estate'
  | 'Agriculture & Environment'
  | 'Banking, Insurance & Fintech'
  | 'Media & Entertainment';

export type ClientIndustry = {
  category: ClientIndustryCategory;
  name: string;
};

export type LineOfBusiness = 
  | 'Recruitment'
  | 'HR Managed Services'
  | 'IT & Technology'
  | 'Mgt Consulting'
  | 'HR Consulting'
  | 'Outsourcing';

export interface ClientContact {
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface ClientOrigin {
  source: ClientSource;
  salesPerson: string;
  referral: {
    source: string;
    referredBy: string;
    feePercentage: number;
    isExternal: boolean;
  };
  notes: string;
}

export interface ClientFormData {
  companyName: string;
  website: string;
  location: {
    country: string;
    city: string;
  };
  country: string;
  city: string;
  industry: string;
  salesLead: string;
  contacts: ClientContact[];
  documents: {
    crDocument?: File;
    vatDocument?: File;
  };
  crDocument?: File;
  vatDocument?: File;
  origin: ClientOrigin;
  lineOfBusiness: LineOfBusiness[];
}

export interface Client {
  id: string;
  name: string;
  jobCount: number;
  industry: string;
  location: string;
  stage: 'Lead' | 'Negotiation' | 'Engaged' | 'Signed';
  owner: string;
  team: string;
  createdAt: string;
  incorporationDate: string;
}