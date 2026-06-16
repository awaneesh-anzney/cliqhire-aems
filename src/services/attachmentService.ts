import { api } from "@/lib/axios-config";

export interface Attachment {
  _id: string;
  fileName: string;
  uploadedAt: string;
  file: string;
}

// Create a new attachment (file upload)
export const createJobAttachment = async (file: File, jobId: string): Promise<Attachment> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_id", jobId);
  const response = await api.post(`/api/jobattachments`, formData);
  return response.data.data;
};

// Get attachments by job ID
export const getJobAttachmentsByJobId = async (jobId: string): Promise<Attachment[]> => {
  const response = await api.get(`/api/jobattachments/job/${jobId}`);
  return response.data.data;
};

// Get a single attachment by ID
export const getJobAttachmentById = async (id: string): Promise<Attachment> => {
  const response = await api.get(`/api/jobattachments/${id}`);
  return response.data.data;
};

// Update an attachment by ID (PATCH for partial update)
export const updateJobAttachment = async (
  id: string,
  updateData: Partial<Attachment>,
): Promise<Attachment> => {
  const response = await api.patch(`/api/jobattachments/${id}`, updateData);
  return response.data.data;
};

// Delete an attachment by ID
export const deleteJobAttachment = async (id: string): Promise<void> => {
  await api.delete(`/api/jobattachments/${id}`);
};
