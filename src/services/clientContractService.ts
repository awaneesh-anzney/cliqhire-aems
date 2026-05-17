import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL ;

// Get all contracts for a client
export const getClientContracts = async (clientId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/contracts/client/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client contracts:", error);
    throw error;
  }
};

// Get single contract type for a client
export const getContractByType = async (clientId: string, contractType: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/contracts/${clientId}/${contractType}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contractType} contract:`, error);
    throw error;
  }
};

// Update contract API function
export const updateContract = async (clientId: string, contractType: string, contractData: any) => {
  try {
    // Create FormData for file uploads and other data
    const formData = new FormData();

    // Helper function to append data to FormData
    const appendToFormData = (key: string, value: any) => {
      if (value === null || value === undefined) {
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    };

    // Handle file uploads with specific naming based on contract type (similar to addContract)
    if (contractType === "consultingContractHRC") {
      const { technicalProposalDocument, financialProposalDocument } = contractData;
      if (technicalProposalDocument instanceof File) {
        formData.append("techProposalDocHRC", technicalProposalDocument);
      }
      if (financialProposalDocument instanceof File) {
        formData.append("finProposalDocHRC", financialProposalDocument);
      }
    } else if (contractType === "consultingContractMGTC") {
      const { technicalProposalDocument, financialProposalDocument } = contractData;
      if (technicalProposalDocument instanceof File) {
        formData.append("techProposalDocMGTC", technicalProposalDocument);
      }
      if (financialProposalDocument instanceof File) {
        formData.append("finProposalDocMGTC", financialProposalDocument);
      }
    } else if (contractType === "businessContractRQT") {
      const { contractDocument } = contractData;
      if (contractDocument instanceof File) {
        formData.append("businessContractRQTDocument", contractDocument);
      }
    } else if (contractType === "businessContractHMS") {
      const { contractDocument } = contractData;
      if (contractDocument instanceof File) {
        formData.append("businessContractHMSDocument", contractDocument);
      }
    } else if (contractType === "businessContractIT") {
      const { contractDocument } = contractData;
      if (contractDocument instanceof File) {
        formData.append("businessContractITDocument", contractDocument);
      }
    } else if (contractType === "outsourcingContract") {
      const { contractDocument } = contractData;
      if (contractDocument instanceof File) {
        formData.append("outsourcingContractDocument", contractDocument);
      }
    }
    
    // Append all contract data to FormData (excluding files which are handled above)
    Object.keys(contractData).forEach((key) => {
      const value = contractData[key];

      // Skip file fields as they are handled specifically above
      // Only skip fields that end with "Document" or are actual file fields
      if (key.endsWith("Document") || (key.includes("Document") && value instanceof File)) {
        if (value && typeof value === "object" && value.url) {
          // If it's an existing file object, don't append it
          // The backend will keep the existing file
          return;
        }
        // Skip file fields that were handled above
        return;
      } else {
        appendToFormData(key, value);
      }
    });
    
    const response = await axios.patch(
      `${API_URL}/api/contracts/updatecontracts/${clientId}/${contractType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error updating contract:", error);
    throw error;
  }
};

// Delete contract API function
export const deleteContract = async (clientId: string, contractType: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/contracts/deletecontracts/${clientId}/${contractType}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting contract:", error);
    throw error;
  }
};

// Add contract API function
export const addContract = async (clientId: string, contractType: string, contractData: any) => {
  try {
    // Create FormData for file uploads and other data
    const formData = new FormData();

    // Add clientId and contractType
    formData.append("clientId", clientId);
    formData.append("businessType", contractType);

    // Helper function to append data to FormData
    const appendToFormData = (key: string, value: any) => {
      if (value === null || value === undefined) {
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    };

    // Handle file uploads with specific naming based on contract type
    if (contractType === "consultingContractHRC") {
      const { technicalProposalDocument, financialProposalDocument } = contractData;
      if (technicalProposalDocument) {
        formData.append("techProposalDocHRC", technicalProposalDocument);
      }
      if (financialProposalDocument) {
        formData.append("finProposalDocHRC", financialProposalDocument);
      }
    }
    if (contractType === "consultingContractMGTC") {
      const { technicalProposalDocument, financialProposalDocument } = contractData;
      if (technicalProposalDocument) {
        formData.append("techProposalDocMGTC", technicalProposalDocument);
      }
      if (financialProposalDocument) {
        formData.append("finProposalDocMGTC", financialProposalDocument);
      }
    }
    if (contractType === "businessContractRQT") {
      const { contractDocument } = contractData;
      if (contractDocument) {
        formData.append("businessContractRQTDocument", contractDocument);
      }
    }
    if (contractType === "businessContractHMS") {
      const { contractDocument } = contractData;
      if (contractDocument) {
        formData.append("businessContractHMSDocument", contractDocument);
      }
    }
    if (contractType === "businessContractIT") {
      const { contractDocument } = contractData;
      if (contractDocument) {
        formData.append("businessContractITDocument", contractDocument);
      }
    }
    if (contractType === "outsourcingContract") {
      const { contractDocument } = contractData;
      if (contractDocument) {
        formData.append("outsourcingContractDocument", contractDocument);
      }
    }

    // Append all other contract data to FormData (excluding files which are handled above)
    Object.keys(contractData).forEach((key) => {
      const value = contractData[key];

      // Skip file fields as they are handled specifically above
      if (key.includes("Document")) {
        return;
      }

      appendToFormData(key, value);
    });

    const response = await axios.post(`${API_URL}/api/contracts/addContracts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding contract:", error);
    throw error;
  }
};

// Renew contract API function
export const renewContract = async (clientId: string, contractType: string, notes?: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/contracts/renew/${clientId}/${contractType}`,
      { notes }
    );
    return response.data;
  } catch (error) {
    console.error(`Error renewing ${contractType} contract:`, error);
    throw error;
  }
};
