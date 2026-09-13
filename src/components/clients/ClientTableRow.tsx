"use client";

import React from "react";
import { TableCell } from "@/components/ui/table";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { useRouter } from "next/navigation";
import { ClientStageStatus } from "@/services/clientService";
import { Building2, MapPin, Briefcase, ArrowUpRight, Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    role?: "parent" | "subsidiary" | "standalone";
    groupId?: string | null;
  };
  onStageChange: (clientId: string, newStage: "Lead" | "Engaged" | "Signed") => void;
  onStatusChange: (clientId: string, newStatus: ClientStageStatus) => void;
  canModify?: boolean;
  moduleType?: "clients" | "leads";
}

function getInitials(name: string = ""): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "CO";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarGradient(name: string = ""): string {
  const gradients = [
    "from-blue-600 to-indigo-600",
    "from-indigo-600 to-violet-600",
    "from-emerald-600 to-teal-600",
    "from-sky-600 to-blue-700",
    "from-violet-600 to-fuchsia-600",
    "from-amber-600 to-orange-600",
    "from-rose-600 to-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
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
  moduleType = "clients",
}) => {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const targetPath = `/${moduleType === "leads" ? "leads" : "clients"}/${client.id}`;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!client.clientId) return;
    navigator.clipboard.writeText(client.clientId);
    setCopied(true);
    toast.success(`Copied ID: ${client.clientId}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Client ID */}
      <TableCell className="px-3 py-2.5">
        {client.clientId ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopyId}
                className="group/id inline-flex items-center gap-1 font-mono text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/70 px-1.5 py-0.5 rounded-md border border-border/50 transition-colors"
              >
                {copied ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-0 group-hover/id:opacity-100 transition-opacity" />
                )}
                <span className="truncate max-w-[80px]">{client.clientId}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
              Click to copy: {client.clientId}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* Name + Avatar */}
      <TableCell className="px-3 py-2.5">
        <div
          onClick={() => router.push(targetPath)}
          className="cursor-pointer group/name flex items-center gap-2.5 max-w-[240px]"
        >
          {/* Company Initials Avatar */}
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-2xs bg-gradient-to-br",
              getAvatarGradient(client.name)
            )}
          >
            {getInitials(client.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground group-hover/name:text-primary transition-colors truncate">
                {client.name}
              </span>
              <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 group-hover/name:text-primary transition-all shrink-0" />
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {(client as any).subsidiaryCount > 0 && (
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.1 rounded font-bold border border-primary/20 shrink-0">
                  +{(client as any).subsidiaryCount} Sub
                </span>
              )}
              {client.role === "subsidiary" && (
                <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.1 rounded font-bold border border-indigo-500/20 shrink-0">
                  Subsidiary
                </span>
              )}
              {client.groupId && (
                <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.1 rounded font-bold border border-amber-500/20 shrink-0">
                  Group
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Industry */}
      <TableCell className="px-3 py-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 overflow-hidden max-w-[130px] cursor-help">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span className="text-xs font-medium text-foreground/80 truncate">
                {client.industry || "—"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
            {client.industry || "No Industry Listed"}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      {/* Location */}
      <TableCell className="px-3 py-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 overflow-hidden max-w-[120px] cursor-help">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span className="text-xs font-medium text-foreground/80 truncate">
                {client.countryOfBusiness || "Global"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
            {client.countryOfBusiness || "Global"}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      {/* Stage */}
      <TableCell className="px-3 py-2.5">
        <ClientStageBadge
          id={client.id}
          stage={client.clientStage}
          onStageChange={onStageChange}
          disabled={!canModify}
        />
      </TableCell>

      {/* Status */}
      <TableCell className="px-3 py-2.5 text-center">
        <ClientStageStatusBadge
          id={client.id}
          status={client.clientSubStage as any}
          stage={client.clientStage}
          onStatusChange={onStatusChange}
          disabled={!canModify}
        />
      </TableCell>

      {/* Age */}
      <TableCell className="px-3 py-2.5 text-center">
        <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
          {formatClientAge(client.clientAge)}
        </span>
      </TableCell>

      {/* Job Count */}
      <TableCell className="px-3 py-2.5 text-center">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-muted/40 border border-border/70">
          <Briefcase className="w-3 h-3 text-indigo-500 shrink-0" />
          <span className="text-[11px] font-semibold text-foreground">
            {client.jobCount || 0}
          </span>
        </div>
      </TableCell>

      {/* Created By */}
      <TableCell className="px-3 py-2.5 text-right pr-4">
        <span className="text-xs font-medium text-muted-foreground block truncate max-w-[120px] ml-auto">
          {client.createdBy || "System"}
        </span>
      </TableCell>
    </>
  );
};

export default ClientTableRow;
