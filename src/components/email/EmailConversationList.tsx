"use client";

import React from "react";
import { cn } from "@/lib/utils";

// MUI Icons
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";

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
  // Pagination Props
  page?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (newPage: number) => void;
  // Filter Prop
  selectedContactEmail?: string | null;
  onClearContactFilter?: () => void;
  // Search state
  isSearchMode?: boolean;
  searchResultCount?: number;
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
  page = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  selectedContactEmail,
  onClearContactFilter,
  isSearchMode,
  searchResultCount,
}: EmailConversationListProps) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

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
            {isSearchMode ? "Search Results" : activeFolder}
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
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            title="Clear search"
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </button>
        )}
      </div>

      {/* Active Filter Pill */}
      {selectedContactEmail && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <FilterListIcon sx={{ fontSize: 13 }} />
            <span className="truncate">Contact: {selectedContactEmail}</span>
          </div>
          {onClearContactFilter && (
            <button
              type="button"
              onClick={onClearContactFilter}
              className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded text-blue-600 dark:text-blue-300"
              title="Clear filter"
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </button>
          )}
        </div>
      )}

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
            <p className="text-xs font-medium mt-2 text-slate-500">
              {isSearchMode ? "No results found" : "No emails in this folder"}
            </p>
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

      {/* Pagination Footer */}
      {onPageChange && (
        <div className="shrink-0 pt-2.5 pb-0.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none">
          <span className="font-medium tabular-nums text-slate-600 dark:text-slate-300">
            {totalItems > 0 ? (
              <>
                <span className="font-semibold text-[#1C252E] dark:text-white">
                  {startItem}–{endItem}
                </span>{" "}
                of {totalItems}
              </>
            ) : (
              "0 emails"
            )}
          </span>

          <div className="flex items-center gap-1">
            {/* First Page */}
            {totalPages > 2 && (
              <button
                type="button"
                onClick={() => onPageChange(1)}
                disabled={page <= 1 || isLoading}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <FirstPageIcon sx={{ fontSize: 16 }} />
              </button>
            )}

            {/* Previous Page */}
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </button>

            {/* Page indicator pill */}
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              {page} / {Math.max(1, totalPages)}
            </span>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </button>

            {/* Last Page */}
            {totalPages > 2 && (
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                disabled={page >= totalPages || isLoading}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <LastPageIcon sx={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
