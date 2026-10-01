"use client";

import React from "react";
import { TableCell } from "@/components/ui/table";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { useRouter } from "next/navigation";
import { ClientStageStatus } from "@/services/clientService";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
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
    "from-indigo-600 to-purple-600",
    "from-emerald-600 to-teal-600",
    "from-sky-600 to-blue-700",
    "from-purple-600 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-rose-600 to-red-600",
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
      <TableCell className="px-3 py-2">
        {client.clientId ? (
          <Tooltip title={`Click to copy: ${client.clientId}`} arrow>
            <button
              type="button"
              onClick={handleCopyId}
              className="group/id inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 px-1.5 py-0.5 rounded-md border border-border/60 transition-colors"
            >
              {copied ? (
                <CheckOutlinedIcon sx={{ fontSize: 12, color: "#00A76F" }} />
              ) : (
                <ContentCopyOutlinedIcon sx={{ fontSize: 11, opacity: 0.6 }} />
              )}
              <span className="truncate max-w-[80px]">{client.clientId}</span>
            </button>
          </Tooltip>
        ) : (
          <span className="text-[10.5px] text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* Name + Avatar */}
      <TableCell className="px-3 py-2">
        <div
          onClick={() => router.push(targetPath)}
          className="cursor-pointer group/name flex items-center gap-2 max-w-[240px]"
        >
          {/* Company Initials Avatar */}
          <div
            className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-[9.5px] shrink-0 shadow-2xs bg-gradient-to-br",
              getAvatarGradient(client.name)
            )}
          >
            {getInitials(client.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#1C252E] dark:text-white group-hover/name:text-[#2563EB] transition-colors truncate">
                {client.name}
              </span>
              <ArrowOutwardOutlinedIcon sx={{ fontSize: 12, opacity: 0 }} className="group-hover/name:opacity-100 group-hover/name:text-[#2563EB] transition-all shrink-0" />
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {(client as any).subsidiaryCount > 0 && (
                <Chip
                  label={`+${(client as any).subsidiaryCount} Sub`}
                  size="small"
                  sx={{
                    height: 14,
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    bgcolor: "rgba(0, 167, 111, 0.1)",
                    color: "#00A76F",
                    border: 0,
                    "& .MuiChip-label": { px: 0.4 },
                  }}
                />
              )}
              {client.role === "subsidiary" && (
                <Chip
                  label="Subsidiary"
                  size="small"
                  sx={{
                    height: 14,
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    bgcolor: "rgba(142, 51, 255, 0.1)",
                    color: "#8E33FF",
                    border: 0,
                    "& .MuiChip-label": { px: 0.4 },
                  }}
                />
              )}
              {client.groupId && (
                <Chip
                  label="Group"
                  size="small"
                  sx={{
                    height: 14,
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    bgcolor: "rgba(255, 171, 0, 0.1)",
                    color: "#FFAB00",
                    border: 0,
                    "& .MuiChip-label": { px: 0.4 },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Industry */}
      <TableCell className="px-3 py-2">
        <Tooltip title={client.industry || "No Industry Listed"} arrow>
          <div className="flex items-center gap-1.5 overflow-hidden max-w-[130px] cursor-help">
            <BusinessOutlinedIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
            <span className="text-xs font-medium text-foreground/80 truncate">
              {client.industry || "—"}
            </span>
          </div>
        </Tooltip>
      </TableCell>

      {/* Location */}
      <TableCell className="px-3 py-2">
        <Tooltip title={client.countryOfBusiness || "Global"} arrow>
          <div className="flex items-center gap-1.5 overflow-hidden max-w-[120px] cursor-help">
            <LocationOnOutlinedIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
            <span className="text-xs font-medium text-foreground/80 truncate">
              {client.countryOfBusiness || "Global"}
            </span>
          </div>
        </Tooltip>
      </TableCell>

      {/* Stage */}
      <TableCell className="px-3 py-2">
        <ClientStageBadge
          id={client.id}
          stage={client.clientStage}
          onStageChange={onStageChange}
          disabled={!canModify}
        />
      </TableCell>

      {/* Status */}
      <TableCell className="px-3 py-2 text-center">
        <ClientStageStatusBadge
          id={client.id}
          status={client.clientSubStage as any}
          stage={client.clientStage}
          onStatusChange={onStatusChange}
          disabled={!canModify}
        />
      </TableCell>

      {/* Age */}
      <TableCell className="px-3 py-2 text-center">
        <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
          {formatClientAge(client.clientAge)}
        </span>
      </TableCell>

      {/* Job Count */}
      <TableCell className="px-3 py-2 text-center">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40">
          <WorkOutlineOutlinedIcon sx={{ fontSize: 12, color: "#6366F1" }} />
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
            {client.jobCount || 0}
          </span>
        </div>
      </TableCell>

      {/* Created By */}
      <TableCell className="px-3 py-2 text-right pr-4">
        <span className="text-[11px] font-medium text-muted-foreground block truncate max-w-[120px] ml-auto">
          {client.createdBy || "System"}
        </span>
      </TableCell>
    </>
  );
};

export default ClientTableRow;
