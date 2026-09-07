"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientStageBadge } from "@/components/client-stage-badge";
import { ClientStageStatusBadge } from "@/components/client-stage-status-badge";
import { ClientStageStatus } from "@/services/clientService";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

  const handleCopyId = (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Copied ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const entityPath = moduleType === "leads" ? "leads" : "clients";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3 overflow-y-auto custom-scrollbar flex-1 min-h-0">
      {clients.map((client) => {
        const isSelected = selectedRows.has(client.id);

        return (
          <div
            key={client.id}
            onClick={() => router.push(`/${entityPath}/${client.id}`)}
            className={cn(
              "group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
              "bg-card/90 hover:bg-card hover:shadow-md hover:border-primary/40",
              isSelected
                ? "border-primary/60 bg-primary/[0.03] ring-1 ring-primary/20 shadow-xs"
                : "border-border/80"
            )}
          >
            {/* Card Header: Checkbox + Avatar + Title & ID */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  {canDelete && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-1"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(client.id)}
                        className="rounded-md border-border"
                      />
                    </div>
                  )}

                  {/* Company Avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs bg-gradient-to-br",
                      getAvatarGradient(client.name)
                    )}
                  >
                    {getInitials(client.name)}
                  </div>

                  {/* Name and Group Badges */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {client.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {client.clientId && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, client.clientId)}
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-muted-foreground hover:text-foreground bg-muted/50 px-1.5 py-0.5 rounded-md border border-border/60 transition-colors"
                        >
                          {copiedId === client.clientId ? (
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 opacity-60" />
                          )}
                          <span>{client.clientId}</span>
                        </button>
                      )}

                      {client.subsidiaryCount && client.subsidiaryCount > 0 ? (
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-md font-bold border border-primary/20">
                          +{client.subsidiaryCount} Sub
                        </span>
                      ) : null}

                      {client.role === "subsidiary" && (
                        <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.2 rounded-md font-bold border border-indigo-500/20">
                          Subsidiary
                        </span>
                      )}

                      {client.groupId && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.2 rounded-md font-bold border border-amber-500/20">
                          Group
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage & Status Badges */}
              <div
                className="flex items-center gap-1.5 flex-wrap pt-1"
                onClick={(e) => e.stopPropagation()}
              >
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

              {/* Company Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="truncate text-[11px] font-medium text-foreground/80">
                    {client.industry || "General"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="truncate text-[11px] font-medium text-foreground/80">
                    {client.countryOfBusiness || "Global"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500/80 shrink-0" />
                  <span className="text-[11px] font-medium text-foreground/80">
                    {client.jobCount || 0} Open Jobs
                  </span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="text-[11px] font-medium text-foreground/80">
                    Age: {formatClientAge(client.clientAge)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer: Owner / CreatedBy + View Details CTA */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[130px]">
                <User className="w-3 h-3 shrink-0" />
                <span className="truncate">{client.createdBy || "System"}</span>
              </div>

              <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientCardView;
