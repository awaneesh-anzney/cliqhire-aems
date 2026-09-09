"use client";

import React, { useState } from "react";
import { 
  Inbox, 
  Star, 
  Send, 
  PenSquare, 
  LogOut, 
  Clock, 
  Trash2, 
  FileText,
  AlertTriangle,
  MailCheck,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Sparkles,
  Building2,
  UserCheck,
  Users,
  Check,
  X,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mailbox } from "@/types/email";
import { useDisconnectMailbox } from "@/hooks/useEmail";
import { useEmailSignatures } from "@/hooks/useEmailSignatures";
import { EmailContactType, EMAIL_TYPE_CONFIG } from "@/types/emailContactTypes";
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
    bgHover: string;
  }[] = [
    { 
      id: "inbox", 
      label: "Inbox", 
      icon: Inbox, 
      badge: unreadCount, 
      color: "text-sky-600 dark:text-sky-400", 
      bgHover: "hover:bg-sky-500/10" 
    },
    { 
      id: "starred", 
      label: "Starred", 
      icon: Star, 
      color: "text-amber-600 dark:text-amber-400", 
      bgHover: "hover:bg-amber-500/10" 
    },
    { 
      id: "sent", 
      label: "Sent Mail", 
      icon: Send, 
      color: "text-emerald-600 dark:text-emerald-400", 
      bgHover: "hover:bg-emerald-500/10" 
    },
    { 
      id: "drafts", 
      label: "Drafts", 
      icon: FileText, 
      color: "text-purple-600 dark:text-purple-400", 
      bgHover: "hover:bg-purple-500/10" 
    },
    { 
      id: "trash", 
      label: "Trash", 
      icon: Trash2, 
      color: "text-rose-600 dark:text-rose-400", 
      bgHover: "hover:bg-rose-500/10" 
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
        className={`flex flex-col justify-between h-full bg-card/85 backdrop-blur-md border border-border/60 rounded-2xl p-3 shadow-xs transition-all duration-300 ${
          isCollapsed ? "w-16 items-center" : "w-full"
        }`}
      >
        {/* Top Section: Compose & Folder Navigation */}
        <div className="space-y-2.5 w-full">
          {/* Collapse Toggle & New Message Header */}
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-1`}>
            {!isCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Folders
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
                  className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs mx-auto transition-transform active:scale-95"
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New Message</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={onComposeClick}
              className="w-full h-9 gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs justify-start px-3.5 rounded-xl transition-transform active:scale-[0.98]"
            >
              <PenSquare className="h-4 w-4" />
              <span>New Message</span>
            </Button>
          )}

          {/* Folder List */}
          <nav className="space-y-1 w-full pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFolder === item.id;

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSelectFolder(item.id)}
                        className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-colors relative ${
                          isActive
                            ? "bg-primary/15 text-primary font-bold shadow-2xs"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? item.color : ""}`} />
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? item.color : "text-muted-foreground/80"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 ? (
                    <Badge
                      variant="secondary"
                      className={`h-4 px-1.5 text-[10px] font-bold rounded-full ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted/70 text-foreground"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  ) : isActive ? (
                    <ChevronRight className="h-3 w-3 text-primary opacity-50" />
                  ) : null}
                </button>
              );
            })}

            {/* Email Types Section (Client, Candidate, Team) */}
            <div className="pt-2.5 border-t border-border/40 mt-2.5 space-y-1">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Email Types
                  </span>
                  {(selectedEmailType || selectedEmailAddress) && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectEmailType?.(null);
                        onSelectEmailAddress?.(null);
                      }}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-destructive transition-colors"
                      title="Clear type filter"
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
                  activeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
                },
                {
                  id: "candidate" as EmailContactType,
                  label: "Candidate Emails",
                  icon: UserCheck,
                  color: "text-emerald-600 dark:text-emerald-400",
                  activeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                },
                {
                  id: "team" as EmailContactType,
                  label: "Team Emails",
                  icon: Users,
                  color: "text-purple-600 dark:text-purple-400",
                  activeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
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
                              className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-colors relative ${
                                isTypeActive
                                  ? `${typeItem.activeBg} font-bold shadow-2xs`
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              }`}
                            >
                              <Icon className={`h-4 w-4 ${isTypeActive ? typeItem.color : ""}`} />
                              {hasAddressForThisType && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
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
                  <div key={typeItem.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isTypeActive) {
                          // Toggle off
                          onSelectEmailType?.(null);
                          onSelectEmailAddress?.(null);
                        } else {
                          onSelectEmailType?.(typeItem.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all group ${
                        isTypeActive
                          ? `${typeItem.activeBg} font-semibold shadow-2xs`
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                            isTypeActive ? typeItem.color : "text-muted-foreground/80"
                          }`}
                        />
                        <span className="truncate">{typeItem.label}</span>
                      </div>

                      {isTypeActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      ) : null}
                    </button>

                    {/* Expandable Email Address Selector when type is selected */}
                    {isTypeActive && (
                      <div className="pl-6 pr-1 pb-1 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        <EmailAddressSelector
                          initialType={typeItem.id}
                          selectedEmail={selectedEmailAddress}
                          onSelect={(email) => onSelectEmailAddress?.(email)}
                          onClear={() => onSelectEmailAddress?.(null)}
                          title={`Select ${typeItem.label.replace(" Emails", "")} Email`}
                          trigger={
                            <button
                              type="button"
                              className={`w-full text-left px-2 py-1 rounded-lg text-[11px] flex items-center justify-between gap-1 border transition-all ${
                                selectedEmailAddress
                                  ? "bg-primary/10 text-primary border-primary/25 font-mono font-medium shadow-2xs"
                                  : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/60"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Mail className="h-3 w-3 shrink-0 text-primary/70" />
                                <span className="truncate">
                                  {selectedEmailAddress || "Select email address..."}
                                </span>
                              </div>

                              {selectedEmailAddress ? (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectEmailAddress?.(null);
                                  }}
                                  className="p-0.5 rounded hover:bg-primary/20 hover:text-primary shrink-0 text-muted-foreground"
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

            {/* Email Signatures Quick Trigger in Sidebar */}
            {onOpenSignatures && (
              <div className="pt-2 border-t border-border/40 mt-2">
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onOpenSignatures}
                        className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <PenTool className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Signatures ({signatures.length})</TooltipContent>
                  </Tooltip>
                ) : (
                  <button
                    onClick={onOpenSignatures}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PenTool className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="truncate">Signatures</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 text-[9px] font-bold rounded-md border-border/70 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary"
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
        <div className="pt-2.5 border-t border-border/60 w-full space-y-2">
          {mailbox && !isCollapsed && (
            <div className="p-2.5 rounded-xl bg-muted/20 border border-border/50 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-semibold text-foreground truncate max-w-[130px]">
                  {mailbox.displayName || "Work Mailbox"}
                </span>
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>

              <p className="text-muted-foreground truncate font-mono text-[10px]" title={mailbox.emailAddress}>
                {mailbox.emailAddress}
              </p>

              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] pt-0.5 border-t border-border/40">
                <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                <span className="truncate">Synced: {formatLastSync(mailbox.lastSyncedAt)}</span>
              </div>

              {mailbox.sentFolderDetected === false && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[10px] pt-0.5">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
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
                      className="h-9 w-9 mx-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Disconnect Mailbox</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start px-2.5 gap-2 rounded-xl transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Disconnect Mailbox</span>
                </Button>
              )}
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-bold">Disconnect Mailbox?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  This will pause incoming IMAP sync for this account. Your past sent and received email history will remain safely preserved in CliqHire.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs h-8 rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    disconnectMutation.mutate();
                    setDisconnectOpen(false);
                  }}
                  className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
                >
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>
    </TooltipProvider>
  );
};
