"use client";
import { TableCell } from "@/components/ui/table";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { useRouter } from "next/navigation";
import { ClientStageStatus } from "@/services/clientService";
import React from "react";
import { Building2, MapPin, Briefcase, Calendar, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

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
    clientType?: string;
    nextFollowUpDate?: string;
    lastContactedAt?: string;
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
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[10px] font-medium text-muted-foreground block truncate max-w-[80px] cursor-help">
              {client.clientId || "—"}
            </span>
          </TooltipTrigger>
          <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
            {client.clientId || "No ID"}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      {/* Name */}
      <TableCell className="px-3 py-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              onClick={() => router.push(`/clients/${client.id}`)}
              className="cursor-pointer group/name truncate max-w-[150px]"
            >
              <span className="text-[13px] font-semibold text-foreground group-hover/name:text-brand transition-all block truncate">
                {client.name}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
            {client.name}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      {/* Type */}
      <TableCell className="px-3 py-2.5">
        <div className="flex items-center gap-1.5 overflow-hidden max-w-[100px]">
           <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
           <span className="text-[11px] font-medium text-foreground truncate">
             {client.clientType || "New"}
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

      {/* Next Follow-up */}
      <TableCell className="px-3 py-2.5">
        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
          <Calendar className={cn("w-3 h-3 shrink-0", client.nextFollowUpDate && new Date(client.nextFollowUpDate) < new Date() ? "text-red-500" : "text-muted-foreground")} />
          <span className={cn("text-[11px] font-medium truncate", client.nextFollowUpDate && new Date(client.nextFollowUpDate) < new Date() ? "text-red-500 font-bold" : "text-foreground")}>
            {client.nextFollowUpDate ? new Date(client.nextFollowUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "—"}
          </span>
        </div>
      </TableCell>

      {/* Last Contacted */}
      <TableCell className="px-3 py-2.5">
        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
          <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-[11px] font-medium text-foreground truncate">
            {client.lastContactedAt ? formatDistanceToNow(new Date(client.lastContactedAt), { addSuffix: true }) : "—"}
          </span>
        </div>
      </TableCell>

      {/* Job Count */}
      <TableCell className="px-3 py-2.5 text-center">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted border border-border">
           <Briefcase className="w-2.5 h-2.5 text-brand shrink-0" />
           <span className="text-[10px] font-semibold text-foreground">{client.jobCount || 0}</span>
        </div>
      </TableCell>

      {/* Created By */}
      <TableCell className="px-3 py-2.5 text-right pr-6">
        <span className="text-[11px] font-medium text-foreground block truncate max-w-[120px] ml-auto">
          {client.createdBy || "System"}
        </span>
      </TableCell>
    </>
  );
};

export default ClientTableRow;
