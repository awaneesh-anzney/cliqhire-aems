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
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/80 border border-blue-100/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm shrink-0 transition-all duration-300">
        {/* Top subtle brand gradient highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />

        {/* Subtle Ambient Radial Tints: Sapphire & Indigo */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="pointer-events-none absolute left-1/4 -bottom-8 h-28 w-36 rounded-full bg-indigo-500/10 blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Welcome & Context Strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 text-white">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Welcome back,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    {firstName}
                  </span>
                </h1>
                {/* Live workspace indicator */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Workspace Live</span>
                </div>
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Talent Operations & Sourcing Hub • Real-time Requisition & Pipeline Analytics
              </p>
            </div>
          </div>

          {/* Action Bar & Date Badge */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
            {/* Current Date Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{currentDate}</span>
            </div>

            {/* Quick Action: Client */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenClientModal(true)}
              className="h-8 px-3 gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all active:scale-95 shadow-2xs text-[11px] font-bold cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>+ Client</span>
            </Button>

            {/* Quick Action: Jobs (Royal Blue CTA) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenJobModal(true)}
              className="h-8 px-3 gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 border-0 text-white hover:text-white rounded-xl transition-all active:scale-95 shadow-sm shadow-blue-500/25 text-[11px] font-bold cursor-pointer"
            >
              <Briefcase className="h-3.5 w-3.5 text-white" />
              <span>+ Jobs</span>
            </Button>

            {/* Quick Action: Candidate (Indigo CTA) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenCandidateModal(true)}
              className="h-8 px-3.5 gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:from-indigo-700 active:to-indigo-800 border-0 text-white hover:text-white rounded-xl transition-all active:scale-95 shadow-sm shadow-indigo-500/25 text-[11px] font-bold cursor-pointer"
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
