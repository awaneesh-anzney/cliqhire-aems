import { api } from "@/lib/axios-config";

export interface DashboardStats {
    jobs: {
        total: number;
        active: number;
        inactive: number;
    };
    candidates: {
        total: number;
        active: number;
        inactive: number;
    };
    clients: {
        total: number;
        byStage: {
            lead: number;
            engaged: number;
            signed: number;
        };
    };
    users: {
        total: number;
        active: number;
        inactive: number;
    };
    contracts: {
        total: number;
    };
    pipeline: {
        activePipelines: number;
        candidatesInProcess: number;
        candidatesCompleted: number;
        totalCandidatesInPipeline: number;
        stageBreakdown: {
            stage: string;
            count: number;
        }[];
        // Derived compatibility fields
        candidatesInterviewing: number;
        candidatesHired: number;
    };
    tasks: {
        pending: number;
        completed: number;
        total: number;
    };
}

export interface DashboardResponse {
    success: boolean;
    data: Omit<DashboardStats, "pipeline"> & {
        pipeline: {
            activePipelines: number;
            candidatesInProcess: number;
            candidatesCompleted: number;
            totalCandidatesInPipeline: number;
            stageBreakdown: {
                stage: string;
                count: number;
            }[];
        };
    };
    message?: string;
    error?: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await api.get<DashboardResponse>('/api/dashboard/stats');
        const data = response.data.data;

        // Safely extract stage breakdown and calculate derived values for backward compatibility
        const stageBreakdown = data.pipeline?.stageBreakdown || [];
        
        const interviewStage = stageBreakdown.find(
            s => s.stage.toLowerCase() === 'interview'
        );
        const hiredStage = stageBreakdown.find(
            s => s.stage.toLowerCase() === 'hired'
        );

        const candidatesInterviewing = interviewStage 
            ? interviewStage.count 
            : 0;
            
        const candidatesHired = hiredStage 
            ? hiredStage.count 
            : (data.pipeline?.candidatesCompleted || 0);

        return {
            ...data,
            pipeline: {
                ...data.pipeline,
                candidatesInterviewing,
                candidatesHired,
                stageBreakdown
            }
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};
