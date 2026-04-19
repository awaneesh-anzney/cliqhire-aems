import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJobPositions,
  getJobTeam,
  assignJobTeamPosition,
  removeJobTeamMember,
  type JobPosition,
  type TeamMemberForPosition,
} from '@/services/jobService';
import { toast } from 'sonner';

// ─── Job Positions Hook ───────────────────────────────────────────────────────

/**
 * Fetch all active job positions (hiringManager, recruiter, teamLead, headhunter …)
 * dynamically from /api/job-positions
 */
export function useJobPositions() {
  return useQuery<JobPosition[]>({
    queryKey: ['job-positions'],
    queryFn: getJobPositions,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

// ─── Job Team Hook ────────────────────────────────────────────────────────────

interface UseJobTeamOptions {
  jobId: string;
  enabled?: boolean;
}

/**
 * Fetch and mutate the team assigned to a specific job.
 * Uses the new /api/jobs/:jobId/team endpoints.
 */
export function useJobTeam({ jobId, enabled = true }: UseJobTeamOptions) {
  const queryClient = useQueryClient();
  const queryKey = ['job-team', jobId];

  // ── Fetch team ─────────────────────────────────────────────
  const {
    data: team,
    isLoading,
    isError,
    refetch,
  } = useQuery<TeamMemberForPosition[]>({
    queryKey,
    queryFn: async () => {
      const result = await getJobTeam(jobId);
      return result.team || [];
    },
    enabled: !!jobId && enabled,
  });

  // ── Assign members to a position ───────────────────────────
  const assignMutation = useMutation({
    mutationFn: ({
      position,
      userIds,
    }: {
      position: string;
      userIds: string[];
    }) => assignJobTeamPosition(jobId, position, userIds),

    onSuccess: (response) => {
      // Invalidate to refresh team data
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });

      const positionLabel =
        team?.find((t) => t.position === response.data?.jobTeamMembers?.find?.((m: any) => m)?.position)
          ?.positionLabel || 'position';

      toast.success(`Team member(s) assigned successfully`);

      // Pipeline auto-create notification
      if (response.pipeline?.created) {
        toast.success(`Pipeline created automatically for this job!`, {
          description: `Pipeline ID: ${response.pipeline.pipelineId}`,
        });
      }
    },

    onError: (error: any) => {
      const message = error?.message || 'Failed to assign team member';
      toast.error(message);
    },
  });

  // ── Remove a member from a position ────────────────────────
  const removeMutation = useMutation({
    mutationFn: ({ position, userId }: { position: string; userId: string }) =>
      removeJobTeamMember(jobId, position, userId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      toast.success('Team member removed');
    },

    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove team member');
    },
  });

  // ── Helper: get users for a specific position ──────────────
  const getUsersForPosition = (position: string) =>
    team?.find((t) => t.position === position)?.users || [];

  return {
    team: team || [],
    isLoading,
    isError,
    refetch,

    // Mutations
    assignToPosition: (position: string, userIds: string[]) =>
      assignMutation.mutateAsync({ position, userIds }),
    removeFromPosition: (position: string, userId: string) =>
      removeMutation.mutateAsync({ position, userId }),

    // State
    isAssigning: assignMutation.isPending,
    isRemoving: removeMutation.isPending,

    // Utility
    getUsersForPosition,
  };
}
