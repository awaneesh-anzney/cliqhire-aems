import axios, { AxiosError } from "axios";

// Interface for Primary Contact
export interface PrimaryContact {
  _id?: string; // Make _id optional for new contacts
  client_id?: string; // Backend expects this field to link contact to client
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode?: string;
  position?: string;
  designation?: string; // Backend returns this field
  linkedin?: string;
  error?: string;
  gender?: string;
  name?: string; // Add name field for backend compatibility
}

export const clientStageStatuses = [
  "Replied to a message",
  "Calls",
  "Attended a meeting",
  "Profile Sent",
  "Contract Sent",
  "Contract Negotiation",
] as const;

export type ClientStageStatus = (typeof clientStageStatuses)[number];

export interface ClientResponse {
  clientId?:string;
  _id: string;
  name: string;
  emails?: string[];
  phoneNumber?: string;
  website?: string;
  industry?: string;
  location?: string;
  address?: string;
  googleMapsLink?: string;
  incorporationDate?: string | null;
  registrationNumber?: string;
  lineOfBusiness?: string[];
  countryOfBusiness?: string;
  referredBy?: string;
  linkedInProfile?: string;
  linkedInPage?: string;
  countryCode?: string;
  primaryContacts?: PrimaryContact[];
  clientStage?: "Lead" | "Engaged" | "Signed";
  clientSubStage?: ClientStageStatus;
  clientTeam?: "Enterprise" | "SMB" | "Mid-Market";
  clientRm?: string;
  clientAge?: {
    years: number;
    months: number;
    days: number;
  };
  contractNumber?: string;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  contractValue?: number;
  contractType?: string;
  cLevelPercentage?: number;
  belowCLevelPercentage?: number;
  fixedPercentageNotes?: string;
  fixedPercentageValue?: string;
  fixedPercentageAdvanceNotes?: string;
  cLevelPercentageNotes?: string;
  belowCLevelPercentageNotes?: string;
  fixWithoutAdvanceNotes?: string;
  seniorLevelPercentage?: number;
  executivesPercentage?: number;
  nonExecutivesPercentage?: number;
  otherPercentage?: number;
  seniorLevelNotes?: string;
  executivesNotes?: string;
  nonExecutivesNotes?: string;
  otherNotes?: string;
  profileImage?: string | null;
  crCopy?: string | null;
  vatCopy?: string | null;
  gstTinDocument?: string | null;
  fixedPercentage?: string | null;
  fixedPercentageAdvance?: string | null;
  variablePercentageCLevel?: string | null;
  variablePercentageBelowCLevel?: string | null;
  fixWithoutAdvance?: string | null;
  seniorLevel?: string | null;
  executives?: string | null;
  nonExecutives?: string | null;
  other?: string | null;
  salesLead?: string;
  jobCount?: number; // Added optional jobCount property
  createdBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  error?: string;
  labelType?: {
    seniorLevel?: string;
    executives?: string;
    nonExecutives?: string;
    other?: string;
  };
}

interface ApiResponse<T> {
  status: string;
  success: boolean;
  results?: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  data: T;
  message?: string;
  error?: string;
}


const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Deep clones an object and removes circular references
 */
const deepCloneAndSanitize = (obj: any): any => {
  const seen = new WeakSet();

  const clone = (item: any): any => {
    if (item === null || typeof item !== "object") return item;
    if (item instanceof Date) return item.toISOString();
    if (item instanceof File) return item; // Keep File objects as-is for now

    if (seen.has(item)) {
      return {}; // Remove circular reference
    }
    seen.add(item);

    if (Array.isArray(item)) {
      return item.map(clone);
    }

    const cloned: any = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        cloned[key] = clone(item[key]);
      }
    }
    return cloned;
  };

  return clone(obj);
};

/**
 * Validates and sanitizes client data
 */
const validateAndSanitizeClientData = (data: any) => {
  try {
    // First, deep clone and remove circular references
    const sanitized = deepCloneAndSanitize(data);

    // Ensure required fields exist and are valid
    if (!sanitized.name || sanitized.name.trim() === '') {
      throw new Error('Client name is required');
    }

    // Initialize arrays if they don't exist
    sanitized.emails = Array.isArray(sanitized.emails) ? sanitized.emails : [];
    sanitized.lineOfBusiness = Array.isArray(sanitized.lineOfBusiness) ? sanitized.lineOfBusiness : [];
    sanitized.primaryContacts = Array.isArray(sanitized.primaryContacts) ? sanitized.primaryContacts : [];

    // Convert string numbers to actual numbers where expected
    const numericFields = [
      'clientAge', 'contractValue', 'cLevelPercentage', 'belowCLevelPercentage',
      'seniorLevelPercentage', 'executivesPercentage', 'nonExecutivesPercentage', 'otherPercentage'
    ];

    numericFields.forEach(field => {
      if (sanitized[field] !== null && sanitized[field] !== undefined) {
        const num = Number(sanitized[field]);
        sanitized[field] = isNaN(num) ? 0 : num;
      }
    });

    // Clean up undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    // Ensure dates are strings or null
    if (sanitized.contractStartDate && !(typeof sanitized.contractStartDate === 'string')) {
      sanitized.contractStartDate = new Date(sanitized.contractStartDate).toISOString();
    }
    if (sanitized.contractEndDate && !(typeof sanitized.contractEndDate === 'string')) {
      sanitized.contractEndDate = new Date(sanitized.contractEndDate).toISOString();
    }
    // if (sanitized.incorporationDate && !(typeof sanitized.incorporationDate === 'string')) {
    //   sanitized.incorporationDate = new Date(sanitized.incorporationDate).toISOString();
    // }

    // Validate primary contacts
    if (sanitized.primaryContacts && Array.isArray(sanitized.primaryContacts)) {
      sanitized.primaryContacts = sanitized.primaryContacts.map((contact: any) => {
        if (typeof contact === 'object' && contact !== null) {
          // Create name from firstName and lastName if name doesn't exist
          const name = contact.name || (contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}`.trim() : '');
          return {
            client_id: contact.client_id || sanitized._id, // Include client_id for backend linking
            name: name,
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            email: contact.email || '',
            phone: contact.phone || '',
            countryCode: contact.countryCode || '',
            designation: contact.position || contact.designation || '', // Handle both position and designation
            linkedin: contact.linkedin || '',
            gender: contact.gender || '',
            isPrimary: contact.isPrimary !== undefined ? contact.isPrimary : true
          };
        }
        return contact;
      });
    }

    // Validate labelType
    if (sanitized.labelType && typeof sanitized.labelType === 'object') {
      sanitized.labelType = {
        seniorLevel: sanitized.labelType.seniorLevel || '',
        executives: sanitized.labelType.executives || '',
        nonExecutives: sanitized.labelType.nonExecutives || '',
        other: sanitized.labelType.other || '',
      };
    } else {
      sanitized.labelType = {
        seniorLevel: '',
        executives: '',
        nonExecutives: '',
        other: '',
      };
    }

    return sanitized;
  } catch (error: unknown) {
    console.error('Data validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    throw new Error(`Data validation failed: ${errorMessage}`);
  }
};

/**
 * Prepares FormData for requests with file uploads
 */
const prepareFormData = (data: any): FormData => {
  const formData = new FormData();
  const fileFields = [
    'profileImage', 'crCopy', 'vatCopy', 'gstTinDocument',
    'fixedPercentage', 'fixedPercentageAdvance',
    'variablePercentageCLevel', 'variablePercentageBelowCLevel',
    'fixWithoutAdvance', 'seniorLevel', 'executives',
    'nonExecutives', 'other'
  ];

  // Append all non-file fields
  Object.keys(data).forEach(key => {
    if (fileFields.includes(key)) {
      return; // Skip file fields for now
    }

    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value) || (typeof value === 'object' && key === 'labelType')) {
      try {
        formData.append(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Could not stringify field ${key}:`, error);
        // Skip this field if it can't be stringified
      }
    } else if (typeof value === 'object') {
      try {
        formData.append(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Could not stringify field ${key}:`, error);
      }
    } else {
      formData.append(key, String(value));
    }
  });

  // Append file fields
  fileFields.forEach(field => {
    const file = data[field];
    if (file instanceof File && file.size > 0) {
      formData.append(field, file, file.name);
    }
  });

  return formData;
};

/**
 * Prepares plain JSON data for requests without files
 */
const prepareJsonData = (data: any) => {
  const jsonData = { ...data };
  const fileFields = [
    'profileImage', 'crCopy', 'vatCopy', 'gstTinDocument',
    'fixedPercentage', 'fixedPercentageAdvance',
    'variablePercentageCLevel', 'variablePercentageBelowCLevel',
    'fixWithoutAdvance', 'seniorLevel', 'executives',
    'nonExecutives', 'other'
  ];

  // Convert File objects to null for JSON payload
  fileFields.forEach(field => {
    if (jsonData[field] instanceof File) {
      jsonData[field] = null;
    }
  });

  return jsonData;
};

/**
 * Determines if the payload contains any file uploads
 */
const hasFileUploads = (data: any): boolean => {
  const fileFields = [
    'profileImage', 'crCopy', 'vatCopy', 'gstTinDocument',
    'fixedPercentage', 'fixedPercentageAdvance',
    'variablePercentageCLevel', 'variablePercentageBelowCLevel',
    'fixWithoutAdvance', 'seniorLevel', 'executives',
    'nonExecutives', 'other'
  ];

  return fileFields.some(
    field => data[field] instanceof File && data[field].size > 0
  );
};

/**
 * Handles sending client requests with proper content type
 */
const sendClientRequest = async (
  url: string,
  method: 'post' | 'put',
  rawData: any
) => {
  try {
    // First validate and sanitize the data
    const validatedData = validateAndSanitizeClientData(rawData);

    if (hasFileUploads(validatedData)) {
      const formData = prepareFormData(validatedData);

      return await axios({
        method,
        url,
        data: formData,
        // When sending FormData, do not set Content-Type header
        // The browser will automatically set it with the correct boundary
        timeout: 30000, // 30 second timeout
      });
    } else {
      const jsonData = prepareJsonData(validatedData);

      // Test JSON serialization before sending
      try {
        const testSerialization = JSON.stringify(jsonData);
      } catch (serializationError) {
        console.error('JSON serialization failed:', serializationError);
        throw new Error('Data contains non-serializable content');
      }


      return await axios({
        method,
        url,
        data: jsonData,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Request error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
    console.error('Non-Axios error:', error);
    throw new Error('An unexpected error occurred');
  }
};

/**
 * Enhanced error handler with better error parsing
 */
const handleError = (error: AxiosError) => {
  let errorMessage = "Unknown error occurred";

  if (error.response) {
    // Server responded with error status
    const errorData = error.response.data as any;
    errorMessage = errorData?.message || errorData?.error || `Server error: ${error.response.status}`;

    // Log detailed error info for debugging
    console.error("API Error Details:", {
      status: error.response.status,
      statusText: error.response.statusText,
      data: errorData,
      url: error.config?.url,
      method: error.config?.method
    });
  } else if (error.request) {
    // Request made but no response received
    errorMessage = "No response from server. Please check your connection.";
    console.error("Network Error:", error.request);
  } else {
    // Error in request setup
    errorMessage = error.message;
    console.error("Request Setup Error:", error.message);
  }

  return new Error(errorMessage);
};

// Create a new client
const createClient = async (rawData: FormData | Omit<ClientResponse, "_id" | "createdAt" | "updatedAt"> & {
  profileImage?: File | null;
  crCopy?: File | null;
  vatCopy?: File | null;
  gstTinDocument?: File | null;
  fixedPercentage?: File | null;
  fixedPercentageAdvance?: File | null;
  variablePercentageCLevel?: File | null;
  variablePercentageBelowCLevel?: File | null;
  fixWithoutAdvance?: File | null;
  seniorLevel?: File | null;
  executives?: File | null;
  nonExecutives?: File | null;
  other?: File | null;
}): Promise<ClientResponse> => {
  try {
    if (rawData instanceof FormData) {
      // When sending FormData, do not set Content-Type header
      // The browser will automatically set it with the correct boundary
      const response = await axios.post<ApiResponse<ClientResponse>>(
        `${API_URL}/api/clients`,
        rawData,
        {
          timeout: 30000
        }
      );
      return response.data.data;
    } else {
      const response = await sendClientRequest(`${API_URL}/api/clients`, 'post', rawData);
      return response.data.data;
    }
  } catch (error: any) {
    console.error('Create client error:', error);
    throw handleError(error);
  }
};

export interface ClientsPage {
  clients: ClientResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get all clients (server-side paginated)
const getClients = async (queryParams: {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  clientStage?: "Lead" | "Engaged" | "Signed";
  clientTeam?: "Enterprise" | "SMB" | "Mid-Market";
} = {}): Promise<ClientsPage> => {
  const limit = queryParams.limit ?? 10;
  const page = queryParams.page ?? 1;

  try {
    const response = await axios.get(`${API_URL}/api/clients`, {
      params: { ...queryParams, page, limit },
      timeout: 15000,
    });

    const resData = response.data;

    // New API format: { success, totalCount, page, limit, data: [...] }
    if (resData.success && Array.isArray(resData.data)) {
      const totalCount = resData.totalCount ?? resData.results ?? resData.data.length;
      return {
        clients: resData.data,
        totalCount,
        page: resData.page ?? page,
        limit: resData.limit ?? limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      };
    }

    // Legacy nested format: { data: { clients: [...], total, page, pages } }
    if (resData.data?.clients) {
      const { clients, total, page: p, pages } = resData.data;
      return {
        clients,
        totalCount: total ?? clients.length,
        page: p ?? page,
        limit,
        totalPages: (pages ?? Math.ceil((total ?? clients.length) / limit)) || 1,
      };
    }

    // Fallback
    const clients = Array.isArray(resData.data) ? resData.data :
      Array.isArray(resData) ? resData : [];
    const totalCount = resData.results ?? resData.total ?? resData.totalCount ?? clients.length;
    return {
      clients,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error: any) {
    console.error('Error in getClients:', error);
    throw handleError(error);
  }
};

// Get client names
const getClientNames = async (search?: string): Promise<string[]> => {
  try {
    const response = await axios.get<ApiResponse<string[]>>(
      `${API_URL}/api/clients/names`,
      {
        params: { search },
        timeout: 10000
      }
    );
    return response.data.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// Get client by ID
const getClientById = async (id: string): Promise<ClientResponse> => {
  try {
    const response = await axios.get<ApiResponse<ClientResponse>>(
      `${API_URL}/api/clients/${id}`,
      { timeout: 15000 }
    );
    return response.data.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// Update client
const updateClient = async (
  id: string,
  rawData: Omit<ClientResponse, "_id" | "createdAt" | "updatedAt"> & {
    profileImage?: File | string | null;
    crCopy?: File | string | null;
    vatCopy?: File | string | null;
    gstTinDocument?: File | string | null;
    fixedPercentage?: File | string | null;
    fixedPercentageAdvance?: File | string | null;
    variablePercentageCLevel?: File | string | null;
    variablePercentageBelowCLevel?: File | string | null;
    fixWithoutAdvance?: File | string | null;
    seniorLevel?: File | string | null;
    executives?: File | string | null;
    nonExecutives?: File | string | null;
    other?: File | string | null;
  }
): Promise<ClientResponse> => {
  try {
    const response = await sendClientRequest(
      `${API_URL}/api/clients/${id}`,
      'put',
      rawData
    );
    return response.data.client;
  } catch (error: any) {
    throw handleError(error);
  }
};

// Update client stage
const updateClientStage = async (
  id: string,
  stage: "Lead" | "Engaged" | "Signed"
): Promise<ClientResponse> => {
  try {
    // Fetch the full client data to avoid backend issues with partial updates.
    const currentClient = await getClientById(id);

    const dataToUpdate = {
      ...currentClient,
      clientStage: stage,
    };

    // Remove fields that should not be sent in an update payload.
    const { _id, createdAt, updatedAt, __v, ...updatePayload } = dataToUpdate;

    // Manually remove file URL fields to prevent backend errors.
    const fileFields = [
      'profileImage', 'crCopy', 'vatCopy', 'gstTinDocument', 'fixedPercentage',
      'fixedPercentageAdvance', 'variablePercentageCLevel', 'variablePercentageBelowCLevel',
      'fixWithoutAdvance', 'seniorLevel', 'executives', 'nonExecutives', 'other'
    ];
    fileFields.forEach(field => delete (updatePayload as any)[field]);

    // Call the main updateClient function to reuse its logic, including validation.
    return await updateClient(id, updatePayload);

  } catch (error: any) {
    console.error("Error updating client stage:", error);
    // The error is already handled by `updateClient`, so we just re-throw it.
    throw error;
  }
};

// Update client stage status
const updateClientStageStatus = async (
  id: string,
  status: ClientStageStatus
): Promise<ClientResponse> => {
  try {
    // Fetch the full client data to avoid backend issues with partial updates.
    const currentClient = await getClientById(id);

    const dataToUpdate = {
      ...currentClient,
      clientSubStage: status,
    };

    // Remove fields that should not be sent in an update payload.
    const { _id, createdAt, updatedAt, __v, ...updatePayload } = dataToUpdate;

    // Manually remove file URL fields to prevent backend errors.
    const fileFields = [
      'profileImage', 'crCopy', 'vatCopy', 'gstTinDocument', 'fixedPercentage',
      'fixedPercentageAdvance', 'variablePercentageCLevel', 'variablePercentageBelowCLevel',
      'fixWithoutAdvance', 'seniorLevel', 'executives', 'nonExecutives', 'other'
    ];
    fileFields.forEach(field => delete (updatePayload as any)[field]);

    // Call the main updateClient function to reuse its logic, including validation.
    return await updateClient(id, updatePayload);

  } catch (error: any) {
    console.error("Error updating client stage status:", error);
    // The error is already handled by `updateClient`, so we just re-throw it.
    throw error;
  }
};

// Delete client
const deleteClient = async (id: string): Promise<void> => {
  try {
    await axios.delete<ApiResponse<null>>(`${API_URL}/api/clients/${id}`, {
      timeout: 10000
    });
  } catch (error: any) {
    throw handleError(error);
  }
};

// Upload client file
const uploadClientFile = async (
  clientId: string,
  file: File,
  field: "profileImage" | "crCopy" | "vatCopy" | "gstTinDocument" |
    "fixedPercentage" | "fixedPercentageAdvance" |
    "variablePercentageCLevel" | "variablePercentageBelowCLevel" |
    "fixWithoutAdvance" | "seniorLevel" | "executives" |
    "nonExecutives" | "other"
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", field);

    const response = await axios.post<ApiResponse<{ filePath: string }>>(
      `${API_URL}/api/clients/${clientId}/upload`,
      formData,
      {
        // When sending FormData, do not set Content-Type header
        // The browser will automatically set it with the correct boundary
        timeout: 30000
      }
    );
    return response.data.data.filePath;
  } catch (error: any) {
    throw handleError(error);
  }
};

// Add primary contact
const addPrimaryContact = async (
  clientId: string,
  contactData: PrimaryContact
): Promise<ClientResponse> => {
  try {
    // Handle phone number - remove country code from phone if it's included
    let phoneNumber = contactData.phone;
    let countryCode = contactData.countryCode || "";

    // If phone number starts with the country code, remove it
    if (phoneNumber && countryCode && phoneNumber.startsWith(countryCode.replace('+', ''))) {
      phoneNumber = phoneNumber.substring(countryCode.replace('+', '').length);
    }

    const contactPayload = {
      client_id: clientId, // Backend expects this field to link the contact to the client
      name: contactData.name || `${contactData.firstName} ${contactData.lastName}`.trim(),
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: phoneNumber,
      countryCode: countryCode,
      designation: contactData.position || "", // Backend expects 'designation' not 'position'
      linkedin: contactData.linkedin || "",
      gender: contactData.gender || "",
      isPrimary: true, // Backend expects this field
    };

    const response = await axios.post<ApiResponse<ClientResponse>>(
      `${API_URL}/api/clients/${clientId}/primarycontact`,
      contactPayload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000
      }
    );

    // The response should always have the data property according to ApiResponse<T> interface
    return response.data.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// Update a single primary contact using PATCH API
const updatePrimaryContact = async (
  clientId: string,
  contactId: string,
  contactData: Partial<PrimaryContact>
): Promise<PrimaryContact> => {
  try {
    // Map position to designation for backend compatibility
    const patchData = { ...contactData };
    if (patchData.position !== undefined) {
      patchData.designation = patchData.position;
      delete patchData.position;
    }

    const response = await axios.patch<ApiResponse<PrimaryContact>>(
      `${API_URL}/api/clients/${clientId}/primarycontact/${contactId}`,
      patchData,
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );
    return response.data.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// Delete a primary contact using DELETE API
const deletePrimaryContact = async (
  clientId: string,
  contactId: string
): Promise<void> => {
  try {
    await axios.delete<ApiResponse<null>>(
      `${API_URL}/api/clients/${clientId}/primarycontact/${contactId}`,
      { timeout: 15000 }
    );
  } catch (error: any) {
    throw handleError(error);
  }
};

// Get all primary contacts for a client
const getPrimaryContacts = async (clientId: string): Promise<PrimaryContact[]> => {
  try {
    const response = await axios.get<ApiResponse<PrimaryContact[]>>(
      `${API_URL}/api/clients/${clientId}/primary-contacts`,
      { timeout: 15000 }
    );
    return response.data.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

export {
  createClient,
  getClients,
  getClientNames,
  getClientById,
  updateClient,
  updateClientStage,
  updateClientStageStatus,
  deleteClient,
  uploadClientFile,
  addPrimaryContact,
  updatePrimaryContact,
  deletePrimaryContact,
  getPrimaryContacts,
};