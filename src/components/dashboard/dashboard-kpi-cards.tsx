"use client";

import { 
    Building2, 
    Briefcase, 
    Users, 
    UserCheck, 
    FileText, 
    Layers,
    ArrowUpRight
} from 'lucide-react';
import { useDashboardStats } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

export function DashboardKpiCards() {
    const { data: dashboardStats, isLoading } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Candidates Skeleton */}
                <div className="p-6 rounded-[1.5rem] bg-card border border-border shadow-sm flex flex-col justify-between animate-pulse min-h-[200px]">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-muted" />
                            <div className="w-4 h-4 rounded bg-muted" />
                        </div>
                        <div className="h-3 w-24 bg-muted rounded mb-2" />
                        <div className="h-8 w-16 bg-muted rounded" />
                    </div>
                    <div className="space-y-2 mt-4">
                        <div className="h-2 w-full bg-muted rounded-full" />
                        <div className="flex justify-between">
                            <div className="h-3 w-12 bg-muted rounded" />
                            <div className="h-3 w-12 bg-muted rounded" />
                        </div>
                    </div>
                </div>
                
                {/* 2. Jobs Skeleton */}
                <div className="p-6 rounded-[1.5rem] bg-card border border-border shadow-sm flex flex-col justify-between animate-pulse min-h-[200px]">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-muted" />
                            <div className="w-4 h-4 rounded bg-muted" />
                        </div>
                        <div className="h-3 w-20 bg-muted rounded mb-2" />
                        <div className="h-8 w-16 bg-muted rounded" />
                    </div>
                    <div className="space-y-2 mt-4">
                        <div className="h-2 w-full bg-muted rounded-full" />
                        <div className="flex justify-between">
                            <div className="h-3 w-12 bg-muted rounded" />
                            <div className="h-3 w-12 bg-muted rounded" />
                        </div>
                    </div>
                </div>
                
                {/* 3. Clients Skeleton */}
                <div className="p-6 rounded-[1.5rem] bg-card border border-border shadow-sm flex flex-col justify-between animate-pulse min-h-[200px]">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-muted" />
                            <div className="w-4 h-4 rounded bg-muted" />
                        </div>
                        <div className="h-3 w-20 bg-muted rounded mb-2" />
                        <div className="h-8 w-14 bg-muted rounded" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-muted/50">
                        <div className="h-5 bg-muted rounded" />
                        <div className="h-5 bg-muted rounded" />
                        <div className="h-5 bg-muted rounded" />
                    </div>
                </div>
                
                {/* 4. Pipeline Skeleton */}
                <div className="p-6 rounded-[1.5rem] bg-card border border-border shadow-sm flex flex-col justify-between animate-pulse min-h-[200px] md:col-span-2 lg:col-span-2">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-muted" />
                            <div className="w-4 h-4 rounded bg-muted" />
                        </div>
                        <div className="h-3 w-32 bg-muted rounded mb-2" />
                        <div className="h-8 w-20 bg-muted rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-muted/50">
                        <div className="space-y-2">
                            <div className="h-6 bg-muted rounded-lg" />
                            <div className="h-6 bg-muted rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-muted rounded" />
                            <div className="h-3 bg-muted rounded" />
                            <div className="h-3 bg-muted rounded" />
                        </div>
                    </div>
                </div>
                
                {/* Stacked Team Users and Contracts Skeleton */}
                <div className="flex flex-col md:flex-row lg:flex-col gap-6 md:col-span-2 lg:col-span-1">
                    {/* Team Users Skeleton */}
                    <div className="p-5 rounded-[1.5rem] bg-card border border-border shadow-sm flex flex-col justify-between animate-pulse flex-1 min-h-[95px]">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-3 w-16 bg-muted rounded" />
                                <div className="w-6 h-6 rounded bg-muted" />
                            </div>
                            <div className="h-6 w-10 bg-muted rounded mb-2" />
                        </div>
                        <div className="space-y-1">
                            <div className="h-1 w-full bg-muted rounded-full" />
                            <div className="flex justify-between">
                                <div className="h-2 w-8 bg-muted rounded" />
                                <div className="h-2 w-8 bg-muted rounded" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Contracts Skeleton */}
                    <div className="p-5 rounded-[1.5rem] bg-card border border-border shadow-sm flex flex-col justify-between animate-pulse flex-1 min-h-[95px]">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-3 w-16 bg-muted rounded" />
                                <div className="w-6 h-6 rounded bg-muted" />
                            </div>
                            <div className="h-6 w-10 bg-muted rounded mb-2" />
                        </div>
                        <div className="h-5 bg-muted rounded mt-2" />
                    </div>
                </div>
            </div>
        );
    }

    // Calculations for Candidates
    const candidatesTotal = dashboardStats?.candidates?.total || 0;
    const candidatesActive = dashboardStats?.candidates?.active || 0;
    const candidatesInactive = dashboardStats?.candidates?.inactive || 0;
    const candidatesActivePercent = candidatesTotal > 0 ? (candidatesActive / candidatesTotal) * 100 : 0;
    const candidatesInactivePercent = candidatesTotal > 0 ? (candidatesInactive / candidatesTotal) * 100 : 0;

    // Calculations for Jobs
    const jobsTotal = dashboardStats?.jobs?.total || 0;
    const jobsActive = dashboardStats?.jobs?.active || 0;
    const jobsInactive = dashboardStats?.jobs?.inactive || 0;
    const jobsActivePercent = jobsTotal > 0 ? (jobsActive / jobsTotal) * 100 : 0;
    const jobsInactivePercent = jobsTotal > 0 ? (jobsInactive / jobsTotal) * 100 : 0;

    // Calculations for Clients
    const clientsTotal = dashboardStats?.clients?.total || 0;
    const clientsLead = dashboardStats?.clients?.byStage?.lead || 0;
    const clientsEngaged = dashboardStats?.clients?.byStage?.engaged || 0;
    const clientsSigned = dashboardStats?.clients?.byStage?.signed || 0;
    const clientsLeadPercent = clientsTotal > 0 ? (clientsLead / clientsTotal) * 100 : 0;
    const clientsEngagedPercent = clientsTotal > 0 ? (clientsEngaged / clientsTotal) * 100 : 0;
    const clientsSignedPercent = clientsTotal > 0 ? (clientsSigned / clientsTotal) * 100 : 0;

    // Calculations for Users
    const usersTotal = dashboardStats?.users?.total || 0;
    const usersActive = dashboardStats?.users?.active || 0;
    const usersInactive = dashboardStats?.users?.inactive || 0;
    const usersActivePercent = usersTotal > 0 ? (usersActive / usersTotal) * 100 : 0;
    const usersInactivePercent = usersTotal > 0 ? (usersInactive / usersTotal) * 100 : 0;

    // Pipeline Data
    const pipelineTotal = dashboardStats?.pipeline?.totalCandidatesInPipeline || 0;
    const activePipelines = dashboardStats?.pipeline?.activePipelines || 0;
    const candidatesInProcess = dashboardStats?.pipeline?.candidatesInProcess || 0;
    const candidatesCompleted = dashboardStats?.pipeline?.candidatesCompleted || 0;
    const stageBreakdown = dashboardStats?.pipeline?.stageBreakdown || [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Candidates Card */}
            <div className="group relative bg-card border border-border/80 shadow-[0_2px_12px_-5px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-6 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-border/100 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-700 bg-brand pointer-events-none" />
                
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Candidates
                        </span>
                        <div className="p-2 rounded-lg bg-brand/5 text-brand group-hover:bg-brand/10 group-hover:scale-105 transition-all duration-300">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
                            {candidatesTotal}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">profiles</span>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {/* Segmented Ratio Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${candidatesActivePercent}%` }} 
                        />
                        <div 
                            className="h-full bg-slate-300 dark:bg-zinc-700 transition-all duration-500" 
                            style={{ width: `${candidatesInactivePercent}%` }} 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {candidatesActive} Active
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {candidatesInactive} Inactive
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Jobs Card */}
            <div className="group relative bg-card border border-border/80 shadow-[0_2px_12px_-5px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-6 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-border/100 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-700 bg-orange-500 pointer-events-none" />
                
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Active Jobs
                        </span>
                        <div className="p-2 rounded-lg bg-orange-500/5 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                            <Briefcase className="w-4 h-4" />
                        </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
                            {jobsActive}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">open roles</span>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {/* Segmented Ratio Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
                        <div 
                            className="h-full bg-orange-500 transition-all duration-500" 
                            style={{ width: `${jobsActivePercent}%` }} 
                        />
                        <div 
                            className="h-full bg-slate-300 dark:bg-zinc-700 transition-all duration-500" 
                            style={{ width: `${jobsInactivePercent}%` }} 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-orange-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            {jobsActive} Recruiting
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {jobsInactive} Inactive
                        </span>
                        <span className="text-muted-foreground ml-auto">
                            {jobsTotal} Total
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Clients Card */}
            <div className="group relative bg-card border border-border/80 shadow-[0_2px_12px_-5px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-6 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-border/100 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-700 bg-emerald-500 pointer-events-none" />
                
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Total Clients
                        </span>
                        <div className="p-2 rounded-lg bg-emerald-500/5 text-emerald-600 group-hover:bg-emerald-600/10 group-hover:scale-105 transition-all duration-300">
                            <Building2 className="w-4 h-4" />
                        </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
                            {clientsTotal}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">partners</span>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {/* Multi-segment Ratio Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
                        <div 
                            className="h-full bg-violet-500 transition-all duration-500" 
                            style={{ width: `${clientsLeadPercent}%` }} 
                        />
                        <div 
                            className="h-full bg-sky-500 transition-all duration-500" 
                            style={{ width: `${clientsEngagedPercent}%` }} 
                        />
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${clientsSignedPercent}%` }} 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                        <span className="flex items-center gap-1 text-violet-600">
                            <span className="w-1 h-1 rounded-full bg-violet-500" />
                            {clientsLead} Lead
                        </span>
                        <span className="flex items-center gap-1 text-sky-600 border-x border-border/40 px-2">
                            <span className="w-1 h-1 rounded-full bg-sky-500" />
                            {clientsEngaged} Engaged
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            {clientsSigned} Signed
                        </span>
                    </div>
                </div>
            </div>

            {/* 4. Pipeline Card (Spans 2 columns on large screens) */}
            <div className="group relative bg-card border border-border/80 shadow-[0_2px_12px_-5px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-6 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-border/100 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden lg:col-span-2">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-700 bg-blue-500 pointer-events-none" />
                
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Recruitment Pipeline
                        </span>
                        <div className="p-2 rounded-lg bg-blue-500/5 text-blue-600 group-hover:bg-blue-650/10 group-hover:scale-105 transition-all duration-300">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
                            {pipelineTotal}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">candidates in funnel</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/40">
                    <div className="flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between bg-blue-500/5 dark:bg-blue-500/10 px-3.5 py-1.5 rounded-xl border border-blue-500/10 text-xs font-bold text-blue-600">
                            <span>Active Pipelines</span>
                            <span>{activePipelines}</span>
                        </div>
                        <div className="flex items-center justify-between bg-orange-500/5 dark:bg-orange-500/10 px-3.5 py-1.5 rounded-xl border border-orange-500/10 text-xs font-bold text-orange-600">
                            <span>In Process</span>
                            <span>{candidatesInProcess}</span>
                        </div>
                        <div className="flex items-center justify-between bg-emerald-500/5 dark:bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/10 text-xs font-bold text-emerald-600">
                            <span>Completed</span>
                            <span>{candidatesCompleted}</span>
                        </div>
                    </div>
                    
                    <div className="bg-muted/40 dark:bg-zinc-800/40 p-3 rounded-2xl border border-border/40 flex flex-col justify-center space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 block">
                            Stage Breakdown
                        </span>
                        {stageBreakdown.map((stage, idx) => {
                            const colors = {
                                sourcing: 'bg-purple-500',
                                screening: 'bg-pink-500',
                                interview: 'bg-blue-500',
                                hired: 'bg-emerald-500',
                            };
                            const type = stage.stage.toLowerCase() as keyof typeof colors;
                            const dotColor = colors[type] || 'bg-slate-400';
                            
                            return (
                                <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                                        {stage.stage}
                                    </span>
                                    <span className="text-foreground">{stage.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Column containing both Team Users and Contracts (Stretched to match Pipeline's height) */}
            <div className="flex flex-col md:flex-row lg:flex-col gap-6 md:col-span-2 lg:col-span-1">
                {/* 5. Team Users Card */}
                <div className="group relative bg-card border border-border/80 shadow-[0_2px_12px_-5px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-5 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-border/100 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden flex-1">
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-10 transition-all duration-700 bg-teal-500 pointer-events-none" />
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                Team Users
                            </span>
                            <div className="p-1.5 rounded-lg bg-teal-500/5 text-teal-600 group-hover:bg-teal-655/10 transition-all duration-300">
                                <UserCheck className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        
                        <div className="flex items-baseline gap-1.5 my-1">
                            <span className="text-2xl font-black tracking-tight text-foreground">
                                {usersTotal}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">accounts</span>
                        </div>
                    </div>

                    <div className="space-y-2 mt-1">
                        {/* Segmented Ratio Bar */}
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden flex">
                            <div 
                                className="h-full bg-teal-500 transition-all duration-500" 
                                style={{ width: `${usersActivePercent}%` }} 
                            />
                            <div 
                                className="h-full bg-slate-300 dark:bg-zinc-700 transition-all duration-500" 
                                style={{ width: `${usersInactivePercent}%` }} 
                            />
                        </div>
                        
                        <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="flex items-center gap-1 text-teal-600">
                                <span className="w-1 h-1 rounded-full bg-teal-500" />
                                {usersActive} Active
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <span className="w-1 h-1 rounded-full bg-slate-400" />
                                {usersInactive} Inactive
                            </span>
                        </div>
                    </div>
                </div>

                {/* 6. Contracts Card */}
                <div className="group relative bg-card border border-border/80 shadow-[0_2px_12px_-5px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-5 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-border/100 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden flex-1">
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-10 transition-all duration-700 bg-pink-500 pointer-events-none" />
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                Contracts
                            </span>
                            <div className="p-1.5 rounded-lg bg-pink-500/5 text-pink-600 group-hover:bg-pink-655/10 transition-all duration-300">
                                <FileText className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        
                        <div className="flex items-baseline gap-1.5 my-1">
                            <span className="text-2xl font-black tracking-tight text-foreground">
                                {dashboardStats?.contracts?.total || 0}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">active agreements</span>
                        </div>
                    </div>

                    <div className="mt-1">
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-pink-500/5 border border-pink-500/10 text-[9px] font-bold text-pink-600">
                            <span className="uppercase tracking-wider">Executed</span>
                            <span className="bg-pink-500/10 px-1.5 py-0.5 rounded-full">
                                {dashboardStats?.contracts?.total || 0} Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
