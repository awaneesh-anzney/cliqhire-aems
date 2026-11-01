"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboard";
import { DashboardQueryParams } from "@/types/dashboard";
import {
  DashboardHeader,
  DashboardTimeframeBar,
  ExecutiveKpiStrip,
  RecruitmentFunnelCard,
  MonthlyTrendsChartCard,
  DistributionCards,
  LeaderboardsCard,
  OperationsLaunchpad,
  DashboardSkeleton,
} from "@/components/dashboard";
import { CreateClientModal } from "@/components/create-client-modal/create-client-modal";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";

export default function DashboardPage() {
  const { user } = useAuth();

  // Query parameters for timeframe scoping (presets: 'all', 'month', '3_months', '6_months', 'year', or specific year/month/dates)
  const [queryParams, setQueryParams] = useState<DashboardQueryParams>({
    timeframe: "6_months",
  });

  // Fetch live dashboard statistics with query parameters
  const {
    data: dashboardStats,
    isLoading,
    isFetching,
    refetch,
  } = useDashboardStats(queryParams);

  // Quick Action Modals
  const [openClientModal, setOpenClientModal] = useState(false);
  const [openJobModal, setOpenJobModal] = useState(false);
  const [openCandidateModal, setOpenCandidateModal] = useState(false);

  const handleParamsChange = (updates: Partial<DashboardQueryParams>) => {
    setQueryParams((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.25, md: 1.5 },
        p: { xs: "8px 12px 14px", sm: "10px 14px 16px" },
      }}
      className="font-sans"
    >
      {/* ─── 1. EXECUTIVE WELCOME & COMPANY BRANDING HEADER ─── */}
      <DashboardHeader
        userName={user?.name}
        companyName="CliqHire"
        onOpenClient={() => setOpenClientModal(true)}
        onOpenJob={() => setOpenJobModal(true)}
        onOpenCandidate={() => setOpenCandidateModal(true)}
      />

      {/* ─── 2. TIMEFRAME FILTER TOOLBAR (Presets, Month/Year Picker, Custom Range Popover) ─── */}
      <DashboardTimeframeBar
        timeframeInfo={dashboardStats?.timeframe}
        params={queryParams}
        onParamsChange={handleParamsChange}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      {/* ─── 3. PRIMARY EXECUTIVE METRICS KPI STRIP ─── */}
      {/* Order: 1. Clients (Lead, Engaged, Signed), 2. Jobs, 3. Candidates, 4. Hired Candidates */}
      <ExecutiveKpiStrip
        kpiCards={dashboardStats?.kpiCards}
        candidatesStats={dashboardStats?.candidates}
        monthlyTrends={dashboardStats?.charts?.monthlyTrends}
        timeframeLabel={dashboardStats?.timeframe?.label}
        candidatesTotal={dashboardStats?.candidates?.total || 0}
        candidatesActive={dashboardStats?.candidates?.active || 0}
        candidatesInactive={dashboardStats?.candidates?.inactive || 0}
        jobsTotal={dashboardStats?.jobs?.total || 0}
        jobsActive={dashboardStats?.jobs?.active || 0}
        jobsInactive={dashboardStats?.jobs?.inactive || 0}
        clientsTotal={dashboardStats?.clients?.total || 0}
        clientsLead={dashboardStats?.clients?.byStage?.lead || 0}
        clientsEngaged={dashboardStats?.clients?.byStage?.engaged || 0}
        clientsSigned={dashboardStats?.clients?.byStage?.signed || 0}
        candidatesCompleted={dashboardStats?.pipeline?.candidatesCompleted || 0}
      />

      {/* ─── 4. ANALYTICAL WORKSPACE: FUNNEL & OPERATIONS ─── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(12, 1fr)" },
          gap: { xs: 1.5, md: 2 },
          alignItems: "stretch",
        }}
      >
        {/* Row 1 Left: Recruitment Funnel Conversion (8 cols on desktop) */}
        <Box
          sx={{ gridColumn: { xs: "span 12", lg: "span 8" }, display: "flex" }}
        >
          <RecruitmentFunnelCard
            funnel={dashboardStats?.charts?.recruitmentFunnel}
          />
        </Box>

        {/* Row 1 Right: Operations Launchpad with quick actions & Hired Registry link (4 cols on desktop) */}
        <Box
          sx={{ gridColumn: { xs: "span 12", lg: "span 4" }, display: "flex" }}
        >
          <OperationsLaunchpad
            onOpenCandidate={() => setOpenCandidateModal(true)}
            onOpenJob={() => setOpenJobModal(true)}
            onOpenClient={() => setOpenClientModal(true)}
          />
        </Box>
      </Box>

      {/* ─── 5. MONTHLY HIRING VELOCITY & TRENDS CHART ─── */}
      <Box sx={{ width: "100%" }}>
        <MonthlyTrendsChartCard
          trends={dashboardStats?.charts?.monthlyTrends}
        />
      </Box>

      {/* ─── 6. LIFECYCLE & STAGE DISTRIBUTION CARDS ─── */}
      <Box sx={{ width: "100%" }}>
        <DistributionCards
          clientDistribution={dashboardStats?.charts?.clientDistribution}
          jobStageDistribution={dashboardStats?.charts?.jobStageDistribution}
        />
      </Box>

      {/* ─── 7. RECRUITER & CLIENT LEADERBOARDS ─── */}
      <Box sx={{ width: "100%" }}>
        <LeaderboardsCard
          topRecruiters={dashboardStats?.charts?.topRecruiters}
          topClients={dashboardStats?.charts?.topClientsByActiveJobs}
        />
      </Box>

      {/* ─── 8. QUICK ACTION MODALS ─── */}
      <CreateClientModal
        open={openClientModal}
        onOpenChange={setOpenClientModal}
      />

      <CreateJobRequirementForm
        open={openJobModal}
        onOpenChange={setOpenJobModal}
      />

      <CreateCandidateModal
        isOpen={openCandidateModal}
        onClose={() => setOpenCandidateModal(false)}
      />
    </Box>
  );
}
