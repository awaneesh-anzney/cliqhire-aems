"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Mailbox } from "@/types/email";
import { useAuth } from "@/contexts/AuthContext";

// MUI Icons
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import CircularProgress from "@mui/material/CircularProgress";

export interface NavFolder {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const EMAIL_NAV_FOLDERS: NavFolder[] = [
  { id: "all", label: "All", icon: MailOutlineIcon },
  { id: "inbox", label: "Inbox", icon: InboxOutlinedIcon },
  { id: "sent", label: "Sent", icon: SendOutlinedIcon },
  { id: "drafts", label: "Drafts", icon: DraftsOutlinedIcon },
  { id: "trash", label: "Trash", icon: DeleteOutlineIcon },
  { id: "spam", label: "Spam", icon: ReportGmailerrorredOutlinedIcon },
  { id: "important", label: "Important", icon: LabelImportantOutlinedIcon },
  { id: "starred", label: "Starred", icon: StarBorderOutlinedIcon },
];

export const EMAIL_NAV_LABELS = [
  { id: "social", label: "Social", color: "#22C55E" },
  { id: "promotions", label: "Promotions", color: "#F59E0B" },
  { id: "forums", label: "Forums", color: "#FF5630" },
];

export interface EmailNavSidebarProps {
  activeFolder: string;
  onSelectFolder: (folder: string) => void;
  onCompose: () => void;
  mailbox?: Mailbox | null;
  totalInboxCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDisconnect?: () => void;
  isDisconnecting?: boolean;
  className?: string;
}

function getUserInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function EmailNavSidebar({
  activeFolder,
  onSelectFolder,
  onCompose,
  mailbox,
  totalInboxCount,
  onRefresh,
  isRefreshing = false,
  onDisconnect,
  isDisconnecting = false,
  className,
}: EmailNavSidebarProps) {
  const { user } = useAuth();

  return (
    <div
      className={cn(
        "w-full md:w-[210px] lg:w-[220px] shrink-0 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto bg-transparent border-r border-slate-100 dark:border-slate-800/80 transition-all font-['Public_Sans',sans-serif]",
        className
      )}
    >
      {/* Compose Button */}
      <button
        type="button"
        onClick={onCompose}
        className="w-full h-10 px-4 rounded-xl bg-[#1C252E] hover:bg-[#28323D] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#1C252E] font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] outline-none"
      >
        <EditOutlinedIcon sx={{ fontSize: 17 }} />
        <span>Compose</span>
      </button>

      {/* Folders List */}
      <div className="flex flex-col space-y-0.5">
        {EMAIL_NAV_FOLDERS.map((f) => {
          const Icon = f.icon;
          const isActive = activeFolder === f.id;
          const countBadge =
            f.id === "inbox" && activeFolder === "inbox" && totalInboxCount && totalInboxCount > 0
              ? totalInboxCount
              : undefined;

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFolder(f.id)}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-colors outline-none",
                isActive
                  ? "bg-slate-100/90 dark:bg-slate-800 font-bold text-[#1C252E] dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  sx={{
                    fontSize: 19,
                    color: isActive ? "#1C252E" : "#637381",
                  }}
                  className={isActive ? "dark:!text-white" : "dark:!text-slate-400"}
                />
                <span className="capitalize">{f.label}</span>
              </div>
              {countBadge !== undefined && (
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                  {countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Labels Section */}
      <div className="flex flex-col space-y-1 pt-3">
        {EMAIL_NAV_LABELS.map((lbl) => {
          const isActive = activeFolder === lbl.id;
          return (
            <button
              key={lbl.id}
              type="button"
              onClick={() => onSelectFolder(lbl.id)}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-colors outline-none",
                isActive
                  ? "bg-slate-100/90 dark:bg-slate-800 font-bold text-[#1C252E] dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Vertical Pill Tag */}
                <span
                  className="w-1.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: lbl.color }}
                />
                <span>{lbl.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom: Logged-in User Profile & Disconnect Button */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                  {getUserInitials(user?.name)}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#1C252E] dark:text-white truncate leading-tight">
                {user?.name || "User"}
              </span>
              <span className="text-[10.5px] text-[#919EAB] truncate leading-tight mt-0.5">
                {mailbox?.emailAddress || user?.email || "Connected"}
              </span>
            </div>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Sync Mailbox"
              className="p-1 rounded-lg text-[#919EAB] hover:text-[#1C252E] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              <RefreshIcon sx={{ fontSize: 15 }} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          )}
        </div>

        {/* Disconnect Button at Bottom-Left Corner */}
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            disabled={isDisconnecting}
            className="w-full py-1.5 px-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/80 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            title="Disconnect current mailbox"
          >
            {isDisconnecting ? (
              <CircularProgress size={12} color="inherit" />
            ) : (
              <PowerSettingsNewOutlinedIcon sx={{ fontSize: 14 }} />
            )}
            <span>Disconnect</span>
          </button>
        )}
      </div>
    </div>
  );
}
