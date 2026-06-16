import { api } from "@/lib/axios-config";

interface ActivityData {
  activityName: string;
  description: string;
  // Add other activity fields as needed
}

// Define an interface for the activity response
export interface ActivityResponse {
  _id: string;
  activityName: string;
  description: string;
  // Add other activity fields as needed
  createdAt: string;
}

const createActivity = async (activityData: ActivityData) => {
  try {
    const response = await api.post(`/api/activities`, activityData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Unknown error occurred";
      console.error("Server response:", error.response.data);
      throw new Error(`Error creating activity: ${errorMessage}`);
    }
    throw new Error(`Error creating activity: ${error.message}`);
  }
};

const getActivities = async (): Promise<ActivityResponse[]> => {
  try {
    const response = await api.get(`/api/activities`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Unknown error occurred";
      console.error("Server response:", error.response.data);
      throw new Error(`Error fetching activities: ${errorMessage}`);
    }
    throw new Error(`Error fetching activities: ${error.message}`);
  }
};

const getActivityById = async (id: string): Promise<ActivityResponse> => {
  try {
    const response = await api.get(`/api/activities/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Unknown error occurred";
      console.error("Server response:", error.response.data);
      throw new Error(`Error fetching activity: ${errorMessage}`);
    }
    throw new Error(`Error fetching activity: ${error.message}`);
  }
};

const updateActivityById = async (id: string, activityData: ActivityData) => {
  try {
    const response = await api.patch(`/api/activities/${id}`, activityData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Unknown error occurred";
      console.error("Server response:", error.response.data);
      throw new Error(`Error updating activity: ${errorMessage}`);
    }
    throw new Error(`Error updating activity: ${error.message}`);
  }
};

const deleteActivityById = async (id: string) => {
  try {
    const response = await api.delete(`/api/activities/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Unknown error occurred";
      console.error("Server response:", error.response.data);
      throw new Error(`Error deleting activity: ${errorMessage}`);
    }
    throw new Error(`Error deleting activity: ${error.message}`);
  }
};

export { createActivity, getActivities, getActivityById, updateActivityById, deleteActivityById };
