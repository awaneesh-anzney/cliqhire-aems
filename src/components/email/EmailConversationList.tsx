"use client";

import React from "react";
import { cn } from "@/lib/utils";

// MUI Icons
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";

export interface ConversationItem {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  senderEmail: string;
  to: string[];
  date: string;
  relativeTime: string;
  unread: boolean;
  isStarred: boolean;
  isImportant: boolean;
  snippet: string;
  hasAttachments?: boolean;
}

export interface EmailConversationListProps {
  items: ConversationItem[];
  selectedId: string | null;
  onSelectItem: (item: ConversationItem) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFolder: string;
  isLoading?: boolean;
  onMobileBack?: () => void;
  className?: string;
}

// Deterministic pastel color for initials
function getInitialsColor(name: string): string {
  const colors = ["#00A76F", "#1877F2", "#8E33FF", "#FF5630", "#00B8D9", "#FFAB00"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function EmailConversationList({
  items,
  selectedId,
  onSelectItem,
  searchQuery,
  onSearchChange,
  activeFolder,
  isLoading = false,
  onMobileBack,
  className,
}: EmailConversationListProps) {
  return (
    <div
      className={cn(
        "w-full md:w-[280px] lg:w-[320px] shrink-0 p-3.5 sm:p-4 flex flex-col gap-3 overflow-hidden border-r border-slate-100 dark:border-slate-800/80 bg-transparent transition-all font-['Public_Sans',sans-serif]",
        className
      )}
    >
      {/* Mobile Back to Folders */}
      {onMobileBack && (
        <div className="flex md:hidden items-center justify-between pb-1">
          <button
            type="button"
            onClick={onMobileBack}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            <span>Folders</span>
          </button>
          <span className="text-xs font-bold text-[#1C252E] dark:text-white capitalize">
            {activeFolder}
          </span>
        </div>
      )}

      {/* Search Bar Input */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 shadow-2xs focus-within:border-slate-400 dark:focus-within:border-slate-500 transition-all">
        <SearchOutlinedIcon sx={{ fontSize: 19, color: "#919EAB" }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1C252E] dark:text-white placeholder:text-[#919EAB] font-normal"
        />
      </div>

      {/* Emails Conversation List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
        {isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-[#919EAB]">
            <CircularProgress size={20} />
            <span className="text-xs">Loading conversations...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center text-slate-400">
            <MailOutlineIcon sx={{ fontSize: 36, color: "#919EAB", opacity: 0.6 }} />
            <p className="text-xs font-medium mt-2 text-slate-500">No emails in this folder</p>
          </div>
        ) : (
          items.map((item) => {
            const isSelected = item.threadId === selectedId || item.id === selectedId;
            const initialLetter = (item.sender || "U").charAt(0).toUpperCase();
            const color = getInitialsColor(item.sender || "U");

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={cn(
                  "group p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 select-none",
                  isSelected
                    ? "bg-[#F4F6F8] dark:bg-slate-800/80 shadow-2xs"
                    : "hover:bg-[#F4F6F8]/60 dark:hover:bg-slate-800/40"
                )}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs"
                  style={{ backgroundColor: color }}
                >
                  {initialLetter}
                </div>

                {/* Sender, Subject snippet & time */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 leading-tight">
                    <span
                      className={cn(
                        "text-[13px] truncate",
                        item.unread
                          ? "font-bold text-[#1C252E] dark:text-white"
                          : "font-semibold text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {item.sender}
                    </span>
                    <span className="text-[11px] font-medium text-[#919EAB] shrink-0">
                      {item.relativeTime}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#919EAB] truncate mt-1">
                    {item.snippet}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
