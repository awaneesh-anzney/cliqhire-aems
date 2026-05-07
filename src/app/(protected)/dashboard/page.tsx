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
       <div className="flex flex-col w-full min-h-full py-3 px-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50/50">
         
         {/* Optimized Welcome Section - More Compact */}
         <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white py-5 px-8 shadow-2xl shadow-slate-200 border border-slate-800">
           {/* Abstract Background Elements */}
           <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/20 rounded-full blur-[80px]" />
             <div className="absolute top-1/2 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="space-y-0.5">
               <div className="flex items-center gap-2 mb-0.5">
                 <span className="flex h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Recruitment Hub</p>
               </div>
               <h3 className="text-2xl font-black tracking-tight text-white">
                 Welcome back, <span className="text-brand">{firstName}</span>.
               </h3>
               <p className="text-slate-400 font-bold text-xs max-w-xl">
                 Fueling your talent acquisition journey with precision and speed.
               </p>
             </div>
             
             <div className="flex-shrink-0 flex items-center gap-3">
               <div className="hidden lg:flex flex-col items-end px-3 py-1 border-r border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
                  <p className="text-xs font-black text-brand">+12.5%</p>
               </div>
               <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black backdrop-blur-xl shadow-inner text-slate-200">
                 <Calendar className="w-3 h-3 text-brand" />
                 {currentDate}
               </div>
             </div>
           </div>
         </div>
 
         {/* Dashboard KPI Metrics - Tightened Spacing */}
         <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
           <DashboardKpiCards />
         </div>
 
         {/* Quick Actions - High Density Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
           {/* Action 1: Client Creation */}
           <button
             onClick={() => setOpen(true)}
             className="group relative flex flex-col items-start p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-brand/10 hover:border-brand/20 transition-all duration-500 text-left h-full overflow-hidden"
           >
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out" />
             
             <div className="relative z-10 p-3.5 bg-brand/5 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-all duration-500 mb-5">
               <Building2 className="w-6 h-6" />
             </div>
             
             <div className="relative z-10 space-y-2.5 flex-1">
               <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-brand transition-colors">
                 Onboard <br/>New Client
               </h2>
               <p className="text-slate-400 text-[11px] font-bold leading-relaxed max-w-[180px]">
                 Expand your portfolio and set up a new dedicated workspace.
               </p>
             </div>
 
             <div className="relative z-10 mt-6 flex items-center justify-between w-full">
               <div className="flex items-center gap-1.5 text-[9px] font-black text-brand uppercase tracking-widest bg-brand/10 px-2.5 py-1 rounded-full">
                 <Plus className="w-2.5 h-2.5" /> Start
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
               </div>
             </div>
           </button>
 
           {/* Action 2: Job Requirement */}
           <button
             onClick={() => setJobModal(true)}
             className="group relative flex flex-col items-start p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-brand/10 hover:border-brand/20 transition-all duration-500 text-left h-full overflow-hidden"
           >
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out" />
             
             <div className="relative z-10 p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-5">
               <Target className="w-6 h-6" />
             </div>
             
             <div className="relative z-10 space-y-2.5 flex-1">
               <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                 Post Job <br/>Requirement
               </h2>
               <p className="text-slate-400 text-[11px] font-bold leading-relaxed max-w-[180px]">
                 Translate open roles into actionable recruitment targets.
               </p>
             </div>
 
             <div className="relative z-10 mt-6 flex items-center justify-between w-full">
               <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
                 <Zap className="w-2.5 h-2.5" /> Post
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
               </div>
             </div>
           </button>
 
           {/* Action 3: Candidate Creation */}
           <div className="group relative flex flex-col items-start p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-brand/10 hover:border-brand/20 transition-all duration-500 text-left h-full overflow-hidden">
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out" />
             
             <div className="relative z-10 p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 mb-5">
               <Rocket className="w-6 h-6" />
             </div>
             
             <div className="relative z-10 space-y-2.5 flex-1">
               <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                 Capture <br/>Top Talent
               </h2>
               <p className="text-slate-400 text-[11px] font-bold leading-relaxed max-w-[180px]">
                 Expand your candidate pool with high-potential profiles.
               </p>
             </div>
 
             <div className="relative z-10 mt-6 w-full">
               <CreateCandidateButton className="w-full h-11 bg-slate-900 text-white hover:bg-brand font-black rounded-xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center border-none group-hover:scale-[1.02] active:scale-[0.98]">
                 Add Profile
               </CreateCandidateButton>
             </div>
           </div>
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
