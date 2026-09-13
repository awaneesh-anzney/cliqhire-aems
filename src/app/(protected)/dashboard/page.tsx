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
    <div className="h-full min-h-0 w-full flex flex-col overflow-hidden p-2.5 sm:p-3 md:p-3.5 gap-2.5 bg-transparent animate-in fade-in duration-300">
      {/* ─── MODERN EXECUTIVE COMMAND & ACTION HEADER ─── */}
      <header className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-slate-900 text-primary-foreground py-2 px-3 sm:px-4 border border-white/10 shadow-sm shrink-0">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-10 h-24 w-32 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Welcome & Status Pill */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-7.5 w-7.5 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-md shadow-2xs">
              <Sparkles className="h-4 w-4 text-white" />
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Welcome back, {firstName}
              </h1>
              <span className="hidden md:inline text-[11px] font-medium text-white/75">
                Talent Operations & Sourcing Hub
              </span>
            </div>

            {/* Live Feed indicator */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Workspace Live</span>
            </div>
          </div>

          {/* Action Bar & Date Badge */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
            {/* Quick Action: Client */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenClientModal(true)}
              className="h-7.5 px-2.5 sm:px-3 gap-1.5 bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white rounded-lg transition-all active:scale-95 shadow-2xs text-[10.5px] font-black uppercase tracking-wider backdrop-blur-md"
            >
              <Building2 className="h-3 w-3 text-white" />
              <span>+ Client</span>
            </Button>

            {/* Quick Action: Job */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenJobModal(true)}
              className="h-7.5 px-2.5 sm:px-3 gap-1.5 bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white rounded-lg transition-all active:scale-95 shadow-2xs text-[10.5px] font-black uppercase tracking-wider backdrop-blur-md"
            >
              <Briefcase className="h-3 w-3 text-white" />
              <span>+ Jobs</span>
            </Button>

            {/* Quick Action: Candidate */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenCandidateModal(true)}
              className="h-7.5 px-2.5 sm:px-3 gap-1.5 bg-white text-primary hover:bg-white/90 border-white rounded-lg transition-all active:scale-95 shadow-2xs text-[10.5px] font-black uppercase tracking-wider"
            >
              <UserPlus className="h-3 w-3 text-primary" />
              <span>+ Candidate</span>
            </Button>

            {/* Current Date Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-white/15 text-[10px] font-bold text-white/90 backdrop-blur-md">
              <Calendar className="w-3 h-3 text-white/80" />
              <span>{currentDate}</span>
            </div>
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
