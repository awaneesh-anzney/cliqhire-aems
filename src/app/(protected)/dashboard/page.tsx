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
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B132B] via-[#162447] to-[#0B132B] text-white border border-blue-400/25 p-3 sm:p-3.5 shadow-md shrink-0 transition-all duration-300">
        {/* Subtle Ambient Radial Tints: Crimson Red & Electric Blue */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-rose-500/20 blur-2xl" />
        <div className="pointer-events-none absolute left-1/4 -bottom-8 h-28 w-36 rounded-full bg-blue-500/25 blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Welcome & Context Strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-2xs backdrop-blur-md">
              <Sparkles className="h-4.5 w-4.5 text-rose-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Welcome back, {firstName}
                </h1>
                {/* Live workspace indicator */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 shadow-2xs backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Workspace Live</span>
                </div>
              </div>
              <p className="text-[11.5px] text-slate-300/90 font-medium">
                Talent Operations & Sourcing Hub • Real-time Requisition & Pipeline Analytics
              </p>
            </div>
          </div>

          {/* Action Bar & Date Badge */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
            {/* Current Date Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-[11px] font-bold text-white/90 shadow-2xs backdrop-blur-md">
              <Calendar className="w-3.5 h-3.5 text-white/80" />
              <span>{currentDate}</span>
            </div>

            {/* Quick Action: Client */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenClientModal(true)}
              className="h-8 px-3 gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/25 border-white/20 hover:border-white/35 text-white hover:text-white rounded-xl transition-all active:scale-95 shadow-2xs text-[11px] font-bold backdrop-blur-md cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-slate-200" />
              <span>+ Client</span>
            </Button>

            {/* Quick Action: Jobs (Electric Blue CTA) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenJobModal(true)}
              className="h-8 px-3 gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 border-blue-400/50 text-white hover:text-white rounded-xl transition-all active:scale-95 shadow-sm shadow-blue-600/30 text-[11px] font-bold cursor-pointer"
            >
              <Briefcase className="h-3.5 w-3.5 text-white" />
              <span>+ Jobs</span>
            </Button>

            {/* Quick Action: Candidate (Signature Crimson Red CTA) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenCandidateModal(true)}
              className="h-8 px-3.5 gap-1.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 border-rose-400/60 text-white hover:text-white rounded-xl transition-all active:scale-95 shadow-sm shadow-rose-500/35 text-[11px] font-bold cursor-pointer"
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
