"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Mailbox } from "@/types/email";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailSignatures } from "@/hooks/useEmailSignatures";
import { useEmailRecipients } from "@/hooks/useEmailRecipients";
import { EmailContactItem, EmailContactType } from "@/types/emailContactTypes";

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
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

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
  { id: "archive", label: "Archive", icon: ArchiveOutlinedIcon },
  { id: "trash", label: "Trash", icon: DeleteOutlineIcon },
  { id: "spam", label: "Spam", icon: ReportGmailerrorredOutlinedIcon },
  { id: "important", label: "Important", icon: LabelImportantOutlinedIcon },
  { id: "starred", label: "Starred", icon: StarBorderOutlinedIcon },
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
  onOpenSignatures?: () => void;
  selectedContactEmail?: string | null;
  onSelectContactFilter?: (email: string | null) => void;
  onComposeToContact?: (email: string, name?: string) => void;
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

function getAvatarColor(name: string): string {
  const colors = ["#00A76F", "#1877F2", "#8E33FF", "#00B8D9", "#F59E0B", "#6366F1"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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
  onOpenSignatures,
  selectedContactEmail,
  onSelectContactFilter,
  onComposeToContact,
}: EmailNavSidebarProps) {
  const { user } = useAuth();
  const { signatures } = useEmailSignatures();

  // Contact Directory Data
  const { data: teamContacts = [], isLoading: loadingTeam } = useEmailRecipients("team");
  const { data: candidateContacts = [], isLoading: loadingCandidates } = useEmailRecipients("candidate");
  const { data: clientContacts = [], isLoading: loadingClients } = useEmailRecipients("client");

  // Accordion state for contact lists
  const [expandedSection, setExpandedSection] = useState<EmailContactType | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const toggleSection = (type: EmailContactType) => {
    setExpandedSection((prev) => (prev === type ? null : type));
    setSearchFilter("");
  };

  const directoryCategories = useMemo(
    () => [
      {
        id: "team" as EmailContactType,
        label: "Team Members",
        icon: PeopleAltOutlinedIcon,
        count: teamContacts.length,
        loading: loadingTeam,
        contacts: teamContacts,
        colorClass: "text-purple-600 dark:text-purple-400",
        badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      },
      {
        id: "candidate" as EmailContactType,
        label: "Candidates",
        icon: BadgeOutlinedIcon,
        count: candidateContacts.length,
        loading: loadingCandidates,
        contacts: candidateContacts,
        colorClass: "text-emerald-600 dark:text-emerald-400",
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      },
      {
        id: "client" as EmailContactType,
        label: "Clients",
        icon: BusinessOutlinedIcon,
        count: clientContacts.length,
        loading: loadingClients,
        contacts: clientContacts,
        colorClass: "text-blue-600 dark:text-blue-400",
        badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      },
    ],
    [teamContacts, candidateContacts, clientContacts, loadingTeam, loadingCandidates, loadingClients]
  );

  return (
    <div
      className={cn(
        "w-full md:w-[220px] lg:w-[235px] shrink-0 p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto bg-transparent border-r border-slate-100 dark:border-slate-800/80 transition-all font-['Public_Sans',sans-serif] custom-scrollbar",
        className
      )}
    >
      {/* Compose Button */}
      <button
        type="button"
        onClick={onCompose}
        className="w-full h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-hover text-primary-foreground font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm shadow-primary/25 hover:shadow-md hover:shadow-primary/30 transition-all active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
      >
        <EditOutlinedIcon sx={{ fontSize: 17 }} />
        <span>Compose</span>
      </button>

      {/* Active Contact Filter Banner (if filtering by a stakeholder) */}
      {selectedContactEmail && (
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-between gap-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <FilterListIcon sx={{ fontSize: 14, color: "#2563EB" }} />
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 truncate" title={selectedContactEmail}>
              {selectedContactEmail}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectContactFilter?.(null)}
            className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shrink-0"
            title="Clear filter"
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </button>
        </div>
      )}

      {/* Standard Folders List */}
      <div className="flex flex-col space-y-0.5">
        <span className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
          Mailbox
        </span>
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
                "flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] transition-colors outline-none",
                isActive
                  ? "bg-slate-100/90 dark:bg-slate-800 font-bold text-[#1C252E] dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  sx={{
                    fontSize: 18,
                    color: isActive ? "#1C252E" : "#637381",
                  }}
                  className={isActive ? "dark:!text-white" : "dark:!text-slate-400"}
                />
                <span className="capitalize">{f.label}</span>
              </div>
              {countBadge !== undefined && (
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                  {countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Replacement Section: Signatures & Stakeholder Lists */}
      <div className="flex flex-col pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <div className="flex items-center justify-between px-2.5 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Contacts & Tools
          </span>
        </div>

        {/* 1. Signatures Entry */}
        <button
          type="button"
          onClick={onOpenSignatures}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-all outline-none group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <HistoryEduOutlinedIcon
              sx={{ fontSize: 18 }}
              className="text-slate-500 group-hover:text-amber-500 transition-colors"
            />
            <span className="truncate">Signatures</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
            {signatures.length}
          </span>
        </button>

        {/* 2. Lists for Team Members, Candidates, and Clients */}
        {directoryCategories.map((cat) => {
          const Icon = cat.icon;
          const isExpanded = expandedSection === cat.id;
          const filteredContacts = cat.contacts.filter((c) => {
            if (!searchFilter.trim()) return true;
            const q = searchFilter.toLowerCase();
            return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
          });

          return (
            <div key={cat.id} className="flex flex-col space-y-0.5">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleSection(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all outline-none",
                  isExpanded
                    ? "bg-slate-100/90 dark:bg-slate-800 font-bold text-[#1C252E] dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon sx={{ fontSize: 18 }} className={cat.colorClass} />
                  <span className="truncate">{cat.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", cat.badgeClass)}>
                    {cat.loading ? "..." : cat.count}
                  </span>
                  {isExpanded ? (
                    <ExpandMoreIcon sx={{ fontSize: 16, color: "#919EAB" }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: 16, color: "#919EAB" }} />
                  )}
                </div>
              </button>

              {/* Expanded List Panel */}
              {isExpanded && (
                <div className="pl-2 pr-1 py-1 space-y-1 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 animate-in fade-in duration-150">
                  {/* Quick Search if more than 3 contacts */}
                  {cat.contacts.length > 3 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700/70 text-[11px] mb-1">
                      <SearchOutlinedIcon sx={{ fontSize: 13, color: "#919EAB" }} />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder={`Search ${cat.label.toLowerCase()}...`}
                        className="w-full bg-transparent border-none outline-none text-[#1C252E] dark:text-white placeholder:text-slate-400 text-[11px]"
                      />
                    </div>
                  )}

                  {/* Contact Items List */}
                  <div className="max-h-44 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                    {cat.loading ? (
                      <div className="flex items-center justify-center py-3 text-slate-400 gap-1.5 text-xs">
                        <CircularProgress size={12} thickness={4} />
                        <span>Loading...</span>
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-2 italic">
                        No contacts found
                      </p>
                    ) : (
                      filteredContacts.map((contact) => {
                        const isFiltered = selectedContactEmail === contact.email;
                        const avatarBg = getAvatarColor(contact.name);

                        return (
                          <div
                            key={contact.id || contact.email}
                            className={cn(
                              "group/item flex items-center justify-between p-1.5 rounded-lg text-left transition-colors cursor-pointer",
                              isFiltered
                                ? "bg-blue-100/80 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-bold"
                                : "hover:bg-white dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                            )}
                            onClick={() => {
                              if (isFiltered) {
                                onSelectContactFilter?.(null);
                              } else {
                                onSelectContactFilter?.(contact.email);
                              }
                            }}
                            title={`Click to filter emails from ${contact.name}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs"
                                style={{ backgroundColor: avatarBg }}
                              >
                                {getUserInitials(contact.name)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11.5px] truncate font-medium group-hover/item:text-[#1C252E] dark:group-hover/item:text-white leading-tight">
                                  {contact.name}
                                </span>
                                <span className="text-[9.5px] text-[#919EAB] truncate leading-tight mt-0.5">
                                  {contact.roleOrCompany || contact.email}
                                </span>
                              </div>
                            </div>

                            {/* Actions on hover */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-1">
                              {onComposeToContact && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onComposeToContact(contact.email, contact.name);
                                  }}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300"
                                  title={`Compose email to ${contact.name}`}
                                >
                                  <SendIcon sx={{ fontSize: 11 }} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
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
