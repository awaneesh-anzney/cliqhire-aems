"use client";

import { useState } from "react";
import { 
  Building2, 
  Briefcase, 
  UserPlus, 
  Calendar, 
  Sparkles,
  ShieldCheck,
  Plus,
  Layers,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards";
import { CreateClientModal } from "@/components/create-client-modal/create-client-modal";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { CreateCandidateModal } from "@/components/candidates/create-candidate-modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const [openClientModal, setOpenClientModal] = useState(false);
  const [openJobModal, setOpenJobModal] = useState(false);
  const [openCandidateModal, setOpenCandidateModal] = useState(false);

  const firstName = user?.name ? user.name.split(" ")[0] : "Partner";

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="dashboard-container">
      {/* ─── MODERN EXECUTIVE COMMAND & ACTION HEADER ─── */}
      <header className="relative overflow-hidden rounded-2xl bg-card/95 dark:bg-card/95 backdrop-blur-xl border border-border/80 p-3 sm:p-4 shadow-xs shrink-0 transition-all duration-300">
        {/* Subtle Ambient Radial Tints: #FFF1F2 & #EFF6FF */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-[#FFF1F2] dark:bg-rose-500/10 blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-8 h-28 w-36 rounded-full bg-[#EFF6FF] dark:bg-blue-500/10 blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Welcome & Context Strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FFF1F2] to-[#EFF6FF] dark:from-rose-500/20 dark:to-blue-500/20 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                  Welcome back, {firstName}
                </h1>
                {/* Live workspace indicator */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Workspace Live</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Talent Operations & Sourcing Hub • Real-time Requisition & Pipeline Analytics
              </p>
            </div>
          </div>

          {/* Action Bar & Date Badge */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
            {/* Current Date Badge with #FFF1F2 soft tint */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1F2] dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-[11px] font-bold text-rose-700 dark:text-rose-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>{currentDate}</span>
            </div>

            {/* Quick Action: Client */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenClientModal(true)}
              className="h-8 px-3 gap-1.5 bg-card hover:bg-muted/80 border-border/80 text-foreground rounded-xl transition-all active:scale-95 shadow-2xs text-[11px] font-bold"
            >
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>+ Client</span>
            </Button>

            {/* Quick Action: Job */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenJobModal(true)}
              className="h-8 px-3 gap-1.5 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl transition-all active:scale-95 shadow-2xs text-[11px] font-bold"
            >
              <Briefcase className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>+ Job</span>
            </Button>

            {/* Quick Action: Candidate (Primary Crimson Rose Standout) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenCandidateModal(true)}
              className="h-8 px-3.5 gap-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white border border-rose-400/40 rounded-xl transition-all active:scale-95 shadow-xs shadow-rose-500/25 text-[11px] font-bold"
            >
              <UserPlus className="h-3.5 w-3.5 text-white" />
              <span>+ Candidate</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── PRIMARY METRICS & ANALYTICS WORKSPACE ─── */}
      <DashboardKpiCards
        onOpenClient={() => setOpenClientModal(true)}
        onOpenJob={() => setOpenJobModal(true)}
        onOpenCandidate={() => setOpenCandidateModal(true)}
      />

      {/* ─── MODALS ─── */}
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
    </div>
  );
}
