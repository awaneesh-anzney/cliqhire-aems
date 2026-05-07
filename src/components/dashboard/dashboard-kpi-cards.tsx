"use client";
 
 import { Building2, Briefcase, Calendar, Users, TrendingUp } from 'lucide-react';
 import { useDashboardStats } from "@/hooks/useDashboard";
 import { cn } from "@/lib/utils";
 
 export function DashboardKpiCards() {
     const { data: dashboardStats, isLoading } = useDashboardStats();
 
     const kpis = [
         {
             label: "Total Candidates",
             value: dashboardStats?.candidates?.total || 0,
             subtext: `${dashboardStats?.candidates?.active || 0} active currently`,
             icon: Users,
             color: "brand",
             delay: "delay-0"
         },
         {
             label: "Active Jobs",
             value: dashboardStats?.jobs?.active || 0,
             subtext: `out of ${dashboardStats?.jobs?.total || 0} total jobs`,
             icon: Briefcase,
             color: "orange",
             delay: "delay-75"
         },
         {
             label: "Interviews Scheduled",
             value: dashboardStats?.pipeline?.candidatesInterviewing || 0,
             subtext: `across ${dashboardStats?.pipeline?.activePipelines || 0} pipelines`,
             icon: Calendar,
             color: "blue",
             delay: "delay-150"
         },
         {
             label: "Total Clients",
             value: dashboardStats?.clients?.total || 0,
             subtext: `${dashboardStats?.clients?.byStage?.signed || 0} successfully signed`,
             icon: Building2,
             color: "green",
             delay: "delay-200"
         }
     ];
 
     const getColorClasses = (color: string) => {
         switch (color) {
             case "brand": return "bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white";
             case "orange": return "bg-orange-500/10 text-orange-600 group-hover:bg-orange-600 group-hover:text-white";
             case "blue": return "bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white";
             case "green": return "bg-green-500/10 text-green-600 group-hover:bg-green-600 group-hover:text-white";
             default: return "bg-gray-100 text-gray-600";
         }
     };
 
     return (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {kpis.map((kpi, idx) => (
                 <div 
                     key={idx}
                     className={cn(
                         "group relative p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all duration-500 flex flex-col justify-between overflow-hidden",
                         "hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-brand/10",
                         "animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both",
                         kpi.delay
                     )}
                 >
                     {/* Background Glow Effect */}
                     <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                     
                     <div className="relative z-10 flex justify-between items-start mb-6">
                         <div className={cn(
                             "p-3 rounded-xl transition-all duration-500 ease-out transform group-hover:scale-110 group-hover:rotate-3",
                             getColorClasses(kpi.color)
                         )}>
                             <kpi.icon className="w-5 h-5" />
                         </div>
                         <div className="p-1 rounded-full bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                             <TrendingUp className="w-3.5 h-3.5" />
                         </div>
                     </div>
                     
                     <div className="relative z-10">
                         <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 transition-colors group-hover:text-slate-500">
                             {kpi.label}
                         </p>
                         <h3 className="text-3xl font-black text-slate-900 tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                             {isLoading ? (
                                 <span className="flex h-8 w-16 bg-slate-100 animate-pulse rounded-md" />
                             ) : (
                                 kpi.value
                             )}
                         </h3>
                         <div className="mt-2 flex items-center gap-1.5">
                             <span className={cn(
                                 "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                 kpi.color === "brand" ? "bg-brand animate-pulse" : 
                                 kpi.color === "orange" ? "bg-orange-500" :
                                 kpi.color === "blue" ? "bg-blue-500" : "bg-green-500"
                             )} />
                             <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                                 {isLoading ? "Fetching latest data..." : kpi.subtext}
                             </p>
                         </div>
                     </div>
                 </div>
             ))}
         </div>
     );
 }
