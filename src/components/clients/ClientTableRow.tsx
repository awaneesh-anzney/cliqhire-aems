"use client";
 import { TableRow, TableCell } from "@/components/ui/table";
 import { ClientStageBadge } from "@/components/client-stage-badge";
 import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
 import { useRouter } from "next/navigation";
 import { ClientStageStatus } from "@/services/clientService";
 import React from "react";
 import { Calendar, Building2, MapPin, Briefcase } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 export interface ClientTableRowProps {
   client: {
     clientId?: string;
     id: string;
     name: string;
     industry: string;
     countryOfBusiness: string;
     clientStage: "Lead" | "Engaged" | "Signed";
     clientSubStage?: ClientStageStatus;
     owner: string;
     team: string;
     createdAt: string;
     jobCount: number;
     incorporationDate: string;
     createdBy?: string;
     clientAge?: {
       years: number;
       months: number;
       days: number;
     };
   };
   onStageChange: (clientId: string, newStage: "Lead" | "Engaged" | "Signed") => void;
   onStatusChange: (clientId: string, newStatus: ClientStageStatus) => void;
   canModify?: boolean;
 }
 
 const formatClientAge = (age?: { years: number; months: number; days: number }) => {
   if (!age) return "0d";
   const { years, months, days } = age;
   if (years > 0) return `${years}y ${months}m`;
   if (months > 0) return `${months}m ${days}d`;
   return `${days}d`;
 };
 
 const ClientTableRow: React.FC<ClientTableRowProps> = ({
   client,
   onStageChange,
   onStatusChange,
   canModify = false,
 }) => {
   const router = useRouter();
 
   return (
     <>
       {/* Client ID */}
       <TableCell className="px-3 py-2.5">
         <span className="text-[10px] font-bold text-slate-500 block truncate max-w-[80px]">
           {client.clientId || "—"}
         </span>
       </TableCell>
 
       {/* Name */}
       <TableCell className="px-3 py-2.5">
         <div 
           onClick={() => router.push(`/clients/${client.id}`)}
           className="cursor-pointer group/name truncate max-w-[150px]"
         >
           <span className="text-[13px] font-bold text-slate-900 group-hover/name:text-brand transition-all block truncate">
             {client.name}
           </span>
         </div>
       </TableCell>
 
       {/* Industry */}
       <TableCell className="px-3 py-2.5">
         <div className="flex items-center gap-1.5 overflow-hidden max-w-[120px]">
            <Building2 className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-[11px] font-medium text-slate-600 truncate">
              {client.industry || "—"}
            </span>
         </div>
       </TableCell>
 
       {/* Location */}
       <TableCell className="px-3 py-2.5">
         <div className="flex items-center gap-1.5 overflow-hidden max-w-[100px]">
            <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-[11px] font-medium text-slate-600 truncate">
              {client.countryOfBusiness || "Global"}
            </span>
         </div>
       </TableCell>
 
       {/* Stage */}
       <TableCell className="px-3 py-2.5">
         <div className="scale-90 origin-left">
           <ClientStageBadge
             id={client.id}
             stage={client.clientStage}
             onStageChange={onStageChange}
             disabled={!canModify}
           />
         </div>
       </TableCell>
 
       {/* Status */}
       <TableCell className="px-3 py-2.5">
         <div className="scale-90 origin-center">
           <ClientStageStatusBadge
             id={client.id}
             status={client.clientSubStage as any}
             stage={client.clientStage}
             onStatusChange={onStatusChange}
             disabled={!canModify}
           />
         </div>
       </TableCell>
 
       {/* Age */}
       <TableCell className="px-3 py-2.5 text-center">
         <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">
           {formatClientAge(client.clientAge)}
         </span>
       </TableCell>
 
       {/* Job Count */}
       <TableCell className="px-3 py-2.5 text-center">
         <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
            <Briefcase className="w-2.5 h-2.5 text-brand shrink-0" />
            <span className="text-[10px] font-bold text-slate-900">{client.jobCount || 0}</span>
         </div>
       </TableCell>
 
       {/* Created By */}
       <TableCell className="px-3 py-2.5 text-right pr-6">
         <span className="text-[11px] font-bold text-slate-700 block truncate max-w-[120px] ml-auto">
           {client.createdBy || "System"}
         </span>
       </TableCell>
     </>
   );
 };
 
 export default ClientTableRow;
