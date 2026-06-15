"use client";

import { 
  Building2, 
  Briefcase, 
  UserPlus, 
  ArrowRight, 
  Calendar, 
  Zap,
  Plus,
  Sparkles,
  Target,
  Rocket
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { CreateCandidateButton } from "@/components/candidates/create-candidate-button";
import { useState } from "react";
import { CreateClientModal } from "@/components/create-client-modal/create-client-modal";
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [openJobModal, setJobModal] = useState(false);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Partner';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <div className="dashboard-container">
        
        {/* Optimized Welcome Section - Brand Theme with Modern Animations */}
        <div className="group dashboard-welcome-banner">
          {/* Abstract Background Elements with Floating Animation */}
          <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-card/10 rounded-full blur-[80px] transition-all duration-1000 group-hover:scale-120 group-hover:-translate-x-12 animate-pulse" />
            <div className="absolute top-1/2 -right-12 w-48 h-48 bg-card/5 rounded-full blur-[60px] transition-all duration-1000 group-hover:scale-110 group-hover:-translate-y-12" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="dashboard-welcome-badge">
                <span className="flex h-1.5 w-1.5 rounded-full bg-card animate-pulse" />
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Recruitment Hub</p>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
                Welcome back, <span className="text-white/90">{firstName}</span>.
              </h3>
              <p className="text-white/80 font-bold text-[11px] sm:text-xs max-w-xl animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
                Fueling your talent acquisition journey with precision and speed.
              </p>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-3 animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
              <div className="hidden lg:flex flex-col items-end px-3 py-0.5 border-r border-white/20 transition-all duration-500 group-hover:border-white/40">
                 <p className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-widest">Efficiency</p>
                 <p className="text-[11px] sm:text-xs font-black text-white">+12.5%</p>
              </div>
              <div className="dashboard-date-badge">
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white transition-transform duration-500 group-hover:rotate-12" />
                {currentDate}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard KPI Metrics - Tightened Spacing with Entry Animation */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          <DashboardKpiCards />
        </div>

        {/* Quick Actions - High Density Grid with Staggered Entry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
          {/* Action 1: Client Creation */}
          <button
            onClick={() => setOpen(true)}
            className="group dashboard-action-card"
          >
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-muted rounded-full group-hover:scale-125 transition-transform duration-500 ease-out" />
            
            <div className="dashboard-action-icon bg-brand/5 text-brand group-hover:bg-brand group-hover:text-white">
              <Building2 className="w-5 h-5" />
            </div>
            
            <div className="relative z-10 space-y-1.5 flex-1">
              <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-tight group-hover:text-brand transition-colors">
                Onboard <br/>New Client
              </h2>
              <p className="text-muted-foreground text-[10px] font-bold leading-relaxed max-w-[180px]">
                Expand your portfolio and set up a new dedicated workspace.
              </p>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between w-full">
              <div className="dashboard-action-badge bg-brand/10 text-brand">
                <Plus className="w-2.5 h-2.5" /> Start
              </div>
              <div className="dashboard-action-circle">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Action 2: Job Requirement */}
          <button
            onClick={() => setJobModal(true)}
            className="group dashboard-action-card"
          >
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-muted rounded-full group-hover:scale-125 transition-transform duration-500 ease-out" />
            
            <div className="dashboard-action-icon bg-blue-500/5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
              <Target className="w-5 h-5" />
            </div>
            
            <div className="relative z-10 space-y-1.5 flex-1">
              <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                Post Job <br/>Requirement
              </h2>
              <p className="text-muted-foreground text-[10px] font-bold leading-relaxed max-w-[180px]">
                Translate open roles into actionable recruitment targets.
              </p>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between w-full">
              <div className="dashboard-action-badge bg-blue-500/10 text-blue-600">
                <Zap className="w-2.5 h-2.5" /> Post
              </div>
              <div className="dashboard-action-circle">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Action 3: Candidate Creation */}
          <CreateCandidateButton className="p-0 border-none bg-transparent hover:bg-transparent shadow-none w-full h-full block">
            <div className="group dashboard-action-card">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-muted rounded-full group-hover:scale-125 transition-transform duration-500 ease-out" />
              
              <div className="dashboard-action-icon bg-emerald-500/5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white">
                <Rocket className="w-5 h-5" />
              </div>
              
              <div className="relative z-10 space-y-1.5 flex-1">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                  Capture <br/>Top Talent
                </h2>
                <p className="text-muted-foreground text-[10px] font-bold leading-relaxed max-w-[180px]">
                  Expand your candidate pool with high-potential profiles.
                </p>
              </div>

              <div className="relative z-10 mt-4 flex items-center justify-between w-full">
                <div className="dashboard-action-badge bg-emerald-500/10 text-emerald-600">
                  <Rocket className="w-2.5 h-2.5" /> Capture
                </div>
                <div className="dashboard-action-circle">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </CreateCandidateButton>
        </div>
      </div>

      <CreateClientModal
        open={open}
        onOpenChange={setOpen}
      />
      <CreateJobRequirementForm
        open={openJobModal}
        onOpenChange={setJobModal}
      />
    </>
  );
}
