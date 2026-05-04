import axios from 'axios';
import { api } from '@/lib/axios-config';
import { 
  TeamMember, 
  TeamMemberResponse, 
  TeamMemberFilters, 
  CreateTeamMemberData, 
  UpdateTeamMemberData 
} from '@/types/teamMember';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Get all team members with optional filters
export const getTeamMembers = async (filters?: TeamMemberFilters): Promise<{ teamMembers: TeamMember[] }> => {
  try {
     const response = await api.get('/api/users', { params: filters });
    if (response.data && (response.data.status === 'success' || response.data.success === true)) {
      return {
        teamMembers: response.data.data?.users || response.data.data || []
      };
    }
    throw new Error(response.data?.message || 'Failed to fetch team members');
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch team members');
  }
};

// Get a single team member by ID
export const getTeamMemberById = async (id: string): Promise<TeamMember> => {
  try { 
    const response = await api.get(`/api/users/${id}`);
    if (response.data) {
      // Handle { success: true, data: { ... } } format
      if (response.data.success === true) {
        return response.data.data?.user || response.data.data || response.data;
      }
      // Handle { status: 'success', data: { ... } } format
      if (response.data.status === 'success') {
        return response.data.data?.user || response.data.data || response.data;
      }
      
      // Fallbacks
      return response.data.data?.user || response.data.data || response.data.user || response.data;
    }
    
    throw new Error(response.data?.message || 'Failed to fetch team member');
  } catch (error: any) {
    console.error('Error fetching team member:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch team member');
  }
};

// Create a new team member
export const createTeamMember = async (teamMemberData: CreateTeamMemberData | FormData): Promise<TeamMember> => {
  try {
    let response;
    
    if (teamMemberData instanceof FormData) {
      // FormData for file uploads - don't set Content-Type header
      // Browser will automatically set it with the correct boundary
      response = await api.post('/api/users/add-member', teamMemberData);
    } else {
      // JSON payload
      response = await api.post('/api/users/add-member', teamMemberData);
    }
    
    if (response.data && (response.data.status === 'success' || response.data.success === true)) {
      return response.data.data?.user || response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to create team member');
  } catch (error: any) {
    console.error('Error creating team member:', error);
    throw new Error(error.response?.data?.message || 'Failed to create team member');
  }
};

// Update a team member
export const updateTeamMember = async (teamMemberData: UpdateTeamMemberData): Promise<TeamMember> => {
  try {
    const { _id, ...updateData } = teamMemberData;
    
    // Filter only allowed fields according to API specification
    const allowedFields = [
      'name', 'firstName', 'lastName', 'email', 'teamRole', 'phone', 'location', 'experience', 
      'status', 'department', 'specialization', 'skills', 'resume', 
      'avatar', 'gender', 'countryCode'
    ];
    
    const filteredUpdateData = Object.keys(updateData).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = updateData[key as keyof typeof updateData];
      }
      return acc;
    }, {} as any);
    
    const response = await api.patch(`/api/users/${_id}`, filteredUpdateData);    
    // Handle different response formats
    if (response.data) {
      // If response has success field and it's true (new API format)
      if (response.data.success === true) {
        return response.data.data?.user || response.data.data || response.data;
      }
      
      // If response has status field and it's success (old API format)
      if (response.data.status === 'success') {
        return response.data.data?.user || response.data.data || response.data;
      }
      
      // If response doesn't have status field but has data (direct response)
      if (response.data.data) {
        return response.data.data.user || response.data.data;
      }
      
      // If response is the user object directly
      if (response.data._id) {
        return response.data;
      }
      
      // If response has a message indicating success
      if (response.data.message && response.data.message.toLowerCase().includes('success')) {
        return response.data.data?.user || response.data.data || response.data;
      }
    }
    
    // If we get here, the response format is unexpected
    console.warn('Unexpected response format:', response.data);
    
    // As a fallback, if we have any data and the status is 200, assume success
    if (response.status === 200 && response.data) {
      // Check for success field first
      if (response.data.success === true) {
        return response.data.data?.user || response.data.data || response.data;
      }
      // Fallback to other formats
      return response.data.data?.user || response.data.data || response.data;
    }
    
    throw new Error(response.data?.message || 'Failed to update team member');
  } catch (error: any) {
    console.error('Error updating team member:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Team member not found');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid request data');
    }
    
    // If we get a 200 status but it's in the error object, something is wrong with the response parsing
    if (error.response?.status === 200) {
      const responseData = error.response.data;
      if (responseData) {
        // Check for success field first
        if (responseData.success === true) {
          return responseData.data?.user || responseData.data || responseData;
        }
        // Fallback to other formats
        return responseData.data?.user || responseData.data || responseData;
      }
    }
    
    throw new Error(error.response?.data?.message || 'Failed to update team member');
  }
};

// Delete a team member
export const deleteTeamMember = async (id: string): Promise<void> => {
  try {  
    const response = await api.delete(`/api/users/${id}`);
    if (!response.data || (response.data.status !== 'success' && response.data.success !== true)) {
      throw new Error(response.data?.message || 'Failed to delete team member');
    }
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Team member not found');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to delete team member');
  }
};

// Update team member status
export const updateTeamMemberStatus = async (id: string, status: string): Promise<TeamMember> => {
  try {
    const response = await api.patch(`/api/users/${id}`, { status });

    // Handle multiple possible response formats
    if (response.data) {
      // New API format
      if (response.data.success === true) {
        return response.data.data?.user || response.data.data || response.data;
      }

      // Old API format
      if (response.data.status === 'success') {
        return response.data.data?.user || response.data.data || response.data;
      }

      // Generic data container
      if (response.data.data) {
        return response.data.data.user || response.data.data;
      }

      // Direct object
      if (response.data._id) {
        return response.data;
      }
    }

    // If status is 200 but body is unconventional, attempt sane fallback
    if (response.status === 200 && response.data) {
      return response.data.data?.user || response.data.data || response.data;
    }

    throw new Error(response.data?.message || 'Failed to update team member status');
  } catch (error: any) {
    console.error('Error updating team member status:', error);
    const message = error?.response?.data?.message || error?.message || 'Failed to update team member status';
    throw new Error(message);
  }
};

// Upload team member resume
export const uploadResume = async (id: string, file: File): Promise<{ resumeUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.patch(`/api/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Handle different response formats
    if (response.data) {
      // If response has success field and it's true (new API format)
      if (response.data.success === true) {
        return { resumeUrl: response.data.data?.user?.resume || response.data.data?.resume || '' };
      }
      
      // If response has status field and it's success (old API format)
      if (response.data.status === 'success') {
        return { resumeUrl: response.data.data?.user?.resume || response.data.data?.resume || '' };
      }
      
      // If response has data field
      if (response.data.data) {
        return { resumeUrl: response.data.data.user?.resume || response.data.data.resume || '' };
      }
    }
    
    throw new Error(response.data?.message || 'Failed to upload resume');
  } catch (error: any) {
    console.error('Error uploading resume:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Team member not found');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid file format or size');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to upload resume');
  }
};

// Get team member statistics
export const getTeamMemberStats = async (id: string): Promise<{
  activeJobs: number;
  completedPlacements: number;
  performanceRating: number;
}> => {
  try {
    const response = await api.get(`/api/users/${id}/stats`);
    
    if (response.data && (response.data.status === 'success' || response.data.success === true)) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to fetch team member stats');
  } catch (error: any) {
    console.error('Error fetching team member stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch team member stats');
  }
}; 



// Register team member with authentication credentials (Admin only)
export const registerTeamMember = async (registrationData: {
  teamMemberId: string;
  teamMemberName: string;
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    teamMemberId: string;
    isActive: boolean;
    createdAt: string;
  };
}> => {
  try {
    const response = await api.post('/api/auth/register-member', registrationData);

    // Normalize across possible API formats
    const data = response?.data || {};

    // New API: { success: true, data: { user }, message }
    if (data.success === true) {
      return {
        success: true,
        message: data.message || 'Team member registered successfully',
        user: data.data?.user || data.user,
      };
    }

    // Old API: { status: 'success', data: { user }, message }
    if (data.status === 'success') {
      return {
        success: true,
        message: data.message || 'Team member registered successfully',
        user: data.data?.user || data.user,
      };
    }

    // Fallback: HTTP 200 with usable data
    if (response.status === 200 && data) {
      return {
        success: true,
        message: data.message || 'Team member registered successfully',
        user: data.data?.user || data.user,
      };
    }

    throw new Error(data?.message || 'Failed to register team member');
  } catch (error: any) {
    console.error('Error registering team member:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Team member not found');
    }
    
    if (error.response?.status === 409) {
      throw new Error('User with this email already exists');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid request data');
    }

    if (error.response?.status === 200 && error.response.data) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to register team member',
      };
    }

    throw new Error(error.response?.data?.message || error.message || 'Failed to register team member');
  }
};