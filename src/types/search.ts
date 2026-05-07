export type SearchEntityType = 'all' | 'candidates' | 'clients' | 'jobs' | 'users' | 'temp';

export interface SearchParams {
  q: string;
  type?: SearchEntityType;
  page?: number;
  limit?: number;
  status?: string;
}

export interface CandidateItem {
  type: 'candidate';
  id: string;
  name: string;
  subtitle: string;
  email: string;
  phone: string;
  countryCode: string;
  otherPhone?: string;
  otherPhoneCountryCode?: string;
  status: string;
  location: string;
  experience: string;
}

export interface ClientItem {
  type: 'client';
  id: string;
  clientId: string;
  name: string;
  subtitle: string;
  email: string;
  phone: string;
  countryCode: string;
  industry: string;
  location: string;
  status: string;
  lineOfBusiness: string;
}

export interface JobItem {
  type: 'job';
  id: string;
  jobId: string;
  name: string;
  subtitle: string;
  client: {
    id: string;
    name: string;
    industry: string;
  };
  location: string;
  status: string;
  department: string;
}

export interface UserItem {
  type: 'user';
  id: string;
  name: string;
  subtitle: string;
  email: string;
  phone: string;
  countryCode: string;
  role: string;
  department: string;
  status: string;
  location: string;
}

export interface TempCandidateItem {
  type: 'temp';
  id: string;
  name: string;
  subtitle: string;
  email: string;
  phone: string;
  profileLink: string;
  countryCode: string;
  location: string;
  experience: string;
  pipelineId: string;
  isTemp: boolean;
}

export type SearchResultItem = CandidateItem | ClientItem | JobItem | UserItem | TempCandidateItem;

export interface EntityData<T> {
  items: T[];
  count: number;
  hasMore: boolean;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  type: SearchEntityType;
  totalCount: number;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  data: {
    candidates?: EntityData<CandidateItem>;
    clients?: EntityData<ClientItem>;
    jobs?: EntityData<JobItem>;
    users?: EntityData<UserItem>;
    tempCandidates?: EntityData<TempCandidateItem>;
    // When specific type is requested, it might be under a different key
    temp?: EntityData<TempCandidateItem>;
  };
  fromCache: boolean;
}
