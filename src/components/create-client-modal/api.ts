import { api } from "@/lib/axios-config";

export const createClient = async (data: FormData) => {
  try {
    const response = await api.post(
      `/api/clients`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(error.response?.data?.message || "Failed to create client");
  }
};