"use client";

import React, { useState } from "react";
import { 
  Inbox, 
  Send, 
  Trash2, 
  FileText, 
  Star, 
  PenSquare, 
  Clock, 
  AlertTriangle, 
  LogOut, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ChevronRight, 
  PenTool,
  Building2,
  UserCheck,
  Users,
  Mail,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Mailbox } from "@/types/email";
import { useDisconnectMailbox } from "@/hooks/useEmail";
import { useEmailSignatures } from "@/hooks/useEmailSignatures";
import { EmailContactType } from "@/types/emailContactTypes";
import { EmailAddressSelector } from "./EmailAddressSelector";

export type EmailFolder = "inbox" | "starred" | "sent" | "drafts" | "trash";

interface EmailSidebarProps {
  activeFolder: EmailFolder;
  onFolderChange: (folder: EmailFolder) => void;
  onComposeClick: () => void;
  unreadCount?: number;
  mailbox: Mailbox | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  onOpenSignatures?: () => void;
  selectedEmailType?: EmailContactType | null;
  onSelectEmailType?: (type: EmailContactType | null) => void;
  selectedEmailAddress?: string | null;
  onSelectEmailAddress?: (email: string | null) => void;
}

export const EmailSidebar: React.FC<EmailSidebarProps> = ({
  activeFolder,
  onFolderChange,
  onComposeClick,
  unreadCount = 0,
  mailbox,
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile,
  onOpenSignatures,
  selectedEmailType = null,
  onSelectEmailType,
  selectedEmailAddress = null,
  onSelectEmailAddress,
}) => {
  const disconnectMutation = useDisconnectMailbox();
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const { signatures } = useEmailSignatures();

  const formatLastSync = (dateStr?: string | null) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  const navItems: { 
    id: EmailFolder; 
    label: string; 
    icon: React.ElementType; 
    badge?: number;
    color: string;
    activeBg: string;
    hoverBg: string;
  }[] = [
    { 
      id: "inbox", 
      label: "Inbox", 
      icon: Inbox, 
      badge: unreadCount, 
      color: "text-blue-600 dark:text-blue-400", 
      activeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border-blue-500/25 shadow-2xs",
      hoverBg: "hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" 
    },
    { 
      id: "starred", 
      label: "Starred", 
      icon: Star, 
      color: "text-amber-500 dark:text-amber-400", 
      activeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border-amber-500/25 shadow-2xs",
      hoverBg: "hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400" 
    },
    { 
      id: "sent", 
      label: "Sent Mail", 
      icon: Send, 
      color: "text-emerald-600 dark:text-emerald-400", 
      activeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border-emerald-500/25 shadow-2xs",
      hoverBg: "hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400" 
    },
    { 
      id: "drafts", 
      label: "Drafts", 
      icon: FileText, 
      color: "text-purple-600 dark:text-purple-400", 
      activeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold border-purple-500/25 shadow-2xs",
      hoverBg: "hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400" 
    },
    { 
      id: "trash", 
      label: "Trash", 
      icon: Trash2, 
      color: "text-rose-600 dark:text-rose-400", 
      activeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border-rose-500/25 shadow-2xs",
      hoverBg: "hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400" 
    },
  ];

  const handleSelectFolder = (id: EmailFolder) => {
    onFolderChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={`flex flex-col h-full bg-card/95 border border-border/80 rounded-2xl shadow-xs transition-all duration-300 overflow-hidden ${
          isCollapsed ? "w-full p-2 items-center" : "w-full p-2.5 sm:p-3"
        }`}
      >
        {/* Top Header: Collapse Toggle & Compose */}
        <div className="shrink-0 space-y-2 w-full pb-2 border-b border-border/50">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-1`}>
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">
                Mailbox
              </span>
            )}
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-7 w-7 text-muted-foreground hover:text-foreground hidden md:inline-flex rounded-lg"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>

          {/* New Message CTA */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onComposeClick}
                  size="icon"
                  className="h-9 w-9 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/25 mx-auto transition-all active:scale-95"
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New Message</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={onComposeClick}
              className="w-full h-8.5 gap-2 text-xs font-bold bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 justify-start px-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PenSquare className="h-3.5 w-3.5" />
              <span>New Message</span>
            </Button>
          )}
        </div>

        {/* Middle Section: Folders, Email Types & Signatures with ZERO unwanted scrollbars */}
        <div
          className={`flex-1 min-h-0 w-full pt-1.5 space-y-2 overflow-x-hidden ${
            isCollapsed
              ? "overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              : "overflow-y-auto scrollbar-thin"
          }`}
        >
          {/* Folder Navigation */}
          <nav className="space-y-0.5 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFolder === item.id;

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSelectFolder(item.id)}
                        className={`w-9 h-9 mx-auto flex items-center justify-center rounded-xl transition-colors relative border ${
                          isActive
                            ? `${item.activeBg} shadow-2xs`
                            : `border-transparent text-muted-foreground ${item.hoverBg}`
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? item.color : ""}`} />
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label} {item.badge ? `(${item.badge})` : ""}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectFolder(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border group ${
                    isActive
                      ? `${item.activeBg} shadow-2xs`
                      : `border-transparent text-muted-foreground hover:text-foreground ${item.hoverBg}`
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? item.color : "text-muted-foreground/80 group-hover:" + item.color
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 ? (
                    <Badge
                      variant="secondary"
                      className={`h-4 px-1.5 text-[9px] font-bold rounded-full ${
                        isActive ? "bg-blue-600 text-white shadow-2xs" : "bg-muted/80 text-foreground"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  ) : isActive ? (
                    <ChevronRight className="h-3 w-3 opacity-60" />
                  ) : null}
                </button>
              );
            })}

            {/* Stakeholders Section */}
            <div className="pt-2 border-t border-border/50 mt-2 space-y-0.5">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Stakeholders
                  </span>
                  {(selectedEmailType || selectedEmailAddress) && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectEmailType?.(null);
                        onSelectEmailAddress?.(null);
                      }}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-destructive transition-colors"
                      title="Clear stakeholder filter"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}

              {([
                {
                  id: "client" as EmailContactType,
                  label: "Client Emails",
                  icon: Building2,
                  color: "text-blue-600 dark:text-blue-400",
                  activeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25",
                  hoverBg: "hover:bg-blue-500/10 hover:text-blue-600",
                },
                {
                  id: "candidate" as EmailContactType,
                  label: "Candidate Emails",
                  icon: UserCheck,
                  color: "text-emerald-600 dark:text-emerald-400",
                  activeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
                  hoverBg: "hover:bg-emerald-500/10 hover:text-emerald-600",
                },
                {
                  id: "team" as EmailContactType,
                  label: "Team Emails",
                  icon: Users,
                  color: "text-purple-600 dark:text-purple-400",
                  activeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25",
                  hoverBg: "hover:bg-purple-500/10 hover:text-purple-600",
                },
              ]).map((typeItem) => {
                const Icon = typeItem.icon;
                const isTypeActive = selectedEmailType === typeItem.id;
                const hasAddressForThisType = isTypeActive && !!selectedEmailAddress;

                if (isCollapsed) {
                  return (
                    <EmailAddressSelector
                      key={typeItem.id}
                      initialType={typeItem.id}
                      selectedEmail={isTypeActive ? selectedEmailAddress : null}
                      onSelect={(email) => {
                        onSelectEmailType?.(typeItem.id);
                        onSelectEmailAddress?.(email);
                      }}
                      onClear={() => onSelectEmailAddress?.(null)}
                      trigger={
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={`w-9 h-9 mx-auto flex items-center justify-center rounded-xl transition-colors relative border ${
                                isTypeActive
                                  ? `${typeItem.activeBg} font-bold shadow-2xs`
                                  : `border-transparent text-muted-foreground ${typeItem.hoverBg}`
                              }`}
                            >
                              <Icon className={`h-4 w-4 ${isTypeActive ? typeItem.color : ""}`} />
                              {hasAddressForThisType && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {typeItem.label}
                            {hasAddressForThisType ? ` (${selectedEmailAddress})` : " - Select Address"}
                          </TooltipContent>
                        </Tooltip>
                      }
                    />
                  );
                }

                return (
                  <div key={typeItem.id} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (isTypeActive) {
                          onSelectEmailType?.(null);
                          onSelectEmailAddress?.(null);
                        } else {
                          onSelectEmailType?.(typeItem.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border group ${
                        isTypeActive
                          ? `${typeItem.activeBg} font-semibold shadow-2xs`
                          : `border-transparent text-muted-foreground hover:text-foreground ${typeItem.hoverBg}`
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                            isTypeActive ? typeItem.color : "text-muted-foreground/80"
                          }`}
                        />
                        <span className="truncate">{typeItem.label}</span>
                      </div>

                      {isTypeActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      ) : null}
                    </button>

                    {/* Expandable Email Address Selector when type is selected */}
                    {isTypeActive && (
                      <div className="pl-5 pr-1 pb-1 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        <EmailAddressSelector
                          initialType={typeItem.id}
                          selectedEmail={selectedEmailAddress}
                          onSelect={(email) => onSelectEmailAddress?.(email)}
                          onClear={() => onSelectEmailAddress?.(null)}
                          title={`Select ${typeItem.label.replace(" Emails", "")} Email`}
                          trigger={
                            <button
                              type="button"
                              className={`w-full text-left px-2 py-1 rounded-lg text-[10px] flex items-center justify-between gap-1 border transition-all ${
                                selectedEmailAddress
                                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 font-mono font-medium shadow-2xs"
                                  : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/60"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Mail className="h-3 w-3 shrink-0 text-blue-600/70" />
                                <span className="truncate">
                                  {selectedEmailAddress || "Select email..."}
                                </span>
                              </div>

                              {selectedEmailAddress ? (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectEmailAddress?.(null);
                                  }}
                                  className="p-0.5 rounded hover:bg-blue-200 hover:text-blue-700 shrink-0 text-muted-foreground"
                                  title="Clear address"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </span>
                              ) : (
                                <ChevronRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                              )}
                            </button>
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Email Signatures */}
            {onOpenSignatures && (
              <div className="pt-2 border-t border-border/50 mt-2">
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onOpenSignatures}
                        className="w-9 h-9 mx-auto flex items-center justify-center rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                      >
                        <PenTool className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Signatures ({signatures.length})</TooltipContent>
                  </Tooltip>
                ) : (
                  <button
                    onClick={onOpenSignatures}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <PenTool className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                      <span className="truncate">Signatures</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 text-[9px] font-bold rounded-md border-border/70 text-muted-foreground group-hover:border-amber-500/40 group-hover:text-amber-600 dark:group-hover:text-amber-400"
                    >
                      {signatures.length}
                    </Badge>
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Section: Mailbox Health & Disconnect */}
        <div className="shrink-0 pt-2 border-t border-border/60 w-full space-y-1.5 mt-auto">
          {mailbox && !isCollapsed && (
            <div className="p-2 rounded-xl bg-gradient-to-br from-slate-50 via-card to-blue-50/20 dark:from-slate-900/60 dark:to-slate-800/60 border border-blue-100/60 dark:border-blue-900/30 space-y-1 text-[10px] shadow-2xs">
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-bold text-foreground truncate max-w-[120px]" title={mailbox.displayName || "Work Mailbox"}>
                  {mailbox.displayName || "Work Mailbox"}
                </span>
                <span className="flex h-2 w-2 relative shrink-0" title="Mailbox connected & syncing">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                </span>
              </div>

              <p className="text-muted-foreground truncate font-mono text-[9px]" title={mailbox.emailAddress}>
                {mailbox.emailAddress}
              </p>

              <div className="flex items-center justify-between text-muted-foreground text-[9px] pt-1 border-t border-border/40">
                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 shrink-0 text-muted-foreground/70" />
                  <span className="truncate">{formatLastSync(mailbox.lastSyncedAt)}</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                  Active
                </span>
              </div>

              {mailbox.sentFolderDetected === false && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[9px] pt-0.5">
                  <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">Sent folder not detected</span>
                </div>
              )}
            </div>
          )}

          {/* Disconnect Mailbox Trigger */}
          <AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
            <AlertDialogTrigger asChild>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 mx-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Disconnect Mailbox</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border/70 hover:border-destructive/30 justify-start px-2 gap-1.5 rounded-xl transition-all"
                >
                  <LogOut className="h-3 w-3 text-muted-foreground group-hover:text-destructive shrink-0" />
                  <span className="truncate">Disconnect</span>
                </Button>
              )}
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Disconnect Mailbox?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  This will safely disconnect your personal mailbox integration. Incoming sync will be paused, but all previously imported conversations and message history will remain preserved in CliqHire.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs h-8 rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    disconnectMutation.mutate();
                    setDisconnectOpen(false);
                  }}
                  className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl"
                >
                  Disconnect Now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>
    </TooltipProvider>
  );
};
