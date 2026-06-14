"use client";
 
 import React from "react";
 import { 
   UserCheck, 
   UserX, 
   Building2,
   Target,
   Clock,
   Zap
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface KPIData {
   totalJobs: number;
   activeJobs: number;
   inactiveJobs: number;
   appliedCandidates: number;
   hiredCandidates: number;
   disqualifiedCandidates: number;
 }
 
 interface KPISectionProps {
   data: KPIData;
 }
 
 const KPI_CARDS = [
   {
     title: "Pipeline Jobs",
     value: "totalJobs",
     icon: Building2,
     color: "text-blue-600",
     bgColor: "bg-blue-50/50",
   },
   {
     title: "Live Sourcing",
     value: "activeJobs", 
     icon: Target,
     color: "text-brand",
     bgColor: "bg-brand/5",
   },
   {
     title: "Applicants",
     value: "appliedCandidates",
     icon: Zap,
     color: "text-amber-600",
     bgColor: "bg-amber-50/50",
   },
   {
     title: "Success Hires",
     value: "hiredCandidates",
     icon: UserCheck,
     color: "text-emerald-600",
     bgColor: "bg-emerald-50/50",
   },
 ];
 
 export function KPISection({ data }: KPISectionProps) {
   const getCardData = (valueKey: string) => {
     return data[valueKey as keyof KPIData] || 0;
   };
 
   return (
     <div className="grid grid-cols-4 gap-3 p-1">
       {KPI_CARDS.map((card, idx) => {
         const IconComponent = card.icon;
         const value = getCardData(card.value);
         
         return (
           <div 
             key={card.title} 
             className={cn(
                "group relative flex items-center p-3 rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-sm hover:border-brand/20",
                "animate-in fade-in slide-in-from-top-2",
                `delay-[${idx * 100}ms]`
             )}
           >
             {/* Glow Effect */}
             <div className={cn(
                "absolute -right-2 -bottom-2 w-12 h-12 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                card.bgColor
             )} />
 
             <div className={cn(
                "p-2.5 rounded-xl mr-3.5 shrink-0 transition-all duration-300",
                card.bgColor
             )}>
               <IconComponent className={cn("h-4.5 w-4.5", card.color)} />
             </div>
             
             <div className="flex flex-col min-w-0">
               <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors">
                 {card.title}
               </span>
               <div className="flex items-baseline gap-1">
                 <span className="text-lg font-semibold text-foreground tracking-tight">
                   {value.toLocaleString()}
                 </span>
               </div>
             </div>
           </div>
         );
       })}
     </div>
   );
 }
