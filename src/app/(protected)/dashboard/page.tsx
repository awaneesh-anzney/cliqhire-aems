"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboard";
import {
  DashboardHeader,
  ExecutiveKpiStrip,
  PipelineVelocityCard,
  OperationsLaunchpad,
  RecruitmentForceCard,
  LegalAgreementsCard,
  DashboardSkeleton,
} from "@/components/dashboard";
import { CreateClientModal } from "@/components/create-client-modal/create-client-modal";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dashboardStats, isLoading } = useDashboardStats();

  const [openClientModal, setOpenClientModal] = useState(false);
  const [openJobModal, setOpenJobModal] = useState(false);
  const [openCandidateModal, setOpenCandidateModal] = useState(false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // 1. Candidates calculations
  const candidatesTotal = dashboardStats?.candidates?.total || 0;
  const candidatesActive = dashboardStats?.candidates?.active || 0;
  const candidatesInactive = dashboardStats?.candidates?.inactive || 0;
  const candidatesActivePercent =
    candidatesTotal > 0 ? (candidatesActive / candidatesTotal) * 100 : 0;
  const candidatesInactivePercent =
    candidatesTotal > 0 ? (candidatesInactive / candidatesTotal) * 100 : 0;

  // 2. Jobs calculations
  const jobsTotal = dashboardStats?.jobs?.total || 0;
  const jobStageBreakdown = dashboardStats?.jobs?.stageBreakdown || [];
  const jobsOpen =
    jobStageBreakdown.find((s: any) => s.stage?.toLowerCase() === "open")?.count || 0;
  const jobsActiveStage =
    jobStageBreakdown.find((s: any) => s.stage?.toLowerCase() === "active")?.count || 0;
  const jobsOpenPercent = jobsTotal > 0 ? (jobsOpen / jobsTotal) * 100 : 0;
  const jobsActivePercent = jobsTotal > 0 ? (jobsActiveStage / jobsTotal) * 100 : 0;

  // 3. Clients calculations
  const clientsTotal = dashboardStats?.clients?.total || 0;
  const clientsLead = dashboardStats?.clients?.byStage?.lead || 0;
  const clientsEngaged = dashboardStats?.clients?.byStage?.engaged || 0;
  const clientsSigned = dashboardStats?.clients?.byStage?.signed || 0;
  const clientsLeadPercent = clientsTotal > 0 ? (clientsLead / clientsTotal) * 100 : 0;
  const clientsEngagedPercent =
    clientsTotal > 0 ? (clientsEngaged / clientsTotal) * 100 : 0;
  const clientsSignedPercent =
    clientsTotal > 0 ? (clientsSigned / clientsTotal) * 100 : 0;

  // 4. Pipeline calculations
  const pipelineTotal = dashboardStats?.pipeline?.totalCandidatesInPipeline || 0;
  const activePipelines = dashboardStats?.pipeline?.activePipelines || 0;
  const candidatesInProcess = dashboardStats?.pipeline?.candidatesInProcess || 0;
  const candidatesCompleted = dashboardStats?.pipeline?.candidatesCompleted || 0;
  const stageBreakdown = dashboardStats?.pipeline?.stageBreakdown || [];

  // 5. Operations, Team & Contracts
  const usersTotal = dashboardStats?.users?.total || 0;
  const usersActive = dashboardStats?.users?.active || 0;
  const usersActivePercent = usersTotal > 0 ? Math.round((usersActive / usersTotal) * 100) : 0;
  const contractsTotal = dashboardStats?.contracts?.total || 0;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        px: { xs: 2, sm: 3, md: 3.5 },
        py: { xs: 2, sm: 2.5, md: 3 },
      }}
      className="font-sans"
    >
      {/* ─── 1. EXECUTIVE WELCOME HEADER ─── */}
      <DashboardHeader
        userName={user?.name}
        onOpenClient={() => setOpenClientModal(true)}
        onOpenJob={() => setOpenJobModal(true)}
        onOpenCandidate={() => setOpenCandidateModal(true)}
      />

      {/* ─── 2. PRIMARY EXECUTIVE METRICS KPI STRIP ─── */}
      <ExecutiveKpiStrip
        candidatesTotal={candidatesTotal}
        candidatesActive={candidatesActive}
        candidatesInactive={candidatesInactive}
        candidatesActivePercent={candidatesActivePercent}
        candidatesInactivePercent={candidatesInactivePercent}
        jobsTotal={jobsTotal}
        jobsOpen={jobsOpen}
        jobsActiveStage={jobsActiveStage}
        jobsOpenPercent={jobsOpenPercent}
        jobsActivePercent={jobsActivePercent}
        clientsTotal={clientsTotal}
        clientsLead={clientsLead}
        clientsEngaged={clientsEngaged}
        clientsSigned={clientsSigned}
        clientsLeadPercent={clientsLeadPercent}
        clientsEngagedPercent={clientsEngagedPercent}
        clientsSignedPercent={clientsSignedPercent}
        candidatesCompleted={candidatesCompleted}
        activePipelines={activePipelines}
        pipelineTotal={pipelineTotal}
      />

      {/* ─── 3. ANALYTICAL WORKSPACE: PERFECTLY ALIGNED ROWS ─── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(12, 1fr)" },
          gap: 2.5,
          alignItems: "stretch",
        }}
      >
        {/* Row 1 Left: Recruitment Pipeline Velocity (8 cols on desktop) */}
        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 8" }, display: "flex" }}>
          <PipelineVelocityCard
            pipelineTotal={pipelineTotal}
            activePipelines={activePipelines}
            candidatesInProcess={candidatesInProcess}
            candidatesCompleted={candidatesCompleted}
            stageBreakdown={stageBreakdown}
            jobsTotal={jobsTotal}
            jobStageBreakdown={jobStageBreakdown}
          />
        </Box>

        {/* Row 1 Right: Operations Launchpad (4 cols on desktop) */}
        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 4" }, display: "flex" }}>
          <OperationsLaunchpad
            onOpenCandidate={() => setOpenCandidateModal(true)}
            onOpenJob={() => setOpenJobModal(true)}
            onOpenClient={() => setOpenClientModal(true)}
          />
        </Box>

        {/* Row 2 Left: Recruitment Force & Staffing Capacity (8 cols on desktop) */}
        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 8" }, display: "flex" }}>
          <RecruitmentForceCard
            usersTotal={usersTotal}
            usersActive={usersActive}
            usersActivePercent={usersActivePercent}
          />
        </Box>

        {/* Row 2 Right: Legal & MSAs (4 cols on desktop) */}
        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 4" }, display: "flex" }}>
          <LegalAgreementsCard
            contractsTotal={contractsTotal}
          />
        </Box>
      </Box>

      {/* ─── 4. MODALS PRESERVED WITH 100% REAL APIS ─── */}
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
