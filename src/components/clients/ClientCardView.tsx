"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { ClientStageStatus } from "@/services/clientService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ClientCardItem {
  id: string;
  clientId?: string;
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
  subsidiaryCount?: number;
}

interface ClientCardViewProps {
  clients: ClientCardItem[];
  selectedRows: Set<string>;
  onToggleSelect: (id: string) => void;
  onStageChange: (id: string, stage: "Lead" | "Engaged" | "Signed") => void;
  onStatusChange: (id: string, status: ClientStageStatus) => void;
  canModify?: boolean;
  canDelete?: boolean;
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

function formatClientAge(age?: { years: number; months: number; days: number }) {
  if (!age) return "0d";
  const { years, months, days } = age;
  if (years > 0) return `${years}y ${months}m`;
  if (months > 0) return `${months}m ${days}d`;
  return `${days}d`;
}

export const ClientCardView: React.FC<ClientCardViewProps> = ({
  clients,
  selectedRows,
  onToggleSelect,
  onStageChange,
  onStatusChange,
  canModify = false,
  canDelete = false,
  moduleType = "clients",
}) => {
  const router = useRouter();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, clientId?: string) => {
    e.stopPropagation();
    if (!clientId) return;
    navigator.clipboard.writeText(clientId);
    setCopiedId(clientId);
    toast.success(`Copied ID: ${clientId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-3.5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {clients.map((client) => {
          const isSelected = selectedRows.has(client.id);
          const targetPath = `/${moduleType === "leads" ? "leads" : "clients"}/${client.id}`;

          return (
            <Box
              key={client.id}
              onClick={() => router.push(targetPath)}
              sx={{
                bgcolor: "background.paper",
                borderRadius: "12px",
                border: 1,
                borderColor: isSelected ? "#2563EB" : "divider",
                p: 2,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 1.5,
                boxShadow: isSelected
                  ? "0 0 0 2px rgba(37, 99, 235, 0.15)"
                  : "0px 1px 3px 0px rgba(0, 0, 0, 0.04)",
                "&:hover": {
                  borderColor: "rgba(37, 99, 235, 0.4)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                },
              }}
            >
              {/* Top Row: Checkbox, Avatar, Name & ID */}
              <div>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                    {canDelete && (
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(client.id)}
                          className="rounded-md border-border"
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs bg-gradient-to-br",
                        getAvatarGradient(client.name)
                      )}
                    >
                      {getInitials(client.name)}
                    </div>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {client.name}
                      </Typography>
                      {client.clientId && (
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, client.clientId)}
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground mt-0.5"
                        >
                          {copiedId === client.clientId ? (
                            <CheckOutlinedIcon sx={{ fontSize: 11, color: "#00A76F" }} />
                          ) : (
                            <ContentCopyOutlinedIcon sx={{ fontSize: 10 }} />
                          )}
                          <span>{client.clientId}</span>
                        </button>
                      )}
                    </Box>
                  </Box>

                  <ArrowOutwardOutlinedIcon sx={{ fontSize: 15, color: "text.disabled", flexShrink: 0 }} />
                </Box>

                {/* Sub-Badges (Subsidiary, Group) */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mt: 1 }}>
                  {(client as any).subsidiaryCount > 0 && (
                    <Chip
                      label={`+${(client as any).subsidiaryCount} Subsidiaries`}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        bgcolor: "rgba(0, 167, 111, 0.1)",
                        color: "#00A76F",
                        border: 0,
                        "& .MuiChip-label": { px: 0.5 },
                      }}
                    />
                  )}
                  {client.role === "subsidiary" && (
                    <Chip
                      label="Subsidiary"
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        bgcolor: "rgba(142, 51, 255, 0.1)",
                        color: "#8E33FF",
                        border: 0,
                        "& .MuiChip-label": { px: 0.5 },
                      }}
                    />
                  )}
                  {client.groupId && (
                    <Chip
                      label="Corporate Group"
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        bgcolor: "rgba(255, 171, 0, 0.1)",
                        color: "#FFAB00",
                        border: 0,
                        "& .MuiChip-label": { px: 0.5 },
                      }}
                    />
                  )}
                </Box>
              </div>

              {/* Middle Row: Industry & Location */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 0.5, borderTop: 1, borderBottom: 1, borderColor: "divider" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessOutlinedIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "11px", color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {client.industry || "General Industry"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "11px", color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {client.countryOfBusiness || "Global"}
                  </Typography>
                </Box>
              </Box>

              {/* Bottom Row: Stage & Status Selectors + Age & Jobs */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 flex-wrap">
                  <ClientStageBadge
                    id={client.id}
                    stage={client.clientStage}
                    onStageChange={onStageChange}
                    disabled={!canModify}
                  />
                  <ClientStageStatusBadge
                    id={client.id}
                    status={client.clientSubStage as any}
                    stage={client.clientStage}
                    onStatusChange={onStatusChange}
                    disabled={!canModify}
                  />
                </div>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                    <Typography sx={{ fontSize: "10.5px", color: "text.secondary" }}>
                      {formatClientAge(client.clientAge)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WorkOutlineOutlinedIcon sx={{ fontSize: 12, color: "#6366F1" }} />
                    <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: "#6366F1" }}>
                      {client.jobCount || 0} Jobs
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </div>
    </div>
  );
};

export default ClientCardView;
