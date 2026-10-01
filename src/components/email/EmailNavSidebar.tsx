"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Mailbox } from "@/types/email";

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
  className?: string;
}

export function EmailNavSidebar({
  activeFolder,
  onSelectFolder,
  onCompose,
  mailbox,
  totalInboxCount,
  onRefresh,
  isRefreshing = false,
  className,
}: EmailNavSidebarProps) {
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

      {/* Mailbox Status Quick Action in Sidebar */}
      {mailbox && (
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#919EAB]">
          <div className="flex items-center justify-between">
            <span className="truncate max-w-[140px] font-medium">{mailbox.emailAddress}</span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Sync Mailbox"
                className="p-1 hover:text-foreground transition-colors"
              >
                <RefreshIcon sx={{ fontSize: 14 }} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
